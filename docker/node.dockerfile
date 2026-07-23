# Base image
FROM node:20.9.0
# Update npm to version 9.7.2
RUN npm install -g npm@10.5.2

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Create node_modules folder
RUN mkdir -p /app/node_modules

# Give write permission to node_modules folder
#RUN chown -R root:root /app/node_modules
#RUN chown -R node:node /app/node_modules
# Install dependencies
# Copy the rest of the application code to the container
COPY . .

#RUN npm install

#COPY ./app/node_modules /node_modules
#RUN npm install
# Set the NODE_OPTIONS environment variable
ENV NODE_OPTIONS="--max-old-space-size=16384"
# Make port 3000 available to the world outside this container
#EXPOSE 3000

# Start the application
#CMD ["npm", "run", "start:dev"]