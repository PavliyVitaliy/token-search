# Use the Node.js base image
FROM node:20

# Set the working directory
WORKDIR /app

# Copy the necessary files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the source code
COPY . .

# Build the NestJS application
RUN yarn build

# Expose the application port
EXPOSE 3000

# Define the command to run the application
CMD ["yarn", "start:prod"]
