# Запуск образа Docker на Windows

docker run -d --name oqustudy-dev-3 -p 80:80 -p 8000:8000 -v "C://oppia/appengine.None.root/:/tmp" -v "C://Git/.oqustudy.kz/oppia/../oppia:/oppia" dev-oppia
