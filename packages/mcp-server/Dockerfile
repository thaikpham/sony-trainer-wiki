# Use Node.js 20 as base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and config
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Start the server
CMD ["npm", "start"]
