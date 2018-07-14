#!/bin/sh

echo -e "-- Clean ... --\n"
/usr/local/bin/docker-compose rm --force --stop
docker stop $(docker ps -a -q)
docker rm --force $(docker ps -a -q)
docker rmi --force $(docker images -a -q)
echo -e "\n\n-- Removing volume directories --\n"
docker volume rm $(docker volume ls --quiet --filter="dangling=true")

echo -e "-- start docker-compose --\n"
/usr/local/bin/docker-compose -f /home/ec2-user/venos/docker-compose.yml up -d