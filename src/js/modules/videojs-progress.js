/**
 * Fork of https://github.com/mickey/videojs-progressTips
 */
window.cytubeEnhanced.addModule('videojsProgress', function () {
    'use strict';
    var that = this;

    this.handleProgress = function () {
        if (window.PLAYER instanceof window.VideoJSPlayer) {
            if (window.PLAYER.player.techName === 'Html5' || window.PLAYER.player.Ua === 'Html5') { //Ua is uglifier mangle
                var $tipWrapper = $('<div class="vjs-tip">').insertAfter('.vjs-progress-control');
                var $tipBody = $('<div class="vjs-tip-body">').appendTo($tipWrapper);
                $('<div class="vjs-tip-body-arrow">').appendTo($tipBody);
                var $tipInner = $('<div class="vjs-tip-body-inner">').appendTo($tipBody);

                $('.vjs-progress-control').on('mousemove', function(e) {
                    var $seekBar = $(window.PLAYER.player.controlBar.progressControl.seekBar.el());
                    var pixelsInSecond = $seekBar.outerWidth() / window.PLAYER.player.duration();
                    var mousePositionInPlayer = e.pageX - $seekBar.offset().left;

                    var timeInSeconds = mousePositionInPlayer / pixelsInSecond;


                    var hours = Math.floor(timeInSeconds / 3600);

                    var minutes = hours > 0 ? Math.floor((timeInSeconds % 3600) / 60) : Math.floor(timeInSeconds / 60);
                    if (minutes < 10 && hours > 0) {
                        minutes = '0' + minutes;
                    }

                    var seconds = Math.floor(timeInSeconds % 60);
                    if (seconds < 10) {
                        seconds = '0' + seconds;
                    }

                    if (hours > 0) {
                        $tipInner.text(hours + ':' + minutes + ':' + seconds);
                    } else {
                        $tipInner.text(minutes + ":" + seconds);
                    }

                    var $controlBar = $('.vjs-control-bar');
                    $tipWrapper.css('top', -($controlBar.height() + $('.vjs-progress-control').height()) + 'px')
                        .css('left', (e.pageX - $controlBar.offset().left - $tipInner.outerWidth() / 2)+ 'px')
                        .show();
                });

                $('.vjs-progress-control, .vjs-play-control').on('mouseout', function() {
                    $tipWrapper.hide();
                });
            }
        }
    };

    this.handleProgress();
    window.socket.on('changeMedia', function () {
        that.handleProgress();
    });
});
