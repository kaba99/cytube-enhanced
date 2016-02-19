window.cytubeEnhanced.addModule('Layout', function (app, settings) {
    'use strict';

    var that = this;

    var tab = app.Settings.getTab('layout', 'Сетка', 200);
    var userSettings = app.Settings.data;
    userSettings.layout = userSettings.layout || {};


    this.scheme = {
        'hide-header': {
            title: app.t('layout[.]Hide header'),
            options: [
                {value: 'yes', title: app.t('settings[.]Yes')},
                {value: 'no', title: app.t('settings[.]No'), selected: true}
            ]
        },
        'player-position': {
            title: app.t('layout[.]Player position'),
            default: 'right',
            options: [
                {value: 'left', title: app.t('layout[.]Left')},
                {value: 'right', title: app.t('layout[.]Right'), selected: true},
                {value: 'center', title: app.t('layout[.]Center')}
            ]
        },
        'playlist-position': {
            title: app.t('layout[.]Playlist position'),
            options: [
                {value: 'left', title: app.t('layout[.]Left')},
                {value: 'right', title: app.t('layout[.]Right'), selected: true}
            ]
        },
        'userlist-position': {
            title: app.t('layout[.]Chat\'s userlist position'),
            options: [
                {value: 'left', title: app.t('layout[.]Left'), selected: true},
                {value: 'right', title: app.t('layout[.]Right')}
            ]
        }
    };


    /**
     * Creating markup
     */
    var schemeItem;
    var option;
    for (var itemName in this.scheme) {
        schemeItem = this.scheme[itemName];

        if (userSettings.layout[itemName]) {
            for (option in schemeItem.options) {
                schemeItem.options[option].selected = (userSettings.layout[itemName] == schemeItem.options[option].value)
            }
        }

        tab.addControl('select', 'horizontal', schemeItem.title, itemName, schemeItem.options, null, 100);
    }


    /**
     * Saving and applying settings
     */
    app.Settings.onSave(function (settings) {
        settings.layout = settings.layout || {};

        for (var itemName in that.scheme) {
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