cytubeEnhanced.setModule('chatControls', function () {
    var that = this;


    this.handleAfk = function (data) {
        if (data.name === CLIENT.name) {
            if (data.afk) {
                that.$afkBtn.removeClass('label-default');
                that.$afkBtn.addClass('label-success');
            } else {
                that.$afkBtn.addClass('label-default');
                that.$afkBtn.removeClass('label-success');
            }
        }
    };


    this.handleAfkBtn = function () {
        socket.emit('chatMsg', {msg: '/afk'});
    };
    this.$afkBtn = $('<span id="afk-btn" class="label label-default pull-right pointer">')
        .text('АФК')
        .appendTo('#chatheader')
        .on('click', function () {
            that.handleAfkBtn();
        });


    this.handleClearBtn = function () {
        if (confirm('Вы уверены, что хотите очистить чат?')) {
            socket.emit("chatMsg", {msg: '/clear'});
        }
    };
    this.$clearChatBtn = $('<span id="clear-chat-btn" class="label label-default pull-right pointer">')
        .text('Очистить чат')
        .insertAfter(that.$afkBtn)
        .on('click', function () {
            that.handleClearBtn();
        });

    if (hasPermission("chatclear")) {
        this.$clearChatBtn.show();
    } else {
        this.$clearChatBtn.hide();
    }


    this.run = function () {
        socket.on('setAFK', function (data) {
            that.handleAfk(data);
        });

        socket.on('setUserRank', function () {
            if (hasPermission("chatclear")) {
                that.$clearChatBtn.show();
            } else {
                that.$clearChatBtn.hide();
            }
        });
    };
});
