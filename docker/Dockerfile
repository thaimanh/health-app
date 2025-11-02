# Stage 1: Build the application
FROM node:14.20.0-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install development and production dependencies
# npm ci is used for clean, deterministic installs
RUN npm ci --force

# Copy source code
COPY . .

# Build the TypeScript application
RUN npm run build

# Stage 2: Create the production image
FROM node:14.20.0-alpine

# Set working directory
WORKDIR /app

# Create a non-root user and switch to it for security
# UID 1001 is a common practice for non-root users in containers
RUN addgroup --system appgroup && adduser --system --uid 1001 appuser appgroup
USER appuser

# Expose the port your app runs on
EXPOSE 3000

# Copy only necessary production artifacts from the build stage
# This keeps the final image small and secure
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist

# Install only production dependencies
# This ensures devDependencies are not in the final image
RUN npm ci --omit=dev --force

# Start the application using the 'node' command directly
# This ensures proper signal handling for graceful shutdowns
CMD ["node", "dist/server.js"]