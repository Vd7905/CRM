# ---------- Stage 1: Build the React app ----------
FROM node:18-alpine AS build
WORKDIR /app

# Copy dependency files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the full app and build it
COPY . .
RUN npm run build

# ---------- Stage 2: Serve with Nginx ----------
FROM nginx:alpine

# Copy custom nginx config (you’ll create this file below)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (container port for Nginx)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
