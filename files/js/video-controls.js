animachEnhancedApp.addModule('videoControls', function () {
    $('#mediarefresh').hide();


    var $videoControls = $('<div id="video-controls" class="btn-group">').appendTo("#videowrap");


    var $refreshVideoBtn = $('<button id="refresh-video" class="btn btn-sm btn-default">Обновить видео</button>').appendTo($videoControls);
    $refreshVideoBtn.on('click', function () {
        PLAYER.type = '';
        PLAYER.id = '';
        socket.emit('playerReady');
    });


    var qualityLabelsTranslate = {
        auto: 'авто',
        small: '240p',
        medium: '380p',
        large: '480p',
        hd720: '720p',
        hd1080: '1080p',
        highres: 'наивысшее'
    };
    var $videoQualityBtn = $('<div class="btn-group">').appendTo($videoControls)
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
            settingsFix();

            $("#us-default-quality").val($(this).data('quality'));
            saveUserOptions();

            $('#refresh-video').click();

            $videoQualityBtn.find('button').html('Качество: ' + $(this).text() + ' <span class="caret"></span>');
            $('.video-dropdown-toggle').dropdown();

            return false;
        });

    var settingsFix = function () {
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


    var $hidePlayerBtn = $('<button id="hide-player-btn" class="btn btn-sm btn-default" data-hidden="0">Скрыть видео</button>')
        .appendTo($videoControls)
        .on('click', function() {
            if (+$(this).data('hidden') === 0) {
                var $playerWindow = $('#videowrap').find('.embed-responsive');
                $playerWindow.css({position: 'relative'});

                $playerWindow.append($('<div id="hidden-player-overlay">'));

                $(this).data('hidden', 1);
                $(this).text('Показать видео');
            } else {
                $('#hidden-player-overlay').remove();

                $(this).data('hidden', 0);
                $(this).text('Скрыть видео');
            }
        });


    var PLAYER_VOLUME;
    var $muteVolumeBtn = $('<button id="mute-volume-btn" class="btn btn-sm btn-default" data-hidden="0">Выключить звук</button>')
        .appendTo($videoControls)
        .on('click', function() {
            if (+$(this).data('hidden') === 0) {
                PLAYER_VOLUME = PLAYER.player.volume;
                if (PLAYER.player.mute !== undefined) {
                    PLAYER.player.mute();
                } else if (PLAYER.player.volume !== undefined) {
                    PLAYER.player.volume = 0;
                }

                $(this).data('hidden', 1);
                $(this).text('Включить звук');
            } else {
                if (PLAYER.player.unMute !== undefined) {
                    PLAYER.player.unMute();
                } else if (PLAYER.player.volume !== undefined) {
                    PLAYER.player.volume = PLAYER_VOLUME;
                }

                $(this).data('hidden', 0);
                $(this).text('Выключить звук');
            }
        });


    var $expandPlaylistBtn = $('<button id="expand-playlist-btn" class="btn btn-sm btn-default" data-expanded="0" title="Развернуть плейлист">')
        .append('<span class="glyphicon glyphicon-resize-full">')
        .prependTo('#videocontrols')
        .on('click', function() {
            if (+$(this).data('expanded') === 1) {
                $('#queue').css('max-height', '500px');
                $(this).attr('title', 'Свернуть плейлист');

                $(this).data('expanded', 0);

        		scrollQueue();
        	} else {
                $('#queue').css('max-height', '100000px');
                $(this).attr('title', 'Развернуть плейлист');

                $(this).data('expanded', 1);
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
            hidePlayer();
            var $outer = $('<div class="modal fade chat-help-modal" role="dialog">').appendTo($("body"));
            var $modal = $('<div class="modal-dialog modal-lg">').appendTo($outer);
            var $content = $('<div class="modal-content">').appendTo($modal);

            var $header = $('<div class="modal-header">').appendTo($content);
            $('<button class="close" data-dismiss="modal" aria-hidden="true">').html('x').appendTo($header);
            $('<h3 class="modal-title">').text('Список пользователей, добавивших видео').appendTo($header);

            var $body = $('<div class="modal-body">').appendTo($content);

            $outer.on("hidden", function() {
                $outer.remove();
                unhidePlayer();
            });
            $outer.modal();

        	var contributorsList = {};
            $("#queue .queue_entry").each(function () {
                var username = $(this).attr('title').replace('Added by: ', '');
                
                if (contributorsList[username] === undefined) {
                    contributorsList[username] = 1;
                } else {
                    contributorsList[username] += 1;
                }
            });
            
           $body.append($('<p>Всего добавлено: ' + ($("#queue .queue_entry").length + 1) + ' видео.</p>'));
            
            var $contributorsListOl = $('<ol>');
            for (var contributor in contributorsList) {
                $contributorsListOl.append($('<li>' + contributor + ': ' + contributorsList[contributor] + '.</li>'));
            }
            $contributorsListOl.appendTo($body);
        });
});
