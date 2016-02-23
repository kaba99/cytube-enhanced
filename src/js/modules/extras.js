window.cytubeEnhanced.addModule('extras', function (app, settings) {
    'use strict';
    var that = this;

    var defaultSettings = {
        enabledModules: ['anime-quotes', 'pirate-quotes']
    };
    settings = $.extend({}, defaultSettings, settings);

    var tab = app.Settings.getTab('extra', 'Сторонние модули', 400);
    var $tabContent = $('<div class="row">').appendTo(tab.$content).wrap('<div class="' + app.prefix + 'extras">');
    var userSettings = app.Settings.storage;

    var $modulesInfoMessage = $('<div class="' + app.prefix + 'extras__info-message">').text('Сторонние модули отсутствуют.').prependTo(tab.$content);

    var namespace = 'extras';
    userSettings.setDefault(namespace + '.enabled', settings.enabledModules);
    this.enabledModules = userSettings.get(namespace + '.enabled') || [];
    this.extraModules = {};


    this.add = function (config) {
        $modulesInfoMessage.text('Сторонние модули от других пользователей.');

        that.extraModules[config.name] = config;
        that.extraModules[config.name].$el = that.addMarkup(config).appendTo($tabContent);
        that.sort();

        if (that.enabledModules.indexOf(config.name) != -1) {
            $.getScript(that.extraModules[config.name].url + '?ac=' + Date.now());
        }
    };


    this.enable = function (name) {
        return that.enabledModules.push(name);
    };


    this.disable = function (name) {
        var position = that.enabledModules.indexOf(name);

        if (position !== -1) {
            return that.enabledModules.splice(position, 1);
        } else {
            return false;
        }
    };


    this.addMarkup = function (config) {
        var $moduleInfo = $('<div class="' + app.prefix + 'extras__item">');
        $moduleInfo.data('name', config.name);

        var $title = $('<div class="' + app.prefix + 'extras__item__title">').text(config.title).appendTo($moduleInfo);
        var $description = $('<div class="' + app.prefix + 'extras__item__description">').text(config.description || 'Нет описания').appendTo($moduleInfo);
        var $toggleModuleButton = $('<div class="' + app.prefix + 'extras__item__button btn btn-xs">').appendTo($moduleInfo).data('enabled', that.enabledModules.indexOf(config.name) != -1).on('click', function () {
            if ($(this).data('enabled')) {
                $(this).data('enabled', false);
                that.disable(config.name);
                $(this).removeClass('btn-danger').addClass('btn-success').text('Включить');
            } else {
                $(this).data('enabled', true);
                that.enable(config.name);
                $(this).removeClass('btn-success').addClass('btn-danger').text('Выключить');
            }
        });
        if (that.enabledModules.indexOf(config.name) != -1) {
            $toggleModuleButton.addClass('btn-danger').text('Выключить');
        } else {
            $toggleModuleButton.addClass('btn-success').text('Включить');
        }

        $moduleInfo = $('<div class="col-md-6">').append($moduleInfo);

        return $moduleInfo;
    };


    this.sort = function () {
        var extraModulesArray = [];
        for (var module in that.extraModules) {
            extraModulesArray.push(that.extraModules[module]);
        }

        extraModulesArray = extraModulesArray.sort(function (a, b) {
            var aSort = +(that.enabledModules.indexOf(a.name) != -1);
            var bSort = +(that.enabledModules.indexOf(b.name) != -1);

            if (aSort < bSort) {
                return 1;
            } else if (aSort > bSort) {
                return -1;
            } else {
                if (a.title.toLowerCase() > b.title.toLowerCase()) {
                    return 1;
                } else if (a.title.toLowerCase() < b.title.toLowerCase()) {
                    return -1;
                } else {
                    return 0;
                }
            }
        });

        for (var extraModuleIndex = 0, extraModulesLength = extraModulesArray.length; extraModuleIndex < extraModulesLength; extraModuleIndex++) {
            extraModulesArray[extraModuleIndex].$el.detach().appendTo($tabContent);
        }
    };


    /**
     * Saving and applying settings
     */
    app.Settings.onSave(function (settings) {
        settings.set(namespace + '.enabled', that.enabledModules);

        if (settings.isDirty(namespace + '.enabled')) {
            app.Settings.requestPageReload();
        }
    });
});
