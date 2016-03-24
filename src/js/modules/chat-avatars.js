window.cytubeEnhanced.addModule('chatAvatars', function (app, settings) {
    'use strict';
    var that = this;

    var tab = app.Settings.getTab('general', app.t('general[.]General'), 100);
    var userSettings = app.Settings.storage;
    var appSettings = app.storage;

    var defaultSettings = {
        avatarClass: 'chat-avatar',
        smallAvatarClass: 'chat-avatar_small',
        bigAvatarClass: 'chat-avatar_big'
    };
    settings = $.extend({}, defaultSettings, settings);

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
        return (window.findUserlistItem(username) && window.findUserlistItem(username).data('profile').image) ? window.findUserlistItem(username).data('profile').image : null;
    };

    this.applyAvatar = function ($usernameBlock, username, newAvatar) {
        username = username || $usernameBlock.text().replace(/^\s+|[:]?\s+$/g, '');
        newAvatar = newAvatar || that.getAvatarFromUserlist(username);
        var cachedAvatar = that.getAvatarFromCache(username);
        var $messageBlock = $usernameBlock.parent();

        if (cachedAvatar || newAvatar) {
            if (!cachedAvatar) {
                that.cacheAvatar(username, newAvatar);
            }

            if ($messageBlock.find('.' + settings.avatarClass).length == 0) {
                var $avatar = $("<img>").attr("src", newAvatar || cachedAvatar)
                    .addClass(settings.avatarClass + ' ' + ((userSettings.get(namespace + '.avatars-mode') == 'big') ? settings.bigAvatarClass : settings.smallAvatarClass))
                    .prependTo($messageBlock);

                if (userSettings.get(namespace + '.avatars-mode') == 'big') {
                    $(this).css('display', 'none');
                    $avatar.attr('title', username);
                }
            }
        }
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
                var $div = oldFormatChatMessage(data, last);

                that.applyAvatar($div.find('.username'), data.username);

                return $div;
            };
        })(window.formatChatMessage);

        $('.username').each(function () {
            that.applyAvatar($(this));
        });


        window.socket.on('addUser', function (data) {
            if (data.profile && data.profile.image && data.name) {
                $('.username:contains("' + data.name + ':")').each(function () {
                    that.applyAvatar($(this), data.name, data.profile.image);
                });
            }
        });
    }
});