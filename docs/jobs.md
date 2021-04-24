# Задачи (jobs) для фиксации БД

После добавления нового/новых полей а GAE БД нужно их заполнить актуальными значениями.
Для этого существует механизм Job.

За подробностями идём в [доку](https://github.com/oppia/oppia/wiki/Writing-new-one-off-jobs-using-map-reduce).

## Пример Job-ы

```python
class SetPaidStatus4ActivityRightsOneOffJob(jobs.BaseMapReduceOneOffJobManager):
    """One-off job that sets up the paid status for activities rights."""
    COMMITER = user_services.UserActionsInfo(feconf.SYSTEM_COMMITTER_ID)

    @classmethod
    def entity_classes_to_map_over(cls):
        return [
            collection_models.CollectionRightsModel,
            exp_models.ExplorationRightsModel,
        ]

    @staticmethod
    def map(model):
        if model.deleted:
            return

        if isinstance(model, exp_models.ExplorationRightsModel):
            rights_manager.change_exploration_paid_status(
                SetPaidStatus4ActivityRightsOneOffJob.COMMITER,
                model.id,
                feconf.DEFAULT_EXPLORATION_PAID_STATUS,
            )
        elif isinstance(model, collection_models.CollectionRightsModel):
            rights_manager.change_collection_paid_status(
                SetPaidStatus4ActivityRightsOneOffJob.COMMITER,
                model.id,
                feconf.DEFAULT_EXPLORATION_PAID_STATUS,
            )

        yield ('SUCCESS', model.id)

    @staticmethod
    def reduce(key, values):
        yield (key, len(values))
```

## Пишем Job-у

1. Выбираем файл для джобы

    Проще всего посомтреть на имена файлов и на Job-ы, которые написаны внутри.
    Выбираем подходящий файл, который оканчивается на `jobs_one_off.py`

2. Создаём класс

    В большинстве случаев наследуемся от `jobs.BaseMapReduceOneOffJobManager` и описываем три метода:

    * `entity_classes_to_map_over` - возвращает массив моделей (таблиц базы данных), для которых будет производиться фикс
    * `map` - принимает запись из таблицы (`model`) для запуска фикса. В нём описываем основную логику фикса
    * `reduce` - TODO(anyone): добавить описания для reduce.
