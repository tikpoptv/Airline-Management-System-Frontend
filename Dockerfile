# Step 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Step 2: Production stage
FROM nginx:alpine

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config (listens on port 85)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set exposed port
EXPOSE 85

CMD ["nginx", "-g", "daemon off;"]
