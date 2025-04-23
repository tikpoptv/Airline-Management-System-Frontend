FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Expose port 5173 (internal Vite dev server port)
EXPOSE 5173

# Default command to run the dev server
CMD ["npm", "run", "dev", "--", "--host", "--port=5173"]
