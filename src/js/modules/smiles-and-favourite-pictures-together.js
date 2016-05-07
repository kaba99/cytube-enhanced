window.cytubeEnhanced.addModule('smilesAndFavouritePicturesTogether', function (app) {
    'use strict';
    var that = this;

    var tab = app.Settings.getTab('general', app.t('general[.]General'), 100);
    var userSettings = app.Settings.storage;


    if (!app.isModulePermitted('smiles') || !app.isModulePermitted('favouritePictures')) {
        return;
    }

    var namespace = 'general';
    this.scheme = {
        'smiles-and-favourite-pictures-together': {
            title: app.t('general[.]Smiles and pictures together'),
            default: 'no',
            options: [
                {value: 'yes', title: app.t('settings[.]Yes')},
                {value: 'no', title: app.t('settings[.]No')}
            ]
        }
    };


    /**
     * Creating markup for settings
     */
    var schemeItem;
    var option;
    var sort = 10000;
    for (var itemName in this.scheme) {
        schemeItem = this.scheme[itemName];

        userSettings.setDefault(namespace + '.' + itemName, schemeItem.default);

        if (userSettings.get(namespace + '.' + itemName)) {
            for (option in schemeItem.options) {
                schemeItem.options[option].selected = (userSettings.get(namespace + '.' + itemName) == schemeItem.options[option].value);
            }
        }

        tab.addControl('select', 'horizontal', schemeItem.title, itemName, schemeItem.options, null, sort);
        sort += 100;
    }


    /**
     * Saving and applying settings
     */
    app.Settings.onSave(function (settings) {
        for (var itemName in that.scheme) {
            settings.set(namespace + '.' + itemName, $('#' + app.prefix + itemName).val());
        }

        if (settings.isDirty(namespace + '.smiles-and-favourite-pictures-together')) {
            app.Settings.requestPageReload();
        }
    });


    if (userSettings.get(namespace + '.smiles-and-favourite-pictures-together')  == 'yes') {
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