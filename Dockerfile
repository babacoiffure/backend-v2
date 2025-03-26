# Use official Node.js LTS image as base
FROM node:lts-alpine AS base

# Set working directory
WORKDIR /app

# Install global dependencies
RUN npm install -g typescript ts-node

# Copy package files first (for better layer caching)
COPY package.json package-lock.json* ./

# Install production dependencies
FROM base AS deps
RUN npm ci --production

# Build stage
FROM base AS builder
# Install all dependencies for building (using ci for faster and more reliable installs)
RUN npm ci
# Copy necessary files for the build
COPY tsconfig.json ./
COPY src/ ./src/
# Build the application
RUN npm run build && mkdir -p dist/src && ls -la dist

# Production stage
FROM node:lts-alpine AS production

# Set working directory
WORKDIR /app

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules
# Copy built dist folder
COPY --from=builder /app/dist ./dist
# Copy package.json for potential runtime needs
COPY package.json ./

# Set environment to production
ENV NODE_ENV=production

# Expose the port your app runs on
EXPOSE 3000

# Health check (optional)
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
	CMD node -e "require('http').get('http://localhost:3000/health-check', (res) => { if (res.statusCode !== 200) throw new Error('Health check failed'); })" || exit 1

# Run the application
CMD ["node", "dist/src/server.js"]
