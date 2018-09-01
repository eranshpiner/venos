
# container image includes Node.JS 8 over centos7
FROM venos/venos-base:1.0.0

# set env variables
ENV base_dir /usr/src/venos
ENV app_dir ${base_dir}/app
ENV data_dir ${base_dir}/data

# create dirs
RUN mkdir ${base_dir}; mkdir ${app_dir}; mkdir ${data_dir}

# set the working dir
WORKDIR ${app_dir}

# copy the application files
COPY . ./

# RUN npm install (--only=production to exclude devDependencies)
RUN yarn install --production --pure-lockfile

# expose service port
EXPOSE 8080

ENV NODE_ENV production

# run application
CMD [ "yarn", "start" ]
