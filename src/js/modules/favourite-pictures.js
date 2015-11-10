window.cytubeEnhanced.addModule('favouritePictures', function (app) {
    'use strict';

    var that = this;


    if ($('#chat-panel').length === 0) {
        $('<div id="chat-panel" class="row">').insertAfter("#main");
    }

    if ($('#chat-controls').length === 0) {
        $('<div id="chat-controls" class="btn-group">').appendTo("#chatwrap");
    }


    this.$toggleFavouritePicturesPanelBtn = $('<button id="favourite-pictures-btn" class="btn btn-sm btn-default" title="' + app.t('favPics[.]Show your favorite images') + '">')
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
                '<button id="export-pictures" class="btn btn-sm btn-default" style="border-radius: 0;" type="button">' + app.t('favPics[.]Export pictures') + '</button>' +
            '</span>' +
             '<span class="input-group-btn">' +
                '<label for="import-pictures" class="btn btn-sm btn-default" style="border-radius: 0;">' + app.t('favPics[.]Import pictures') + '</label>' +
                '<input type="file" style="display: none" id="import-pictures" name="pictures-import">' +
            '</span>' +
            '<input type="text" id="picture-address" class="form-control input-sm" placeholder="' + app.t('favPics[.]Picture address') + '">' +
            '<span class="input-group-btn">' +
                '<button id="add-picture-btn" class="btn btn-sm btn-default" style="border-radius: 0;" type="button">' + app.t('favPics[.]Add') + '</button>' +
            '</span>' +
            '<span class="input-group-btn">' +
                '<button id="remove-picture-btn" class="btn btn-sm btn-default" type="button">' + app.t('favPics[.]Remove') + '</button>' +
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

        this.$favouritePicturesBodyPanel.empty();

        for (var n = 0, favouritePicturesLen = favouritePictures.length; n < favouritePicturesLen; n++) {
            var escapedAddress = favouritePictures[n].replace(/[&<>"']/g, this.replaceUnsafeSymbol);

            $('<img class="favourite-picture-on-panel">').attr({src: escapedAddress}).appendTo(this.$favouritePicturesBodyPanel);
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
        var smilesAndPicturesTogether = this.smilesAndPicturesTogether || false; //setted up by userConfig module

        if ($('#smiles-panel').length !== 0 && !smilesAndPicturesTogether) {
            $('#smiles-panel').hide();
        }

        this.$favouritePicturesPanel.toggle();


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


    this.addFavouritePicture = function () {
        var imageUrl = $('#picture-address').val().trim();

        if (imageUrl !== '') {
            var favouritePictures = JSON.parse(window.localStorage.getItem('favouritePictures')) || [];

            if (favouritePictures.indexOf(imageUrl) === -1) {
                if (imageUrl !== '') {
                    favouritePictures.push(imageUrl);
                }
            } else {
                window.makeAlert(app.t('favPics[.]The image already exists')).prependTo(this.$favouritePicturesBodyPanel);
                $('#picture-address').val('');

                return false;
            }
            $('#picture-address').val('');

            window.localStorage.setItem('favouritePictures', JSON.stringify(favouritePictures));

            this.renderFavouritePictures();
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

            this.renderFavouritePictures();
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
                download: 'cytube_enhanced_favourite_images.txt'
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


    this.renderFavouritePictures();
});
