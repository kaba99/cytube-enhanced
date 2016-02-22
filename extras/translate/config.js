cytubeEnhanced.getModule('extras').done(function (extraModules) {
    extraModules.add({
        title: 'Перевод интерфейса',
        name: 'translate',
        description: 'Русский перевод интерфейса.',
        url: 'https://cdn.rawgit.com/kaba99/cytube-enhanced/master/extras/translate/translate.js',
        languages: ['ru']
    });
});