#!/bin/bash
if [ "$VENOS_ENV" = "staging" ]
then 
  /usr/local/bin/docker-compose -f /home/ec2-user/venos/docker-compose-staging.yml up -d
elif [ "$VENOS_ENV" = "production" ]
then 
   /usr/local/bin/docker-compose -f /home/ec2-user/venos/docker-compose-production.yml up -d
else 
    echo  "Error. Deployment environment variable is not set! Deployment is stopped!"
    exit
fi 