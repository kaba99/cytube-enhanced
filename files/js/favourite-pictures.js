animachEnhancedApp.addModule('favouritePictures', function (app) {
    if ($('#chat-panel').length === 0) {
        $('<div id="chat-panel" class="row">').insertAfter("#main");
    }

    if ($('#chat-controls').length === 0) {
        $('<div id="chat-controls" class="btn-group">').appendTo("#chatwrap");
    }

    var $favouritePicturesBtn = $('<button id="favourite-pictures-btn" class="btn btn-sm btn-default" title="Показать избранные картинки">')
        .html('<i class="glyphicon glyphicon-th"></i>');
    if ($('#smiles-btn').length !== 0) {
        $('#smiles-btn').after($favouritePicturesBtn);
    } else {
        $favouritePicturesBtn.prependTo($('#chat-controls'));
    }

    var $favouritePicturesPanel = $('<div id="favourite-pictures-panel">')
        .appendTo($('#chat-panel'))
        .hide();
    var $favouritePicturesBodyPanel = $('<div id="pictures-body-panel" class="row">')
        .appendTo($favouritePicturesPanel);
    var $favouritePicturesControlPanel = $('<div id="pictures-control-panel" class="row">')
        .appendTo($favouritePicturesPanel);

    var $favouritePicturesControlPanelForm = $('<div class="col-md-12">')
        .html('<div class="input-group">' +
            '<span class="input-group-btn">' +
                '<button id="pictures-export" class="btn btn-default" style="border-radius: 0;" type="button">Экспорт картинок</button>' +
            '</span>' +
             '<span class="input-group-btn">' +
                '<label for="pictures-import" class="btn btn-default" style="border-radius: 0;">Импорт картинок</label>' +
                '<input type="file" style="display: none" id="pictures-import" name="pictures-import">' +
            '</span>' +
            '<input type="text" id="add-picture-address" class="form-control" placeholder="Адрес картинки">' +
            '<span class="input-group-btn">' +
                '<button id="add-picture-btn" class="btn btn-default" style="border-radius: 0;" type="button">Добавить</button>' +
            '</span>' +
            '<span class="input-group-btn">' +
                '<button id="remove-picture-btn" class="btn btn-default" type="button">Удалить</button>' +
            '</span>' +
        '</div>')
        .appendTo($favouritePicturesControlPanel);


    var renderFavouritePictures = function () {
        var favouritePictures = JSON.parse(window.localStorage.getItem('favouritePictures')) || [];

        $favouritePicturesBodyPanel.empty();

        var escapedAddress;
        var entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;'
        };
        for (var n = 0, favouritePicturesLen = favouritePictures.length; n < favouritePicturesLen; n++) {
            escapedAddress = favouritePictures[n].replace(/[&<>"']/g, function (s) {
                return entityMap[s];
            });

            $('<img onclick="insertText(\' ' + escapedAddress + ' \')">')
                 .attr({src: escapedAddress})
                  .appendTo($favouritePicturesBodyPanel);
        }
    };
    renderFavouritePictures();


    $favouritePicturesBtn.on('click', function() {
        var isSmilesAndPictures = app.permittedModules.userConfig === true && app.modules.userConfig !== undefined && app.modules.userConfig.options['smiles-and-pictures'] === true;

        if ($('#smiles-panel').length !== 0 && !isSmilesAndPictures) {
            $('#smiles-panel').hide();
        }

        $favouritePicturesPanel.toggle();


        if (!isSmilesAndPictures) {
            if ($(this).hasClass('btn-default')) {
                if ($('#smiles-btn').length !== 0 && $('#smiles-btn').hasClass('btn-success')) {
                    $('#smiles-btn').removeClass('btn-success');
                    $('#smiles-btn').addClass('btn-default');
                }

                $(this).removeClass('btn-default');
                $(this).addClass('btn-success');
            } else {
                $(this).removeClass('btn-success');
                $(this).addClass('btn-default');
            }
        }
    });

    $(document.body).on('click', '.chat-picture', function () {
        $picture = $('<img src="' + $(this).prop('src') + '">');

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


            if (pictureWidth > document.documentElement.clientWidth || pictureHeight > document.documentElement.clientHeight) {
                var scaleFactor;
                if (pictureWidth > pictureHeight) {
                    scaleFactor = pictureWidth / (document.documentElement.clientWidth * 0.8);

                    pictureHeight /= scaleFactor;
                    pictureWidth /= scaleFactor;
                } else {
                    scaleFactor = pictureHeight / (document.documentElement.clientHeight * 0.8);

                    pictureHeight /= scaleFactor;
                    pictureWidth /= scaleFactor;
                }
            }

            $modalPicture.css({
                width: pictureWidth,
                height: pictureHeight,
                marginLeft: -(pictureWidth / 2),
                marginTop: -(pictureHeight / 2),
            });


            $picture.appendTo($modalPicture);
        });
    });

    $(document.body).on('mousewheel', '#modal-picture', function (e) {
        var ZOOM_CONST = 0.15;
        var pictureWidth = parseInt($('#modal-picture').css('width'), 10);
        var pictureHeight = parseInt($('#modal-picture').css('height'), 10);
        var pictureMarginLeft = parseInt($('#modal-picture').css('marginLeft'), 10);
        var pictureMarginTop = parseInt($('#modal-picture').css('marginTop'), 10);

        if (e.deltaY > 0) { //up
            $('#modal-picture').css({
                width: pictureWidth * (1 + ZOOM_CONST),
                height: pictureHeight * (1 + ZOOM_CONST),
                marginLeft: pictureMarginLeft + (-pictureWidth * ZOOM_CONST / 2),
                marginTop: pictureMarginTop + (-pictureHeight * ZOOM_CONST / 2),
            });
        } else { //down
            $('#modal-picture').css({
                width: pictureWidth * (1 - ZOOM_CONST),
                height: pictureHeight * (1 - ZOOM_CONST),
                marginLeft: pictureMarginLeft + (pictureWidth * ZOOM_CONST / 2),
                marginTop: pictureMarginTop + (pictureHeight * ZOOM_CONST / 2),
            });
        }
    });

    $(document.body).on('click', '#modal-picture-overlay, #modal-picture', function () {
        $('#modal-picture-overlay').remove();
        $('#modal-picture').remove();
    });

    $(document.body).on('keydown', function (e) {
        if (e.which === 27 && $('#modal-picture').length !== 0) {
            $('#modal-picture-overlay').remove();
            $('#modal-picture').remove();
        }
    });

    $('#add-picture-btn').on('click', function () {
        favouritePictures = JSON.parse(window.localStorage.getItem('favouritePictures')) || [];

        if (favouritePictures.indexOf($('#add-picture-address').val()) === -1) {
            if ($('#add-picture-address').val() !== '') {
                favouritePictures.push($('#add-picture-address').val());
            }
        } else {
            makeAlert("Такая картинка уже была добавлена").prependTo($favouritePicturesBodyPanel);
            $('#add-picture-address').val('');

            return false;
        }
        $('#add-picture-address').val('');

        window.localStorage.setItem('favouritePictures', JSON.stringify(favouritePictures));

        renderFavouritePictures();

        return false;
    });

    $('#remove-picture-btn').on('click', function () {
        favouritePictures = JSON.parse(window.localStorage.getItem('favouritePictures')) || [];

        var removePosition = favouritePictures.indexOf($('#add-picture-address').val());
        if (removePosition !== -1) {
            favouritePictures.splice(removePosition, 1);

            window.localStorage.setItem('favouritePictures', JSON.stringify(favouritePictures));

            renderFavouritePictures();
        }

        $('#add-picture-address').val('');

        return false;
    });

    $('#pictures-export').on('click', function () {
        var $downloadLink = $('<a>')
            .attr({
                href: 'data:text/plain;charset=utf-8,' + encodeURIComponent(window.localStorage.getItem('favouritePictures') || JSON.stringify([])),
                download: 'animach_images.txt'
            })
            .hide()
            .appendTo($(document.body));

        $downloadLink[0].click();

        $downloadLink.remove();
    });

    $('#pictures-import').on('change', function (e) {
        var importFile = e.target.files[0];
        var favouritePicturesAdressesReader = new FileReader();

        favouritePicturesAdressesReader.addEventListener('load', function(e) {
            window.localStorage.setItem('favouritePictures', e.target.result);

            renderFavouritePictures();
        });

        favouritePicturesAdressesReader.readAsText(importFile);

        return false;
    });
});
