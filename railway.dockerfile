# Force Railway to recognize new build - timestamp: 2025-12-26-14:05
FROM node:20-alpine

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy entire backend directory
COPY Softellio-Backend/ ./

# Install dependencies
RUN npm install

# Generate Prisma client (with dummy DATABASE_URL for build)
ENV DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy"
RUN npm run prisma:generate

# Build application
RUN npm run build

# Remove dummy DATABASE_URL (will be set by Railway at runtime)
ENV DATABASE_URL=""

# List built files for verification
RUN echo "=== BUILD VERIFICATION ===" && \
    ls -la dist/ && \
    ls -la dist/src/ && \
    echo "=== main.js location ===" && \
    find . -name "main.js" -type f

# Clean up dev dependencies
RUN npm prune --omit=dev

# Production environment
ENV NODE_ENV=production
EXPOSE 3000

# Start application
CMD ["npm", "run", "start:prod"]