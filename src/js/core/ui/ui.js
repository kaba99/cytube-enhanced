window.CytubeEnhancedUI = function (app) {
    var that = this;


    /**
     * Creates modal window
     * @param id Modal id
     * @param $headerContent Modal header (optional)
     * @param $bodyContent Modal body (optional)
     * @param $footerContent Modal footer (optional)
     * @returns {jQuery} Modal window
     */
    this.createModalWindow = function(id, $headerContent, $bodyContent, $footerContent) {
        $('.modal').modal('hide');
        id = app.prefix + 'modal-' + id;
        var $outer;

        if ($('#' + id).length == 0) {
            $outer = $('<div class="modal fade" id="' + id + '" role="dialog" tabindex="-1">').appendTo($("body"));
            var $modal = $('<div class="modal-dialog modal-lg">').appendTo($outer);
            var $content = $('<div class="modal-content">').appendTo($modal);

            if ($headerContent != null) {
                var $header = $('<div class="modal-header">').append($headerContent).appendTo($content);

                $('<button type="button" class="close" data-dismiss="modal" aria-label="' + app.t('Close') + '">').html('<span aria-hidden="true">&times;</span>').prependTo($header);
            }

            if ($bodyContent != null) {
                $('<div class="modal-body">').append($bodyContent).appendTo($content);
            }

            if ($footerContent != null) {
                $('<div class="modal-footer">').append($footerContent).appendTo($content);
            }

            //$outer.on('hidden.bs.modal', function () {
            //    $(this).remove();
            //});

            $outer.modal({keyboard: true});
        } else {
            $outer = $('#' + id);
            $outer.modal('show');
        }

        return $outer;
    };


    this.createConfirmWindow = function (message, callback) {
        if (window.confirm(message)) {
            callback();
        }
    };


    /**
     * Creates wrapper for control elements.
     * @param type Type of wrapper (default, horizontal, inline).
     * @returns {jQuery}
     */
    this.createControlsWrapper = function (type) {
        type = (['default', 'horizontal', 'inline'].indexOf(type) != -1) ? type : 'default';

        return $('<div class="form-' + type + '">');
    };


    /**
     * Creates select with bootstrap markup
     * @param {String} type Control's type (default, horizontal, inline)
     * @param {String} title Label's title
     * @param {String} name Name of the select
     * @param {Object} [options] Options for the select. An example of options: [{value: 'value 1', title: 'title 1', selected: true}, {value: 'value 2', title: 'title 2'}]
     * @param {Function} [handler] Callback, which is calling on every select's change.
     * @returns {jQuery}
     */
    this.createSelectControl = function (type, title, name, options, handler) {
        options = options || [];
        var $wrapper = $('<div class="form-group">');
        var $select;

        if (type == 'horizontal') {
            $('<label for="' + app.prefix + name + '" class="control-label col-sm-4">' + title + '</label>').appendTo($wrapper);
            var $selectWrapper = $('<div class="col-sm-8">').appendTo($wrapper);
            $select = $('<select id="' + app.prefix + name + '" class="form-control">').appendTo($selectWrapper);
        } else { //inline or default
            $('<label for="' + app.prefix + name + '">' + title + '</label>').appendTo($wrapper);
            $select = $('<select id="' + app.prefix + name + '" class="form-control">').appendTo($wrapper);
        }

        if (handler) {
            $select.on('change', handler);
        }

        var selected;
        for (var optionIndex = 0, optionsLength = options.length; optionIndex < optionsLength; optionIndex++) {
            selected = options[optionIndex].selected ? 'selected' : '';
            $select.append('<option value="' + options[optionIndex].value + '" ' + selected + '>' + options[optionIndex].title + '</option>');
        }

        return $wrapper;
    };


    /**
     * Creates button
     * @param {String} [type] Bootstrap button's type (default, primary, success, danger, alert, info, link, etc)
     * @param {String} title Button's title
     * @param {Function} [handler] Callback, which is calling on every button's click.
     */
    this.createButton = function (type, title, handler) {
        var $button = $('<button type="button" class="btn btn-' + type + '">' + title + '</button>');

        if (handler) {
            $button.on('click', handler);
        }

        return $button;
    };
};