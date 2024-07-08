# Stage 1: Build stage
FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Add user so we don't need --no-sandbox.
# RUN groupadd -r user && useradd -r -g user -G audio,video user \
#     && mkdir -p /home/user/Downloads \
#     && chown -R user:user /home/user \
#     && chown -R user:user /usr/src/app

# # Switch to non-root user
# USER user

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

# Install Chromium dependencies
# USER root
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Switch back to non-root user
# USER user

# Install Puppeteer
RUN npm install puppeteer

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables for production
ENV NODE_ENV=production

# Run the application
CMD ["npm", "run", "start:prod"]





# Run the application
# CMD ["google-chrome-stable", "npm", "run", "start:prod"]
