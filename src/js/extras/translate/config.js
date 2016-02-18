cytubeEnhanced.getModule('extras').done(function (extraModules) {
    extraModules.add({
        title: 'Перевод интерфейса',
        name: 'translate',
        description: 'Русский перевод интерфейса.',
        url: 'https://rawgit.com/kaba99/cytube-enhanced/master/src/js/extras/translate/translate.js',
        picture: "url.jpg",
        preview: "preview-url.jpg",
        languages: ['ru']
    });
});