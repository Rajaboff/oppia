#!/bin/bash

docker run -d --name oqustudy -p 80:80 -p 8000:8000 -v "$PWD/../appengine.None.root/:/tmp" -v "${PWD}/../oppia:/oppia" akhanbakhitov777/oqustudy
