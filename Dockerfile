# Base image
FROM node:18

# Create a non-root user and group with a home directory
RUN groupadd -r appgroup && useradd -r -g appgroup -d /home/appuser appuser

# Create the home directory for the non-root user and set permissions
RUN mkdir -p /home/appuser /home/appuser/.npm && \
    chown -R appuser:appgroup /home/appuser

# Create app directory and set ownership
RUN mkdir -p /usr/src/app && chown -R appuser:appgroup /usr/src/app

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json as the root user
COPY package*.json ./

# Install Chromium dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libnss3 \
    libxcomposite1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*


    

# Install Puppeteer and other npm dependencies as the root user

# Install app dependencies as the root user
RUN npm install



# Download wait-for-it.sh script
RUN curl -o /usr/src/app/wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh \
    && chmod +x /usr/src/app/wait-for-it.sh




# Copy the rest of the application source code as the root user
COPY . .

# Ensure the entire app directory is owned by the non-root user before switching to it
RUN chown -R appuser:appgroup /usr/src/app

# Switch to the non-root user
USER appuser

# Creates a "dist" folder with the production build (if applicable)
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Run the application with wait-for-it script
CMD ["bash", "wait-for-it.sh", "postgres:5432", "--", "npm", "run", "start:prod"]
