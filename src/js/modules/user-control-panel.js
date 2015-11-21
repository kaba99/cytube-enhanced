window.cytubeEnhanced.addModule('userControlPanel', function (app, settings) {
    'use strict';

    var that = this;

    var defaultSettings = {
        layoutConfigButton: true,
        smilesAndPicturesTogetherButton: true,
        minimizeButton: true
    };
    settings = $.extend({}, defaultSettings, settings);




    this.$configWrapper = $('<div id="config-wrapper" class="col-lg-12 col-md-12">').appendTo("#leftpane-inner");
    if (!app.userConfig.get('hide-config-panel')) {
        this.$configWrapper.show();
    }

    this.$configBody = $('<div id="config-body" class="well form-horizontal">').appendTo(this.$configWrapper);

    this.handleConfigBtn = function () {
        app.userConfig.toggle('hide-config-panel');
        this.$configWrapper.toggle();
    };
    this.$configBtn = $('<button id="layout-btn" class="btn btn-sm btn-default pull-right">')
        .html('<span class="glyphicon glyphicon-cog"></span> ' + app.t('userConfig[.]Settings'))
        .appendTo('#leftcontrols')
        .on('click', function() {
            that.handleConfigBtn();
        });




    this.$layoutForm = $('<div id="layout-config-form" class="form-group">').appendTo(this.$configBody)
        .append($('<div class="col-lg-3 col-md-3 control-label">' + app.t('userConfig[.]Layout') + '</div>'));
    this.$layoutWrapper = $('<div id="layout-config-wrapper" class="col-lg-9 col-md-9 text-center">').appendTo(this.$layoutForm);
    this.$layoutBtnWrapper = $('<div id="layout-config-btn-wrapper" class="btn-group">').appendTo(this.$layoutWrapper);
    if (!settings.layoutConfigButton && !settings.minimizeButton) {
        this.$layoutForm.hide();
    }


    this.layoutOptions = {
        'hide-header': {
            title: app.t('userConfig[.]Hide header'),
            default: 'no',
            values: {
                yes: app.t('userConfig[.]Yes'),
                no: app.t('userConfig[.]No')
            }
        },
        'player-position': {
            title: app.t('userConfig[.]Player position'),
            default: 'right',
            values: {
                left: app.t('userConfig[.]Left'),
                right: app.t('userConfig[.]Right'),
                center: app.t('userConfig[.]Center')
            }
        },
        'playlist-position': {
            title: app.t('userConfig[.]Playlist position'),
            default: 'right',
            values: {
                left: app.t('userConfig[.]Left'),
                right: app.t('userConfig[.]Right')
            }
        },
        'userlist-position': {
            title: app.t('userConfig[.]Chat\'s userlist position'),
            default: 'left',
            values: {
                left: app.t('userConfig[.]Left'),
                right: app.t('userConfig[.]Right')
            }
        }
    };

    this.configUserLayout = function (layoutValues) {
        var $settingsWrapper = $('<div class="form-horizontal">');

        for (var layoutOption in this.layoutOptions) {
            if (this.layoutOptions.hasOwnProperty(layoutOption)) {
                var $formGroup = $('<div class="form-group">').appendTo($settingsWrapper);

                $('<label for="' + layoutOption + '" class="col-sm-2 control-label">' + this.layoutOptions[layoutOption].title + '</label>').appendTo($formGroup);

                var $selectWrapper = $('<div class="col-sm-10">').appendTo($formGroup);
                var $select = $('<select id="' + layoutOption + '" class="form-control">').appendTo($selectWrapper);

                for (var selectOption in this.layoutOptions[layoutOption].values) {
                    if (this.layoutOptions[layoutOption].values.hasOwnProperty(selectOption)) {
                        $('<option value="' + selectOption + '">' + this.layoutOptions[layoutOption].values[selectOption] + '</option>').appendTo($select);
                    }
                }

                if (layoutValues.hasOwnProperty(layoutOption)) {
                    $select.val(layoutValues[layoutOption]);
                } else {
                    $select.val(this.layoutOptions[layoutOption].default);
                }
            }
        }

        var $userCssWrapper = $('<div class="form-group">').appendTo($settingsWrapper);
        $('<label for="user-css" class="col-sm-2 control-label">' + app.t('userConfig[.]User CSS') + '</label>').appendTo($userCssWrapper);
        var $userCssTextareaWrapper = $('<div class="col-sm-10">').appendTo($userCssWrapper);
        $('<textarea id="user-css" class="form-control" rows="7">')
            .appendTo($userCssTextareaWrapper)
            .val(layoutValues['user-css'] || '');


        var $btnWrapper = $('<div>');

        $('<button type="button" id="cancel-user-layout" class="btn btn-info" data-dismiss="modal">' + app.t('userConfig[.]Cancel') + '</button>').appendTo($btnWrapper);

        $('<button type="button" id="reset-user-layout" class="btn btn-danger">' + app.t('userConfig[.]Reset settings') + '</button>')
            .appendTo($btnWrapper)
            .on('click', function () {
                if (window.confirm(app.t('userConfig[.]All the settings including user css will be reset, continue?'))) {
                    for (var layoutOption in that.layoutOptions) {
                        if (that.layoutOptions.hasOwnProperty(layoutOption)) {
                            layoutValues[layoutOption] = that.layoutOptions[layoutOption].default;
                        }
                    }
                    layoutValues['user-css'] = '';


                    app.userConfig.set('layout', JSON.stringify(layoutValues));

                    that.applyLayoutSettings(layoutValues);

                    $modalWindow.modal('hide');
                }
            });

        $('<button type="button" id="save-user-layout" class="btn btn-success">')
            .text(app.t('userConfig[.]Save'))
            .appendTo($btnWrapper)
            .on('click', function () {
                for (var layoutOption in that.layoutOptions) {
                    if (that.layoutOptions.hasOwnProperty(layoutOption)) {
                        if ($('#' + layoutOption).length !== 0) {
                            layoutValues[layoutOption] = $('#' + layoutOption).val();
                        } else {
                            layoutValues[layoutOption] = that.layoutOptions[layoutOption].default;
                        }
                    }
                }
                if ($('#user-css').length !== 0) {
                    layoutValues['user-css'] = $('#user-css').val();
                } else {
                    layoutValues['user-css'] = '';
                }


                app.userConfig.set('layout', JSON.stringify(layoutValues));

                that.applyLayoutSettings(layoutValues);

                $modalWindow.modal('hide');
            });


        var $modalWindow;
        app.getModule('utils').done(function (utilsModule) {
            $modalWindow = utilsModule.createModalWindow(app.t('userConfig[.]Layout settings'), $settingsWrapper, $btnWrapper);
        });
    };

    this.applyLayoutSettings = function (layoutValues) {
        if (layoutValues['hide-header'] === 'yes') {
            $('#motdrow').hide();
            $('#motdrow').data('hiddenByLayout', '1');
        } else {
            if ($('#motdrow').data('hiddenByMinimize') !== '1') {
                $('#motdrow').show();
            }
            $('#motdrow').data('hiddenByLayout', '0');
        }

        if (layoutValues['player-position'] === 'left') {
            if ($('#chatwrap').hasClass('col-md-10 col-md-offset-1')) {
                $('#chatwrap').removeClass('col-md-10 col-md-offset-1');
                $('#chatwrap').addClass('col-lg-5 col-md-5');
            }
            if ($('#videowrap').hasClass('col-md-10 col-md-offset-1')) {
                $('#videowrap').removeClass('col-md-10 col-md-offset-1');
                $('#videowrap').addClass('col-lg-7 col-md-7');
            }

            $('#videowrap').detach().insertBefore($('#chatwrap'));
        } else if (layoutValues['player-position'] === 'center') {
            $('#chatwrap').removeClass(function (index, css) { //remove all col-* classes
                return (css.match(/(\s)*col-(\S)+/g) || []).join('');
            });
            $('#videowrap').removeClass(function (index, css) { //remove all col-* classes
                return (css.match(/(\s)*col-(\S)+/g) || []).join('');
            });

            $('#chatwrap').addClass('col-md-10 col-md-offset-1');
            $('#videowrap').addClass('col-md-10 col-md-offset-1');

            $('#videowrap').detach().insertBefore($('#chatwrap'));
        } else { //right
            if ($('#chatwrap').hasClass('col-md-10 col-md-offset-1')) {
                $('#chatwrap').removeClass('col-md-10 col-md-offset-1');
                $('#chatwrap').addClass('col-lg-5 col-md-5');
            }
            if ($('#videowrap').hasClass('col-md-10 col-md-offset-1')) {
                $('#videowrap').removeClass('col-md-10 col-md-offset-1');
                $('#videowrap').addClass('col-lg-7 col-md-7');
            }

            $('#chatwrap').detach().insertBefore($('#videowrap'));
        }

        if (layoutValues['playlist-position'] === 'left') {
            $('#rightcontrols').detach().insertBefore($('#leftcontrols'));
            $('#rightpane').detach().insertBefore($('#leftpane'));
        } else { //right
            $('#leftcontrols').detach().insertBefore($('#rightcontrols'));
            $('#leftpane').detach().insertBefore($('#rightpane'));
        }

        if (layoutValues['userlist-position'] === 'right') {
            $('#userlist').addClass('pull-right');
        } else { //left
            $('#userlist').removeClass('pull-right');
        }

        if (layoutValues.hasOwnProperty('user-css') && layoutValues['user-css'] !== '') {
            $("head").append('<style id="user-style" type="text/css">' + layoutValues['user-css'] + '</style>');
        } else if ($('#user-style').length !== 0) {
            $('#user-style').remove();
        }


        $('#refresh-video').click();
    };

    this.handleLayout = function () {
        var userLayout;
        try {
            userLayout = window.JSON.parse(app.userConfig.get('layout')) || {};
        } catch (e) {
            userLayout = {};
        }

        this.configUserLayout(userLayout);
    };
    this.$layoutConfigBtn = $('<button id="layout-configuration-btn" class="btn btn-default">')
        .text(app.t('userConfig[.]Settings'))
        .appendTo(this.$layoutBtnWrapper)
        .on('click', function() {
            that.handleLayout();
        });

    var userLayout;
    if (settings.layoutConfigButton) {
        try {
            userLayout = window.JSON.parse(app.userConfig.get('layout')) || {};
        } catch (e) {
            userLayout = {};
        }

        this.applyLayoutSettings(userLayout);
    } else {
        this.$layoutConfigBtn.hide();
    }





    
    this.applyMinimize = function (isMinimized) {
        if (isMinimized) {
            $('#motdrow').data('hiddenByMinimize', '1');
            $('#motdrow').hide();
            $('#queue').parent().hide();

            that.$minBtn.removeClass('btn-default');
            that.$minBtn.addClass('btn-success');
        } else {
            if ($('#motdrow').data('hiddenByLayout') !== '1') {
                $('#motdrow').show();
            }
            $('#motdrow').data('hiddenByMinimize', '0');
            $('#queue').parent().show();

            that.$minBtn.removeClass('btn-success');
            that.$minBtn.addClass('btn-default');
        }
    };

    this.$minBtn = $('<button id="layout-min-btn" class="btn btn-default">')
        .text(app.t('userConfig[.]Minimize'))
        .appendTo(this.$layoutBtnWrapper)
        .on('click', function() {
            that.applyMinimize(app.userConfig.toggle('isMinimized'));
        });

    if (settings.minimizeButton) {
        this.applyMinimize(app.userConfig.get('isMinimized'));
    } else {
        this.$minBtn.hide();
    }




    this.$commonConfigForm = $('<div id="common-config-form" class="form-group">')
        .append($('<div class="col-lg-3 col-md-3 control-label">').text(app.t('userConfig[.]Common')))
        .appendTo(this.$configBody);
    this.$commonConfigWrapper = $('<div id="common-config-wrapper" class="col-lg-9 col-md-9 text-center">').appendTo(this.$commonConfigForm);
    this.$commonConfigBtnWrapper = $('<div id="common-config-btn-wrapper" class="btn-group">').appendTo(this.$commonConfigWrapper);

    if (!(settings.smilesAndPicturesTogetherButton && app.isModulePermitted('smiles') && app.isModulePermitted('favouritePictures'))) {
        this.$commonConfigForm.hide();
    }


    this.applySmilesAndPictures = function (isTurnedOn) {
        app.getModule('smiles').done(function (smilesModule) {
            smilesModule.smilesAndPicturesTogether = isTurnedOn;
        });

        app.getModule('favouritePictures').done(function (favouritePicturesModule) {
            favouritePicturesModule.smilesAndPicturesTogether = isTurnedOn;
        });


        if (isTurnedOn) {
            that.$smilesAndPicturesBtn.removeClass('btn-default');
            that.$smilesAndPicturesBtn.addClass('btn-success');

            $('#smiles-btn').hide();
            $('#smiles-panel').hide();
            $('#smiles-btn').addClass('btn-default');
            $('#smiles-btn').removeClass('btn-success');

            $('#favourite-pictures-btn').hide();
            $('#favourite-pictures-panel').hide();
            $('#favourite-pictures-btn').addClass('btn-default');
            $('#favourite-pictures-btn').removeClass('btn-success');

            $('<button id="smiles-and-picture-btn" class="btn btn-sm btn-default" title="' + app.t('userConfig[.]Show emotes and favorite images') + '">')
                .html('<i class="glyphicon glyphicon-picture"></i> и <i class="glyphicon glyphicon-th"></i>')
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
        } else {
            if ($('#smiles-and-picture-btn').length !== 0) {
                $('#smiles-and-picture-btn').remove();
            }

            that.$smilesAndPicturesBtn.removeClass('btn-success');
            that.$smilesAndPicturesBtn.addClass('btn-default');

            $('#smiles-btn').show();
            $('#favourite-pictures-btn').show();

            $('#smiles-panel').hide();
            $('#favourite-pictures-panel').hide();
        }
    };

    this.$smilesAndPicturesBtn = $('<button id="common-config-smiles-and-pictures-btn" class="btn btn-default">')
        .html('<i class="glyphicon glyphicon-picture"></i> ' + app.t('userConfig[.]and') + ' <i class="glyphicon glyphicon-th"></i>')
        .appendTo(that.$commonConfigBtnWrapper)
        .on('click', function() {
            that.applySmilesAndPictures(app.userConfig.toggle('smiles-and-pictures'));
        });

    if (settings.smilesAndPicturesTogetherButton && app.isModulePermitted('smiles') && app.isModulePermitted('favouritePictures')) {
        this.applySmilesAndPictures(app.userConfig.get('smiles-and-pictures'));
    } else {
        this.$smilesAndPicturesBtn.hide();
    }















    this.$avatarsForm = $('<div id="avatars-config-form" class="form-group">').appendTo(this.$configBody)
        .append($('<div class="col-lg-3 col-md-3 control-label">' + app.t('userConfig[.]Chat avatars') + '</div>'));
    this.$avatarsWrapper = $('<div id="avatars-config-wrapper" class="col-md-8 col-md-offset-1 col-lg-6 col-lg-offset-2 text-center">').appendTo(this.$avatarsForm);


    this.handleAvatars = function (mode) {
        app.userConfig.set('avatarsMode', mode);

        if (mode == 'small') {
            $('#messagebuffer').find('.chat-avatar_big').removeClass('chat-avatar_big').addClass('chat-avatar_small');
        } else if (mode == 'big') {
            $('#messagebuffer').find('.chat-avatar_small').removeClass('chat-avatar_small').addClass('chat-avatar_big');
        } else {
            $('#messagebuffer').find('.chat-avatar').removeClass('chat-avatar_small chat-avatar_big').addClass('chat-avatar_hidden');
        }
    };
    this.$avatarsSelect = $('<select class="form-control">')
        .append('<option value="">Выключены</option>')
        .append('<option value="small">Маленькие</option>')
        .append('<option value="big">Большие</option>')
        .appendTo(this.$avatarsWrapper)
        .on('change', function () {
            that.handleAvatars($(this).val())
        });

    this.$avatarsSelect.find('option[value="' + app.userConfig.get('avatarsMode', mode) + '"]').prop('selected', true);
});
