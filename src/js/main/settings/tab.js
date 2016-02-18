window.CytubeEnhancedUITab = function (app, name, title, sort) {
    'use strict';
    var that = this;

    this.$button = $('<li class="active"><a href="#' + app.prefix + name + '__content" class="' + name + '__button" data-toggle="tab">' + title + '</a></li>');
    this.$content = $('<div id="' + app.prefix + name + '__content" class="tab-pane">');
    this.sort = parseInt(sort, 10) || 0;
    this.controls = {};


    /**
     * Shows the tab
     */
    this.show = function () {
        that.$tabButton.trigger('click');
    };


    /**
     * Adds custom control to tab
     * @param {String} type Type of control function
     * @param {String} controlType Control's type (default, horizontal, inline)
     * @param {String} title Label's title
     * @param {String} name Name of the control
     * @param {Object} [options] Options for the control.
     * @param {Function} [handler] Callback, which is calling on every control's change.
     * @param {Number} [sort] Position of tab (the higher the value, the "lefter" the tab)
     * @returns {jQuery}
     */
    this.addControl = function (type, controlType, title, name, options, handler, sort) {
        type = (['select', 'checkbox'].indexOf(type) != -1) ? type : 'select';
        sort = parseInt(sort, 10) || 0;
        var controlFunctionName = 'create' + type.slice(0, 1).toUpperCase() + type.slice(1) + 'Control';

        var $control = app.UI[controlFunctionName](controlType, title, name, options, handler);
        $control.data('sort', sort);
        that.controls[name] = {$el: $control, sort: sort}

        return $control;
    };
};