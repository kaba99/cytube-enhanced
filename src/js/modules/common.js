window.cytubeEnhanced.addModule('common', function (app, settings) {
    'use strict';
    var that = this;

    var defaultSettings = {
        insertUsernameOnClick: true
    };
    settings = $.extend({}, defaultSettings, settings);

    this.$chatline = $("#chatline");
    this.$userlist = $("#userlist");


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
