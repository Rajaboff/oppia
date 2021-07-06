# Оплата

Для работы используется платёжная система Cloudpayments.
Документация [здесь](https://developers.cloudpayments.ru/).

Для завершения оплаты используется хендлер `POST /payment/ok`.

С FE в виджет нужно передать следующие данные:

```javascript
accountId: 'user@example.com', // email пользователя
data: {
    // Занятие
    activityType: 'exploration',
    activityId: 'jJh43SYYDKzD',

    // Курс
    activityType: 'collection',
    activityId: 'AfmuG83VODxg',

    // Тема
    activityType: 'topic',
    activityId: '4fEyxS8u2vjr',

    // Класс
    activityType: 'class',
    activityId: 'math',

    // false - если покупка для себя
    isPresent: false,

    // true - это подарок и нужно отправить письмо пользователю, который передан в presentEmail
    isPresent: true,
    presentEmail: 'user@example.com'
}
```

Если пользователь купил для себя и зарегистрирован в системе, тогда ему просто будет открыт доступ к занятию/курсу/пр.

Если пользователя ещё нет в системе, или он купил активность в подарок - тогда будет выслано письмо на указанную почту.
В этом письме указан токен.
Нужно авторизоваться и отправить запрос `PUT /activity/access/{token}`, передав токен.
Затем для этого пользователя будет открыт доступ к активности.
