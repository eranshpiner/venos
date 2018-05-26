
# container image includes mysql
FROM mysql:5.7

# set env variables
ENV base_dir /usr/src
ENV db_dir ${base_dir}/db
ENV dbconf_dir ${db_dir}/config

# create dirs
RUN mkdir ${db_dir}; mkdir ${dbconf_dir}

# copy the 'package.json' file
COPY init.sql ${dbconf_dir}

