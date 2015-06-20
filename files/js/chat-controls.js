animachEnhancedApp.addModule('chatControls', function () {
    var $afkButton = $('<span id="afk-btn" class="label label-default pull-right pointer">АФК</span>')
        .appendTo($('#chatheader'))
        .on('click', function () {
            socket.emit('chatMsg', {msg: '/afk'});
        });

    socket.on('setAFK', function (data) {
        if (data.name === CLIENT.name) {
            if (data.afk) {
                $afkButton.removeClass('label-default');
                $afkButton.addClass('label-success');
            } else {
                $afkButton.addClass('label-default');
                $afkButton.removeClass('label-success');
            }
        }
    });


    if (hasPermission("chatclear")) {
        var $clearChatButton = $('<span id="clear-chat-btn" class="label label-default pull-right pointer">Очистить чат</span>')
            .insertAfter($afkButton)
            .on('click', function () {
                if (confirm('Вы уверены, что хотите очистить чат?')) {
    				socket.emit("chatMsg", {msg: '/clear'});
    			}
            });
    }
});
