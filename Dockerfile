
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


# Install Chromium dependencies
RUN apt update && apt install -y \
  chromium \
  libatk1.0-0 \
  libx11-xcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libgdk-pixbuf2.0-0 \
  libglib2.0-0 


# Install Puppeteer without triggering Firefox download
RUN npm install puppeteer

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=development 


# Run the application

CMD ["npm", "run", "start:prod"]


