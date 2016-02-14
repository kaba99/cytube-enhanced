window.cytubeEnhanced.addModule('extraModules', function (app, settings) {
    'use strict';

    var that = this;
    console.log(settings);
    var defaultSettings = {
        baseUrl: 'https://rawgit.com/kaba99/cytube-enhanced/master/src/js/extra',
        enabledModules: ['translate', 'anime-quotes', 'pirate-quotes']
    };
    settings = $.extend({}, defaultSettings, settings);

    console.log(settings);


    var extraModules = [];
    this.add = function (language, config) {
        if (!extraModules[language]) {
            extraModules[language] = [];
        }

        extraModules[language].push(config);
    };


    this.enabledModules = JSON.parse(app.userConfig.get('enabledExtraModules') || 'null') || settings.enabledModules;

    for (var module in this.enabledModules) {
        $.getScript(settings.baseUrl + '/' + this.enabledModules[module].replace(/[\/\\]/g, '') + '/' + app.language + '/index.js');
    }
});
