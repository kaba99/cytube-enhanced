window.cytubeEnhanced.addModule('extraModules', function (app, settings) {
    'use strict';

    var that = this;

    var defaultSettings = {
        enabledModules: ['translate', 'anime-quotes', 'pirate-quotes']
    };
    settings = $.extend({}, defaultSettings, settings);


    var extraModules = [];
    this.add = function (config) {
        extraModules[config.name].push(config);
        console.log(config);
    };


    this.enabledModules = JSON.parse(app.userConfig.get('enabledExtraModules') || 'null') || settings.enabledModules;
    for (var module in this.enabledModules) {
        if (typeof extraModules[this.enabledModules[module]] !== 'undefined' && typeof extraModules[this.enabledModules[module]].url !== 'undefined') {
            $.getScript(extraModules[this.enabledModules[module]].url);
        }
    }
});
