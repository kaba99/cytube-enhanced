window.cytubeEnhanced.Settings.configureTheme(function (app, tab, storage) {
    'use strict';


    app.addTranslation('ru', {
        theme: {
            'Hide header': 'Скрывать шапку',
            'Player position': 'Положение плеера',
            'Playlist position': 'Положение плейлиста',
            'Chat\'s userlist position': 'Позиция списка пользователей чата',
            'Left': 'Слева',
            'Right': 'Справа',
            'Center': 'По центру',
            'Yes': 'Да',
            'No': 'Нет'
        }
    });


    var scheme = {
        'hide-header': {
            title: app.t('theme[.]Hide header'),
            default: 'no',
            options: [
                {value: 'yes', title: app.t('theme[.]Yes')},
                {value: 'no', title: app.t('theme[.]No')}
            ]
        },
        'player-position': {
            title: app.t('theme[.]Player position'),
            default: 'right',
            options: [
                {value: 'left', title: app.t('theme[.]Left')},
                {value: 'right', title: app.t('theme[.]Right')},
                {value: 'center', title: app.t('theme[.]Center')}
            ]
        },
        'playlist-position': {
            title: app.t('theme[.]Playlist position'),
            default: 'right',
            options: [
                {value: 'left', title: app.t('theme[.]Left')},
                {value: 'right', title: app.t('theme[.]Right')}
            ]
        },
        'userlist-position': {
            title: app.t('theme[.]Chat\'s userlist position'),
            default: 'left',
            options: [
                {value: 'left', title: app.t('theme[.]Left')},
                {value: 'right', title: app.t('theme[.]Right')}
            ]
        }
    };


    /**
     * Initializing
     */
    var schemeItem;
    var option;
    var sort = 100;
    for (var itemName in scheme) {
        schemeItem = scheme[itemName];

        storage.setDefault(itemName, schemeItem.default);

        if (storage.get(itemName)) {
            for (option in schemeItem.options) {
                schemeItem.options[option].selected = (storage.get(itemName) == schemeItem.options[option].value)
            }
        }

        tab.addControl('select', 'horizontal', schemeItem.title, itemName, schemeItem.options, null, sort);
        sort += 100;
    }


    var applySettings = function (storage) {
        if (storage.get('hide-header') === 'yes') {
            $('#motdrow').hide();
            $('#motdrow').data('hiddenByLayout', '1');
        } else {
            if ($('#motdrow').data('hiddenByMinimize') !== '1') {
                $('#motdrow').show();
            }
            $('#motdrow').data('hiddenByLayout', '0');
        }

        if (storage.get('player-position') === 'left') {
            if ($('#chatwrap').hasClass('col-md-10 col-md-offset-1')) {
                $('#chatwrap').removeClass('col-md-10 col-md-offset-1');
                $('#chatwrap').addClass('col-lg-5 col-md-5');
            }
            if ($('#videowrap').hasClass('col-md-10 col-md-offset-1')) {
                $('#videowrap').removeClass('col-md-10 col-md-offset-1');
                $('#videowrap').addClass('col-lg-7 col-md-7');
            }

            $('#videowrap').detach().insertBefore($('#chatwrap'));
        } else if (storage.get('player-position') === 'center') {
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

        if (storage.get('playlist-position') === 'left') {
            $('#rightcontrols').detach().insertBefore($('#leftcontrols'));
            $('#rightpane').detach().insertBefore($('#leftpane'));
        } else { //right
            $('#leftcontrols').detach().insertBefore($('#rightcontrols'));
            $('#leftpane').detach().insertBefore($('#rightpane'));
        }

        if (storage.get('userlist-position') === 'right') {
            $('#userlist').addClass('pull-right');
        } else { //left
            $('#userlist').removeClass('pull-right');
        }


        //$('#refresh-video').click();
    };


    /**
     * Saving and applying settings
     */
    app.Settings.onSave(function () {
        for (var itemName in scheme) {
            storage.set(itemName, $('#' + app.prefix + itemName).val());
        }

        applySettings(storage);
    });
    applySettings(storage);
});