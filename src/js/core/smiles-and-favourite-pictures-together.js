window.cytubeEnhanced.addModule('smilesAndFavouritePicturesTogether', function (app) {
    'use strict';
    var that = this;

    var tab = app.Settings.getTab('general', 'Общее', 100);
    var userSettings = app.Settings.data;


    if (!app.isModulePermitted('smiles') || !app.isModulePermitted('favouritePictures')) {
        return;
    }


    /**
     * Creating markup for settings
     */
    tab.addControl('select', 'horizontal', app.t('general[.]Smiles and pictures together'), 'smiles-and-favourite-pictures-together', [
        {value: 'yes', title: app.t('settings[.]Yes')},
        {value: 'no', title: app.t('settings[.]No'), selected: true}
    ], null, 200);


    /**
     * Saving and applying settings
     */
    app.Settings.onSave(function (settings) {
        settings.smilesAndFavouritePicturesTogether = $('#' + app.prefix + 'smiles-and-favourite-pictures-together').val();
    });


    if (userSettings.smilesAndFavouritePicturesTogether == 'yes') {
        app.getModule('smiles').done(function (smilesModule) {
            smilesModule.makeSmilesAndPicturesTogether();
        });

        app.getModule('favouritePictures').done(function (favouritePicturesModule) {
            favouritePicturesModule.makeSmilesAndPicturesTogether();
        });

        $('<button id="smiles-and-picture-btn" class="btn btn-sm btn-default" title="' + app.t('general[.]Show emotes and favorite images') + '">')
            .html('<i class="glyphicon glyphicon-th-large"></i>')
            .prependTo($('#chat-controls'))
            .on('click', function () {
                $('#smiles-btn').click();
                $('#favourite-pictures-btn').click();

                if ($(this).hasClass('btn-default')) {
                    $(this).removeClass('btn-default');
                    $(this).addClass('btn-success');
                } else {
                    $(this).removeClass('btn-success');
                    $(this).addClass('btn-default');
                }
            });
    }
});