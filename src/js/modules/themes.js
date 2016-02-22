window.cytubeEnhanced.addModule('themes', function (app, settings) {
    'use strict';
    var that = this;

    var defaultSettings = {
        selected: 'default',
        themeId: 'theme-css'
    };
    settings = $.extend({}, defaultSettings, settings);

    var tab = app.Settings.getTab('themes', 'Темы', 500);
    var $tabContent = $('<div class="' + app.prefix + 'themes">').appendTo(tab.$content);
    var userSettings = app.Settings.storage;

    var namespace = 'themes';
    userSettings.setDefault(namespace + '.selected', settings.selected);
    this.selected = userSettings.get(namespace + '.selected');
    var themeWasChanged = false;
    this.themes = {};


    this.add = function (config) {
        that.themes[config.name] = config;
        that.themes[config.name].$el = that.addMarkup(config).appendTo($tabContent);
        that.sort();

        if (config.name === that.selected) {
            that.setTheme(config.name);
        }
    };


    tab.onShow(function () {
        $('.' + app.prefix + 'themes__item')
            .removeClass('active')
            .filter(function() {
                return $(this).data('name') === that.selected;
            })
            .addClass('active');
    });


    /**
     * Sets theme
     * @param name Theme's name
     */
    this.setTheme = function (name) {
        var config = that.themes[name];

        if (name !== that.selected) {
            themeWasChanged = true;
        }
        that.selected = name;

        $('.' + app.prefix + 'themes__item')
            .removeClass('active')
            .filter(function() {
                return $(this).data('name') === name;
            })
            .addClass('active');


        $('#' + settings.themeId).remove();
        if (config.cssUrl != '') {
            $('<link rel="stylesheet" id="' + settings.themeId + '">').attr('href', config.cssUrl).appendTo($('head'));
        } else { //resets to default theme
            that.setTheme(userSettings.getDefault(namespace + '.selected'))
        }

        if (typeof config.jsUrl !== 'undefined' && config.jsUrl !== '') {
            $.getScript(config.sUrl);
        }
    };


    this.addMarkup = function (config) {
        var $moduleInfo = $('<div class="' + app.prefix + 'themes__item">').data('name', config.name).on('click', function () {
            var name = $(this).data('name');

            if (name !== that.selected) {
                app.UI.createConfirmWindow('Изменить тему на выбранную?', function () {
                    that.setTheme(name);
                });
            }
        });


        var $title = $('<div class="' + app.prefix + 'themes__item__title">').text(config.title).appendTo($moduleInfo);

        if (typeof config.pictureUrl !== 'undefined' && (config.pictureUrl = config.pictureUrl.trim()) !== '') {
            $('<div class="' + app.prefix + 'themes__item__picture">').appendTo($moduleInfo).css('background-image', 'url("' + config.pictureUrl + '")');
        }


        return $moduleInfo;
    };


    this.sort = function () {
        var themesArray = [];
        for (var theme in that.themes) {
            themesArray.push(that.themes[theme]);
        }

        themesArray = themesArray.sort(function (a, b) {
            if (a.title.toLowerCase() > b.title.toLowerCase()) {
                return 1;
            } else if (a.title.toLowerCase() < b.title.toLowerCase()) {
                return -1;
            } else {
                return 0;
            }
        });

        for (var themeIndex = 0, themesLength = themesArray.length; themeIndex < themesLength; themeIndex++) {
            themesArray[themeIndex].$el.detach().appendTo($tabContent);
        }
    };


    /**
     * Saving and applying settings
     */
    app.Settings.onSave(function (settings) {
        settings.set(namespace + '.selected', that.selected);

        if (themeWasChanged) {
            app.Settings.requestPageReload();
        }
    });
});
