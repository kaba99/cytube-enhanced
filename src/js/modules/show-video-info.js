window.cytubeEnhanced.addModule('showVideoInfo', function (app) {
    'use strict';

    var that = this;


    this.$titleRow = $('<div id="titlerow" class="row">').insertBefore('#main');

	this.$titleRowOuter = $('<div id="titlerow-outer" class="col-md-12" />')
        .html($("#currenttitle").text($(".queue_active a").text() !== '' ? $("#currenttitle").text().replace(/^Currently Playing:/, app.t('videoInfo[.]Now:')) : '').detach())
        .appendTo(this.$titleRow);

    this.$mediaInfo = $('<p id="mediainfo">').prependTo("#videowrap");


    this.showPlaylistInfo = function () {
        if ($(".queue_active").length !== 0) {
            $("#currenttitle").text($("#currenttitle").text().replace(/^Currently Playing:/, app.t('videoInfo[.]Now:')));

            this.$mediaInfo.text($('.queue_active').attr('title').replace('Added by', app.t('videoInfo[.]Added by')));
        } else {
            $("#currenttitle").text('');

            this.$mediaInfo.text(app.t('videoInfo[.]Nothing is playing now'));
        }
    };




    this.showPlaylistInfo();
    window.socket.on("changeMedia", function () {
        that.showPlaylistInfo();
    });
});
