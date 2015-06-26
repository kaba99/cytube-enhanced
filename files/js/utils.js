cytubeEnhanced.setModule('utils', function () {
    $('#wrap').children('.navbar-fixed-top').removeClass('navbar-fixed-top');

    $('#messagebuffer').on('click', '.username', function() {
        $('#chatline').val($(this).text() + $("#chatline").val()).focus();
    });

    this.insertText = function (str) {
        $("#chatline").val($("#chatline").val() + str).focus();
    };

    this.createModalWindow = function($headerContent, $bodyContent, $footerContent) {
        var $outer = $('<div class="modal fade chat-help-modal" role="dialog" tabindex="-1">').appendTo($("body"));
        var $modal = $('<div class="modal-dialog modal-lg">').appendTo($outer);
        var $content = $('<div class="modal-content">').appendTo($modal);

        if ($headerContent !== undefined) {
            var $header = $('<div class="modal-header">').appendTo($content);

            $('<button type="button" class="close" data-dismiss="modal" aria-label="Закрыть">').html('<span aria-hidden="true">&times;</span>').appendTo($header);
            $('<h3 class="modal-title">').append($headerContent).appendTo($header);
        }

        if ($bodyContent !== undefined) {
            $('<div class="modal-body">').append($bodyContent).appendTo($content);
        }

        if ($footerContent !== undefined) {
            $('<div class="modal-footer">').append($footerContent).appendTo($content);
        }

        $outer.on('hidden.bs.modal', function () {
            $(this).remove();
        });

        $outer.modal({keyboard: true});

        return $outer;
    };


    //Only for Google drive
    //https://developers.google.com/youtube/js_api_reference?hl=ru
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
            that.videoURL += '&cc_load_policy=0'; //No caption on this video (not supported for Google Drive Videos)

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
                //that.player.addEventListener('onPlaybackQualityChange', 'youtubePlaybackQualityChange');
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


    this.run = function () {
        handleWindowResize(); //chat height fix because our css loaded later than cytube script calculates height
    };
});
