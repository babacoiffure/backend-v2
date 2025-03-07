# Use official Node.js LTS image as base
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install global dependencies
RUN npm install -g typescript ts-node

# Copy package files
COPY package*.json ./

# Install production dependencies
FROM base AS deps
RUN npm install --omit=dev

# Build stage
FROM base AS builder
# Install all dependencies for building
RUN npm install
# Copy source files
COPY . .
# Build TypeScript to JavaScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production

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
CMD ["npm", "start"]
