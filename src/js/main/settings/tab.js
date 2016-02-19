window.CytubeEnhancedUITab = function (app, name, title, sort) {
    'use strict';
    var that = this;

    this.$button = $('<li><a href="#' + app.prefix + name + '__content" class="' + name + '__button" data-toggle="tab">' + title + '</a></li>');
    this.$content = $('<div id="' + app.prefix + name + '__content" class="tab-pane">');
    this.$form = app.UI.createControlsWrapper('horizontal').appendTo(this.$content);
    this.sort = Math.abs(parseInt(sort, 10)) || 0;
    this.controls = {};


    /**
     * Shows the tab
     */
    this.show = function () {
        that.$button.find('a').tab('show');
    };


    /**
     * Adds custom control to tab
     * @param {String} type Type of control function
     * @param {String} controlType Control's type (default, horizontal, inline)
     * @param {String} title Label's title
     * @param {String} name Name of the control
     * @param {Object} [options] Options for the control.
     * @param {Function} [handler] Callback, which is calling on every control's change.
     * @param {Number} [sort] Position of tab (positive integer number, the higher the value, the "bottomer" the tab)
     * @param {jQuery} [$customContainer] Custom container for control
     * @returns {jQuery}
     */
    this.addControl = function (type, controlType, title, name, options, handler, sort, $customContainer) {
        type = (['select', 'checkbox'].indexOf(type) != -1) ? type : 'select';
        sort = Math.abs(parseInt(sort, 10)) || 0;
        var controlFunctionName = 'create' + type.slice(0, 1).toUpperCase() + type.slice(1) + 'Control';

        var $control = app.UI[controlFunctionName](controlType, title, name, options, handler);
        $control.data('sort', sort);

        that.controls[name] = {$el: $control, sort: sort};
        if ($customContainer) {
            $control.appendTo($customContainer);
        } else {
            $control.appendTo(that.$form);
        }

        return $control;
    };
};