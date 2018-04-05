
# container image includes Node.JS 8 over centos7
FROM venos/nodejs8-centos7:latest

# set env variables
ENV base_dir /usr/src/venos
ENV app_dir ${base_dir}/app
ENV data_dir ${base_dir}/data

# create dirs
RUN mkdir ${base_dir}; mkdir ${app_dir}; mkdir ${data_dir}

# set the working dir 
WORKDIR ${app_dir}

# copy the 'package.json' file
COPY package.json ./

# RUN npm install (--only=production to exclude devDependencies)
RUN npm install

# copy the application bundle
ADD app.js ./
ADD schema ./schema

# expose service port
EXPOSE 3000

# run application
CMD [ "node", "app.js" ]

 

