window.cytubeEnhanced.addModule('settings.layout', function (app, settings) {
    'use strict';

    var that = this;

    var tabConfig = app.UI.getTab('layout', 'Сетка');
    var $tabButton = tabConfig.button;
    var $tabContent = tabConfig.content;
    var userSettings = app.UI.settings;

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

        if (userSettings[itemName]) {
            for (layoutOption in layoutItem.options) {
                layoutItem.options[layoutOption].selected = (userSettings[itemName] == layoutItem.options[layoutOption].value)
            }
        }

        app.UI.createSelect(layoutItem.title, itemName, {
            options: layoutItem.options
        }).appendTo($tabContent);
    }


    /**
     * Saving data
     */
    $tabButton.on('settings.save', function () {
        var $content = $($tabButton.attr('href'));
        userSettings.layout = {};

        for (var itemName in that.layout) {
            userSettings.layout[itemName] = $('#' + app.UI.controlsPrefix + itemName).val();
        }

        app.userConfig.set('settings', userSettings);
    });
});