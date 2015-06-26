cytubeEnhanced.setModule('videoControls', function (app) {
    var that = this;


    $('#mediarefresh').hide();


    this.$topVideoControls = $('<div id="top-video-controls" class="btn-group">').appendTo("#videowrap");


    this.refreshVideo = function () {
        PLAYER.type = '';
        PLAYER.id = '';
        socket.emit('playerReady');
    };
    this.$refreshVideoBtn = $('<button id="refresh-video" class="btn btn-sm btn-default" title="Обновить видео">')
        .html('<i class="glyphicon glyphicon-refresh">')
        .appendTo(this.$topVideoControls)
        .on('click', function () {
            that.refreshVideo();
        });


    this.hidePlayer = function ($hidePlayerBtn) {
        if ($hidePlayerBtn.hasClass('btn-default')) { //video visible
            var $playerWindow = $('#videowrap').find('.embed-responsive');
            $playerWindow.css({position: 'relative'});

            $('<div id="player-overlay">').appendTo($playerWindow);

            $hidePlayerBtn.html('<i class="glyphicon glyphicon-film">');
            $hidePlayerBtn.removeClass('btn-default');
            $hidePlayerBtn.addClass('btn-success');
        } else { //video hidden
            $('#player-overlay').remove();

            $hidePlayerBtn.html('<i class="glyphicon glyphicon-ban-circle">');
            $hidePlayerBtn.removeClass('btn-success');
            $hidePlayerBtn.addClass('btn-default');
        }
    };
    this.$hidePlayerBtn = $('<button id="hide-player-btn" class="btn btn-sm btn-default" title="Скрыть видео">')
        .html('<i class="glyphicon glyphicon-ban-circle">')
        .appendTo(this.$topVideoControls)
        .on('click', function() {
            that.hidePlayer($(this));
        });


    this.qualityLabelsTranslate = {
        auto: 'авто',
        small: '240p',
        medium: '360p',
        large: '480p',
        hd720: '720p',
        hd1080: '1080p',
        highres: 'наивысшее'
    };

    this.youtubeQualityMap = {
        auto: 'default'
    };

    this.$videoQualityBtnGroup = $('<div class="btn-group">')
        .html('<button type="button" class="btn btn-default btn-sm video-dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Качество: ' + this.qualityLabelsTranslate[USEROPTS.default_quality || 'auto'] + ' <span class="caret"></span></button>')
        .appendTo(this.$topVideoControls);

    this.$videoQualityList = $('<ul class="dropdown-menu">');
    for (var qualityName in that.qualityLabelsTranslate) {
        $('<li>')
            .html('<a href="#" data-quality="' + qualityName + '">' + this.qualityLabelsTranslate[qualityName] + '</a>')
            .appendTo(this.$videoQualityList);
    }
    this.$videoQualityList.appendTo(this.$videoQualityBtnGroup);

    this.changeVideoQuality = function ($qualityLink) {
        if (that.YOUTUBE_JS_PLAYER_NOW) {
            var quality = $qualityLink.data('quality');

            quality = that.youtubeQualityMap[quality] !== undefined ?
                that.youtubeQualityMap[quality] :
                quality;

            PLAYER.player.setPlaybackQuality(quality);
        }

        that.settingsFix();
        $("#us-default-quality").val($qualityLink.data('quality'));
        saveUserOptions();

        that.$refreshVideoBtn.click();

        that.$videoQualityBtnGroup.find('button').html('Качество: ' + $qualityLink.text() + ' <span class="caret"></span>');
        $('.video-dropdown-toggle').dropdown();
    };
    this.$videoQualityBtnGroup.on('click', 'a', function () {
        that.changeVideoQuality($(this));

        return false;
    });


    this.settingsFix = function () {
        $("#us-theme").val(USEROPTS.theme);
        $("#us-layout").val(USEROPTS.layout);
        $("#us-no-channelcss").prop("checked", USEROPTS.ignore_channelcss);
        $("#us-no-channeljs").prop("checked", USEROPTS.ignore_channeljs);
        var conninfo = "<strong>Информация о соединении: </strong>" +
                       "Connected to <code>" + IO_URL + "</code> (";
        if (IO_V6) {
            conninfo += "IPv6, ";
        } else {
            conninfo += "IPv4, ";
        }

        if (IO_URL === IO_URLS["ipv4-ssl"] || IO_URL === IO_URLS["ipv6-ssl"]) {
            conninfo += "SSL)";
        } else {
            conninfo += "no SSL)";
        }

        conninfo += ".  SSL включено по умолчанию если оно поддерживается сервером.";
        $("#us-conninfo").html(conninfo);


        $("#us-synch").prop("checked", USEROPTS.synch);
        $("#us-synch-accuracy").val(USEROPTS.sync_accuracy);
        $("#us-wmode-transparent").prop("checked", USEROPTS.wmode_transparent);
        $("#us-hidevideo").prop("checked", USEROPTS.hidevid);
        $("#us-playlistbuttons").prop("checked", USEROPTS.qbtn_hide);
        $("#us-oldbtns").prop("checked", USEROPTS.qbtn_idontlikechange);
        $("#us-default-quality").val(USEROPTS.default_quality || "auto");

        $("#us-chat-timestamp").prop("checked", USEROPTS.show_timestamps);
        $("#us-sort-rank").prop("checked", USEROPTS.sort_rank);
        $("#us-sort-afk").prop("checked", USEROPTS.sort_afk);
        $("#us-blink-title").val(USEROPTS.blink_title);
        $("#us-ping-sound").val(USEROPTS.boop);
        $("#us-sendbtn").prop("checked", USEROPTS.chatbtn);
        $("#us-no-emotes").prop("checked", USEROPTS.no_emotes);

        $("#us-modflair").prop("checked", USEROPTS.modhat);
        $("#us-joinmessage").prop("checked", USEROPTS.joinmessage);
        $("#us-shadowchat").prop("checked", USEROPTS.show_shadowchat);
    };


    //youtubePlaybackQualityChange = function (quality) {
    //    var youtubeQualityMap = {
    //        default: 'auto'
    //    };
    //
    //    quality = youtubeQualityMap[quality] !== undefined ?
    //        youtubeQualityMap[quality] :
    //        quality;
    //
    //    settingsFix();
    //    $("#us-default-quality").val(quality);
    //    saveUserOptions();
    //
    //    $videoQualityBtnGroup.find('button').html('Качество: ' + qualityLabelsTranslate[quality] + ' <span class="caret"></span>');
    //};


    this.toggleGoogleDrivePlayer = function ($youtubeJavascriptPlayerBtn) {
        that.YOUTUBE_JS_PLAYER_TURNED_ON = !that.YOUTUBE_JS_PLAYER_TURNED_ON;
        setOpt(CHANNEL.name + '_config-yt-js-player', that.YOUTUBE_JS_PLAYER_TURNED_ON);

        if (that.YOUTUBE_JS_PLAYER_TURNED_ON) {
            $youtubeJavascriptPlayerBtn.removeClass('btn-default');
            $youtubeJavascriptPlayerBtn.addClass('btn-success');
        } else {
            $youtubeJavascriptPlayerBtn.removeClass('btn-success');
            $youtubeJavascriptPlayerBtn.addClass('btn-default');
        }

        that.$refreshVideoBtn.click();
    };
    this.$youtubeJavascriptPlayerBtn = $('<button id="youtube-javascript-player-btn" class="btn btn-sm btn-default">')
        .text('Использовать Youtube JS Player')
        .appendTo(this.$topVideoControls)
        .on('click', function() {
            that.toggleGoogleDrivePlayer($(this));
        });


    this.PLAYLIST_HEIGHT = 500;
    this.expandPlaylist = function ($expandPlaylistBtn) {
        if ($expandPlaylistBtn.hasClass('btn-success')) {//expanded
            $('#queue').css('max-height', that.PLAYLIST_HEIGHT + 'px');

            $expandPlaylistBtn.attr('title', 'Развернуть плейлист');

            $expandPlaylistBtn.removeClass('btn-success');
            $expandPlaylistBtn.addClass('btn-default');
        } else {//not expanded
            $('#queue').css('max-height', '100000px');

            $expandPlaylistBtn.attr('title', 'Свернуть плейлист');

            $expandPlaylistBtn.removeClass('btn-default');
            $expandPlaylistBtn.addClass('btn-success');

            scrollQueue();
        }
    };
    this.$expandPlaylistBtn = $('<button id="expand-playlist-btn" class="btn btn-sm btn-default" data-expanded="0" title="Развернуть плейлист">')
        .append('<span class="glyphicon glyphicon-resize-full">')
        .prependTo('#videocontrols')
        .on('click', function() {
            that.expandPlaylist($(this));
        });


    this.$scrollToCurrentBtn = $('<button id="scroll-to-current-btn" class="btn btn-sm btn-default" title="Прокрутить плейлист к текущему видео">')
        .append('<span class="glyphicon glyphicon-hand-right">')
        .prependTo('#videocontrols')
        .on('click', function() {
            scrollQueue();
        });


    this.showVideoContributorsList = function () {
        var $bodyWrapper = $('<div>');

        var contributorsList = {};
        $("#queue .queue_entry").each(function () {
            var username = $(this).attr('title').replace('Added by: ', '');

            if (contributorsList[username] === undefined) {
                contributorsList[username] = 1;
            } else {
                contributorsList[username] += 1;
            }
        });

        $bodyWrapper.append($('<p>Всего добавлено: ' + ($("#queue .queue_entry").length + 1) + ' видео.</p>'));

        var $contributorsListOl = $('<ol>');
        for (var contributor in contributorsList) {
            $contributorsListOl.append($('<li>' + contributor + ': ' + contributorsList[contributor] + '.</li>'));
        }
        $contributorsListOl.appendTo($bodyWrapper);

        app.getModule('utils').done(function (utilsModule) {
            utilsModule.createModalWindow('Список пользователей, добавивших видео', $bodyWrapper);
        });
    };
    this.$videoContributorsBtn = $('<button id="video-contributors-btn" class="btn btn-sm btn-default" title="Список пользователей, добавивших видео">')
        .append('<span class="glyphicon glyphicon-user">')
        .prependTo('#videocontrols')
        .on('click', function() {
            that.showVideoContributorsList();
        });


    this.handleGoogleDrivePlayer = function (data) {
        if (that.YOUTUBE_JS_PLAYER_TURNED_ON && data.type === 'fi' && /google/.test(data.url)) {
            that.YOUTUBE_JS_PLAYER_NOW = true;

            app.getModule('utils').done(function (utilsModule) {
                PLAYER = new utilsModule.youtubeJavascriptPlayerForGoogleDrive(data);
                PLAYER.type = data.type;
            });
        } else {
            that.YOUTUBE_JS_PLAYER_NOW = false;
        }
    };


    this.run = function () {
        that.YOUTUBE_JS_PLAYER_TURNED_ON = getOrDefault(CHANNEL.name + '_config-yt-js-player', false);

        socket.on('changeMedia', function (data) {
            that.handleGoogleDrivePlayer(data);
        });

        if (this.YOUTUBE_JS_PLAYER_TURNED_ON) {
            that.$youtubeJavascriptPlayerBtn.removeClass('btn-default');
            that.$youtubeJavascriptPlayerBtn.addClass('btn-success');

            that.$refreshVideoBtn.click();
        }
    };
});
