### Настройка скрипта cytubeEnhanced

Вы можете настроить скрипт **только до подключения** cytubeEnhanced, создав глобальную переменную `cytubeEnhancedSettings`, к примеру, в окно с javascript в панели администрирования.

Пример переменной с конфигурацией:

```javascript
cytubeEnhancedSettings = {
    channelName: 'Мой канал',
    language: 'ru',
    modulesSettings: {
        utils: {
            enabled: true,
            unfixedTopNavbar: true,
            insertUsernameOnClick: true,
            showScriptInfo: true
        },
        favouritePictures: {
            enabled: true
        },
        smiles: {
            enabled: true
        },
        videoControls: {
            enabled: true,
            turnOffVideoOption: true,
            selectQualityOption: true,
            youtubeFlashPlayerForGoogleDocsOption: true,
            expandPlaylistOption: true,
            showVideoContributorsOption: true
        },
        showVideoInfo: {
            enabled: true
        },
        chatCommandsHelp: {
            enabled: true
        },
        additionalChatCommands: {
            enabled: true,
            additionalPermittedCommands: ['*']
        },
        chatControls: {
            enabled: true,
            afkButton: true,
            clearChatButton: true
        },
        standardUITranslate: {
            enabled: true
        },
        navMenuTabs: {
            enabled: true
        },
        userConfig: {
            enabled: true,
            layoutConfigButton: true,
            smilesAndPicturesTogetherButton: true,
            minimizeButton: true
        }
    },
    binds: {
        'additionalChatCommands': {
            beforeRun: function (commandsModule) {
                commandsModule.commandsList['!привет'] = {
                    description: 'приветствие человека (!привет %username%)',
                    value: function (msg) {
                        return msg.replace('!hi', 'привет, ');
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

