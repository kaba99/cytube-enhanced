window.CytubeEnhancedUISettings = function (app) {
    'use strict';
    var that = this;

    this.$navbar = $('#nav-collapsible').find('.navbar-nav');
    this.tabs = {};
    this.$tabsContainerHeader = $('<div class="' + app.prefix + 'ui__header"></div>');
    this.$tabsContainerBody = $('<div class="' + app.prefix + 'ui__body tab-content"></div>');
    this.$tabsContainerTabs = $('<ul class="nav nav-tabs">');
    this.$tabsContainerFooter = $('<div class="' + app.prefix + 'ui__footer"></div>');

    this.$tabsContainerOpenButton = $('<a href="#" id="' + app.prefix + 'ui"></a>')
        .text(app.t('settings[.]Extended settings'))
        .on('click', function (event) {
            event.preventDefault();
            event.stopPropagation();

            that.openSettings();
        });

    var $cytubeOptions = $('#useroptions .modal-header .nav-tabs');
    if ($cytubeOptions.length !== 0 && false) {
        this.$tabsContainerOpenButton.appendTo($cytubeOptions).wrap('<li>');
    } else {
        this.$tabsContainerOpenButton.appendTo(that.$navbar).wrap('<li>');
    }

    this.themeTabName = 'theme-settings';
    this.themeTabTitle = app.t('themes[.]Theme settings');


    /**
     * Data, stored from tabs.
     * @type {CytubeEnhancedStorage}
     */
    this.storage = new CytubeEnhancedStorage('settings', false);
    var pageReloadRequested = false;

    $('<h4>' + app.t('settings[.]Extended settings') + '</h4>').appendTo(that.$tabsContainerHeader);
    that.$tabsContainerTabs.appendTo(that.$tabsContainerHeader);

    $('<button type="button" data-dismiss="modal" class="btn btn-success">' + app.t('settings[.]Save') + '</button>').appendTo(that.$tabsContainerFooter).on('click', function () {
        that.save();
    });
    $('<button type="button" data-dismiss="modal" class="' + app.prefix + 'user-settings btn btn-default">' + app.t('settings[.]Cancel') + '</button>').appendTo(that.$tabsContainerFooter);



    /**
     * Adds action on settings save
     * @param callback Callback to be called on settings save
     */
    this.onSave = function (callback) {
        $(document).on(app.prefix + 'settings.save', function () {
            callback(that.storage);
        });
    };


    /**
     * Saves and applies data from tabs
     */
    this.save = function () {
        $(document).trigger(app.prefix + 'settings.save');
        that.storage.save();

        if (pageReloadRequested) {
            app.UI.createConfirmWindow(app.t('settings[.]Some settings need to refresh the page to get to work. Do it now?'), function (isComfirmed) {
                if (isComfirmed) {
                    window.location.reload();
                }
            });
        }
    };


    /**
     * Resets settings
     */
    this.reset = function () {
        that.storage.reset();

        app.UI.createConfirmWindow(app.t('settings[.]Some settings need to refresh the page to get to work. Do it now?'), function (isComfirmed) {
            if (isComfirmed) {
                window.location.reload();
            }
        });
    };


    /**
     * Adds new tab
     * @param {String} name The name of the tab
     * @param {String} title The title of the tab
     * @param {Number} [sort] Position of tab (positive integer number, the higher the value, the "righter" the tab)
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
     * @param {String} [newTabTitle] If passed and tab is not exists, it creates the tab automatically with these name and title
     * @param {Number} [sort] Position of tab (positive integer number, the higher the value, the "bottomer" the tab)
     * @returns {null|Object} Returns null or tab config
     */
    this.getTab = function (name, newTabTitle, sort) {
        if (typeof that.tabs[name] !== 'undefined') {
            return that.tabs[name];
        } else {
            if (newTabTitle) {
                return addTab(name, newTabTitle, sort);
            } else {
                return null;
            }
        }
    };


    /**
     * Configures theme
     * @param callback callback in which user will configure his theme. (callback(app, tab, storage))
     */
    this.configureTheme = function (callback) {
        var tab = that.getTab(that.themeTabName, that.themeTabTitle, 99999);
        var storage = new CytubeEnhancedStorage('themes.' + app.Settings.storage.get('themes.selected'), true, true);

        callback(app, tab, storage);
    };


    /**
     * Opens tab by its name
     * @param {String} name The name of the tab
     */
    this.openTab = function (name) {
        if (that.tabs[name]) {
            that.tabs[name].show();

            return true;
        } else {
            return false;
        }
    };


    /**
     * Removes tab by its name
     * @param {String} name The name of the tab
     */
    that.removeTab = function (name) {
        if (that.tabs[name]) {
            that.tabs[name].remove();
            delete that.tabs[name];

            return true;
        } else {
            return false;
        }
    };


    /**
     * Sorts tabs
     */
    this.sortTabs = function () {
        var tabsArray = [];
        for (var tab in that.tabs) {
            tabsArray.push(that.tabs[tab]);
        }

        tabsArray = tabsArray.sort(function (a, b) {
            if (a.sort > b.sort) {
                return 1;
            } else if (a.sort < b.sort) {
                return -1;
            } else {
                return 0;
            }
        });

        for (var tabIndex = 0, tabsLength = tabsArray.length; tabIndex < tabsLength; tabIndex++) {
            tabsArray[tabIndex].$button.detach().appendTo(that.$tabsContainerTabs);
        }
    };


    /**
     * Opens settings modal
     * @returns {jQuery} Modal window
     */
    this.openSettings = function () {
        app.UI.createModalWindow('settings', that.$tabsContainerHeader, that.$tabsContainerBody, that.$tabsContainerFooter, true);

        var tabToOpen;
        for (var tab in that.tabs) {
            if (typeof tabToOpen == 'undefined' || typeof tabToOpen.sort == 'undefined' || tabToOpen.sort > that.tabs[tab].sort) {
                tabToOpen = that.tabs[tab];
            }
        }
        tabToOpen.show();
    };


    /**
     * Requests page reload on settings saving
     */
    this.requestPageReload = function () {
        pageReloadRequested = true;
    };
};