# Build and run the API server
FROM node:20-alpine AS runtime

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy the rest of the server code
COPY . .

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Default to production, but can be overridden for development
CMD ["node", "server.js"]
