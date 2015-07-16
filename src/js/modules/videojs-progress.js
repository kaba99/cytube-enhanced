/**
 * Fork of https://github.com/mickey/videojs-progressTips
 */
window.cytubeEnhanced.addModule('videojsProgress', function () {
    'use strict';


    function handleProgress() {
        if (window.PLAYER instanceof window.VideoJSPlayer) {
            if (window.PLAYER.player.techName === "Html5" || window.PLAYER.player.Ua === "Html5") { //Ua is uglifier mangle
                $(".vjs-progress-control").after($("<div id='vjs-tip'><div id='vjs-tip-arrow'></div><div id='vjs-tip-inner'></div></div>"));

                $(".vjs-progress-control").on("mousemove", function(e) {
                    var seekBar = window.PLAYER.player.controlBar.progressControl.seekBar;
                    var mousePosition = (e.pageX - $(seekBar.el()).offset().left) / seekBar.width();

                    var timeInSeconds = mousePosition * window.PLAYER.player.duration();
                    if (timeInSeconds === window.PLAYER.player.duration()) {
                        timeInSeconds = timeInSeconds - 0.1;
                    }

                    var minutes = Math.floor(timeInSeconds / 60);
                    var seconds = Math.floor(timeInSeconds - minutes * 60);
                    if (seconds < 10) {
                        seconds = "0" + seconds;
                    }

                    $('#vjs-tip-inner').html("" + minutes + ":" + seconds);

                    var barHeight = $('.vjs-control-bar').height();
                    $("#vjs-tip").css("top", "" + (e.pageY - $(this).offset().top - barHeight - 20) + "px").css("left", "" + (e.pageX - $(this).offset().left - 20) + "px").css("visibility", "visible");
                });

                $(".vjs-progress-control, .vjs-play-control").on("mouseout", function() {
                    $("#vjs-tip").css("visibility", "hidden");
                });
            }
        }
    }


    handleProgress();
    window.socket.on('changeMedia', function () {
        handleProgress();
    });
});
