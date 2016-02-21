window.cytubeEnhanced.addModule('Layout', function (app, settings) {
    'use strict';

    var that = this;

    var tab = app.Settings.getTab('layout', 'Сетка', 200);
    var userSettings = app.Settings.data;


    var namespace = 'layout';
    this.scheme = {
        'hide-header': {
            title: app.t('layout[.]Hide header'),
            default: 'no',
            options: [
                {value: 'yes', title: app.t('settings[.]Yes')},
                {value: 'no', title: app.t('settings[.]No')}
            ]
        },
        'player-position': {
            title: app.t('layout[.]Player position'),
            default: 'right',
            options: [
                {value: 'left', title: app.t('layout[.]Left')},
                {value: 'right', title: app.t('layout[.]Right')},
                {value: 'center', title: app.t('layout[.]Center')}
            ]
        },
        'playlist-position': {
            title: app.t('layout[.]Playlist position'),
            default: 'right',
            options: [
                {value: 'left', title: app.t('layout[.]Left')},
                {value: 'right', title: app.t('layout[.]Right')}
            ]
        },
        'userlist-position': {
            title: app.t('layout[.]Chat\'s userlist position'),
            default: 'left',
            options: [
                {value: 'left', title: app.t('layout[.]Left')},
                {value: 'right', title: app.t('layout[.]Right')}
            ]
        }
    };


    /**
     * Initializing
     */
    var schemeItem;
    var option;
    var sort = 100;
    for (var itemName in this.scheme) {
        schemeItem = this.scheme[itemName];

        userSettings.setDefault(namespace + '.' + itemName, schemeItem.default);

        if (userSettings.get(namespace + '.' + itemName)) {
            for (option in schemeItem.options) {
                schemeItem.options[option].selected = (userSettings.get(namespace + '.' + itemName) == schemeItem.options[option].value)
            }
        }

        tab.addControl('select', 'horizontal', schemeItem.title, itemName, schemeItem.options, null, sort);
        sort += 100;
    }


    this.applySettings = function (userSettings) {
        if (userSettings.get(namespace + '.hide-header') === 'yes') {
            $('#motdrow').hide();
            $('#motdrow').data('hiddenByLayout', '1');
        } else {
            if ($('#motdrow').data('hiddenByMinimize') !== '1') {
                $('#motdrow').show();
            }
            $('#motdrow').data('hiddenByLayout', '0');
        }

        if (userSettings.get(namespace + '.player-position') === 'left') {
            if ($('#chatwrap').hasClass('col-md-10 col-md-offset-1')) {
                $('#chatwrap').removeClass('col-md-10 col-md-offset-1');
                $('#chatwrap').addClass('col-lg-5 col-md-5');
            }
            if ($('#videowrap').hasClass('col-md-10 col-md-offset-1')) {
                $('#videowrap').removeClass('col-md-10 col-md-offset-1');
                $('#videowrap').addClass('col-lg-7 col-md-7');
            }

            $('#videowrap').detach().insertBefore($('#chatwrap'));
        } else if (userSettings.get(namespace + '.player-position') === 'center') {
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

        if (userSettings.get(namespace + '.playlist-position') === 'left') {
            $('#rightcontrols').detach().insertBefore($('#leftcontrols'));
            $('#rightpane').detach().insertBefore($('#leftpane'));
        } else { //right
            $('#leftcontrols').detach().insertBefore($('#rightcontrols'));
            $('#leftpane').detach().insertBefore($('#rightpane'));
        }

        if (userSettings.get(namespace + '.userlist-position') === 'right') {
            $('#userlist').addClass('pull-right');
        } else { //left
            $('#userlist').removeClass('pull-right');
        }


        $('#refresh-video').click();
    };


    /**
     * Saving and applying settings
     */
    app.Settings.onSave(function (settings) {
        for (var itemName in that.scheme) {
            settings.set(namespace + '.' + itemName, $('#' + app.prefix + itemName).val());
        }

        that.applySettings(settings, namespace);
    });
    this.applySettings(userSettings, namespace);
});