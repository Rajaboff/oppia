# Пользователи

## Роли

В проекте есть несколько ролей пользователей:

* admin
* banned user
* collection editor
* exploration editor
* guest
* learner
* moderator
* topic manager

Эти роли описаны в файле `role_service.py`. У каждой роли есть права - что может делать конкретный пользователь. Например:

```python
feconf.ROLE_ID_GUEST: [
    ACTION_PLAY_ANY_PUBLIC_ACTIVITY,
]
```

означает, что "гость" может запускать любую публичную (опубликованную) активность (курс/занятие).

Права можно удалить или добавить, тем самым **ограничить или расширить доступ** до определённых сущностей. Однако перед этим ознакомьтесь с [родительскими ролями](#родительские-роли)

## Родительские роли

Также присутствует механизм родительских ролей, когда можно указать, что одна роль наследуюет все возможности другой роли. Выглядит наследование ролей так:

```python
PARENT_ROLES = {
    feconf.ROLE_ID_ADMIN: [feconf.ROLE_ID_MODERATOR],
    feconf.ROLE_ID_BANNED_USER: [feconf.ROLE_ID_GUEST],
    feconf.ROLE_ID_COLLECTION_EDITOR: [feconf.ROLE_ID_EXPLORATION_EDITOR],
    feconf.ROLE_ID_EXPLORATION_EDITOR: [feconf.ROLE_ID_LEARNER],
    feconf.ROLE_ID_GUEST: [],
    feconf.ROLE_ID_LEARNER: [feconf.ROLE_ID_GUEST],
    feconf.ROLE_ID_MODERATOR: [feconf.ROLE_ID_TOPIC_MANAGER],
    feconf.ROLE_ID_TOPIC_MANAGER: [feconf.ROLE_ID_COLLECTION_EDITOR]
}
```

В примере `leaner` наследует все, что уммет `guest`, а `admin` наследует все возможности `moderator`.

С наследниками нужно быть внимательными: если удаляешь или добавляешь прав, то будь готов, что это **отразится на наследниках**.

## Ограничение доступа к хендлерам

Для ограничения доступа к ручкам используются декораторы, которые находятся в файле `acl_decorator.py`. Декораторы проверяют - есть ли у пришедшего пользователя доступ до ручек, основываясь на правах и не только.

### Новые декораторы

* `should_be_logged_in` - декоратор, который проверяет, что пользователь авторизован. Иначе кидает `NotLoggedInException`, который может заредиректить на страницу авторизации.
