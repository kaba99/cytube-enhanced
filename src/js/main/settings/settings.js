window.CytubeEnhancedUISettings = function (app) {
    'use strict';
    var that = this;

    this.$navbar = $('#nav-collapsible').find('.navbar-nav');
    this.tabs = {};
    this.$tabsContainerOpenButton = $('<a href="javascript:void(0)" id="' + app.prefix + 'ui"></a>');
    this.$tabsContainerHeader = $('<div class="' + app.prefix + 'ui__header"></div>');
    this.$tabsContainerBody = $('<div class="' + app.prefix + 'ui__body"></div>');
    this.$tabsContainerTabs = $('<ul class="nav nav-tabs">');
    this.$tabsContainerFooter = $('<div class="' + app.prefix + 'ui__footer"></div>');

    /**
     * Data, stored from tabs.
     * @type {{}}
     */
    this.data = {};


    app.addTranslation('ru', {
        settings: {
            'Extended options': 'Расширенные настройки'
        }
    });

    that.$tabsContainerOpenButton
        .text(app.t('settings[.]Extended options'))
        .on('click', function () {
            that.openSettings();
        })
        .appendTo(that.$navbar)
        .wrap('<li>');

    $('<h4>' + app.t('settings[.]Extended options') + '</h4>').appendTo(that.$tabsContainerHeader);
    that.$tabsContainerTabs.appendTo(that.$tabsContainerHeader);



    /**
     * Adds action on settings save
     * @param callback Callback to be called on settings save
     */
    this.onSave = function (callback) {
        $(document).on(app.prefix + 'settings.save', function () {
            callback(that.data);
        });
    };


    /**
     * Saves and applies data from tabs
     */
    this.save = function () {
        $(document).trigger(app.prefix + 'settings.save');
        app.userConfig.set('settings', app.toJSON(that.data));
    };


    /**
     * Adds new tab
     * @param {String} name The name of the tab
     * @param {String} title The title of the tab
     * @param {Number} [sort] Position of tab (the higher the value, the "lefter" the tab)
     * @returns {Object} Returns tab object
     */
    var addTab = function (name, title, sort) {
        var tab = new window.CytubeEnhancedUITab(app, name, title, sort);

        tab.$button.appendTo(that.$tabsContainerTabs);
        tab.$content.appendTo(that.$tabsContainerBody);
        that.tabs[name] = tab;

        that.sortTabs();

        return tab;
    };


    /**
     * Gets tab's content by its name
     * @param {String} name The name of the tab
     * @param {String} newTabTitle If passed and tab is not exists, it creates the tab automatically with these name and title
     * @returns {null|Object} Returns null or tab config
     */
    this.getTab = function (name, newTabTitle) {
        if (typeof that.tabs[name] !== 'undefined') {
            return that.tabs[name];
        } else {
            if (newTabTitle) {
                return addTab(name, newTabTitle);
            } else {
                return null;
            }
        }
    };


    /**
     * Opens tab by its name
     * @param {String} name The name of the tab
     */
    this.openTab = function (name) {
        that.tabs[name].show();
    };


    /**
     * Sorts tabs
     */
    this.sortTabs = function () {
        //that.tabs
    };


    /**
     * Opens settings modal
     * @returns {jQuery} Modal window
     */
    this.openSettings = function () {
        that.data = app.parseJSON(app.userConfig.get('settings'), {});
        return app.UI.createModalWindow('settings', that.$tabsContainerHeader, that.$tabsContainerBody, that.$tabsContainerFooter);
    }
};