# Хэндлеры

## Общее для хэндлеров

Везде, где после выполнения запроса происходит редирект, нужно поправить адрес редиректа. Сейчас даже если приложение открыто на 80-ом порту, после регистрации(или других действий) перебрасывает на порт 8181. Нужно поправить, чтоб редирект
происходил на 80-й. На сколько я понял, это зависит от параметра `continue` в параметрах запроса.

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

## PUT /createhandler/paid_status/{exploration_id}

Изменения платного статуса для занятия [MR21](https://gitlab.com/AkhanBakhitov/oppia/-/merge_requests/21).

Позволяет менять статус занятия с бесплатного `free` на платный `need_paid` и наоборот.
Бесплатные курсы может пройти любой ученик, а к платным доступ закрыт.

Статус занятия может менять его владелец, либо супер-админ.

Для изменения статуса нужно передать:

```bash
payload={"paid_status":"free"}

или

payload={"paid_status":"need_paid"}
```

## PUT /collection_editor_handler/paid_status/{collection_id}

Изменения платного статуса для курса [MR26](https://gitlab.com/AkhanBakhitov/oppia/-/merge_requests/26).

Позволяет менять статус курса с бесплатного `free` на платный `need_paid` и наоборот.

Внимание! Доступ до платных курсов вовсе **не ограничивается**.
Этот статус нужен только для того, чтобы на фронте показать состояние курса.
Логика работы с платными/бесплатными занятиями остаётся на совести занятий.

Статус курса может менять его владелец, либо супер-админ.

Для изменения статуса нужно передать:

```bash
payload={"paid_status":"free"}

или

payload={"paid_status":"need_paid"}
```

## PUT /rightshandler/change_topic_paid_status/{topic_id}

Изменения платного статуса для темы [MR31](https://gitlab.com/AkhanBakhitov/oppia/-/merge_requests/31).

Позволяет менять статус темы с бесплатного `free` на платный `need_paid` и наоборот.

Внимание! Доступ до платных тем вовсе **не ограничивается**.
Этот статус нужен только для того, чтобы на фронте показать состояние темы.
Логика работы с платными/бесплатными занятиями остаётся на совести занятий.

Статус темы может менять только супер-админ.

Для изменения статуса нужно передать:

```bash
payload={"paid_status":"free"}

или

payload={"paid_status":"need_paid"}
```

## PUT /createhandler/user_access/allow/{exploration_id} и /createhandler/user_access/restrict/{exploration_id}

Открытие или закрытие доступа пользователю до платного занятия [MR35](https://gitlab.com/AkhanBakhitov/oppia/-/merge_requests/35).

Пользователи, которым открыт доступ до занятия, могут его запускать.

Открыть доступ до занятия может его владелец, либо супер-админ.

```bash
payload={"user_id":"uid_some_user_id"}
```

## PUT /collection_editor_handler/user_access/allow/{collection_id} и /collection_editor_handler/user_access/restrict/{collection_id}

Открытие или закрытие доступа пользователю до платного курса [MR35](https://gitlab.com/AkhanBakhitov/oppia/-/merge_requests/35).

Пользователи, которым открыт доступ до курса, могут его запускать любое занятие, которое принадлежит этому курсу.

Открыть доступ до курса может его владелец, либо супер-админ.

```bash
payload={"user_id":"uid_some_user_id"}
```

## PUT /rightshandler/topic/user_access/allow/{topic_id} и /rightshandler/topic/user_access/restrict/{topic_id}

Открытие или закрытие доступа пользователю до платной темы [MR35](https://gitlab.com/AkhanBakhitov/oppia/-/merge_requests/35).

Пользователи, которым открыт доступ до темы, могут его запускать любое занятие, которое есть внутри темы.

Открыть доступ до тему может супер-админ.

```bash
payload={"user_id":"uid_some_user_id"}
```
