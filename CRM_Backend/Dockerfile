# ---------- Stage 1: Build the backend ----------
FROM node:18-alpine AS build
WORKDIR /app

# Copy dependency files first (for efficient caching)
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy all source code
COPY . .

# ---------- Stage 2: Production image ----------
FROM node:18-alpine
WORKDIR /app

# Copy only necessary files from build stage
COPY --from=build /app /app

# Set environment variables (can be overridden by docker-compose or cloud env)
ENV NODE_ENV=production

# Expose backend port
EXPOSE 8000

# Start the app
CMD ["npm", "start"]
