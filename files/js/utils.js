animachEnhancedApp.addModule('utils', function () {
    $('#wrap').children('.navbar-fixed-top').removeClass('navbar-fixed-top');

    handleWindowResize(); //chat height fix because our css loaded later than cytube script calculates height

    $('#messagebuffer').on('click', '.username', function() {
        $('#chatline').val($(this).text() + $("#chatline").val()).focus();
    });

    insertText = function (str) {
        $("#chatline").val($("#chatline").val()+str).focus();
    };

    createModalWindow = function($headerContent, $bodyContent, $footerContent) {
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





    //Only for Google docs
    //https://developers.google.com/youtube/js_api_reference?hl=ru
    youtubeJavascriptPlayer = function (data) {
        var self = this;

        self.videoId = data.id;
        self.videoLength = data.seconds;

        self.init = function () {
            removeOld();

            self.videoURL = 'https://video.google.com/get_player?wmode=opaque&ps=docs&partnerid=30&version=3'; //Basic URL to the Player
            self.videoURL += '&docid=' + self.videoId; //Specify the fileID ofthe file to show
            self.videoURL += '&autoplay=1';
            self.videoURL += '&fs=1';
            self.videoURL += '&showinfo=0';
            self.videoURL += '&vq=' + (USEROPTS.default_quality || "auto");
            self.videoURL += '&start=' + parseInt(data.currentTime, 10);
            self.videoURL += '&enablejsapi=1'; //Enable Youtube Js API to interact with the video editor
            self.videoURL += '&playerapiid=' + self.videoId; //Give the video player the same name as the video for future reference
            self.videoURL += '&cc_load_policy=0'; //No caption on this video (not supported for Google Drive Videos)

            var atts = {
                id: "ytapiplayer"
            };
            var params = {
                allowScriptAccess: "always",
                allowFullScreen: "true"
            };
            swfobject.embedSWF(self.videoURL,
                "ytapiplayer",
                VWIDTH,
                VHEIGHT,
                "8",
                null,
                null,
                params,
                atts);

            onYouTubePlayerReady = function (playerId) {
                self.player = document.getElementById("ytapiplayer");
                self.player.addEventListener("onStateChange", "onytplayerStateChange");
                self.player.addEventListener('onPlaybackQualityChange', 'youtubePlaybackQualityChange');
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
                    self.setVolume(VOLUME);
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

        self.load = function (data) {
            self.videoId = data.id;
            self.videoLength = data.seconds;
            self.init();
        };

        self.pause = function () {
            if (self.player && self.player.pauseVideo) {
                self.player.pauseVideo();
            }
        };

        self.play = function () {
            if (self.player && self.player.playVideo) {
                self.player.playVideo();
            }
        };

        self.getTime = function (callback) {
            if (self.player && self.player.getCurrentTime) {
                var t = parseFloat(self.player.getCurrentTime());
                callback(t);
            }
        };

        self.seek = function (time) {
            if (self.player.seekTo) {
                self.player.seekTo(time);
            }
        };

        self.getVolume = function (callback) {
            if (self.player && self.player.getVolume) {
                callback(self.player.getVolume() / 100);
            }
        };

        self.setVolume = function (volume) {
            self.player.setVolume(volume * 100);
        };

        self.init();
    };
});
