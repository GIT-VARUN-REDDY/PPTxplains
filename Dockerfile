# Multi-stage production Dockerfile
FROM node:22-alpine AS build

WORKDIR /app

# Copy root and workspace definitions
COPY package.json ./
COPY client/package*.json client/
COPY server/package*.json server/

# Install dependencies
RUN npm run install:all

# Copy source files
COPY client/ client/
COPY server/ server/

# Build client for production
RUN cd client && npm run build

# Production runner image
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Copy built server and client dist
COPY --from=build /app/server server/
COPY --from=build /app/client/dist client/dist

EXPOSE 5000

CMD ["node", "server/server.js"]
