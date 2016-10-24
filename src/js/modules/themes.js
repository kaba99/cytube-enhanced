window.cytubeEnhanced.addModule('themes', function (app, settings) {
    'use strict';
    var that = this;

    var defaultSettings = {
        defaultTheme: 'halloween', //default theme for user (until user do not change it)
        themeId: 'theme-css' //node id in DOM
    };
    settings = $.extend({}, defaultSettings, settings);


    $('#us-theme').closest('.form-group').hide().val('/css/themes/slate.css');
    if (window.createCookie) {
        window.createCookie('cytube-theme', '/css/themes/slate.css', 1000);
    }


    var tab = app.Settings.getTab('themes', app.t('themes[.]Themes'), 500);
    var $tabContent = $('<div class="' + app.prefix + 'themes">').appendTo(tab.$content);
    var userSettings = app.Settings.storage;

    var $themesInfoMessage = $('<div class="' + app.prefix + 'themes__info-message">').text('Темы отсутствуют.').prependTo(tab.$content);

    var namespace = 'themes';
    userSettings.setDefault(namespace + '.selected', settings.defaultTheme);
    this.themes = {};


    //if settings.defaultTheme was changed by administrator ask user if he want to switch on it
    this.applyNewDefaultTheme = function () {
        var previousDefaultTheme = userSettings.get(namespace + '.previousDefaultTheme');
        if (userSettings.get(namespace + '.selected') == previousDefaultTheme) {
            userSettings.set(namespace + '.previousDefaultTheme', settings.defaultTheme);
            that.setTheme(settings.defaultTheme);
            userSettings.save();
            console.log('reloading');
            window.location.reload();
        } else if (!previousDefaultTheme || (previousDefaultTheme && previousDefaultTheme != settings.defaultTheme)) {
            userSettings.set(namespace + '.previousDefaultTheme', settings.defaultTheme);
            userSettings.save();

            if (settings.defaultTheme != userSettings.get(namespace + '.selected')) {
                var themeTitle = that.themes[settings.defaultTheme].title;
                app.UI.createConfirmWindow(app.t('themes[.]Default theme was changed to "%themeTitle%" by administrator. Do you want to try it? (Don\'t forget, that you can switch your theme in extended settings anytime.)').replace('%themeTitle%', themeTitle), function (isConfirmed) {
                    if (isConfirmed) {
                        that.setTheme(settings.defaultTheme);
                        userSettings.save();
                        app.UI.createConfirmWindow(app.t('settings[.]Some settings need to refresh the page to get to work. Do it now?'), function (isConfirmed) {
                            if (isConfirmed) {
                                window.location.reload();
                            }
                        });
                    }
                });
            }
        }
    };


    this.add = function (config) {
        $themesInfoMessage.remove();

        that.themes[config.name] = config;
        that.themes[config.name].$el = that.addMarkup(config).appendTo($tabContent);
        that.sort();

        if (config.name === userSettings.get(namespace + '.selected')) {
            if (config.name === settings.defaultTheme) {
                userSettings.set(namespace + '.previousDefaultTheme', settings.defaultTheme);
                userSettings.save();
            }
            that.setTheme(config.name);
            that.applyTheme(config.name);
        } else if (config.name === settings.defaultTheme) {
            that.applyNewDefaultTheme();
        }
    };


    tab.onShow(function () {
        $('.' + app.prefix + 'themes__item')
            .removeClass('active')
            .filter(function() {
                return $(this).data('name') === userSettings.get(namespace + '.selected');
            })
            .addClass('active');
    });


    /**
     * Sets theme
     * @param name Theme's name
     */
    this.setTheme = function (name) {
        userSettings.set(namespace + '.selected', name);

        $('.' + app.prefix + 'themes__item')
            .removeClass('active')
            .filter(function() {
                return $(this).data('name') === name;
            })
            .addClass('active');
    };


    this.applyTheme = function (name) {
        var config = that.themes[name];

        $('#' + settings.themeId).remove();
        if (config.cssUrl) {
            $('<link rel="stylesheet" id="' + settings.themeId + '">').attr('href', config.cssUrl).appendTo($('head'));
        } else { //resets to default theme
            that.setTheme(userSettings.getDefault(namespace + '.selected'));
        }

        if (config.jsUrl) {
            $.getScript(config.jsUrl);
        }
    };


    this.addMarkup = function (config) {
        var $moduleInfo = $('<div class="' + app.prefix + 'themes__item">').data('name', config.name).on('click', function () {
            var name = $(this).data('name');

            if (name !== userSettings.get(namespace + '.selected')) {
                app.UI.createConfirmWindow(app.t('themes[.]Apply this theme?'), function (isConfirmed) {
                    if (isConfirmed) {
                        that.setTheme(name);
                    }
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
        if (settings.isDirty(namespace + '.selected')) {
            app.Settings.requestPageReload();
        }
    });
});
