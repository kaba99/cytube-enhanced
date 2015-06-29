## Пример создания модуля скрытия блока с видео

### Вариант 1 - во время загрузки скрипта cytubeEnhanced.

Данный код необходимо выполнить между созданием экземпляра cytubeEnhanced в файле `js/main.js` (добавляется первым) и вызовом cytubeEnhanced.run() в файле `js/main-run.js`.

```javascript
cytubeEnhanced.setModule('hideVideo', function (app) {
    $('#videowrap').hide();
    
    $('#chatwrap').removeClass(function (index, css) { //удалить все классы col-*
        return (css.match(/(\s)*col-(\S)+/g) || []).join('');
    });
    $('#chatwrap').addClass('col-xs-12');
});

cytubeEnhanced.configureModule('hideVideo', {
    enabled: true
});
```

### Вариант 2 - после загрузки скрипта cytubeEnhanced:

```javascript
cytubeEnhanced.setModule('hideVideo', function (app) {
    $('#videowrap').hide();
    
    $('#chatwrap').removeClass(function (index, css) { //удалить все классы col-*
        return (css.match(/(\s)*col-(\S)+/g) || []).join('');
    });
    $('#chatwrap').addClass('col-xs-12');
});

cytubeEnhanced.configureModule('hideVideo', {
    enabled: true
});

cytubeEnhanced.runModule('hideVideo');
```
