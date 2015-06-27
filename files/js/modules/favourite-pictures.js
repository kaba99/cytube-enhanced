cytubeEnhanced.setModule('favouritePictures', function (app) {
    var that = this;


    if ($('#chat-panel').length === 0) {
        $('<div id="chat-panel" class="row">').insertAfter("#main");
    }

    if ($('#chat-controls').length === 0) {
        $('<div id="chat-controls" class="btn-group">').appendTo("#chatwrap");
    }


    this.$toggleFavouritePicturesPanelBtn = $('<button id="favourite-pictures-btn" class="btn btn-sm btn-default" title="Показать избранные картинки">')
        .html('<i class="glyphicon glyphicon-th"></i>');
    if ($('#smiles-btn').length !== 0) {
        this.$toggleFavouritePicturesPanelBtn.insertAfter('#smiles-btn');
    } else {
        this.$toggleFavouritePicturesPanelBtn.prependTo('#chat-controls');
    }


    this.$favouritePicturesPanel = $('<div id="favourite-pictures-panel">')
        .appendTo('#chat-panel')
        .hide();

    this.$favouritePicturesBodyPanel = $('<div id="pictures-body-panel" class="row">')
        .appendTo(this.$favouritePicturesPanel);

    this.$favouritePicturesControlPanel = $('<div id="pictures-control-panel" class="row">')
        .appendTo(this.$favouritePicturesPanel);

    this.$favouritePicturesControlPanelForm = $('<div class="col-md-12">')
        .html('<div class="input-group">' +
            '<span class="input-group-btn">' +
                '<button id="export-pictures" class="btn btn-default" style="border-radius: 0;" type="button">Экспорт картинок</button>' +
            '</span>' +
             '<span class="input-group-btn">' +
                '<label for="import-pictures" class="btn btn-default" style="border-radius: 0;">Импорт картинок</label>' +
                '<input type="file" style="display: none" id="import-pictures" name="pictures-import">' +
            '</span>' +
            '<input type="text" id="picture-address" class="form-control" placeholder="Адрес картинки">' +
            '<span class="input-group-btn">' +
                '<button id="add-picture-btn" class="btn btn-default" style="border-radius: 0;" type="button">Добавить</button>' +
            '</span>' +
            '<span class="input-group-btn">' +
                '<button id="remove-picture-btn" class="btn btn-default" type="button">Удалить</button>' +
            '</span>' +
        '</div>')
        .appendTo(this.$favouritePicturesControlPanel);


    this.entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;'
    };
    this.replaceUnsafeSymbol = function (symbol) {
        return that.entityMap[symbol];
    };
    this.renderFavouritePictures = function () {
        var favouritePictures = JSON.parse(window.localStorage.getItem('favouritePictures')) || [];

        that.$favouritePicturesBodyPanel.empty();

        for (var n = 0, favouritePicturesLen = favouritePictures.length; n < favouritePicturesLen; n++) {
            var escapedAddress = favouritePictures[n].replace(/[&<>"']/g, that.replaceUnsafeSymbol);

            $('<img class="favourite-picture-on-panel">').attr({src: escapedAddress}).appendTo(that.$favouritePicturesBodyPanel);
        }
    };


    this.insertFavouritePicture = function (address) {
        app.getModule('utils').done(function (utilsModule) {
            utilsModule.addMessageToChatInput(' ' + address + ' ', 'end');
        });
    };
    $(document.body).on('click', '.favourite-picture-on-panel', function () {
        that.insertFavouritePicture($(this).attr('src'));
    });


    this.handleFavouritePicturesPanel = function ($toggleFavouritePicturesPanelBtn) {
        var smilesAndPicturesTogether = that.smilesAndPicturesTogether || false; //setted up by userConfig module

        if ($('#smiles-panel').length !== 0 && !smilesAndPicturesTogether) {
            $('#smiles-panel').hide();
        }

        that.$favouritePicturesPanel.toggle();


        if (!smilesAndPicturesTogether) {
            if ($toggleFavouritePicturesPanelBtn.hasClass('btn-default')) {
                if ($('#smiles-btn').length !== 0 && $('#smiles-btn').hasClass('btn-success')) {
                    $('#smiles-btn').removeClass('btn-success');
                    $('#smiles-btn').addClass('btn-default');
                }

                $toggleFavouritePicturesPanelBtn.removeClass('btn-default');
                $toggleFavouritePicturesPanelBtn.addClass('btn-success');
            } else {
                $toggleFavouritePicturesPanelBtn.removeClass('btn-success');
                $toggleFavouritePicturesPanelBtn.addClass('btn-default');
            }
        }
    };
    this.$toggleFavouritePicturesPanelBtn.on('click', function() {
        that.handleFavouritePicturesPanel($(this));
    });


    this.showPicturePreview = function (address) {
        $picture = $('<img src="' + address + '">');

        $picture.ready(function () {
            var $modalPictureOverlay = $('<div id="modal-picture-overlay">').appendTo($(document.body));
            var $modalPicture = $('<div id="modal-picture">').appendTo($(document.body)).draggable();

            var pictureWidth = $picture.prop('width');
            var pictureHeight = $picture.prop('height');


            var $modalPictureOptions = $('<div id="modal-picture-options">');
            $modalPicture.append($('<div id="modal-picture-options-wrapper">').append($modalPictureOptions));

            var $openImageBtn = $('<a href="' + $picture.prop('src') + '" target="_blank" class="btn btn-sm btn-default" style="width:40px;"><i class="glyphicon glyphicon-eye-open"></i></button>')
                .appendTo($modalPictureOptions);

            var $searchByPictureBtn = $('<a href="https://www.google.nl/searchbyimage?image_url=' + $picture.prop('src') + '" target="_blank" class="btn btn-sm btn-default" style="width:40px;"><i class="glyphicon glyphicon-search"></i></button>')
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
                marginTop: -(pictureHeight / 2),
            });


            $picture.appendTo($modalPicture);
        });
    };
    $(document.body).on('click', '.chat-picture', function () {
        that.showPicturePreview($(this).prop('src'));
    });


    this.ZOOM_CONST = 0.15;
    this.handleModalPictureMouseWheel = function (e) {
        var pictureWidth = parseInt($('#modal-picture').css('width'), 10);
        var pictureHeight = parseInt($('#modal-picture').css('height'), 10);
        var pictureMarginLeft = parseInt($('#modal-picture').css('marginLeft'), 10);
        var pictureMarginTop = parseInt($('#modal-picture').css('marginTop'), 10);

        if (e.deltaY > 0) { //up
            $('#modal-picture').css({
                width: pictureWidth * (1 + that.ZOOM_CONST),
                height: pictureHeight * (1 + that.ZOOM_CONST),
                marginLeft: pictureMarginLeft + (-pictureWidth * that.ZOOM_CONST / 2),
                marginTop: pictureMarginTop + (-pictureHeight * that.ZOOM_CONST / 2),
            });
        } else { //down
            $('#modal-picture').css({
                width: pictureWidth * (1 - that.ZOOM_CONST),
                height: pictureHeight * (1 - that.ZOOM_CONST),
                marginLeft: pictureMarginLeft + (pictureWidth * that.ZOOM_CONST / 2),
                marginTop: pictureMarginTop + (pictureHeight * that.ZOOM_CONST / 2),
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


    this.addFavouritePicture = function () {
        if ($('#picture-address').val() !== '') {
            var favouritePictures = JSON.parse(window.localStorage.getItem('favouritePictures')) || [];

            if (favouritePictures.indexOf($('#picture-address').val()) === -1) {
                if ($('#picture-address').val() !== '') {
                    favouritePictures.push($('#picture-address').val());
                }
            } else {
                makeAlert("Такая картинка уже была добавлена").prependTo(that.$favouritePicturesBodyPanel);
                $('#picture-address').val('');

                return false;
            }
            $('#picture-address').val('');

            window.localStorage.setItem('favouritePictures', JSON.stringify(favouritePictures));

            that.renderFavouritePictures();
        }
    };
    $('#add-picture-btn').on('click', function () {
        that.addFavouritePicture();
    });


    this.removeFavouritePicture = function () {
        var favouritePictures = JSON.parse(window.localStorage.getItem('favouritePictures')) || [];

        var removePosition = favouritePictures.indexOf($('#picture-address').val());
        if (removePosition !== -1) {
            favouritePictures.splice(removePosition, 1);

            window.localStorage.setItem('favouritePictures', JSON.stringify(favouritePictures));

            that.renderFavouritePictures();
        }

        $('#picture-address').val('');
    };
    $('#remove-picture-btn').on('click', function () {
        that.removeFavouritePicture();
    });


    this.exportPictures = function () {
        var $downloadLink = $('<a>')
            .attr({
                href: 'data:text/plain;charset=utf-8,' + encodeURIComponent(window.localStorage.getItem('favouritePictures') || JSON.stringify([])),
                download: 'animach_images.txt'
            })
            .hide()
            .appendTo($(document.body));

        $downloadLink[0].click();

        $downloadLink.remove();
    };
    $('#export-pictures').on('click', function () {
        that.exportPictures();
    });


    this.importPictures = function (importFile) {
        var favouritePicturesAddressesReader = new FileReader();

        favouritePicturesAddressesReader.addEventListener('load', function(e) {
            window.localStorage.setItem('favouritePictures', e.target.result);

            that.renderFavouritePictures();
        });
        favouritePicturesAddressesReader.readAsText(importFile);
    };
    $('#import-pictures').on('change', function () {
        that.importPictures($(this)[0].files[0]);
    });


    this.run = function () {
        that.renderFavouritePictures();
    };
});
