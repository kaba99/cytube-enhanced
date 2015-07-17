window.cytubeEnhanced.addModule('imagePreview', function (app, settings) {
    'use strict';

    var that = this;

    var defaultSettings = {
        selectorsToPreview: '.chat-picture', // 'selector1, selector2'. Every selector's node must have attribute src
        zoom: 0.15
    };
    settings = $.extend({}, defaultSettings, settings);

    this.showPicturePreview = function (pictureToPreview) {
        if ($(pictureToPreview).is(settings.selectorsToPreview)) {
            var $picture = $('<img src="' + $(pictureToPreview).attr('src') + '">');

            $picture.ready(function () {
                $('<div id="modal-picture-overlay">').appendTo($(document.body));
                var $modalPicture = $('<div id="modal-picture">').appendTo($(document.body)).draggable();

                var pictureWidth = $picture.prop('width');
                var pictureHeight = $picture.prop('height');


                var $modalPictureOptions = $('<div id="modal-picture-options">');
                $modalPicture.append($('<div id="modal-picture-options-wrapper">').append($modalPictureOptions));

                $('<a href="' + $picture.prop('src') + '" target="_blank" class="btn btn-sm btn-default" style="width:40px;"><i class="glyphicon glyphicon-eye-open"></i></button>')
                    .appendTo($modalPictureOptions);
                $('<a href="https://www.google.com/searchbyimage?image_url=' + $picture.prop('src') + '" target="_blank" class="btn btn-sm btn-default" style="width:40px;"><i class="glyphicon glyphicon-search"></i></button>')
                    .appendTo($modalPictureOptions);


                var scaleFactor = 1;
                if (pictureWidth > document.documentElement.clientWidth && pictureHeight > document.documentElement.clientHeight) {
                    if ((pictureHeight - document.documentElement.clientHeight) > (pictureWidth - document.documentElement.clientWidth)) {
                        scaleFactor = pictureHeight / (document.documentElement.clientHeight * 0.8);
                    } else {
                        scaleFactor = pictureWidth / (document.documentElement.clientWidth * 0.8);
                    }
                } else if (pictureHeight > document.documentElement.clientHeight) {
                    scaleFactor = pictureHeight / (document.documentElement.clientHeight * 0.8);
                } else if (pictureWidth > document.documentElement.clientWidth) {
                    scaleFactor = pictureWidth / (document.documentElement.clientWidth * 0.8);
                }

                pictureHeight /= scaleFactor;
                pictureWidth /= scaleFactor;

                $modalPicture.css({
                    width: pictureWidth,
                    height: pictureHeight,
                    marginLeft: -(pictureWidth / 2),
                    marginTop: -(pictureHeight / 2)
                });


                $picture.appendTo($modalPicture);
            });
        }
    };
    $(document.body).on('click', function () {
        that.showPicturePreview(event.target);
    });


    this.handleModalPictureMouseWheel = function (e) {
        var pictureWidth = parseInt($('#modal-picture').css('width'), 10);
        var pictureHeight = parseInt($('#modal-picture').css('height'), 10);
        var pictureMarginLeft = parseInt($('#modal-picture').css('marginLeft'), 10);
        var pictureMarginTop = parseInt($('#modal-picture').css('marginTop'), 10);

        if (e.deltaY > 0) { //up
            $('#modal-picture').css({
                width: pictureWidth * (1 + settings.zoom),
                height: pictureHeight * (1 + settings.zoom),
                marginLeft: pictureMarginLeft + (-pictureWidth * settings.zoom / 2),
                marginTop: pictureMarginTop + (-pictureHeight * settings.zoom / 2)
            });
        } else { //down
            $('#modal-picture').css({
                width: pictureWidth * (1 - settings.zoom),
                height: pictureHeight * (1 - settings.zoom),
                marginLeft: pictureMarginLeft + (pictureWidth * settings.zoom / 2),
                marginTop: pictureMarginTop + (pictureHeight * settings.zoom / 2)
            });
        }
    };
    $(document.body).on('mousewheel', '#modal-picture', function (e) {
        that.handleModalPictureMouseWheel(e);

        return false;
    });


    this.closePictureByClick = function () {
        $('#modal-picture-overlay').remove();
        $('#modal-picture').remove();
    };
    $(document.body).on('click', '#modal-picture-overlay, #modal-picture', function () {
        that.closePictureByClick();
    });

    this.closePictureByEscape = function (e) {
        if (e.which === 27 && $('#modal-picture').length !== 0) {
            $('#modal-picture-overlay').remove();
            $('#modal-picture').remove();
        }
    };
    $(document.body).on('keydown', function (e) {
        that.closePictureByEscape(e);
    });
});
