#!/bin/bash

if [ $# -lt 6 ]
then
        echo "Invalid input parameters. Usage : $0 -a venos -g staging/production -r github-repo-name/project"
        exit
fi

while getopts :a:g:r: option
do
case "${option}"
in
a) APPLICATION=${OPTARG};;
g) GROUP=${OPTARG};;
r) REPO=${OPTARG};;
?) echo "Invalid input parameters"; exit -1;;
esac
done

if [ -z ${APPLICATION} ]; then
	echo "application name is unset. Probably should be : venos"
	exit
elif [ -z ${GROUP} ]; then
	echo "group name is unset. Should be : staging or production"
        exit
elif [ -z ${REPO} ]; then
	echo "github repository is unset. Should be in format : organization/repo"
        exit
fi

echo "deployment configuration:"
echo "--------------------------"
echo "application = $APPLICATION"
echo "group       = $GROUP"
echo "github repo = $REPO"

#retrieve last commit id
commit_id=$(git log -1 | grep ^commit | cut -d " " -f 2)
echo "commit_id   = $commit_id"
echo "--------------------------"

deployment_status=$(aws deploy create-deployment \
  --application-name $APPLICATION \
  --deployment-config-name CodeDeployDefault.OneAtATime \
  --deployment-group-name $GROUP \
  --description "Deployment to EC2" \
  --github-location repository=$REPO,commitId=$commit_id)
echo "$deployment_status"
echo "$deployment_status" > deployment_id.txt

for (( ; ; ))
do
   result=$(aws deploy get-deployment --cli-input-json "$deployment_status")
   sleep 5s
   echo "$result" | grep -e status | cut -d "," -f 1 | cut -d ":" -f 2

   #echo "$status"
done
