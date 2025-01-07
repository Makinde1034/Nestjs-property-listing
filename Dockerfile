<<<<<<< HEAD
=======



>>>>>>> 397cfa3 ( rebase)
# Stage 1: Build stage
FROM node:20

# Set a working directory
WORKDIR /usr/src/app

# Create a non-root user
RUN groupadd -g 1001 appgroup && \
    useradd -m -u 1001 -g appgroup appuser

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the application and grant universal access to 'dist'
RUN npm run build && \
    chmod -R 777 /usr/src/app/dist

# Install Firefox and required fonts
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    wget \
    gnupg \
    firefox-esr \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf && \
    rm -rf /var/lib/apt/lists/*

# Install Puppeteer without triggering Firefox download
RUN npm install puppeteer

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=development \ PUPPETEER_PRODUCT=firefox \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/firefox

# Run the application
<<<<<<< HEAD
CMD ["npm", "run", "start"]
=======
CMD ["npm", "run", "start:prod"]

>>>>>>> 397cfa3 ( rebase)
