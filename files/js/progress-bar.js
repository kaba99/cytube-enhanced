animachEnhancedApp.addModule('progressBar', function () {
    var $titlerow = $('<div id="titlerow" class="row" />').insertBefore("#main");
	var $titlerowouter = $('<div id="titlerow-outer" class="col-md-12" />')
        .html($("#currenttitle").text($(".queue_active a").text() !== '' ? $("#currenttitle").text().replace(/^Currently Playing:/, 'Сейчас:') : '').detach())
        .appendTo($titlerow);
	var $mediainfo = $('<p id="mediainfo">').prependTo("#videowrap");

    var showPlaylistInfo = function () {
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
//		$mediainfo.html('<marquee scrollamount="5">' + infoString + '</marquee>');
        if ($(".queue_active").length !== 0) {
            $("#currenttitle").text($("#currenttitle").text().replace(/^Currently Playing:/, 'Сейчас:'));

            $mediainfo.text($('.queue_active').attr('title').replace('Added by', 'Добавлено'));
        } else {
            $("#currenttitle").text('');

            $mediainfo.text('Ничего не воспроизводится');
        }
    };
    showPlaylistInfo();

    socket.on("changeMedia", showPlaylistInfo);
});
