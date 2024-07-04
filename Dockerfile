# Base image
FROM node:18



# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install


# Install Puppeteer and Chromium dependencies
RUN apt-get update && \
    apt-get install -y \
        chromium \
        fonts-liberation \
        fonts-ipafont-gothic \
        fonts-wqy-zenhei \
        fonts-thai-tlwg \
        fonts-kacst \
        ttf-freefont \
        libcups2 \
        libxss1 \
        libappindicator1 \
        libnss3 \
        libatk-bridge2.0-0 \
        libgtk-3-0 \
        libx11-xcb1 \
        libxtst6 \
        libxkbcommon-x11-0 \
        libasound2 \
        xvfb \
        x11-xkb-utils \
        xfonts-100dpi \
        xfonts-75dpi \
        xfonts-scalable \
        xfonts-cyrillic \
        x11-apps \
        clang \
        python \
        g++
        --no-install-recommends \
        && apt-get clean \
        && rm -rf /var/lib/apt/lists/*
        
# Set Puppeteer environment variables
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Set Puppeteer environment variables (for running in Docker)
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000
# Run the application
CMD ["npm", "run", "start:prod"]