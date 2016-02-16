window.cytubeEnhanced.addModule('extras', function (app, settings) {
    'use strict';

    var that = this;

    var defaultSettings = {
        enabledModules: ['translate', 'anime-quotes', 'pirate-quotes']
    };
    settings = $.extend({}, defaultSettings, settings);

    this.extraModules = {};
    this.enabledModules = JSON.parse(app.userConfig.get('enabledExtraModules') || 'null') || settings.enabledModules;


    this.add = function (config) {
        this.extraModules[config.name] = config;

        if (this.enabledModules.indexOf(config.name) != -1) {
            $.getScript(this.extraModules[config.name].url);
        }
    };
});
