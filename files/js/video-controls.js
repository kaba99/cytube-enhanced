animachEnhancedApp.addModule('videoControls', function () {
    $('#mediarefresh').hide();


    var $topVideoControls = $('<div id="top-video-controls" class="btn-group">').appendTo("#videowrap");


    var $refreshVideoBtn = $('<button id="refresh-video" class="btn btn-sm btn-default" title="Обновить видео">')
        .html('<i class="glyphicon glyphicon-refresh">')
        .appendTo($topVideoControls)
        .on('click', function () {
            PLAYER.type = '';
            PLAYER.id = '';
            socket.emit('playerReady');
        });


    //var STORE_VOLUME;
    //var $muteVolumeBtn = $('<button id="mute-volume-btn" class="btn btn-sm btn-default" title="Выключить звук">')
    //    .html('<i class="glyphicon glyphicon-volume-off">')
    //    .appendTo($topVideoControls)
    //    .on('click', function() {
    //        if (VOLUME !== 0) {
    //            STORE_VOLUME = VOLUME;
    //
    //            if (PLAYER.player.mute !== undefined) {
    //                PLAYER.player.mute();
    //            } else if (PLAYER.player.volume !== undefined) {
    //                PLAYER.player.volume = 0;
    //            } else if (PLAYER.player.setVolume !== undefined) {
    //                PLAYER.player.setVolume(0);
    //            }
    //
    //            $muteVolumeBtn.html('<i class="glyphicon glyphicon-volume-up">');
    //            $(this).removeClass('btn-default');
    //            $(this).addClass('btn-success');
    //        } else {
    //            VOLUME = STORE_VOLUME;
    //
    //            if (PLAYER.player.unMute !== undefined) {
    //                PLAYER.player.unMute();
    //            } else if (PLAYER.player.volume !== undefined) {
    //                PLAYER.player.volume = VOLUME;
    //            } else if (PLAYER.player.setVolume !== undefined) {
    //                PLAYER.player.setVolume(VOLUME);
    //            }
    //
    //            $muteVolumeBtn.html('<i class="glyphicon glyphicon-volume-off">');
    //            $(this).removeClass('btn-success');
    //            $(this).addClass('btn-default');
    //        }
    //    });
    //(function checkVolume() {
    //    setTimeout(function () {
    //        if (PLAYER && typeof PLAYER.getVolume === "function") {
    //            PLAYER.getVolume(function (v) {
    //                if (typeof v === "number") {
    //                    if (v > 1) {
    //                        v /= 100;
    //                    }
    //
    //                    if (v >= 0 && v <= 1) {
    //                        VOLUME = v;
    //                    } else {
    //                        VOLUME = 1;
    //                    }
    //
    //                    setOpt("volume", VOLUME);
    //                }
    //            });
    //        }
    //
    //        if (VOLUME !== 0) {
    //            STORE_VOLUME = VOLUME;
    //
    //            $muteVolumeBtn.html('<i class="glyphicon glyphicon-volume-off">');
    //            $muteVolumeBtn.removeClass('btn-success');
    //            $muteVolumeBtn.addClass('btn-default');
    //        } else {
    //            $muteVolumeBtn.html('<i class="glyphicon glyphicon-volume-up">');
    //            $muteVolumeBtn.removeClass('btn-default');
    //            $muteVolumeBtn.addClass('btn-success');
    //        }
    //
    //        checkVolume();
    //    }, 1500);
    //})();


    var $hidePlayerBtn = $('<button id="hide-player-btn" class="btn btn-sm btn-default" data-hidden="0" title="Скрыть видео">')
        .html('<i class="glyphicon glyphicon-ban-circle">')
        .appendTo($topVideoControls)
        .on('click', function() {
            if (+$(this).data('hidden') === 0) {
                var $playerWindow = $('#videowrap').find('.embed-responsive');
                $playerWindow.css({position: 'relative'});

                $playerWindow.append($('<div id="hidden-player-overlay">'));

                $(this).data('hidden', 1);

                $(this).html('<i class="glyphicon glyphicon-film">');
                $(this).removeClass('btn-default');
                $(this).addClass('btn-success');
            } else {
                $('#hidden-player-overlay').remove();

                $(this).data('hidden', 0);

                $(this).html('<i class="glyphicon glyphicon-ban-circle">');
                $(this).removeClass('btn-success');
                $(this).addClass('btn-default');
            }
        });


    var qualityLabelsTranslate = {
        auto: 'авто',
        small: '240p',
        medium: '360p',
        large: '480p',
        hd720: '720p',
        hd1080: '1080p',
        highres: 'наивысшее'
    };
    var $videoQualityBtn = $('<div class="btn-group">').appendTo($topVideoControls)
        .html('<button type="button" class="btn btn-default btn-sm video-dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Качество: ' + qualityLabelsTranslate[USEROPTS.default_quality || 'auto'] + ' <span class="caret"></span></button>' +
            '<ul class="dropdown-menu">' +
                '<li><a href="#" data-quality="auto">авто</a></li>' +
                '<li><a href="#" data-quality="small">240p</a></li>' +
                '<li><a href="#" data-quality="medium">360p</a></li>' +
                '<li><a href="#" data-quality="large">480p</a></li>' +
                '<li><a href="#" data-quality="hd720">720p</a></li>' +
                '<li><a href="#" data-quality="hd1080">1080p</a></li>' +
                '<li><a href="#" data-quality="highres">наивысшее</a></li>' +
            '</ul>')
        .on('click', 'a', function () {
            if (YOUTUBE_JS_PLAYER_NOW) {
                var quality = $(this).data('quality');
                var youtubeQualityMap = {
                    auto: 'default'
                };


                quality = youtubeQualityMap[quality] !== undefined ?
                    youtubeQualityMap[quality] :
                    quality;

                PLAYER.player.setPlaybackQuality(quality);
            }

            settingsFix();

            $("#us-default-quality").val($(this).data('quality'));
            saveUserOptions();

            $('#refresh-video').click();

            $videoQualityBtn.find('button').html('Качество: ' + $(this).text() + ' <span class="caret"></span>');
            $('.video-dropdown-toggle').dropdown();

            return false;
        });


    settingsFix = function () {
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


    youtubePlaybackQualityChange = function (quality) {
        var youtubeQualityMap = {
            default: 'auto'
        };

        quality = youtubeQualityMap[quality] !== undefined ?
            youtubeQualityMap[quality] :
            quality;

        settingsFix();
        $("#us-default-quality").val(quality);
        saveUserOptions();

        $videoQualityBtn.find('button').html('Качество: ' + qualityLabelsTranslate[quality] + ' <span class="caret"></span>');
    };


    var YOUTUBE_JS_PLAYER = getOrDefault(CHANNEL.name + '_config-yt-js-player', false);
    socket.on('changeMedia', function (data) {
        if (YOUTUBE_JS_PLAYER && data.type === 'fi' && /google/.test(data.url)) {
            YOUTUBE_JS_PLAYER_NOW = true;

            PLAYER = new youtubeJavascriptPlayer(data);
            PLAYER.type = data.type;
        } else {
            YOUTUBE_JS_PLAYER_NOW = false;
        }
    });
    var $youtubeJavascriptPlayerBtn = $('<button id="youtube-javascript-player-btn" class="btn btn-sm btn-default">Использовать Youtube JS Player</button>')
        .appendTo($topVideoControls)
        .on('click', function() {
            YOUTUBE_JS_PLAYER = !YOUTUBE_JS_PLAYER;
            setOpt(CHANNEL.name + '_config-yt-js-player', YOUTUBE_JS_PLAYER);

            if (YOUTUBE_JS_PLAYER) {
                $(this).removeClass('btn-default');
                $(this).addClass('btn-success');
            } else {
                $(this).removeClass('btn-success');
                $(this).addClass('btn-default');
            }

            $('#refresh-video').click();
        });
    if (YOUTUBE_JS_PLAYER) {
        $youtubeJavascriptPlayerBtn.removeClass('btn-default');
        $youtubeJavascriptPlayerBtn.addClass('btn-success');

        $('#refresh-video').click();
    }




    var $expandPlaylistBtn = $('<button id="expand-playlist-btn" class="btn btn-sm btn-default" data-expanded="0" title="Развернуть плейлист">')
        .append('<span class="glyphicon glyphicon-resize-full">')
        .prependTo('#videocontrols')
        .on('click', function() {
            if (+$(this).data('expanded') === 1) {
                $('#queue').css('max-height', '500px');
                $(this).attr('title', 'Свернуть плейлист');

                $(this).data('expanded', 0);
                $(this).removeClass('btn-default');
                $(this).addClass('btn-success');

                scrollQueue();
            } else {
                $('#queue').css('max-height', '100000px');
                $(this).attr('title', 'Развернуть плейлист');

                $(this).data('expanded', 1);
                $(this).removeClass('btn-success');
                $(this).addClass('btn-default');
            }
        });


    var $scrollToCurrentBtn = $('<button id="scroll-to-current-btn" class="btn btn-sm btn-default" title="Прокрутить плейлист к текущему видео">')
        .append('<span class="glyphicon glyphicon-hand-right">')
        .prependTo('#videocontrols')
        .on('click', function() {
            scrollQueue();
        });

    var $contribBtn = $('<button id="contrib-btn" class="btn btn-sm btn-default" title="Contributors list" />')
        .append('<span class="glyphicon glyphicon-user">')
        .prependTo('#videocontrols')
        .on('click', function() {
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

            createModalWindow('Список пользователей, добавивших видео', $bodyWrapper);
        });
});
