animachEnhancedApp.addModule('userConfig', function () {
    var layoutOptions = {
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

    var UserConfig = function () {
        this.options = {};

        this.set = function (name, value) {
            this.options[name] = value;
            setOpt(CHANNEL.name + "_config-" + name, value);
        };

        this.get = function (name) {
            return this.options[name];
        };

        this.toggle = function (name) {
            var result = !userConfig.get(name);

            userConfig.set(name, result);

            return result;
        };

        this.loadOption = function (name, defaultValue) {
            var option = getOrDefault(CHANNEL.name + "_config-" + name, defaultValue);

            if (this.configFunctions[name] !== undefined) {
                this.configFunctions[name](option);
            }

            return option;
        };
    };


    var userConfig = new UserConfig();

    userConfig.loadDefaults = function () {
        var options = this.options;


        options.minimize = this.loadOption('minimize', false);

        if ($('#smiles-btn').length !== 0 && $('#favourite-pictures-btn').length !== 0) {
            options.smilesAndPictures = this.loadOption('smiles-and-pictures', false);
        }

        for (var layoutOption in layoutOptions) {
            options[layoutOption] = this.loadOption(layoutOption, layoutOptions[layoutOption].default || false);
        }
        options['user-css'] = this.loadOption('user-css', '');
    };

    userConfig.configFunctions = {
        minimize: function (isMinimized) {
            if (isMinimized) {
                $('#motdrow').hide();
                $('#queue').parent().hide();
                $configWrapper.hide();

                $minBtn.removeClass('btn-default');
                $minBtn.addClass('btn-success');
            } else {
                $('#motdrow').show();
                $('#queue').parent().show();
                $configWrapper.show();

                $minBtn.removeClass('btn-success');
                $minBtn.addClass('btn-default');
            }
        },
        'smiles-and-pictures': function (isTurnedOn) {
            if (isTurnedOn) {
                $smilesAndPicturesBtn.removeClass('btn-default');
                $smilesAndPicturesBtn.addClass('btn-success');

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
                $smilesAndPicturesBtn.addClass('btn-default');
                $smilesAndPicturesBtn.removeClass('btn-success');

                $('#smiles-btn').show();
                $('#favourite-pictures-btn').show();

                $('#smiles-panel').hide();
                $('#favourite-pictures-panel').hide();

                if ($('#smiles-and-picture-btn').length !== 0) {
                    $('#smiles-and-picture-btn').remove();
                }
            }
        },
        'user-layout': function (userConfig) {
            var $outer = $('<div class="modal fade chat-help-modal" role="dialog">').appendTo($("body"));
            var $modal = $('<div class="modal-dialog modal-lg">').appendTo($outer);
            var $content = $('<div class="modal-content">').appendTo($modal);

            var $header = $('<div class="modal-header">').appendTo($content);
            $('<button type="button" class="close" data-dismiss="modal" aria-label="Закрыть">').html('<span aria-hidden="true">&times;</span>').appendTo($header);
            $('<h3 class="modal-title">').text('Список команд').appendTo($header);

            var $body = $('<div class="modal-body">').appendTo($content);

            var $footer = $('<div class="modal-footer">').appendTo($content);

            $outer.on('hidden.bs.modal', function () {
                $(this).remove();
            });

            $outer.modal('show');


            var $settingsWrapper = $('<div class="form-horizontal">').appendTo($body);

            for (var layoutOption in layoutOptions) {
                var $formGroup = $('<div class="form-group">').appendTo($settingsWrapper);

                var $label = $('<label for="' + layoutOption + '" class="col-sm-2 control-label">' + layoutOptions[layoutOption].title + '</label>').appendTo($formGroup);

                var $selectWrapper = $('<div class="col-sm-10">').appendTo($formGroup);
                var $select = $('<select id="' + layoutOption + '" class="form-control">').appendTo($selectWrapper);

                for (var selectOption in layoutOptions[layoutOption].values) {
                    var $selectOption = $('<option value="' + selectOption + '">' + layoutOptions[layoutOption].values[selectOption] + '</option>').appendTo($select);

                    if (selectOption === userConfig.get(layoutOption)) {
                        $select.val(selectOption);
                    }
                }
            }

            var $userCssWrapper = $('<div class="form-group">').appendTo($settingsWrapper);
            var $userCssLabel = $('<label for="user-css" class="col-sm-2 control-label">Пользовательское CSS</label>').appendTo($userCssWrapper);
            var $userCssTextareaWrapper = $('<div class="col-sm-10">').appendTo($userCssWrapper);
            var $userCssTextarea = $('<textarea id="user-css" class="form-control">')
                .appendTo($userCssTextareaWrapper)
                .val(userConfig.get('user-css'));


            $('<button type="button" id="reset-user-layout" class="btn btn-danger">Сбросить</button>')
                .appendTo($footer)
                .on('click', function () {
                    if (confirm('Все настройки, в том числе и пользовательское CSS будут сброшены, вы уверены?')) {
                        for (var layoutOption in layoutOptions) {
                            userConfig.set(layoutOption, layoutOptions[layoutOption].default);
                        }

                        userConfig.set('user-css', '');

                        applyLayoutSettings();
                        $outer.modal('hide');
                    }
                });

            $('<button type="button" id="save-user-layout" class="btn btn-success">Сохранить</button>')
                .appendTo($footer)
                .on('click', function () {
                    for (var layoutOption in layoutOptions) {
                        if ($('#' + layoutOption).length !== 0) {
                            userConfig.set(layoutOption, $('#' + layoutOption).val());
                        }
                    }

                    if ($('#user-css').length !== 0) {
                        userConfig.set('user-css', $('#user-css').val());
                    }

                    applyLayoutSettings();
                    $outer.modal('hide');
                });
        }
    };


    var $configWrapper = $('<div id="config-wrapper" class="col-lg-12 col-md-12">').appendTo("#leftpane-inner");
    var $configBody = $('<div id="config-body" class="well form-horizontal">').appendTo($configWrapper);
    var $configBtn = $('<button id="layout-btn" class="btn btn-sm btn-default pull-right">')
        .html('<span class="glyphicon glyphicon-cog"></span> Настройки')
        .appendTo('#leftcontrols')
        .on('click', function() {
            $configWrapper.toggle();
        });


    var $layoutForm = $('<div id="layout-config-form" class="form-group">').appendTo($configBody)
        .append($('<div class="col-lg-3 col-md-3 control-label">Сетка</div>'));
    var $layoutWrapper = $('<div id="layout-config-wrapper" class="col-lg-9 col-md-9 text-center">').appendTo($layoutForm);
    var $layoutBtnWrapper = $('<div id="layout-config-btn-wrapper" class="btn-group">').appendTo($layoutWrapper);

    var $layoutConfigBtn = $('<button id="layout-configuration-btn" class="btn btn-default">Настройка</button>')
        .appendTo($layoutBtnWrapper)
        .on('click', function() {
            userConfig.configFunctions['user-layout'](userConfig);
        });

    var $minBtn = $('<button id="layout-min-btn" class="btn btn-default">Минимизировать</button>')
        .appendTo($layoutBtnWrapper)
        .on('click', function() {
            var isMinimized = userConfig.toggle('minimize');
            userConfig.configFunctions.minimize(isMinimized);
        });


    var $commonConfigForm = $('<div id="common-config-form" class="form-group">').appendTo($configBody)
        .append($('<div class="col-lg-3 col-md-3 control-label">Общее</div>'));
    var $commonConfigWrapper = $('<div id="common-config-wrapper" class="col-lg-9 col-md-9 text-center">').appendTo($commonConfigForm);
    var $commonConfigBtnWrapper = $('<div id="common-config-btn-wrapper" class="btn-group">').appendTo($commonConfigWrapper);

    if ($('#smiles-btn').length !== 0 && $('#favourite-pictures-btn').length !== 0) {
        var $smilesAndPicturesBtn = $('<button id="common-config-smiles-and-pictures-btn" class="btn btn-default"></button>')
            .html('<i class="glyphicon glyphicon-picture"></i> и <i class="glyphicon glyphicon-th"></i>')
            .appendTo($commonConfigBtnWrapper)
            .on('click', function() {
                var isTurnedOn = userConfig.toggle('smiles-and-pictures');
                userConfig.configFunctions['smiles-and-pictures'](isTurnedOn);
            });
    }

    var applyLayoutSettings = function () {
        if (userConfig.get('hide-header') === 'yes') {
            $('#motdrow').hide();
            //TODO: приделать кнопку расписания к чату
        } else { //no
            $('#motdrow').show();
        }

        if (userConfig.get('player-position') === 'left') {
            $('#videowrap').detach().insertBefore($('#chatwrap'));
        } else if (userConfig.get('player-position') === 'center') {
            $('#chatwrap').removeClass('col-lg-5 col-md-5');
            $('#videowrap').removeClass('col-lg-7 col-md-7');

            $('#chatwrap').addClass('col-md-10 col-md-offset-1');
            $('#videowrap').addClass('col-md-10 col-md-offset-1');

            $('#videowrap').detach().insertBefore($('#chatwrap'));
        } else { //right
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
        }
    };

    userConfig.loadDefaults();

    $configWrapper.hide();
    applyLayoutSettings();


    return userConfig;
});
