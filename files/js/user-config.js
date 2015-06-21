animachEnhancedApp.addModule('userConfig', function () {
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
            options.smilesAndPictures = this.loadOption('smilesAndPictures', false);
        }

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
        smilesAndPictures: function (isTurnedOn) {
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
            showConfig();
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
            .html('Одновременно <i class="glyphicon glyphicon-picture"></i> и <i class="glyphicon glyphicon-th"></i>')
            .appendTo($commonConfigBtnWrapper)
            .on('click', function() {
                var isTurnedOn = userConfig.toggle('smilesAndPictures');
                userConfig.configFunctions.smilesAndPictures(isTurnedOn);
            });
    }

    var showConfig = function () {
        alert('В процессе');
    };


    userConfig.loadDefaults();


    return userConfig;
});
