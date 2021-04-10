# Хэндлеры

## GET /_ah/login_proxy

В вервыу очередь, нужно было запретить авторизацию только по email. Для этого использовался хэндлер **/_ah/login** c параметром **action=Login**.
На BE реализован хэнделер **/_ah/login_proxy** - делает все тоже самое что и **/_ah/login**, но не позволяет авторизоваться только по email.
Нужно изменить все вызовы **/_ah/login** на вызовы **/_ah/login_proxy**

## POST /custom_auth

Используется для авторизации по почте и паролю.
В параметрах пути нужно передать: `?email=test@example.com&action=Login&continue=http://mydomain.com/signup?return_url=/`, где:
- email - email пользователя
- mydomain.com - домен- ресурса

payload={"password":"Ru77Kq67", "email":"test@example.com"}

## POST /password_recovery_token

Отправляет письмо с токеном на восстановление пароля
Принимает:
payload={"email":"test@example.com"}
Пользователю будет отправлено письмо со ссылкой типа: http://localhost:8181/password_recovery?token=51099f9044f94351a516a94e1a852e2f
Перейдя по ссылке он должен ввести новый пароль и нажать кнопку "применить". По нажатию на кнопку, нужно отправить
POST-запрос `/token/<token>/password_recovery`. <token> - это токен с которым пришел пользователь. payload={"password":"NEW_PASS"}

## POST /email_confirm_token

Отправляет письмо с токеном на подтверждения почты
Принимает:
payload={"email":"test@example.com"}
Пользователю будет отправлено письмо со ссылкой типа: http://localhost:8181/email_confirm?token=ff4848a0e4d54cd19582094b002307b8
Перейдя по ссылке, пользователь должен попасть на страцицу откуда выполнится POST-запрос `/token/<token>/email_confirm`. <token> - это токен с которым пришел пользователь.
payload={}

## POST /signuphandler/data

Доработан. Используется для создания новых пользователей.
Кроме username теперь еще принимает email, пароль(password) и роль(role). Роль может иметь одно из 2-х значений:
- EXPLORATION_EDITOR - учитель
- LEARNER - ученик

Все параметры обязательны.

## GET /libraryindexhandler и др.

* GET /libraryindexhandler - библиотека курсов и занятий
* GET /librarygrouphandler - библиотека курсов и занятий
* GET /searchhandler/data - поиск курсов и занятий
* GET /explorationsummarieshandler/data - подробная информация по занятию
* GET /collectionsummarieshandler/data - подробная информация по курсу

Библиотека курсов и занятий скрыта для неавторизованных пользователей [MR16](https://gitlab.com/AkhanBakhitov/oppia/-/merge_requests/16).

Написал две вспомогательные ф-ции `does_user_has_access_to_collection` и `does_user_has_access_to_exploration`. Они проверяют - можно ли пользователю получать информацию о курсах/занятиях. В дальнейшем через это ф-цию можно рулить доступностью платных курсов.

## Общее для хэндлеров

Везде, где после выполнения запроса происходит редирект, нужно поправить адрес редиректа. Сейчас даже если приложение открыто на 80-ом порту, после регистрации(или других действий) перебрасывает на порт 8181. Нужно поправить, чтоб редирект
происходил на 80-й. На сколько я понял, это зависит от параметра `continue` в параметрах запроса.
