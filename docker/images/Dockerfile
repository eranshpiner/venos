# venos/nodejs8-centos7:latest

# a base image for all Venos nodejs images. 
# built on centos7 and setup with nodejs 8.
FROM centos:centos7

# add yarn repo
RUN curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo

# installing the NodeSource Node.js 8.x repo...
RUN curl -sL https://rpm.nodesource.com/setup_8.x | bash -

# install nodejs
RUN yum install nodejs yarn -y


 

