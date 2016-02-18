window.cytubeEnhanced.addModule('settings.layout', function (app, settings) {
    'use strict';

    var that = this;

    var tab = app.Settings.getTab('layout', 'Сетка', 200);
    var $tabContent = app.UI.createControlsWrapper('horizontal').appendTo(tab.$content);
    var userSettings = app.Settings.data;
    userSettings.layout = userSettings.layout || {};

    this.layout = {
        'hide-header': {
            title: app.t('userConfig[.]Hide header'),
            options: [
                {value: 'yes', title: app.t('userConfig[.]Yes')},
                {value: 'no', title: app.t('userConfig[.]No'), selected: true}
            ]
        },
        'player-position': {
            title: app.t('userConfig[.]Player position'),
            default: 'right',
            options: [
                {value: 'left', title: app.t('userConfig[.]Left')},
                {value: 'right', title: app.t('userConfig[.]Right'), selected: true},
                {value: 'center', title: app.t('userConfig[.]Center')}
            ]
        },
        'playlist-position': {
            title: app.t('userConfig[.]Playlist position'),
            options: [
                {value: 'left', title: app.t('userConfig[.]Left')},
                {value: 'right', title: app.t('userConfig[.]Right'), selected: true}
            ]
        },
        'userlist-position': {
            title: app.t('userConfig[.]Chat\'s userlist position'),
            options: [
                {value: 'left', title: app.t('userConfig[.]Left'), selected: true},
                {value: 'right', title: app.t('userConfig[.]Right')}
            ]
        }
    };


    /**
     * Creating markup
     */
    var layoutItem;
    var layoutOption;
    for (var itemName in this.layout) {
        layoutItem = this.layout[itemName];

        if (userSettings.layout[itemName]) {
            for (layoutOption in layoutItem.options) {
                layoutItem.options[layoutOption].selected = (userSettings.layout[itemName] == layoutItem.options[layoutOption].value)
            }
        }

        app.UI.createSelectControl('horizontal', layoutItem.title, itemName, layoutItem.options).appendTo($tabContent);
    }


    /**
     * Saving and applying settings
     */
    app.Settings.onSave(function (settings) {
        settings.layout = {};

        for (var itemName in that.layout) {
            settings.layout[itemName] = $('#' + app.prefix + itemName).val();
        }

        that.applySettings(settings.layout);
    });


    this.applySettings = function (layoutSettings) {
        if (layoutSettings['hide-header'] === 'yes') {
            $('#motdrow').hide();
            $('#motdrow').data('hiddenByLayout', '1');
        } else {
            if ($('#motdrow').data('hiddenByMinimize') !== '1') {
                $('#motdrow').show();
            }
            $('#motdrow').data('hiddenByLayout', '0');
        }

        if (layoutSettings['player-position'] === 'left') {
            if ($('#chatwrap').hasClass('col-md-10 col-md-offset-1')) {
                $('#chatwrap').removeClass('col-md-10 col-md-offset-1');
                $('#chatwrap').addClass('col-lg-5 col-md-5');
            }
            if ($('#videowrap').hasClass('col-md-10 col-md-offset-1')) {
                $('#videowrap').removeClass('col-md-10 col-md-offset-1');
                $('#videowrap').addClass('col-lg-7 col-md-7');
            }

            $('#videowrap').detach().insertBefore($('#chatwrap'));
        } else if (layoutSettings['player-position'] === 'center') {
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

        if (layoutSettings['playlist-position'] === 'left') {
            $('#rightcontrols').detach().insertBefore($('#leftcontrols'));
            $('#rightpane').detach().insertBefore($('#leftpane'));
        } else { //right
            $('#leftcontrols').detach().insertBefore($('#rightcontrols'));
            $('#leftpane').detach().insertBefore($('#rightpane'));
        }

        if (layoutSettings['userlist-position'] === 'right') {
            $('#userlist').addClass('pull-right');
        } else { //left
            $('#userlist').removeClass('pull-right');
        }


        $('#refresh-video').click();
    };

    this.applySettings(userSettings.layout);
});