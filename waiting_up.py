#! /usr/bin/python3.6

from urllib3 import disable_warnings
from requests import get
from time import sleep

URL_HTTPS = "https://oqustudy.kz/"
URL = "http://oqustudy.kz/"


def main():
    # status_code = get(URL_HTTPS, verify=False).status_code
    status_code = 0
    while status_code != 200:
        try:
            disable_warnings()

            sleep(5)
            status_code = get(URL).status_code
            print(status_code)
        except Exception as e:
            pass


main()
