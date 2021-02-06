#! /usr/bin/bash

URL="http://oqustudy.kz/"

res=$(curl -o /dev/null -s -w "%{http_code}\n" ${URL})
echo ${res}

while [ "${res}" != "200" ]; do
	sleep 5
	res=$(curl -o /dev/null -s -w "%{http_code}\n" ${URL})
	echo ${res}
done
