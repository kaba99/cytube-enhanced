cytubeEnhanced.setModule('userConfig', function (app, settings) {
    var that = this;

    var defaultSettings = {
        layoutConfigButton: true,
        smilesAndPicturesTogetherButton: true,
        minimizeButton: true
    };
    settings = $.extend(defaultSettings, settings);


    this.layoutOptions = {
        'hide-header': {
            title: 'Скрывать шапку',
            'default': 'no',
            values: {
                yes: 'Да',
                no: 'Нет'
            }
        },
        'player-position': {
            title: 'Положение плеера',
            'default': 'right',
            values: {
                left: 'Слева',
                right: 'Справа',
                center: 'По центру'
            }
        },
        'playlist-position': {
            title: 'Положение плейлиста',
            'default': 'right',
            values: {
                left: 'Слева',
                right: 'Справа'
            }
        },
        'userlist-position': {
            title: 'Позиция списка пользователей чата',
            'default': 'left',
            values: {
                left: 'Слева',
                right: 'Справа'
            }
        }
    };


    this.UserConfig = function () {
        /**
         * UserConfig options
         * @type {object}
         */
        this.options = {};

        /**
         * Sets the user's option and saves it in the user's cookies
         * @param name The name ot the option
         * @param value The value of the option
         */
        this.set = function (name, value) {
            this.options[name] = value;
            setOpt(CHANNEL.name + "_config-" + name, value);
        };

        /**
         * Gets the value of the user's option
         *
         * User's values are setted up from user's cookies at the beginning of the script by the method loadDefaults()
         *
         * @param name Option's name
         * @returns {*}
         */
        this.get = function (name) {
            return this.options[name];
        };

        /**
         * Toggles user's boolean option
         * @param name Boolean option's name
         * @returns {boolean}
         */
        this.toggle = function (name) {
            var result = !this.get(name);

            this.set(name, result);

            return result;
        };

        /**
         * Get the option from cookies and run the related function
         * @param name Option's name
         * @param defaultValue The value to be set if option not exists
         * @returns {*}
         */
        this.loadOption = function (name, defaultValue) {
            var option = getOrDefault(CHANNEL.name + "_config-" + name, defaultValue);

            if (this.configFunctions[name] !== undefined) {
                this.configFunctions[name](option);
            }

            return option;
        };
    };


    this.userConfig = new this.UserConfig();

    this.userConfig.loadDefaults = function () {
        var options = this.options;


        if (settings.minimizeButton) {
            options.minimize = this.loadOption('minimize', false);
        }


        if (settings.smilesAndPicturesTogetherButton && app.isModulePermitted('smiles') && app.isModulePermitted('favouritePictures')) {
            options['smiles-and-pictures'] = this.loadOption('smiles-and-pictures', false);

            app.getModule('smiles').done(function (smilesModule) {
                smilesModule.smilesAndPicturesTogether = options['smiles-and-pictures'];
            });

            app.getModule('favouritePictures').done(function (favouritePicturesModule) {
                favouritePicturesModule.smilesAndPicturesTogether = options['smiles-and-pictures'];
            });
        }


        if (settings.layoutConfigButton) {
            for (var layoutOption in that.layoutOptions) {
                options[layoutOption] = this.loadOption(layoutOption, that.layoutOptions[layoutOption].default || false);
            }

            options['user-css'] = this.loadOption('user-css', '');
        }
    };


    this.userConfig.configFunctions = {
        minimize: function (isMinimized) {
            if (isMinimized) {
                $('#motdrow').hide();
                $('#queue').parent().hide();
                that.$configWrapper.hide();

                that.$minBtn.removeClass('btn-default');
                that.$minBtn.addClass('btn-success');
            } else {
                $('#motdrow').show();
                $('#queue').parent().show();
                that.$configWrapper.show();

                that.$minBtn.removeClass('btn-success');
                that.$minBtn.addClass('btn-default');
            }
        },
        'smiles-and-pictures': function (isTurnedOn) {
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

                $('<button id="smiles-and-picture-btn" class="btn btn-sm btn-default" title="Показать смайлики и избранные картинки">')
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
        }
    };


    this.toggleConfigPanel = function () {
        that.$configWrapper.toggle();
    };
    this.$configWrapper = $('<div id="config-wrapper" class="col-lg-12 col-md-12">').appendTo("#leftpane-inner");
    this.$configBody = $('<div id="config-body" class="well form-horizontal">').appendTo(this.$configWrapper);
    this.$configBtn = $('<button id="layout-btn" class="btn btn-sm btn-default pull-right">')
        .html('<span class="glyphicon glyphicon-cog"></span> Настройки')
        .appendTo('#leftcontrols')
        .on('click', function() {
            that.toggleConfigPanel();
        });


    this.$layoutForm = $('<div id="layout-config-form" class="form-group">').appendTo(this.$configBody)
        .append($('<div class="col-lg-3 col-md-3 control-label">Оформление</div>'));
    this.$layoutWrapper = $('<div id="layout-config-wrapper" class="col-lg-9 col-md-9 text-center">').appendTo(this.$layoutForm);
    this.$layoutBtnWrapper = $('<div id="layout-config-btn-wrapper" class="btn-group">').appendTo(this.$layoutWrapper);
    if (!settings.layoutConfigButton && !settings.minimizeButton) {
        this.$layoutForm.hide();
    }

    this.configUserLayout = function (userConfig) {
        var $settingsWrapper = $('<div class="form-horizontal">');

        for (var layoutOption in that.layoutOptions) {
            var $formGroup = $('<div class="form-group">').appendTo($settingsWrapper);

            var $label = $('<label for="' + layoutOption + '" class="col-sm-2 control-label">' + that.layoutOptions[layoutOption].title + '</label>').appendTo($formGroup);

            var $selectWrapper = $('<div class="col-sm-10">').appendTo($formGroup);
            var $select = $('<select id="' + layoutOption + '" class="form-control">').appendTo($selectWrapper);

            for (var selectOption in that.layoutOptions[layoutOption].values) {
                var $selectOption = $('<option value="' + selectOption + '">' + that.layoutOptions[layoutOption].values[selectOption] + '</option>').appendTo($select);

                if (selectOption === userConfig.get(layoutOption)) {
                    $select.val(selectOption);
                }
            }
        }

        var $userCssWrapper = $('<div class="form-group">').appendTo($settingsWrapper);
        var $userCssLabel = $('<label for="user-css" class="col-sm-2 control-label">Пользовательское CSS</label>').appendTo($userCssWrapper);
        var $userCssTextareaWrapper = $('<div class="col-sm-10">').appendTo($userCssWrapper);
        var $userCssTextarea = $('<textarea id="user-css" class="form-control" rows="7">')
            .appendTo($userCssTextareaWrapper)
            .val(userConfig.get('user-css'));

        var $btnWrapper = $('<div>');

        $('<button type="button" id="reset-user-layout" class="btn btn-info" data-dismiss="modal">Отмена</button>').appendTo($btnWrapper);

        $('<button type="button" id="reset-user-layout" class="btn btn-danger">Сбросить настройки</button>')
            .appendTo(this.$btnWrapper)
            .on('click', function () {
                if (confirm('Все настройки, в том числе и пользовательское CSS будут сброшены, вы уверены?')) {
                    for (var layoutOption in that.layoutOptions) {
                        userConfig.set(layoutOption, that.layoutOptions[layoutOption].default);
                    }

                    userConfig.set('user-css', '');

                    that.applyLayoutSettings(userConfig);
                    $modalWindow.modal('hide');
                }
            });

        $('<button type="button" id="save-user-layout" class="btn btn-success">Сохранить</button>')
            .appendTo($btnWrapper)
            .on('click', function () {
                for (var layoutOption in that.layoutOptions) {
                    if ($('#' + layoutOption).length !== 0) {
                        userConfig.set(layoutOption, $('#' + layoutOption).val());
                    }
                }

                if ($('#user-css').length !== 0) {
                    userConfig.set('user-css', $('#user-css').val());
                }

                that.applyLayoutSettings(userConfig);
                $modalWindow.modal('hide');
            });


        var $modalWindow;
        app.getModule('utils').done(function (utilsModule) {
            $modalWindow = utilsModule.createModalWindow('Настройки оформления', $settingsWrapper, $btnWrapper);
        });
    };
    this.$layoutConfigBtn = $('<button id="layout-configuration-btn" class="btn btn-default">Настройка</button>')
        .appendTo(this.$layoutBtnWrapper)
        .on('click', function() {
            that.configUserLayout(that.userConfig);
        });
    if (!settings.layoutConfigButton) {
        this.$layoutConfigBtn.hide();
    }

    this.minifyInterface = function (userConfig) {
        var isMinimized = userConfig.toggle('minimize');
        userConfig.configFunctions.minimize(isMinimized);
    };
    this.$minBtn = $('<button id="layout-min-btn" class="btn btn-default">Минимизировать</button>')
        .appendTo(this.$layoutBtnWrapper)
        .on('click', function() {
            that.minifyInterface(that.userConfig);
        });
    if (!settings.minimizeButton) {
        this.$minBtn.hide();
    }

    if (app.isModulePermitted('smiles') && app.isModulePermitted('favouritePictures')) {
        $.when(app.getModule('smiles'), app.getModule('favouritePictures')).then(function () {
            that.$commonConfigForm = $('<div id="common-config-form" class="form-group">')
                .append($('<div class="col-lg-3 col-md-3 control-label">Общее</div>'))
                .appendTo(that.$configBody);
            that.$commonConfigWrapper = $('<div id="common-config-wrapper" class="col-lg-9 col-md-9 text-center">').appendTo(that.$commonConfigForm);
            that.$commonConfigBtnWrapper = $('<div id="common-config-btn-wrapper" class="btn-group">').appendTo(that.$commonConfigWrapper);


            that.toggleSmilesAndPictures = function () {
                var isTurnedOn = that.userConfig.toggle('smiles-and-pictures');
                that.userConfig.configFunctions['smiles-and-pictures'](isTurnedOn);
            };
            that.$smilesAndPicturesBtn = $('<button id="common-config-smiles-and-pictures-btn" class="btn btn-default">')
                .html('<i class="glyphicon glyphicon-picture"></i> и <i class="glyphicon glyphicon-th"></i>')
                .appendTo(that.$commonConfigBtnWrapper)
                .on('click', function() {
                    that.toggleSmilesAndPictures();
                });


            if (!settings.smilesAndPicturesTogetherButton) {
                that.$smilesAndPicturesBtn.hide();
                that.$commonConfigForm.hide();
            }
        });
    }


    this.applyLayoutSettings = function (userConfig) {
        if (userConfig.get('hide-header') === 'yes') {
            $('#motdrow').hide();
        } else {
            $('#motdrow').show();
        }

        if (userConfig.get('player-position') === 'left') {
            if ($('#chatwrap').hasClass('col-md-10 col-md-offset-1')) {
                $('#chatwrap').removeClass('col-md-10 col-md-offset-1');
                $('#chatwrap').addClass('col-lg-5 col-md-5');
            }
            if ($('#videowrap').hasClass('col-md-10 col-md-offset-1')) {
                $('#videowrap').removeClass('col-md-10 col-md-offset-1');
                $('#videowrap').addClass('col-lg-7 col-md-7');
            }

            $('#videowrap').detach().insertBefore($('#chatwrap'));
        } else if (userConfig.get('player-position') === 'center') {
            $('#chatwrap').removeClass('col-lg-5 col-md-5');
            $('#videowrap').removeClass('col-lg-7 col-md-7');

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

        if (userConfig.get('playlist-position') === 'left') {
            $('#rightcontrols').detach().insertBefore($('#leftcontrols'));
            $('#rightpane').detach().insertBefore($('#leftpane'));
        } else { //right
            $('#leftcontrols').detach().insertBefore($('#rightcontrols'));
            $('#leftpane').detach().insertBefore($('#rightpane'));
        }

        if (userConfig.get('userlist-position') === 'right') {
            $('#userlist').addClass('pull-right');
        } else {
            $('#userlist').removeClass('pull-right');
        }

        if (userConfig.get('user-css') !== '') {
            $("head").append('<style id="user-style" type="text/css">' + userConfig.get('user-css') + '</style>');
        } else if ($('#user-style').length !== 0) {
            $('#user-style').remove();
        }


        $('#refresh-video').click();
    };


    this.run = function () {
        that.userConfig.loadDefaults();

        if (settings.layoutConfigButton) {
            that.applyLayoutSettings(that.userConfig);
        }
    };
});
