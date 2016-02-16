window.CytubeEnhancedUI = function (app) {
    var that = this;
    var $navbar = $('#nav-collapsible').find('.navbar-nav');
    this.controlsPrefix = 'ce-';

    this.settings = {};

    this.$tabsContainerOpenButton = $('<a href="javascript:void(0)" id="' + this.controlsPrefix + 'ui">' + app.t('settings[.]Extended options') + '</a>');
    this.$tabsContainerHeader = $('<div class="' + this.controlsPrefix + 'ui__header"></div>');
    this.$tabsContainerBody = $('<div class="' + this.controlsPrefix + 'ui__body"></div>');
    this.$tabsContainerTabs = $('<ul class="nav nav-tabs">');
    this.$tabsContainerFooter = $('<div class="' + this.controlsPrefix + 'ui__footer"></div>');


    /**
     * Creates settings
     */
    this.initialize = function () {
        app.addTranslation('ru', {
            settings: {
                'Extended options': 'Расширенные опции'
            }
        });

        that.$tabsContainerOpenButton
            .appendTo($navbar)
            .wrap('<li>')
            .on('click', function () {
                that.openSettings();
            });

        $('<h4>' + app.t('settings[.]Extended options') + '</h4>').appendTo(that.$tabsContainerHeader);
        that.$tabsContainerTabs.appendTo(that.$tabsContainerHeader);
    };


    /**
     * Adds new tab
     * @param name The name of the tab
     * @param title The title of the tab
     * @returns {Object} Returns tab config
     */
    this.addTab = function (name, title) {
        if (that.$tabsContainerTabs.children().length == 0) {
            that.initialize();
        }

        var $newTabButton = $('<li class="active"><a href="#' + that.controlsPrefix + name + '__content" class="' + name + '__button" data-toggle="tab">' + title + '</a></li>')
            .appendTo(that.$tabsContainerTabs);

        var $newTab = $('<div id="' + that.controlsPrefix + name + '__content" class="tab-pane">')
            .appendTo(that.$tabsContainerBody);

        return {
            button: $newTabButton,
            content: $newTab
        }
    };


    /**
     * Gets tab's content by its name
     * @param name {String} The name of the tab
     * @param newTabTitle {String} If passed and tab is not exists, it creates the tab automatically with these name and title
     * @returns {null|Object} Returns null or tab config
     */
    this.getTab = function (name, newTabTitle) {
        var $button = $('#' + that.controlsPrefix + name + '__button');
        var $tab = $('#' + that.controlsPrefix + name + '__content');

        if ($tab.length !== 0 && $button.length !== 0) {
            return {
                button: $button,
                content: $tab
            };
        } else {
            if (newTabTitle) {
                return that.addTab(name, newTabTitle);
            } else {
                return null;
            }
        }
    };


    /**
     * Opens tab by its name
     * @param name The name of the tab
     */
    this.openTab = function (name) {
        $('#' + that.controlsPrefix + name + '__button').trigger('click');
    };


    /**
     * Creates modal window
     * @param $headerContent Modal header (optional)
     * @param $bodyContent Modal body (optional)
     * @param $footerContent Modal footer (optional)
     * @returns {jQuery} Modal window
     */
    this.createModalWindow = function($headerContent, $bodyContent, $footerContent) {
        var $outer = $('<div class="modal fade chat-help-modal" role="dialog" tabindex="-1">').appendTo($("body"));
        var $modal = $('<div class="modal-dialog modal-lg">').appendTo($outer);
        var $content = $('<div class="modal-content">').appendTo($modal);

        if ($headerContent != null) {
            var $header = $('<div class="modal-header">').append($headerContent).appendTo($content);

            $('<button type="button" class="close" data-dismiss="modal" aria-label="Закрыть">').html('<span aria-hidden="true">&times;</span>').prependTo($header);
        }

        if ($bodyContent != null) {
            $('<div class="modal-body">').append($bodyContent).appendTo($content);
        }

        if ($footerContent != null) {
            $('<div class="modal-footer">').append($footerContent).appendTo($content);
        }

        $outer.on('hidden.bs.modal', function () {
            $(this).remove();
        });

        $outer.modal({keyboard: true});

        return $outer;
    };


    /**
     * Creates select with bootstrap markup
     * @param {String} title Label's title
     * @param {String} name Name of the select
     * @param {Object} config Config for the select.
     * @param {Function} [handler] Callback, which is calling on every select's change.
     * @returns {jQuery}
     */
    this.createSelect = function (title, name, config, handler) {
        config = config || {};
        config = $.extend({}, config, {
            columns: {label: 4, element: 8},
            options: []
        });

        var $wrapper = $('<div class="form-group">');
        var $label = $('<label for="' + that.controlsPrefix + name + '" class="control-label col-sm-' + config.columns.label + '">' + title + '</label>').appendTo($wrapper);
        var $selectWrapper = $('<div class="col-sm-' + config.columns.element + '">').appendTo($wrapper);
        var $select = $('<select id="' + that.controlsPrefix + name + '" class="form-control">').appendTo($selectWrapper);

        if (handler) {
            $select.on('change', handler);
        }

        var selected;
        for (var optionIndex = 0, optionsLength = config.options.length; optionIndex < optionsLength; optionIndex++) {
            selected = config.options[optionIndex].selected ? 'selected' : '';
            $select.append('<option value="' + config.options[optionIndex].value + '" ' + selected + '>' + config.options[optionIndex].title + '</option>');
        }

        return $wrapper;
    };


    /**
     * Creates button
     * @param {String} title Button's title
     * @param {String} [type] Bootstrap button's type (default, primary, success, danger, alert, info, link, etc)
     * @param {Function} [handler] Callback, which is calling on every button's click.
     */
    this.createButton = function (title, type, handler) {
        type = type || 'default';

        var $button = $('<button type="button" class="btn btn-' + type + '">' + title + '</button>');
        if (handler) {
            $button.on('click', handler);
        }

        return $button;
    };


    /**
     * Opens settings modal
     * @returns {jQuery} Modal window
     */
    this.openSettings = function () {
        that.settings = app.userConfig.get('settings') || {};
        return that.createModalWindow(that.$tabsContainerHeader, that.$tabsContainerBody, that.$tabsContainerFooter);
    }
};