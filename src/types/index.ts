/**
 * Describes a single layer of clouds in a weather report.
 */
export interface CloudLayer {
  /** 
   * Cloud cover code (e.g., 'OVC' for Overcast, 'BKN' for Broken).
   * Could also include 'SCT', 'FEW', 'SKC'.
   */
  cover: 'OVC' | 'BKN' | 'SCT' | 'FEW' | 'SKC';
  /** 
   * Cloud base altitude in feet.
   */
  base: number;
}

/**
 * Represents a single METAR (Meteorological Aerodrome Report) observation.
 */
export interface MetarReport {
  metar_id: number;
  /** ICAO identifier for the airport/station (e.g., 'KJQF'). */
  icaoId: string;
  /** The time the report was received by the system. */
  receiptTime: string;
  /** The observation time as a Unix timestamp (seconds). */
  obsTime: number;
  /** The official time of the report. */
  reportTime: string;
  /** Temperature in Celsius. */
  temp: number;
  /** Dewpoint in Celsius. */
  dewp: number;
  /** Wind direction in degrees. */
  wdir: number;
  /** Wind speed in knots. */
  wspd: number;
  /** Wind gust in knots, or null if not reported. */
  wgst: number | null;
  /** Visibility in statute miles. */
  visib: number;
  /** Altimeter setting in millibars (e.g., 1018 = 1018.0 mb which is ~30.06 inHg). */
  altim: number;
  /** Sea level pressure in millibars, or null if not reported. */
  slp: number | null;
  qcField: number;
  /** Weather string (e.g., 'RA' for rain, '-SN' for light snow), or null if none. */
  wxString: string | null;
  /** Pressure tendency, or null if not reported. */
  presTend: number | null;
  /** Maximum temperature in the last 6 hours, or null. */
  maxT: number | null;
  /** Minimum temperature in the last 6 hours, or null. */
  minT: number | null;
  /** Maximum temperature in the last 24 hours, or null. */
  maxT24: number | null;
  /** Minimum temperature in the last 24 hours, or null. */
  minT24: number | null;
  /** Precipitation amount, or null. */
  precip: number | null;
  /** Precipitation in the last 3 hours, or null. */
  pcp3hr: number | null;
  /** Precipitation in the last 6 hours, or null. */
  pcp6hr: number | null;
  /** Precipitation in the last 24 hours, or null. */
  pcp24hr: number | null;
  /** Snow depth, or null. */
  snow: number | null;
  /** Vertical visibility, or null. */
  vertVis: number | null;
  /** Type of report (e.g., 'METAR', 'SPECI'). */
  metarType: 'METAR' | 'SPECI';
  /** The raw, unparsed METAR string. */
  rawOb: string;
  /** Flag indicating if this is the most recent report (1 for true, 0 for false). */
  mostRecent: 0 | 1;
  /** Latitude of the station. */
  lat: number;
  /** Longitude of the station. */
  lon: number;
  /** Elevation of the station in meters. */
  elev: number;
  prior: number;
  /** Full name and location of the station. */
  name: string;
  /** An array of cloud layer objects. */
  clouds: CloudLayer[];
}