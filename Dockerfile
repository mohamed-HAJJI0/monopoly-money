FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/game-state/package*.json ./packages/game-state/
COPY packages/server/package*.json ./packages/server/
COPY packages/client/package*.json ./packages/client/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

ENV VITE_API_ROOT=""

# Build the app
RUN npm run build

# Expose port
EXPOSE 8080

ENV PORT=8080
ENV NODE_ENV=production

CMD ["npm", "run", "start"]