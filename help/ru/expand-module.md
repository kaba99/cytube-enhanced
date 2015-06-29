## Пример расширения модуля дополнительных команд чата своими командами:

### Вариант 1 - до загрузки скрипта cytubeEnhanced.

Если вы администратор канала, то данный код необходимо вставить в окно с javascript в панели администрирования, так как в нём код выполняется до подключения внешнего скрипта. Или можно просто выполнить данный код до загрузки cytubeEnhanced;

```javascript
cytubeEnhancedSettings = {
    binds: {
        'additionalChatCommands': {
            beforeRun: function (commandsModule) {
                commandsModule.commandsList['!hi'] = {
                    description: 'приветствие человека (!привет %username%)',
                    value: function (msg) {
                        return msg.replace('!привет', 'привет, ');
                    },
                    isAvailable: function () {
                        return true;
                    }
                };
            }
        }
    }
};
```

### Вариант 2 - после загрузки скрипта cytubeEnhanced.

```javascript
cytubeEnhanced.getModule('additionalChatCommands').done(function (commandsModule) {
    commandsModule.commandsList['!показать моё либимое аниме'] = {
        description: 'выводит моё любимое аниме',
        value: function (msg) {
            return 'Атака титанов';
        },
        isAvailable: function () {
            return true;
        }
    };
})
```
