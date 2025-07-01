import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { type MetarReport } from "./types/index.js";

const FAA_AW_API_BASE = "https://aviationweather.gov/api/data";

// Create server instance
const server = new McpServer({
  name: "faa-aviation-weather",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// --- Refactored Helper Functions ---

/**
 * A more robust and generic helper for making API requests.
 * It throws an error on failure, allowing the caller to handle it.
 * @param url The URL to fetch.
 * @returns The JSON response parsed as type T.
 * @throws {Error} if the network request or response is not ok.
 */
async function makeApiRequest<T>(url: string): Promise<T> {
  const headers = {
    Accept: "application/json",
  };

  const response = await fetch(url, { headers });

  if (!response.ok) {
    // Provide more context in the error message
    const errorBody = await response.text();
    throw new Error(
      `API request failed with status ${response.status}: ${errorBody}`
    );
  }
  return response.json() as Promise<T>;
}

/**
 * Formats a single METAR report into a human-readable string.
 * This separates formatting logic from the main tool logic.
 *
 * NOTE: Adjust the properties (e.g., flightCat, tempC) to match your MetarReport type.
 */
function formatMetarReport(metar: MetarReport): string {
  const details = [
    `Report for: ${metar.name} (${metar.icaoId})`,
    `Time: ${new Date(metar.obsTime).toUTCString()}`,
    `Visibility: ${metar.visib}`,
    `Temperature: ${metar.temp}°C`,
    `Wind: ${metar.wdir}° at ${metar.wspd} knots`,
    `Altimeter: ${metar.altim?.toFixed(2)} inHg`,
    `Raw Text: ${metar.rawOb}`,
  ];
  return details.join("\n");
}


// --- Tool Definition ---

server.tool(
  "get-metar",
  "Get the current METAR (aviation weather report) for one or more airports.",
  {
    // Use Zod's transform to pre-process the input string into a clean array
    airportCodes: z
      .string()
      .max(100, "Input string is too long.")
      .describe("One or more four-letter ICAO airport identifiers, separated by commas (e.g., KCLT,KJFK).")
      .transform((str) =>
        str
          .split(",")
          .map((code) => code.trim().toUpperCase())
          .filter(Boolean) // Remove any empty strings from "KCLT,,KJFK"
      )
      // Ensure the transformation doesn't result in an empty array
      .pipe(z.string().array().nonempty("Please provide at least one valid airport code.")),
  },
  async ({ airportCodes }) => {
    try {
      // Build the URL safely using URLSearchParams
      const url = new URL(`${FAA_AW_API_BASE}/metar`);
      url.searchParams.append("ids", airportCodes.join(","));
      url.searchParams.append("format", "json");

      const metarData = await makeApiRequest<MetarReport[]>(url.toString());

      // Handle the case where the API returns an empty array (valid codes, but no data)
      if (metarData.length === 0) {
        return {
          content: [{
            type: "text",
            text: `No METAR data found for the specified airports: ${airportCodes.join(", ")}`,
          }],
        };
      }

      const formattedMetarBlocks = metarData.map(formatMetarReport);
      const resultText = `✅ METAR Data Retrieved:\n\n---\n\n${formattedMetarBlocks.join("\n\n---\n\n")}`;

      return {
        content: [{
          type: "text",
          text: resultText,
        }],
      };
    } catch (error) {
      // Log the detailed error for debugging on the server
      console.error("Error in get-metar tool:", error);

      // Return a user-friendly error message to the client
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      return {
        content: [{
          type: "text",
          text: `Failed to retrieve METAR data. Reason: ${errorMessage}`,
        }],
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("FAA Aviation Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});