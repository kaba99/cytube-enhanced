Настройка модулей
=================

Большинство модулей, хранящихся в `src/js/modules` можно настраивать.
Рассмотрим небольшой пример (данный объект с настройками должен находиться внутри текстовой области с javascript в настройках канала, т.к. должен существовать до загрузки основного скрипта):

```javascript
window.cytubeEnhancedSettings = {
    language: 'en', //необязательный параметр
    modulesSettings: { //необязательный параметр
        additionalChatCommands: {
            permittedCommands: ['!pick', '!q']
        },
        chatControls: {
            clearChatButton: false
        },
    }
};
```

Здесь настраивается параметр `language`, отвечающий за язык интерфейса по умолчанию, а также два модуля - `additionalChatCommands` и `chatControls`. 
Параметры для каждого настроенного модуля передаются в качестве переменной settings в указанный модуль. К примеру для модуля `chatControls` код с доступными параметрами выглядит так:

```javascript
window.cytubeEnhanced.addModule('chatControls', function (app, settings) {
...
    var defaultSettings = {
        afkButton: true,
        clearChatButton: true
    };
...
```

Исходя из ключей объекта `defaultSettings` понятно, что настраиваются 2 параметра - наличие кнопки афк и наличие кнопки очистки чата.


## Углублённая настройка модулей

Также у модулей можно менять часть функционала на свой. Рассмотрим кусочек кода модуля `additionalChatCommands`:

```javascript
window.cytubeEnhanced.addModule('additionalChatCommands', function (app, settings) {
    ...


    /**
     *The list of commands
     *
     * Every command must have method value(message) which returns command's message.
     * Commands can also have description property for chatCommandsHelp module and isAvailable method which returns false if command is not permitted (by default returns true)
     *
     * @type {object}
     */
    this.commandsList = {
        '!pick': {
            description: app.t('chatCommands[.]random option from the list of options (!pick option1, option2, option3)'),
            value: function (msg) {
                var variants = msg.replace('!pick ', '').split(',');
                return variants[Math.floor(Math.random() * variants.length)].trim();
            }
        },
        '!ask': {
            description: app.t('chatCommands[.]asking a question with yes/no/... type answer (e.g. <i>!ask Will i be rich?</i>)'),
            value: function () {
                return that.askAnswers[Math.floor(Math.random() * that.askAnswers.length)];
            }
        },
```

В этом модуле есть объект `commandsList`, содержащий список дополнительных команд чата.
Он прикреплён к модулю с помощью ключевого слова `this`. Благодаря этому мы можем поменять его, к примеру, добавив несколько своих команд.

**Есть 2 способа такой настройки**

**Первый (`до` загрузки скрипта, должен находиться внутри текстовой области с javascript в настройках канала):**

```javascript
window.cytubeEnhancedSettings = {
    language: 'en', //необязательный параметр
    modulesSettings: { //необязательный параметр
    },
    modulesExtends: {
        additionalChatCommands: function (commandsModule) {
            commandsModule.commandsList['!my favorite anime'] = {
                description: 'Показывает моё любимое аниме',
                value: function (msg) {
                    return 'Хигураши ОВА';
                },
                isAvailable: function () {
                    return true;
                }
            };
        }
    }
};
```

**Второй (`после` загрузки скрипта, должен выполниться `после загрузки window.cytubeEnhanced`):**

```javascript
window.cytubeEnhanced.getModule('additionalChatCommands').done(function (commandsModule) {
    commandsModule.commandsList['!my favorite anime'] = {
        description: 'Показывает моё любимое аниме',
        value: function (msg) {
            return 'Хигураши ОВА';
        },
        isAvailable: function () {
            return true;
        }
    };
});
```

Аналогичное работает с другими модулями и функционалом, прилепленным через `this` или `that`. Подробнее про необходимость в `that` [здесь](http://stackoverflow.com/questions/133973/how-does-this-keyword-work-within-a-javascript-object-literal) и [здесь](http://jsforallof.us/2014/07/08/var-that-this/).

