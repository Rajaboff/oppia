# Работа с API

Для отправления запросов к сервису `curl` нужна авторизация в куках и csrf-токен.

## Dev-режим авторизации

Для авторизации в dev-режиме нужно отправить запрос на `/_ah/login`, передав email пользователя.
В ответных хедерах мы получим куки в хедере `Set-Cookie`:

```bash
$ curl 'http://127.0.0.1/_ah/login?email=test@example.com&action=Login' -D-

HTTP/1.1 302 Redirecting to continue URL
Content-Type: text/html; charset=utf-8
Content-Length: 0
Cache-Control: no-cache
Set-Cookie: dev_appserver_login="test@example.com:False:185804764220139124118"; Path=/
Location: http://127.0.0.1/_ah/login
Server: Development/2.0
Date: Sat, 24 Apr 2021 03:12:52 GMT
```

Нас интересует кука `dev_appserver_login="test@example.com:False:185804764220139124118"`

## CSRF-токен

Дальше для редактирующих запросов нужно сгенерить CSRF-токен.

> Не забудь передать куку в запрос, иначе токен будет бесполезен

```bash
$ curl 'http://127.0.0.1/csrfhandler' -b 'dev_appserver_login="test@example.com:False:185804764220139124118"'
)]}'
{"token": "1619234334/AuWEsnSexiTF_hCfRxbdBA=="}
```

## Отправка запросов

Имея куку и csrf-токен можно отправлять запросы.
Как правило токен передаётся внутри тела запроса:

```bash
$ curl 'http://127.0.0.1/createhandler/paid_status/jkdI9S0GwOEB' -X 'PUT' -b 'dev_appserver_login="test@example.com:False:185804764220139124118"' --data-raw 'csrf_token=1619234334/AuWEsnSexiTF_hCfRxbdBA==&payload={"paid_status":"need_paid"}'
)]}'
{"rights": {"viewer_names": [], "paid_status": "need_paid", "owner_names": ["Foo"], "community_owned": false, "viewable_if_private": false, "voice_artist_names": [], "cloned_from": null, "status": "public", "editor_names": []}}
```

## Все вместе

```bash
COOKIE=$(curl 'http://127.0.0.1/_ah/login?email=test@example.com&action=Login' -D- -s | grep "Set-Cookie" | cut -d ' ' -f 2 | cut -d ';' -f 1)

CSRF_TOKEN=$(curl 'http://127.0.0.1/csrfhandler' -s -b $COOKIE | grep token | cut -d '"' -f 4)

curl 'http://127.0.0.1/createhandler/paid_status/jkdI9S0GwOEB' -X 'PUT' -b $COOKIE -d 'csrf_token='$CSRF_TOKEN'&payload={"paid_status":"need_paid"}'
```
