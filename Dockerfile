FROM node:20-bookworm

# Install system dependencies for Chromium
RUN apt-get update && apt-get install -y \
    curl \
    libnss3 \
    libdbus-1-3 \
    libatk1.0-0 \
    libgbm-dev \
    libasound2 \
    libxrandr2 \
    libxkbcommon-dev \
    libxfixes3 \
    libxcomposite1 \
    libxdamage1 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxshmfence1 \
    libgtk-3-0 \
    libglu1-mesa \
    fonts-liberation \
    fonts-noto-color-emoji \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Create output directory
RUN mkdir -p renders

# Install Remotion browser
RUN npx remotion browser ensure

# Bundle Remotion project
RUN npx remotion bundle remotion/index.ts build/bundle.js

# Set environment variables
ENV NODE_ENV=production
ENV REMOTION_IGNORE_MEMORY_CHECK=true

# Expose port
EXPOSE 8000

# Start server
CMD ["npm", "start"]
