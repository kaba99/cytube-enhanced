window.cytubeEnhanced.addModule('smilesAndFavouritePicturesTogether', function (app) {
    'use strict';
    var that = this;

    var tab = app.Settings.getTab('general', 'Общее', 100);


    var availableLanguages = ['en'];
    for (var language in app.translations) {
        availableLanguages.push(language);
    }

    var options = [];
    for (var languageIndex in availableLanguages) {
        options.push({
            value: availableLanguages[languageIndex],
            title: app.t(availableLanguages[languageIndex]),
            selected: (availableLanguages[languageIndex] == app.storage.get('language'))
        });
    }


    tab.addControl('select', 'horizontal', 'Язык интерфейса', 'language', options, null, 20000);


    app.Settings.onSave(function (settings) {
        app.storage.set('language', $('#' + app.prefix + 'language').val());

        if (app.storage.isDirty('language')) {
            app.Settings.requestPageReload();
        }
    });
});