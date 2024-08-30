# Stage 1: Build stage
FROM node:20

# Set a working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

# Install Firefox and required fonts
RUN apt-get update && \
    apt-get install -y wget gnupg firefox-esr fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Install Puppeteer
RUN npm install puppeteer && \
    npx puppeteer browsers install firefox

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Run the application
CMD ["npm", "run", "start:prod"]
