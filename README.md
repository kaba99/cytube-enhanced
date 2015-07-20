# CyTube-Enhanced plugin

## Quick start

Just download `./build/cytube-enhanced.js` and `./build/cytube-enhanced.css` and assign them as external stuff in administration panel.
Also, you should import chat filters from `src/filters.txt` for some modules.

It should works fine by default, but you can configure this script like so:

```javascript
window.cytubeEnhancedSettings = {
    channelName: "My channel's name", //optional
    language: 'en', //optional
    modulesSettings: {
        additionalChatCommands: {
            permittedCommands: ['!pick', '!q']
        },
        chatControls: {
            clearChatButton: false
        },
    }
};
```

Note: you must configure most of options before modules loads (for example, by configuring it in javascript textarea of administration panel, because it runs before external script)

## Extending some module

```javascript
window.cytubeEnhanced.getModule('additionalChatCommands').done(function (commandsModule) {
    commandsModule.commandsList['!my favorite anime'] = {
        description: 'Displays my favourite anime',
        value: function (msg) {
            return 'Higurashi OVA';
        },
        isAvailable: function () {
            return true;
        }
    };
});
```

## Creating module

```javascript
window.cytubeEnhanced.configureModule('greetingMessage', {
    message: 'Welcome to'
});

window.cytubeEnhanced.addModule('greetingMessage', function (app, settings) {
    alert(settings.message + ' ' + app.channelName + '!');
});
```

## Building from sources

You can build from sources with gulp and npm.

Like so:

```
npm install && gulp --gulpfile ./gulpfile-en.js
```

## License

Licensed under MIT. See LICENSE for the full license text.
