# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy root package.json for workspace setup
COPY package.json ./
COPY Softellio-Backend/package.json ./Softellio-Backend/
COPY Softellio-Backend/package-lock.json ./Softellio-Backend/

# Install dependencies in backend directory
WORKDIR /app/Softellio-Backend
RUN npm ci --only=production

# Copy backend source code
COPY Softellio-Backend/ ./

# Generate Prisma client
RUN npm run prisma:generate

# Build the application
RUN npm run build

# Verify the built file exists
RUN ls -la dist/src/

# Set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]