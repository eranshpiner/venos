# build should run from parent folder:
# docker build -f orderService/Dockerfile -t venos/orderservice:1.0.0 .


# container image includes Node.JS 8 over centos7
FROM venos/venos-base:1.0.0

# set env variables
ENV base_dir /usr/src/venos
ENV app_dir ${base_dir}/app
ENV data_dir ${base_dir}/data
#ENV tmp_dir /tmp/tmpbuild

# create dirs
RUN mkdir ${base_dir}; mkdir ${app_dir}; mkdir ${data_dir};
# RUN mkdir ${app_dir}/public;  mkdir ${tmp_dir}

# build checkout page
#COPY checkout-page/ ${tmp_dir}
#RUN cd ${tmp_dir} && \
#    yarn install && \
#    yarn build && \
#    mv ${tmp_dir}/dist/* ${app_dir}/public && \
#    rm -rf ${tmp_dir}

# set the working dir 
WORKDIR ${app_dir}

# copy the application files
COPY orderService/ ./

# RUN npm install (--only=production to exclude devDependencies)
RUN yarn install --production --pure-lockfile

# expose service port
EXPOSE 3000

ENV NODE_ENV production
# run application
CMD [ "yarn", "start" ]

 

