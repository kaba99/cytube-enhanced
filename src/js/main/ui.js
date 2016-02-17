window.CytubeEnhancedUI = function (app) {
    var that = this;
    var $navbar = $('#nav-collapsible').find('.navbar-nav');

    this.$tabsContainerOpenButton = $('<a href="javascript:void(0)" id="cytube-enhanced-ui">' + app.t('settings[.]Extended options') + '</a>');
    this.$tabsContainerHeader = $('<div class="cytube-enhanced-ui__header"></div>');
    this.$tabsContainerBody = $('<div class="cytube-enhanced-ui__body"></div>');
    this.$tabsContainerTabs = $('<ul class="nav nav-tabs">');
    this.$tabsContainerFooter = $('<div class="cytube-enhanced-ui__footer"></div>');


    /**
     * Creates settings
     */
    this.initialize = function () {


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
     */
    this.addTab = function (name, title) {
        if (that.$tabsContainerTabs.children().length == 0) {
            that.initialize();
        }

        var $newTabButton = $('<li class="active"><a href="#' + name + '__content" class="' + name + '__button" data-toggle="tab">' + title + '</a></li>')
            .appendTo(that.$tabsContainerTabs);

        var $newTab = $('<div id="' + name + '__content" class="tab-pane">')
            .appendTo(that.$tabsContainerBody);
    };


    /**
     * Gets tab's content by its name
     * @param name The name of the tab
     */
    this.getTab = function (name) {
        return $('#' + name + '__content');
    };


    /**
     * Opens tab by its name
     * @param name The name of the tab
     */
    this.openTab = function (name) {
        $('#' + name + '__button').trigger('click');
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
     * Opens settings modal
     */
    this.openSettings = function () {
        that.createModalWindow(that.$tabsContainerHeader, that.$tabsContainerBody, that.$tabsContainerFooter);
    }
};