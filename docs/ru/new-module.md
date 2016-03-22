Создание нового модуля
======================

Новый модуль может быть добавлен после запуска скрипта. Например:

```javascript
window.cytubeEnhanced.addModule('greetingMessage', function (app, settings) {
    alert(settings.message + ' ' + app.channelName + '!');
});
```

Наш модуль довольно прост - при его инициализации с помощью функции `alert` появляется всплывающее окно с приветствием.
Первый параметр метода `addModule` - название нашего модуля. Второй - функция, являющяяся конструктором нашего модуля.
В функцию передаются 2 параметра: `app` - экземпляр `window.CytubeEnhanced`, а `settings` - объект с настройками вашего модуля по умолчанию. Как их задавать можно посмотреть [здесь](https://github.com/kaba99/cytube-enhanced/tree/master/docs/ru/tuning.md).