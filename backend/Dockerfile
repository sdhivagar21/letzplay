FROM node:18-alpine
WORKDIR /app

# Install prod deps first (faster rebuilds)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# Expose port and run
ENV PORT=5000
EXPOSE 5000

CMD ["node", "server.js"]
