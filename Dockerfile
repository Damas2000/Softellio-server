# Use Node.js 20 LTS
FROM node:20-alpine

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy backend directory completely
COPY Softellio-Backend/ ./

# Install all dependencies (including dev for build)
RUN npm install

# Generate Prisma client
RUN npm run prisma:generate

# Build the application
RUN npm run build

# Verify the built file exists and show contents
RUN ls -la dist/
RUN ls -la dist/src/ || echo "dist/src not found"
RUN find dist/ -name "*.js" | head -10

# Remove dev dependencies for production
RUN npm prune --omit=dev

# Set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]