# === Build Stage ===
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the production-ready static files
RUN npm run build

# === Serve Stage ===
FROM node:18-alpine

# Install a static file server
RUN npm install -g serve

# Set working directory
WORKDIR /app

# Copy built files from the builder stage
COPY --from=builder /app/dist ./dist

# Expose port for Coolify or external reverse proxy
EXPOSE 4173

# Start the static server
CMD ["serve", "-s", "dist", "-l", "4173"]
