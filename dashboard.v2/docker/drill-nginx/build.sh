if [[ $# != 2 ]]; then
	echo "Usage: bash $0 {username} {password}"
	exit 1
fi
echo "username=$1  password=$2"
printf "$1:$(openssl passwd -crypt $2)\n" >> .htpasswd
docker build --rm --no-cache=true -t drill-nginx:latest .
rm -rf build
kirk images push drill-nginx:latest

