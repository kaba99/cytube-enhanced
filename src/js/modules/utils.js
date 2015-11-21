window.cytubeEnhanced.addModule('utils', function (app, settings) {
    'use strict';

    var that = this;

    var defaultSettings = {
        unfixedTopNavbar: true,
        insertUsernameOnClick: true,
        showScriptInfo: true
    };
    settings = $.extend({}, defaultSettings, settings);



    //$('#messagebuffer, #queue').nanoScroller({
    //    alwaysVisible: true,
    //    preventPageScrolling: true
    //});
    //
    //this.handleChatScrollBar = function() {
    //    $('#messagebuffer')[0].nanoscroller.reset();
    //};
    //window.socket.on("chatMsg", that.handleChatScrollBar);
    //window.socket.on("clearchat", that.handleChatScrollBar);
    //
    //this.handlePlaylistScrollBar = function() {
    //    $('#queue')[0].nanoscroller.reset();
    //};
    //window.socket.on("playlist", that.handlePlaylistScrollBar);
    //window.socket.on("queue", that.handlePlaylistScrollBar);
    //window.socket.on("setPlaylistMeta", that.handlePlaylistScrollBar);
    //
    //$(window).resize(function () {
    //    $('#messagebuffer, #queue')[0].nanoscroller.reset();
    //});

    window.chatTabComplete = function () {
        var i;
        var words = $("#chatline").val().split(" ");
        var current = words[words.length - 1].toLowerCase();
        if (!current.match(/^[\w-]{1,20}$/)) {
            return;
        }

        var __slice = Array.prototype.slice;
        var usersWithCap = __slice.call($("#userlist .userlist_item")).map(function (elem) {
            return elem.children[1].innerHTML;
        });
        var users = __slice.call(usersWithCap).map(function (user) {
            return user.toLowerCase();
        }).filter(function (name) {
            return name.indexOf(current) === 0;
        });

        // users now contains a list of names that start with current word

        if (users.length === 0) {
            return;
        }

        // trim possible names to the shortest possible completion
        var min = Math.min.apply(Math, users.map(function (name) {
            return name.length;
        }));
        users = users.map(function (name) {
            return name.substring(0, min);
        });

        // continually trim off letters until all prefixes are the same
        var changed = true;
        var iter = 21;
        while (changed) {
            changed = false;
            var first = users[0];
            for (i = 1; i < users.length; i++) {
                if (users[i] !== first) {
                    changed = true;
                    break;
                }
            }

            if (changed) {
                users = users.map(function (name) {
                    return name.substring(0, name.length - 1);
                });
            }

            // In the event something above doesn't generate a break condition, limit
            // the maximum number of repetitions
            if (--iter < 0) {
                break;
            }
        }

        current = users[0].substring(0, min);
        for (i = 0; i < usersWithCap.length; i++) {
            if (usersWithCap[i].toLowerCase() === current) {
                current = usersWithCap[i];
                break;
            }
        }

        if (users.length === 1) {
            if (words.length === 1) {
                current += ":";
            }
            current += " ";
        }
        words[words.length - 1] = current;
        $("#chatline").val(words.join(" "));
    };


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



    if (settings.unfixedTopNavbar) {
        $('#wrap').children('.navbar-fixed-top').removeClass('navbar-fixed-top');
    }

    if (settings.showScriptInfo) {
        $('#footer').children('.container').append('<p class="text-muted credit">CyTube Enhanced (<a href="https://github.com/kaba99/cytube-enhanced">GitHub</a>)</p>');
    }

    setTimeout(function () {
        window.handleWindowResize(); //chat height fix
    }, 3000);
    setTimeout(function () {
        window.handleWindowResize(); //chat height fix
    }, 10000);





    window.addUserDropdown = (function (oldAddUserDropdown) {
        return function (entry) {
            var functionResponse = oldAddUserDropdown(entry);

            entry.find('.user-dropdown>strong').click(function () {
                $(chatline).val($(this).text() + ": " + $(chatline).val());
            });

            return functionResponse;
        };
    })(window.addUserDropdown);

    $('.user-dropdown>strong').click(function () {
        $(chatline).val($(this).text() + ": " + $(chatline).val());
    });







    $('#queue').sortable("option", "axis", "y");
});