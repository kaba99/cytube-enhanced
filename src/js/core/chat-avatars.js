window.cytubeEnhanced.addModule('chatAvatars', function (app) {
    'use strict';
    var that = this;

    //var tab = app.UI.Settings.getTab('general', 'Общее');
    //var $tabContent = $('<div class="form-horizontal">').appendTo(tabConfig.content);
    var userSettings = app.Settings.data;
    userSettings.layout = userSettings.layout || {};

    if (app.userConfig.get('avatarsMode')) {
        window.formatChatMessage = (function (oldFormatChatMessage) {
            return function (data, last) {
                var div = oldFormatChatMessage(data, last);

                var avatarCssClasses = (app.userConfig.get('avatarsMode') == 'big' ? 'chat-avatar chat-avatar_big' : 'chat-avatar chat-avatar_small');

                if ((window.findUserlistItem(data.username) != null) && (window.findUserlistItem(data.username).data('profile').image != "")) {
                    var $avatar = $("<img>").attr("src", window.findUserlistItem(data.username).data('profile').image)
                        .addClass(avatarCssClasses)
                        .prependTo(div.find('.username').parent());

                    if (app.userConfig.get('avatarsMode') == 'big') {
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
            var avatarCssClasses = (app.userConfig.get('avatarsMode') == 'big' ? 'chat-avatar chat-avatar_big' : 'chat-avatar chat-avatar_small');

            if (window.findUserlistItem(username) && window.findUserlistItem(username).data('profile').image) {
                var $avatar = $("<img>").attr("src", window.findUserlistItem(username).data('profile').image)
                    .addClass(avatarCssClasses)
                    .prependTo($messageBlock);

                if (app.userConfig.get('avatarsMode') == 'big') {
                    $(this).css('display', 'none');
                    $avatar.attr('title', username);
                }
            }
        });
    }
});