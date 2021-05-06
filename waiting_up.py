#! /usr/bin/python3.6

from urllib3 import disable_warnings
from requests import get
from time import sleep

URL="https://oqustudy.kz/"

disable_warnings()
res = get(URL, verify=False)
print(res.status_code)

while res.status_code != 200:
    sleep(5)
    res = get(URL, verify=False)
    print(res.status_code)
