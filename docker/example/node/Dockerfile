# Latest version
FROM node:carbon

#Logging level
ENV NPM_CONFIG_LOGLEVEL info

# Application folder
WORKDIR /usr/src/app/venos/example

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# If you are building your code for production
# RUN npm install --only=production
RUN npm install

# Bundle app source
COPY . .

#Expose service port
EXPOSE 8080

#Command to run application
CMD [ "npm", "start" ]
