/**
 * Saves messages from chat which were sent by other users to you
 */
window.cytubeEnhanced.addModule('pmHistory', function (app) {
    'use strict';

    var that = this;


    window.socket.on('chatMsg', function (data) {
        if (window.CLIENT.name && data.msg.toLowerCase().indexOf(window.CLIENT.name.toLowerCase()) != -1) {
            var pmHistory = JSON.parse(app.userConfig.get('pmHistory')) || [];
            if (!$.isArray(pmHistory)) {
                pmHistory = [];
            }

            if (pmHistory.length < 99) {

            }

            pmHistory.push({
                username: data.username.replace(/[^\w-]/g, '\\$'),
                msg: data.msg,
                time: data.time
            });

            pmHistory.set(JSON.stringify(pmHistory));
        }
    });



    this.formatHistoryMessage = function (data) {
        var $messageWrapper = $('<div class="pm-history-message">');


        var time = (new Date(data.time));

        var day = time.getDate();
        day = day.length === 1 ? ('0' + day) : day;
        var month = time.getMonth();
        month = month.length === 1 ? ('0' + month) : month;
        var year = time.getFullYear();
        var hours = time.getHours();
        hours = hours.length === 1 ? ('0' + hours) : hours;
        var minutes = time.getMinutes();
        minutes = minutes.length === 1 ? ('0' + minutes) : minutes;
        var seconds = time.getSeconds();
        seconds = seconds.length === 1 ? ('0' + seconds) : seconds;

        var timeString = day + '.' + month + '.' + year + ' ' + hours + ':' + minutes + ':' + seconds;



        $messageWrapper.append($('<div class="pm-history-message-time">' + timeString + '</div>'));
        $messageWrapper.append($('<div class="pm-history-message-username">' + data.username + '</div>'));
        $messageWrapper.append($('<div class="pm-history-message-content">' + data.username + '</div>'));


        return $messageWrapper;
    };

    this.showChatHistory = function () {
        var $modalWindow;
        var pmHistory = JSON.parse(app.userConfig.get('pmHistory')) || [];
        if (!$.isArray(pmHistory)) {
            pmHistory = [];
        }


        var $wrapper = $('<div class="pm-history-content">');
        for (var position = 0, historyLength = pmHistory.length; position < historyLength; position++) {
            $wrapper.append(that.formatHistoryMessage(pmHistory[position]));
        }


        var $resetChatHistoryBtn = $('<button type="button" id="pm-history-reset-btn" class="btn btn-warning">' + app.t('pmHistory[.]Reset history') + '</button>')
            .on('click', function () {
                if (window.confirm('pmHistory[.]Are you sure, that you want to clear messages history?')) {
                    that.resetChatHistory($modalWindow);
                }
            });
        var $exitChatHistoryBtn = $('<button type="button" id="pm-history-exit-btn" class="btn btn-info">' + app.t('pmHistory[.]Exit') + '</button>')
            .on('click', function () {
                $modalWindow.modal('hide');
            });
        var $footer = $('<div class="pm-history-footer">');
        $footer.append($resetChatHistoryBtn);
        $footer.append($exitChatHistoryBtn);


        app.getModule('utils').done(function (utilsModule) {
            $modalWindow = utilsModule.createModalWindow(app.t('pmHistory[.]Chat history'), $wrapper, $footer);
        });
    };

    this.$showChatHistoryBtn = $('<span id="pm-history-btn" class="label label-default pull-right pointer">')
        .text('История')
        .appendTo('#chatheader')
        .on('click', function () {
            that.showChatHistory();
        });



    this.resetChatHistory = function ($modalWindow) {
        app.userConfig.set('pmHistory', JSON.stringify([]));

        if ($modalWindow != null) {
            $modalWindow.modal('hide');
        }
    };
});