# CyTube-Enhanced plugin

## Quick start

Just download `./build/your-language/cytube-enhanced.min.js` and `./build/your-language/cytube-enhanced.min.css` and assign them as external stuff in channel settings panel of the channel.
Also, you should import chat filters from `src/filters.txt` for some modules.

## Documentation
[Русская версия](https://github.com/kaba99/cytube-enhanced/tree/master/docs/ru/start.md)
[Английская версия](https://github.com/kaba99/cytube-enhanced/tree/master/docs/en/start.md)

## Creating module

```javascript
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
