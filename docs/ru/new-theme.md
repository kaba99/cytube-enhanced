Создание новой темы
===================

**Для работы тем должен быть включен модуль theme.js**

Тема состоит из двух файлов - файла со стилями (обязателен) и javascript-файла для настройки темы (по желанию).
Чтобы добавить новую тему нужно создать файл конфигурации:

```javascript
window.cytubeEnhanced.getModule('themes').done(function (extraModules) {
    extraModules.add({
        title: 'Новогодняя тема',
        name: 'new-year',
        cssUrl: 'https://rawgit.com/kaba99/cytube-enhanced/master/themes/new_year/theme.css',
        jsUrl: 'https://rawgit.com/kaba99/cytube-enhanced/master/themes/new_year/theme.js',
        pictureUrl: 'http://i.imgur.com/N9JOTno.png'
    });
});
```

Ключи `title` и `name` обозначают название в списке тем и системное имя (на латинице).
`cssUrl` - ссылка на файл со стилями темы (обязателен). `jsUrl` - ссылка на файл с настройками темы (необязателен).

## Скрипт с настройками темы

Как говорилось выше, тему можно настроить любым скриптом:

```javascript
$(document).ready(function () {
    console.log('Тема загружена!');
});
```

Кроме этого доступна возможность удобно создать нужные опции на вкладке с настройками вашей темы и ,тем самым, управлять ей:

```javascript
window.cytubeEnhanced.Settings.configureTheme(function (app, tab, storage) {
    'use strict';

    app.addTranslation('ru', {
        theme: {'Hide header': 'Скрывать шапку'}
    });


    var options: [
        {value: 'yes', title: app.t('theme[.]Yes')},
        {value: 'no', title: app.t('theme[.]No')}
    ]
    storage.setDefault('hide-header', 'no');

    if (storage.get('hide-header')) {
        for (var option in schemeItem.options) {
            schemeItem.options[option].selected = (storage.get(itemName) == schemeItem.options[option].value)
        }
    }

    tab.addControl('select', 'horizontal', app.t('theme[.]Hide header'), 'hide-header', options, null, 0);


    var applySettings = function (storage) {
        if (storage.get('hide-header') === 'yes') {
            $('#motdrow').hide();
        } else {
            $('#motdrow').show();
        }
    };

    app.Settings.onSave(function () {
        storage.set('hide-header', $('#' + app.prefix + 'hide-header').val());

        applySettings(storage);
    });
    applySettings(storage);
});
```

Этот код создаёт выпадающий список "Скрывать шапку" в настройках темы. Если значение это выпадающего списка равно "yes", то при сохранении настроек шапка (`#motdrow`) будет скрываться при каждом обновлении страницы. Если выбрано "no" - то шапка показывается.