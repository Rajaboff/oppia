# Nginx

Nginx необходим для запрета старой системы авторизации(только по email)
Платформа поднимается на порту 8181, а nginx на 80. Наружу светим 80. Перенаправляем все запросы c 80 на 8181 кроме
запросов на `/_ah/login`, таким образом запретим старую авторизацию.

## Установка nginx

```bash
sudo apt update
sudo apt install nginx
sudo systemctl enable nginx
```

## Настройка nginx

1. Переходим в директорию с oppia
2. Перезаписываем файл и перезапускаем nginx
```bash
sudo systemctl stop nginx
sudo cat nginx_local.conf > /etc/nginx/nginx.conf
sudo systemctl start nginx
```

### Поднять самоподписанный сертификат

```bash
sudo mkdir /etc/nginx/ssl/
cd sert
sudo cp * /etc/nginx/ssl/
```

P.S.

- Для генерации сертификата пользовался [этой](https://habr.com/ru/post/352722/) статьей
- Если есть проблемы с редиректами попробуйте режим инкогнито - браузер мог что-то закешировать

## Запуск приложения

Т.к. теперь используем nginx, то приложение нужно поднимать не на 80, а на 8181 порту.
Т.е. команда получается такая:

```bash
docker run -d --name oqustudy -p 8181:80 -v "~/appengine.None.root/:/tmp" -v "${PWD}/../oppia:/oppia" akhanbakhitov777/oqustudy
```

Чтобы ходить по домену `oqustudy.kz` и попадать в локальное приложение, а не в прод, нужно в `/etc/hosts` добавить строку `127.0.0.1	oqustudy.kz`
