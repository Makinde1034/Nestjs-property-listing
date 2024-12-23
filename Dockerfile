# # # Stage 1: Build stage
# # FROM node:20

# # # Set a working directory
# # WORKDIR /usr/src/app

# # # Copy package.json and package-lock.json
# # COPY package*.json ./

# # # Install dependencies
# # RUN npm ci

# # # Copy the rest of the application source code
# # COPY . .

# # # Build the application
# # RUN npm run build

# # # Install Firefox and required fonts
# # RUN apt-get update && \
# #     apt-get install -y wget gnupg firefox-esr fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf --no-install-recommends && \
# #     rm -rf /var/lib/apt/lists/*

# # # Install Puppeteer
# # RUN npm install puppeteer && \
# #     npx puppeteer browsers install firefox

# # # Expose the port the app runs on
# # EXPOSE 3000

# # # Set environment variables
# # ENV NODE_ENV=production

# # # Run the application
# # CMD ["npm", "run", "start:prod"]


# # Stage 1: Build stage
# FROM node:20

# # Set a working directory
# WORKDIR /usr/src/app

# # Copy package.json and package-lock.json
# COPY package*.json ./

# # Install dependencies
# RUN npm ci

# # Copy the rest of the application source code
# COPY . .

# # Build the application
# RUN npm run build

# # Install Firefox and required fonts
# RUN apt-get update && \
#     apt-get install -y --no-install-recommends \
#     wget \
#     gnupg \
#     firefox-esr \
#     fonts-ipafont-gothic \
#     fonts-wqy-zenhei \
#     fonts-thai-tlwg \
#     fonts-kacst \
#     fonts-freefont-ttf && \
#     rm -rf /var/lib/apt/lists/*

# # Install Puppeteer without triggering Firefox download
# RUN npm install puppeteer

# # Expose the port the app runs on
# EXPOSE 3000

# # Set environment variables
# ENV NODE_ENV=production \
#     PUPPETEER_PRODUCT=firefox \
#     PUPPETEER_EXECUTABLE_PATH=/usr/bin/firefox

# # Run the application
# CMD ["npm", "run", "start:prod"]

# # Stage 1: Build stage
# FROM node:20 as builder

# WORKDIR /usr/src/app
# COPY package*.json ./
# RUN npm ci
# COPY . .
# RUN npm run build

# # Stage 2: Production stage
# FROM node:20-slim

# WORKDIR /usr/src/app
# COPY --from=builder /usr/src/app/dist ./dist
# COPY package*.json ./
# RUN npm ci --only=production

# ENV NODE_OPTIONS="--max-old-space-size=4096"

# # Install Firefox and required fonts
# RUN apt-get update && \
#     apt-get install -y --no-install-recommends \
#     wget \
#     gnupg \
#     firefox-esr \
#     fonts-ipafont-gothic \
#     fonts-wqy-zenhei \
#     fonts-thai-tlwg \
#     fonts-kacst \
#     fonts-freefont-ttf && \
#     rm -rf /var/lib/apt/lists/*

# ENV NODE_ENV=production \
#     PUPPETEER_PRODUCT=firefox \
#     PUPPETEER_EXECUTABLE_PATH=/usr/bin/firefox

# EXPOSE 3000

# CMD ["node", "--max-old-space-size=4096", "dist/main"]




# Stage 1: Build stage
FROM node:20 as builder

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production stage
FROM node:20-slim

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
COPY package*.json ./
RUN npm ci --only=production

ENV NODE_OPTIONS="--max-old-space-size=4096"

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

# Set environment variables for Puppeteer
ENV NODE_ENV=production \
    PUPPETEER_PRODUCT=firefox \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/firefox

EXPOSE 3000

CMD ["node", "--max-old-space-size=4096", "dist/main"]
