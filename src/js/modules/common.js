window.cytubeEnhanced.addModule('common', function (app, settings) {
    'use strict';
    var that = this;

    var defaultSettings = {
        insertUsernameOnClick: true
    };
    settings = $.extend({}, defaultSettings, settings);

    this.$chatline = $("#chatline");
    this.$userlist = $("#userlist");


    window.chatTabComplete = function () {
        var i;
        var words = that.$chatline.val().split(" ");
        var current = words[words.length - 1].toLowerCase();
        if (!current.match(/^[\wа-яА-ЯёЁ-]{1,20}$/)) {
            return;
        }

        var __slice = Array.prototype.slice;
        var usersWithCap = __slice.call(that.$userlist.find('.userlist_item')).map(function (elem) {
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
        that.$chatline.val(words.join(" "));
    };


    if (settings.insertUsernameOnClick) {
        $('#messagebuffer')
            .on('click', '.username', function() {
                app.Helpers.addMessageToChatInput($(this).text(), 'begin');
            })
            .on('click', '.chat-avatar', function() {
                app.Helpers.addMessageToChatInput($(this).parent().find('.username').text(), 'begin');
            });
    }



    $('#wrap').children('.navbar-fixed-top').removeClass('navbar-fixed-top');
    $('#footer').children('.container').append('<p class="text-muted credit">CyTube Enhanced (<a href="https://github.com/kaba99/cytube-enhanced" target="_blank">GitHub</a>)</p>');

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
                that.$chatline.val($(this).text() + ": " + that.$chatline.val());
            });

            return functionResponse;
        };
    })(window.addUserDropdown);

    $('.user-dropdown>strong').click(function () {
        that.$chatline.val($(this).text() + ": " + that.$chatline.val()).focus();
    });


    $('#queue').sortable("option", "axis", "y");
});
