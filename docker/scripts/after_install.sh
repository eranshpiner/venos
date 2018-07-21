#!/bin/bash

echo  "-- Clean ... --\n"
/usr/local/bin/docker-compose rm --force --stop
docker stop $(docker ps -a -q)
docker rm --force $(docker ps -a -q)
docker rmi --force $(docker images -a -q)
echo "\n\n-- Removing volume directories --\n"
docker volume rm $(docker volume ls --quiet --filter="dangling=true")

echo  "-- start docker-compose --\n"
echo "Deployment environment : $VENOS_ENV"

chmod +x /home/ec2-user/venos/docker/scripts/docker_runner.sh
source /home/ec2-user/venos/docker/scripts/docker_runner.sh
#if [ "$VENOS_ENV" = "staging" ]
#then 
#  /usr/local/bin/docker-compose -f /home/ec2-user/venos/docker-compose-staging.yml up -d
#elif [ "$VENOS_ENV" = "production" ]
#then 
#  /usr/local/bin/docker-compose -f /home/ec2-user/venos/docker-compose-production.yml up -d
#else 
#    echo  "Error. Deployment environment variable is not set! Deployment is stopped!"
#    exit
#fi 
