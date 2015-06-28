## Пример расширения модуля дополнительных команд чата своими командами:

### Вариант 1 - до загрузки скрипта cytubeEnhanced.

Если вы администратор канала, то данный код необходимо вставить в окно с javascript в панели администратора, так как в нём код выполняется до подключения внешнего скрипта. Или можно просто выполнить данный код до загрузки cytubeEnhanced;

```javascript
cytubeEnhancedBinds = {
    'additionalChatCommands': {
        beforeRun: function (commandsModule) {
            commandsModule.commandsList['!hi'] = {
                description: 'приветствие человека (!hi %username%)',
                value: function (msg) {
                    return msg.replace('!hi', 'привет, ');
                },
                isAvailable: function () {
                    return true;
                }
            };
        }
    }
};
```

### Вариант 2 - после загрузки скрипта cytubeEnhanced.

```javascript
cytubeEnhanced.getModule('additionalChatCommands').done(function (commandsModule) {
    commandsModule.commandsList['!показать моё либимое аниме'] = {
        description: 'выводит моё либимое аниме',
        value: function (msg) {
            return 'Атака титанов';
        },
        isAvailable: function () {
            return true;
        }
    };
})
```
