cytubeEnhanced.setModule('utils', function (app, settings) {
    var that = this;

    var defaultSettings = {
        unfixedTopNavbar: true,
        insertUsernameOnClick: true
    };
    settings = $.extend(defaultSettings, settings);


    /**
     * Adds the text to chat input
     * @param message The text to add.
     * @param position The position of the adding. It can be 'begin' or 'end'.
     */
    this.addMessageToChatInput = function (message, position) {
        position = position || 'end';

        if (position === 'begin') {
            message = message + $("#chatline").val();
        } else {
            message = $("#chatline").val() + message;
        }

        $('#chatline').val(message).focus();
    };


    if (settings.insertUsernameOnClick) {
        $('#messagebuffer').on('click', '.username', function() {
            that.addMessageToChatInput($(this).text(), 'begin');
        });
    }


    this.createModalWindow = function($headerContent, $bodyContent, $footerContent) {
        var $outer = $('<div class="modal fade chat-help-modal" role="dialog" tabindex="-1">').appendTo($("body"));
        var $modal = $('<div class="modal-dialog modal-lg">').appendTo($outer);
        var $content = $('<div class="modal-content">').appendTo($modal);

        if ($headerContent !== undefined) {
            var $header = $('<div class="modal-header">').appendTo($content);

            $('<button type="button" class="close" data-dismiss="modal" aria-label="Закрыть">').html('<span aria-hidden="true">&times;</span>').appendTo($header);
            $('<h3 class="modal-title">').append($headerContent).appendTo($header);
        }

        if ($bodyContent !== undefined) {
            $('<div class="modal-body">').append($bodyContent).appendTo($content);
        }

        if ($footerContent !== undefined) {
            $('<div class="modal-footer">').append($footerContent).appendTo($content);
        }

        $outer.on('hidden.bs.modal', function () {
            $(this).remove();
        });

        $outer.modal({keyboard: true});

        return $outer;
    };


    this.run = function () {
        if (settings.unfixedTopNavbar) {
            $('#wrap').children('.navbar-fixed-top').removeClass('navbar-fixed-top');
        }

        setTimeout(function () {
            handleWindowResize(); //chat height fix because our css loads later than cytube script calculates height
        }, 3000);
    };
});
