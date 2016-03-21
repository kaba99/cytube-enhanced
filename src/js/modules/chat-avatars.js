window.cytubeEnhanced.addModule('chatAvatars', function (app) {
    'use strict';
    var that = this;

    var tab = app.Settings.getTab('general', 'Общее', 100);
    var userSettings = app.Settings.storage;
    var appSettings = app.storage;


    var namespace = 'avatars';
    this.scheme = {
        'avatars-mode': {
            title: app.t('chatAvatars[.]Chat avatars'),
            default: '',
            options: [
                {value: '', title: app.t('chatAvatars[.]Disabled')},
                {value: 'small', title: app.t('chatAvatars[.]Small')},
                {value: 'big', title: app.t('chatAvatars[.]Big')}
            ]
        }
    };
    appSettings.setDefault(namespace + '.cache', []);



    this.cacheAvatar = function (username, avatar) {
        var cachedAvatars = appSettings.get(namespace + '.cache');

        if (cachedAvatars.length >= 50) {
            cachedAvatars = cachedAvatars.slice(0, 49);
        }

        cachedAvatars.unshift({
            username: username,
            avatar: avatar
        });

        appSettings.set(namespace + '.cache', cachedAvatars);
    };

    this.getAvatarFromCache = function (username) {
        var cachedAvatar = _.findLast(appSettings.get(namespace + '.cache'), function (o) { return o.username == username });
        cachedAvatar = cachedAvatar ? cachedAvatar.avatar : null;

        return cachedAvatar;
    };

    this.getAvatarFromUserlist = function (username) {
        var avatar = (window.findUserlistItem(username) && window.findUserlistItem(username).data('profile').image) ? window.findUserlistItem(username).data('profile').image : null;

        return avatar;
    };



    /**
     * Creating markup for settings
     */
    var schemeItem;
    var option;
    var sort = 100;
    for (var itemName in this.scheme) {
        schemeItem = this.scheme[itemName];

        userSettings.setDefault(namespace + '.' + itemName, schemeItem.default);

        if (userSettings.get(namespace + '.' + itemName)) {
            for (option in schemeItem.options) {
                schemeItem.options[option].selected = (userSettings.get(namespace + '.' + itemName) == schemeItem.options[option].value)
            }
        }

        tab.addControl('select', 'horizontal', schemeItem.title, itemName, schemeItem.options, null, sort);
        sort += 100;
    }


    /**
     * Saving and applying settings
     */
    app.Settings.onSave(function (settings) {
        for (var itemName in that.scheme) {
            settings.set(namespace + '.' + itemName, $('#' + app.prefix + itemName).val());
        }

        if (settings.isDirty(namespace + '.avatars-mode')) {
            app.Settings.requestPageReload();
        }
    });


    /**
     * Applying settings
     */
    if (userSettings.get(namespace  + '.avatars-mode')) {
        window.formatChatMessage = (function (oldFormatChatMessage) {
            return function (data, last) {
                var div = oldFormatChatMessage(data, last);
                var avatarCssClasses = (userSettings.get(namespace + '.avatars-mode') == 'big') ? 'chat-avatar chat-avatar_big' : 'chat-avatar chat-avatar_small';

                var cachedAvatar = that.getAvatarFromCache(data.username);
                var newAvatar = that.getAvatarFromUserlist(data.username);

                if (cachedAvatar || newAvatar) {
                    if (!cachedAvatar) {
                        that.cacheAvatar(data.username, newAvatar);
                    }

                    var $avatar = $("<img>").attr("src", newAvatar || cachedAvatar)
                        .addClass(avatarCssClasses)
                        .prependTo(div.find('.username').parent());

                    if (userSettings.get(namespace + '.avatars-mode') == 'big') {
                        div.find('.username').css('display', 'none');
                        $avatar.attr('title', data.username);
                    }
                }

                return div;
            };
        })(window.formatChatMessage);

        $('.username').each(function () {
            var $messageBlock = $(this).parent();
            var username = $(this).text().replace(/^\s+|[:]?\s+$/g, '');
            var avatarCssClasses = (userSettings.get(namespace + '.avatars-mode') == 'big') ? 'chat-avatar chat-avatar_big' : 'chat-avatar chat-avatar_small';

            var cachedAvatar = that.getAvatarFromCache(username);
            var newAvatar = that.getAvatarFromUserlist(username);

            if (cachedAvatar || newAvatar) {
                if (!cachedAvatar) {
                    that.cacheAvatar(username, newAvatar);
                }

                var $avatar = $("<img>").attr("src", newAvatar || cachedAvatar)
                    .addClass(avatarCssClasses)
                    .prependTo($messageBlock);

                if (userSettings.get(namespace + '.avatars-mode') == 'big') {
                    $(this).css('display', 'none');
                    $avatar.attr('title', username);
                }
            }
        });


        window.socket.on('addUser', function (data) {
            if (data.profile && data.profile.image && data.name) {
                $('.username:contains("' + data.name + ':")').each(function () {
                    var $messageBlock = $(this).parent();
                    var avatarCssClasses = (userSettings.get(namespace + '.avatars-mode') == 'big') ? 'chat-avatar chat-avatar_big' : 'chat-avatar chat-avatar_small';

                    var cachedAvatar = that.getAvatarFromCache(data.name);
                    var newAvatar = that.getAvatarFromUserlist(data.name);

                    if (cachedAvatar || newAvatar) {
                        if (!cachedAvatar) {
                            that.cacheAvatar(data.name, newAvatar);
                        }

                        var $avatar = $("<img>").attr("src", newAvatar || cachedAvatar)
                            .addClass(avatarCssClasses)
                            .prependTo($messageBlock);

                        if (userSettings.get(namespace + '.avatars-mode') == 'big') {
                            $(this).css('display', 'none');
                            $avatar.attr('title', data.name);
                        }
                    }
                });
            }
        });
    }
});