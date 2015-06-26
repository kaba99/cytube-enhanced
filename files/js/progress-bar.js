cytubeEnhanced.setModule('progressBar', function () {
    var that = this;


    this.$titleRow = $('<div id="titlerow" class="row">').insertBefore('#main');

	this.$titleRowOuter = $('<div id="titlerow-outer" class="col-md-12" />')
        .html($("#currenttitle").text($(".queue_active a").text() !== '' ? $("#currenttitle").text().replace(/^Currently Playing:/, 'Сейчас:') : '').detach())
        .appendTo(this.$titleRow);

    this.$mediaInfo = $('<p id="mediainfo">').prependTo("#videowrap");


    this.showPlaylistInfo = function () {
//        $("#currenttitle").text($("#currenttitle").text().replace('Currently Playing:', 'Сейчас: '));
//
//        var infoString = 'СЛЕДУЩЕЕ:';
//
//        var $currentItem = $(".queue_active");
//        for (var position = 1; position <= 3; position++) {
//            $currentItem = $currentItem.next();
//            if ($currentItem.length !== 0) {
//                infoString += ' ' + position + ' ▸ ' + $currentItem.children('a').html() + ' (' + $currentItem.prop('title').replace('Added by: ', '') + ')';
//            }
//        }
//
//        if ($currentItem.length === 0) {
//            infoString += ' // КОНЕЦ ПЛЕЙЛИСТА //';
//        }
//
//		$mediaInfo.html('<marquee scrollamount="5">' + infoString + '</marquee>');
        if ($(".queue_active").length !== 0) {
            $("#currenttitle").text($("#currenttitle").text().replace(/^Currently Playing:/, 'Сейчас:'));

            that.$mediaInfo.text($('.queue_active').attr('title').replace('Added by', 'Добавлено'));
        } else {
            $("#currenttitle").text('');

            that.$mediaInfo.text('Ничего не воспроизводится');
        }
    };


    this.run = function () {
        that.showPlaylistInfo();

        socket.on("changeMedia", function () {
            that.showPlaylistInfo();
        });
    };
});
