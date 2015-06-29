cytubeEnhanced.setModule('videoControls', function (app, settings) {
    var that = this;

    var defaultSettings = {
        turnOffVideoOption: true,
        selectQualityOption: true,
        youtubeFlashPlayerForGoogleDocsOption: true,
        expandPlaylistOption: true,
        showVideoContributorsOption: true
    };
    settings = $.extend(defaultSettings, settings);


    //Only for Google drive
    //https://developers.google.com/youtube/js_api_reference
    this.youtubeJavascriptPlayerForGoogleDrive = function (data) {
        var that = this;

        that.videoId = data.id;
        that.videoLength = data.seconds;

        that.init = function () {
            removeOld();

            that.videoURL = 'https://video.google.com/get_player?wmode=opaque&ps=docs&partnerid=30&version=3'; //Basic URL to the Player
            that.videoURL += '&docid=' + that.videoId; //Specify the fileID of the file to show
            that.videoURL += '&autoplay=1';
            that.videoURL += '&fs=1';
            that.videoURL += '&showinfo=0';
            that.videoURL += '&rel=0';
            that.videoURL += '&vq=' + (USEROPTS.default_quality || "auto");
            that.videoURL += '&start=' + parseInt(data.currentTime, 10);
            that.videoURL += '&enablejsapi=1'; //Enable Youtube Js API to interact with the video editor
            that.videoURL += '&playerapiid=' + that.videoId; //Give the video player the same name as the video for future reference
            that.videoURL += '&cc_load_policy=0'; //No caption on this video (maybe not supported for Google Drive Videos)

            var atts = {
                id: "ytapiplayer"
            };
            var params = {
                allowScriptAccess: "always",
                allowFullScreen: "true"
            };
            swfobject.embedSWF(that.videoURL,
                "ytapiplayer",
                VWIDTH,
                VHEIGHT,
                "8",
                null,
                null,
                params,
                atts);

            onYouTubePlayerReady = function (playerId) {
                that.player = $('#ytapiplayer')[0];
                that.player.addEventListener("onStateChange", "onytplayerStateChange");
            };

            onytplayerStateChange = function (newState) {
                var statesMap = {
                    '-1': 'beforeVideo',
                    0: 'end',
                    1: 'play',
                    2: 'pause',
                    3: 'buf',
                    5: 'queue'
                };


                if (statesMap[newState] === 'beforeVideo') {
                    that.setVolume(VOLUME);
                } else if (statesMap[newState] === 'play') {
                    PLAYER.paused = false;

                    if (CLIENT.leader) {
                        sendVideoUpdate();
                    }
                } else if (statesMap[newState] === 'pause') {
                    PLAYER.paused = true;

                    if (CLIENT.leader) {
                        sendVideoUpdate();
                    }
                } else if (statesMap[newState] === 'end') {
                    if (CLIENT.leader) {
                        socket.emit("playNext");
                    }
                }
            };
        };

        that.load = function (data) {
            that.videoId = data.id;
            that.videoLength = data.seconds;
            that.init();
        };

        that.pause = function () {
            if (that.player && that.player.pauseVideo) {
                that.player.pauseVideo();
            }
        };

        that.play = function () {
            if (that.player && that.player.playVideo) {
                that.player.playVideo();
            }
        };

        that.getTime = function (callback) {
            if (that.player && that.player.getCurrentTime) {
                var t = parseFloat(that.player.getCurrentTime());
                callback(t);
            }
        };

        that.seek = function (time) {
            if (that.player.seekTo) {
                that.player.seekTo(time);
            }
        };

        that.getVolume = function (callback) {
            if (that.player && that.player.getVolume) {
                callback(that.player.getVolume() / 100);
            }
        };

        that.setVolume = function (volume) {
            that.player.setVolume(volume * 100);
        };

        that.init();
    };


    $('#mediarefresh').hide();


    this.$topVideoControls = $('<div id="top-video-controls" class="btn-group">').appendTo("#videowrap");


    this.refreshVideo = function () {
        PLAYER.type = '';
        PLAYER.id = '';
        socket.emit('playerReady');
    };
    this.$refreshVideoBtn = $('<button id="refresh-video" class="btn btn-sm btn-default" title="' + app.t('video[.]Refresh video') + '">')
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
    this.$hidePlayerBtn = $('<button id="hide-player-btn" class="btn btn-sm btn-default" title="' + app.t('video[.]Hide video') + '">')
        .html('<i class="glyphicon glyphicon-ban-circle">')
        .appendTo(this.$topVideoControls)
        .on('click', function() {
            that.hidePlayer($(this));
        });
    if (!settings.turnOffVideoOption) {
        this.$hidePlayerBtn.hide();
    }


    this.qualityLabelsTranslate = {
        auto: 'авто',
        small: '240p',
        medium: '360p',
        large: '480p',
        hd720: '720p',
        hd1080: '1080p',
        highres: app.t('video[.]highres')
    };

    this.youtubeQualityMap = {
        auto: 'default'
    };

    this.$videoQualityBtnGroup = $('<div class="btn-group">')
        .html('<button type="button" class="btn btn-default btn-sm video-dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' + app.t('video[.]Quality') + ': ' + this.qualityLabelsTranslate[USEROPTS.default_quality || 'auto'] + ' <span class="caret"></span></button>')
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

        that.$videoQualityBtnGroup.find('button').html(app.t('video[.]Quality') + ': ' + $qualityLink.text() + ' <span class="caret"></span>');
        $('.video-dropdown-toggle').dropdown();
    };
    this.$videoQualityBtnGroup.on('click', 'a', function () {
        that.changeVideoQuality($(this));

        return false;
    });
    if (!settings.selectQualityOption) {
        this.$videoQualityBtnGroup.hide();
    }


    this.settingsFix = function () {
        $("#us-theme").val(USEROPTS.theme);
        $("#us-layout").val(USEROPTS.layout);
        $("#us-no-channelcss").prop("checked", USEROPTS.ignore_channelcss);
        $("#us-no-channeljs").prop("checked", USEROPTS.ignore_channeljs);

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
        .text(app.t('video[.]Use Youtube JS Player'))
        .appendTo(this.$topVideoControls)
        .on('click', function() {
            that.toggleGoogleDrivePlayer($(this));
        });
    if (!settings.youtubeFlashPlayerForGoogleDocsOption) {
        this.$youtubeJavascriptPlayerBtn.hide();
    }


    this.PLAYLIST_HEIGHT = 500;
    this.expandPlaylist = function ($expandPlaylistBtn) {
        if ($expandPlaylistBtn.hasClass('btn-success')) {//expanded
            $('#queue').css('max-height', that.PLAYLIST_HEIGHT + 'px');

            $expandPlaylistBtn.attr('title', app.t('video[.]Expand playlist'));

            $expandPlaylistBtn.removeClass('btn-success');
            $expandPlaylistBtn.addClass('btn-default');
        } else {//not expanded
            $('#queue').css('max-height', '100000px');

            $expandPlaylistBtn.attr('title', app.t('video[.]Unexpand playlist'));

            $expandPlaylistBtn.removeClass('btn-default');
            $expandPlaylistBtn.addClass('btn-success');

            scrollQueue();
        }
    };
    this.$expandPlaylistBtn = $('<button id="expand-playlist-btn" class="btn btn-sm btn-default" data-expanded="0" title="' + app.t('video[.]Expand playlist') + '">')
        .append('<span class="glyphicon glyphicon-resize-full">')
        .prependTo('#videocontrols')
        .on('click', function() {
            that.expandPlaylist($(this));
        });
    if (!settings.expandPlaylistOption) {
        this.$expandPlaylistBtn.hide();
    }


    this.$scrollToCurrentBtn = $('<button id="scroll-to-current-btn" class="btn btn-sm btn-default" title="' + app.t('video[.]Scroll the playlist to the current video') + '">')
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

        $bodyWrapper.append($('<p>' + app.t('video[.]Video\'s count') + ': ' + ($("#queue .queue_entry").length + 1) + '</p>'));

        var $contributorsListOl = $('<ol>');
        for (var contributor in contributorsList) {
            $contributorsListOl.append($('<li>' + contributor + ': ' + contributorsList[contributor] + '.</li>'));
        }
        $contributorsListOl.appendTo($bodyWrapper);

        app.getModule('utils').done(function (utilsModule) {
            utilsModule.createModalWindow(app.t('video[.]Contributors\' list'), $bodyWrapper);
        });
    };
    this.$videoContributorsBtn = $('<button id="video-contributors-btn" class="btn btn-sm btn-default" title="' + app.t('video[.]Contributors\' list') + '">')
        .append('<span class="glyphicon glyphicon-user">')
        .prependTo('#videocontrols')
        .on('click', function() {
            that.showVideoContributorsList();
        });
    if (!settings.showVideoContributorsOption) {
        this.$videoContributorsBtn.hide();
    }


    this.handleGoogleDrivePlayer = function (data) {
        if (that.YOUTUBE_JS_PLAYER_TURNED_ON && data.type === 'fi' && /google/.test(data.url)) {
            that.YOUTUBE_JS_PLAYER_NOW = true;

            PLAYER = new that.youtubeJavascriptPlayerForGoogleDrive(data);
            PLAYER.type = data.type;
        } else {
            that.YOUTUBE_JS_PLAYER_NOW = false;
        }
    };

    this.run = function () {
        if (settings.youtubeFlashPlayerForGoogleDocsOption) {
            that.YOUTUBE_JS_PLAYER_TURNED_ON = getOrDefault(CHANNEL.name + '_config-yt-js-player', false);

            socket.on('changeMedia', function (data) {
                that.handleGoogleDrivePlayer(data);
            });

            if (that.YOUTUBE_JS_PLAYER_TURNED_ON) {
                that.$youtubeJavascriptPlayerBtn.removeClass('btn-default');
                that.$youtubeJavascriptPlayerBtn.addClass('btn-success');

                that.$refreshVideoBtn.click();
            }
        }
    };
});
