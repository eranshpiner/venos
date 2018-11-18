#!/bin/bash

echo  "-- Clean ... --\n"
docker stop $(docker ps -a -q)
docker rm --force $(docker ps -a -q)
docker rmi --force $(docker images -a -q)
echo "\n\n-- Removing volume directories --\n"
docker volume rm $(docker volume ls --quiet --filter="dangling=true")

echo  "-- start docker-compose --\n"
echo "Deployment environment : $VENOS_ENV"

sudo /usr/local/bin/docker-compose -f /home/ec2-user/venos/docker-compose-${VENOS_ENV}.yml up -d 

#chmod +x /home/ec2-user/venos/docker/scripts/docker_runner.sh
#source /home/ec2-user/venos/docker/scripts/docker_runner_new.sh

#if [ "$VENOS_ENV" = "staging" ]
#then 
#  /usr/local/bin/docker-compose -f /home/ec2-user/venos/docker-compose-staging.yml up -d
#elif [ "$VENOS_ENV" = "production" ]
#then 
#  /usr/local/bin/docker-compose -f /home/ec2-user/venos/docker-compose-production.yml up -d
#else 
#    echo  "Error. Deployment environment variable is not set! Deployment is stopped!"
#    exit 1
#fi 
