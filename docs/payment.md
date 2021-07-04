# Оплата

Для работы используется платёжная система Cloudpayments.
Документация [здесь](https://developers.cloudpayments.ru/).

Для завершения оплаты используется хендлер `POST /payment/ok`.

С FE в виджет нужно передать следующие данные:

```javascript
accountId: 'user@example.com', // email пользователя
data: {
    // Занятие
    // activityType: 'exploration',
    // activityId: 'jJh43SYYDKzD',

    // Курс
    // activityType: 'collection',
    // activityId: 'AfmuG83VODxg',

    // Тема
    // activityType: 'topic',
    // activityId: '4fEyxS8u2vjr',

    // Класс
    activityType: 'class',
    activityId: 'math',

    // Если подарок выставлен в true, тогда будет отпралено письмо на указанный email
    isPresent: false
}
```
