
# container image includes Node.JS 8 over centos7
FROM eranshpiner/venos:1.0.0

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
ADD uuid.js ./
ADD customers ./customers
ADD lib ./lib
ADD notes ./notes

# expose service port
EXPOSE 8080

# run application
CMD [ "node", "app.js" ]

 

