#!/bin/sh
export PATH=/usr/local/bin:$PATH;

sudo yum update
#install codedeploy agent
sudo yum install -y ruby
sudo yum install -y wget
cd /home/ec2-user
wget https://aws-codedeploy-eu-west-1.s3.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto
#install docker
sudo yum install -y docker
sudo service docker start
sudo systemctl enable docker
# Docker login notes:
#   - For no email, just put one blank space.
#   - Also the private repo protocol and version are needed for docker
#     to properly setup the .dockercfg file to work with compose
docker login --username="someuser" --password="asdfasdf" --email=" " https://example.com/v1/
mv /root/.dockercfg /home/ec2-user/.dockercfg
chown ec2-user:ec2-user /home/ec2-user/.dockercfg
usermod -a -G docker ec2-user
#install docker-compose
curl -L https://github.com/docker/compose/releases/download/1.21.1/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
chown root:docker /usr/local/bin/docker-compose
cat <<EOF >/home/ec2-user/docker-compose.yml
nginx:
  image: nginx
  ports:
    - "80:80"
EOF
chown ec2-user:ec2-user /home/ec2-user/docker-compose.yml
# run docker-compose
/usr/local/bin/docker-compose -f /home/ec2-user/docker-compose.yml up -d