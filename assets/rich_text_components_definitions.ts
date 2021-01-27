
/* eslint-disable */
/* Don't modify anything outside the {} brackets.
 * The contents of the {} brackets should be formatted as a JSON object.
 * JSON rules:
 * 1. All keys and string values must be enclosed in double quotes.
 * 2. Each key/value pair should be on a new line.
 * 3. All values and keys must be constant, you can't use any JavaScript
 *    functions.
 */

/**
 * @fileoverview Definitions for rich text components.
 */

export = {
  "Collapsible": {
    "backend_id": "Collapsible",
    "category": "Basic Input",
    "description": "Разборный блок HTML.",
    "frontend_id": "collapsible",
    "tooltip": "Insert collapsible block",
    "icon_data_url": "/rich_text_components/Collapsible/Collapsible.png",
    "is_complex": true,
    "requires_fs": false,
    "is_lesson_related": false,
    "is_block_element": true,
    "customization_arg_specs": [{
      "name": "heading",
      "description": "Заголовок для блока акардиона",
      "schema": {
        "type": "unicode"
      },
      "default_value": "Образец заголовка"
    }, {
      "name": "content",
      "description": "Содержимое блока акардиона",
      "schema": {
        "type": "html",
        "ui_config": {
          "hide_complex_extensions": true
        }
      },
      "default_value": "Вы открыли блок акардион."
    }]
  },
  "Image": {
    "backend_id": "Image",
    "category": "Basic Input",
    "description": "Картинка.",
    "frontend_id": "image",
    "tooltip": "Insert image",
    "icon_data_url": "/rich_text_components/Image/Image.png",
    "is_complex": false,
    "requires_fs": true,
    "is_lesson_related": false,
    "is_block_element": true,
    "customization_arg_specs": [{
      "name": "filepath",
      "description": "Изображение (Разрешенные расширения: gif, jpeg, jpg, png, svg)",
      "schema": {
        "type": "custom",
        "obj_type": "Filepath"
      },
      "default_value": ""
    }, {
      "name": "caption",
      "description": "Подпись к изображению (необязательно)",
      "schema": {
        "type": "unicode"
      },
      "default_value": ""
    }, {
      "name": "alt",
      "description": "Кратко объяснение этого изображения",
      "schema": {
        "type": "unicode",
        "validators": [{
          "id": "is_nonempty"
        }],
        "ui_config": {
          "placeholder": "Подробное описание изображения"
        }
      },
      "default_value": ""
    }]
  },
  "Link": {
    "backend_id": "Link",
    "category": "Basic Input",
    "description": "Ссылка на URL-адрес.",
    "frontend_id": "link",
    "tooltip": "Insert link",
    "icon_data_url": "/rich_text_components/Link/Link.png",
    "is_complex": false,
    "requires_fs": false,
    "is_lesson_related": false,
    "is_block_element": false,
    "customization_arg_specs": [{
      "name": "url",
      "description": "URL ссылки. Если протокол не указан, будет использоваться HTTPS.",
      "schema": {
        "type": "custom",
        "obj_type": "SanitizedUrl"
      },
      "default_value": ""
    }, {
      "name": "text",
      "description": "Текст ссылки. Если оставить поле пустым, будет использоваться URL-адрес ссылки.",
      "schema": {
        "type": "unicode"
      },
      "default_value": ""
    }]
  },
  "Math": {
    "backend_id": "Math",
    "category": "Basic Input",
    "description": "Математическая формула.",
    "frontend_id": "math",
    "tooltip": "Insert mathematical formula",
    "icon_data_url": "/rich_text_components/Math/Math.png",
    "is_complex": false,
    "requires_fs": false,
    "is_lesson_related": false,
    "is_block_element": false,
    "customization_arg_specs": [{
      "name": "math_content",
      "description": "Отображаемое математическое выражение.",
      "schema": {
        "type": "custom",
        "obj_type": "MathExpressionContent"
      },
      "default_value": {
        "raw_latex": "",
        "svg_filename": ""
      }
    }]
  },
  "Skillreview": {
    "backend_id": "skillreview",
    "category": "Basic Input",
    "description": "Ссылка на концептуальную карту связанного навыка.",
    "frontend_id": "skillreview",
    "tooltip": "Insert Concept Card Link",
    "icon_data_url": "/rich_text_components/Skillreview/Skillreview.png",
    "is_complex": false,
    "requires_fs": false,
    "is_lesson_related": true,
    "is_block_element": false,
    "customization_arg_specs": [{
      "name": "text",
      "description": "Текст для отображения",
      "schema": {
        "type": "unicode"
      },
      "default_value": "концептуальная карта"
    }, {
      "name": "skill_id",
      "description": "Навык, к которому относится эта ссылка",
      "schema": {
        "type": "custom",
        "obj_type": "SkillSelector"
      },
      "default_value": ""
    }]
  },
  "Svgdiagram": {
    "backend_id": "svgdiagram",
    "category": "Basic Input",
    "description": "Пользовательская диаграмма SVG.",
    "frontend_id": "svgdiagram",
    "tooltip": "Insert diagram",
    "icon_data_url": "/rich_text_components/Svgdiagram/Svgdiagram.png",
    "is_complex": false,
    "requires_fs": true,
    "is_lesson_related": false,
    "is_block_element": true,
    "customization_arg_specs": [{
      "name": "svg_filename",
      "description": "Редактор диаграмм SVG",
      "schema": {
        "type": "custom",
        "obj_type": "SvgFilename"
      },
      "default_value": ""
    }, {
      "name": "alt",
      "description": "Кратко объясните эту диаграмму.",
      "schema": {
        "type": "unicode",
        "validators": [{
          "id": "is_nonempty"
        }],
        "ui_config": {
          "placeholder": "Описание схемы"
        }
      },
      "default_value": ""
    }]
  },
  "Tabs": {
    "backend_id": "Tabs",
    "category": "Basic Input",
    "description": "Набор вкладок.",
    "frontend_id": "tabs",
    "tooltip": "Insert tabs (e.g. for hints)",
    "icon_data_url": "/rich_text_components/Tabs/Tabs.png",
    "is_complex": true,
    "requires_fs": false,
    "is_lesson_related": false,
    "is_block_element": true,
    "customization_arg_specs": [{
      "name": "tab_contents",
      "description": "Заголовки и содержание вкладок.",
      "schema": {
        "type": "custom",
        "obj_type": "ListOfTabs"
      },
      "default_value": [{
        "title": "Заголовок подсказки",
        "content": "Этот набор вкладок показывает некоторые подсказки. Щелкните другие вкладки, чтобы отобразить соответствующие подсказки."
      }, {
        "title": "Подсказка №1",
        "content": "Это первая подсказка."
      }]
    }]
  },
  "Video": {
    "backend_id": "Video",
    "category": "Basic Input",
    "description": "Видео на YouTube",
    "frontend_id": "video",
    "tooltip": "Insert video",
    "icon_data_url": "/rich_text_components/Video/Video.png",
    "is_complex": false,
    "requires_fs": false,
    "is_lesson_related": false,
    "is_block_element": true,
    "customization_arg_specs": [{
      "name": "video_id",
      "description": "URL-адрес Youtube с ID видео.. (ID - это строка из 11 символов после \"v=\" в URL-адресе видео.)",
      "schema": {
        "type": "unicode"
      },
      "default_value": ""
    }, {
      "name": "start",
      "description": "Время начала видео в секундах: (на какой момент начать видео.)",
      "schema": {
        "type": "int",
        "validators": [{
          "id": "is_at_least",
          "min_value": 0
        }]
      },
      "default_value": 0
    }, {
      "name": "end",
      "description": "Время окончания видео в секундах: (на какой момент закончить видео.)",
      "schema": {
        "type": "int",
          "validators": [{
            "id": "is_at_least",
            "min_value": 0
          }]
      },
      "default_value": 0
    }, {
      "name": "autoplay",
      "description": "Автовоспроизвести это видео после загрузки вопроса?",
      "schema": {
        "type": "bool"
      },
      "default_value": false
    }]
  }
};
