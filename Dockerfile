# ---- Stage 1: Build ----
# Use a specific Node.js version for reproducibility.
# The 'as builder' keyword names this stage.
FROM node:22.17.0-bullseye AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
# This leverages Docker's layer caching. These files change less often than source code.
COPY package*.json ./

# Install all dependencies, including devDependencies needed for building
RUN npm install

# Copy the rest of the application's source code
COPY . .

# Run the build command defined in package.json, which compiles TS to JS in /dist
RUN npm run build

# ---- Stage 2: Production/Runner ----
# Use a lightweight, production-ready Node.js image based on Alpine Linux
FROM node:22.17.0-alpine3.21

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json again to install only production dependencies
COPY package*.json ./

# Install ONLY production dependencies.
# The --omit=dev flag (for npm v7+) or --production (older npm) is crucial for a small image size.
RUN npm install --omit=dev

# Copy the compiled code from the 'builder' stage
COPY --from=builder /app/dist .

# Expose the port the app runs on
EXPOSE 3000

# The command to run the application
CMD [ "node", "index.js" ]