window.cytubeEnhanced.addModule('navMenuTabs', function (app) {
    'use strict';

    var that = this;


    this.addTabInput = function ($tabsArea, tabName, tabValue) {
        tabName = tabName || '';
        tabValue = tabValue || '';

        var $wrapper = $('<div class="row tab-option-wrapper">').appendTo($tabsArea);

        var $tabNameWrapperOfWrapper = $('<div class="col-sm-4 col-md-3">').appendTo($wrapper);
        var $tabNameWrapper = $('<div class="form-group">').appendTo($tabNameWrapperOfWrapper);
        $('<input name="title" type="text" class="form-control" placeholder="' + app.t('tabs[.]Title') + '">')
            .val(tabName)
            .appendTo($tabNameWrapper);


        var $tabValueWrapperOfWrapper = $('<div class="col-sm-8 col-md-9">').appendTo($wrapper);
        var $tabValueWrapper = $('<div class="form-group">').appendTo($tabValueWrapperOfWrapper);
        $('<input name="content" type="text" class="form-control" placeholder="' + app.t('tabs[.]Content') + '">')
            .val(tabValue)
            .appendTo($tabValueWrapper);
    };


    this.tabsConfigToHtml = function (channelDescription, tabsConfig) {
        var $virtualMainWrapper = $('<div>');

        if (channelDescription !== undefined && channelDescription !== '') {
            $('<div id="motd-channel-description">')
                .html(channelDescription)
                .appendTo($virtualMainWrapper);
        }

        if (tabsConfig.length !== 0) {
            var TAB_TITLE = 0;
            var TAB_CONTENT = 1;
            var LINK_TITLE = 0;
            var LINK_ADDRESS = 1;

            var $tabsWrapper = $('<div id="motd-tabs-wrapper">').appendTo($virtualMainWrapper);
            var $tabs = $('<div id="motd-tabs">').appendTo($tabsWrapper);
            var $tabsContent = $('<div id="motd-tabs-content">').appendTo($tabsWrapper);

            for (var tabIndex = 0, tabsLength = tabsConfig.length; tabIndex < tabsLength; tabIndex++) {
                if (tabsConfig[tabIndex][TAB_TITLE].indexOf('!dropdown!') === 0) {
                    var $dropdownWrapper = $('<div class="btn-group">');
                    $('<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">')
                        .html(tabsConfig[tabIndex][TAB_TITLE].replace('!dropdown!', '') + ' <span class="caret"></span>')
                        .appendTo($dropdownWrapper);
                    var $dropdownMenu = $('<ul class="dropdown-menu">')
                        .appendTo($dropdownWrapper);

                    var linksConfig = tabsConfig[tabIndex][TAB_CONTENT];
                    for (var linkIndex = 0, linksLength = tabsConfig[tabIndex][TAB_CONTENT].length; linkIndex < linksLength; linkIndex++) {
                        var $link = $('<a>').attr({href: linksConfig[linkIndex][LINK_ADDRESS], target: '_blank'}).text(linksConfig[linkIndex][LINK_TITLE]);
                        $('<li>').html($link).appendTo($dropdownMenu);
                    }

                    $dropdownWrapper.appendTo($tabs);
                } else if (tabsConfig[tabIndex][TAB_TITLE].indexOf('!link!') === 0) {
                    $('<a href="' + tabsConfig[tabIndex][TAB_CONTENT] + '" target="_blank" class="btn btn-default btn-link">')
                        .html(tabsConfig[tabIndex][TAB_TITLE].replace('!link!', ''))
                        .appendTo($tabs);
                } else {
                    $('<button class="btn btn-default motd-tab-btn" data-tab-index="' + tabIndex + '">')
                        .html(tabsConfig[tabIndex][TAB_TITLE])
                        .appendTo($tabs);

                    $('<div class="motd-tab-content" data-tab-index="' + tabIndex + '">')
                        .hide()
                        .html(tabsConfig[tabIndex][TAB_CONTENT])
                        .appendTo($tabsContent);
                }
            }
        }

        return $virtualMainWrapper.html();
    };


    this.tabsHtmlToCondig = function (htmlCode) {
        this.$tabsArea.empty();

        var $tabsTree = $('<div>').html(htmlCode);
        var $tabsTreeNavBtns = $tabsTree.find('#motd-tabs').children();
        var $tabsTreeTabsContent = $tabsTree.find('#motd-tabs-content');

        $('#channel-description-input').val($tabsTree.find('#motd-channel-description').html());

        $tabsTreeNavBtns.each(function () {
            if ($(this).hasClass('btn-group')) { //dropdown
                var parsedDropdownItems = '';
                var $dropdownItems = $(this).children('ul').children();

                $dropdownItems.each(function () {
                    var link = $(this).children('a');

                    parsedDropdownItems += '[n]' + link.text() + '[/n][a]' + link.attr('href') + '[/a], ';
                });
                parsedDropdownItems = parsedDropdownItems.slice(0, -2);

                that.addTabInput(that.$tabsArea, '!dropdown!' + $(this).children('button').html().replace(' <span class="caret"></span>', ''), parsedDropdownItems);
            } else if ($(this).hasClass('btn-link')) { //link
                that.addTabInput(that.$tabsArea, '!link!' + $(this).html(), $(this).attr('href'));
            } else { //tab
                that.addTabInput(that.$tabsArea, $(this).html(), $tabsTreeTabsContent.find('[data-tab-index="' + $(this).data('tabIndex') + '"]').html());
            }
        });
    };


    this.motdCutMap = {
        '<iframe $1>$2</iframe>': /\[iframe(.*?)\](.*?)[/iframe]]/g
    };
    this.fixMotdCut = function () {
        $('#motd-tabs-content').find('.motd-tab-content').each(function () {
            for (var tag in that.motdCutMap) {
                if (that.motdCutMap.hasOwnProperty(tag)) {
                    $(this).html($(this).html().replace(that.motdCutMap[tag], tag));
                }
            }
        });
    };


    this.$tabsSettings = $('<div id="tabs-settings">')
        .html('<hr>' +
            '<h3>' + app.t('tabs[.]Tabs settings') + '</h3>' +
            '<ul>' +
                '<li>' + app.t('tabs[.]By default tab behaves like simple tab.') + '</li>' +
                '<li>' + app.t('tabs[.]Use !dropdown! prefix to create dropdown list. Example: !dropdown!My dropdown. Value must look like "[n]Link title 1[/n][a]URL 1[/a], [n]Link title 2[/n][a]URL 2[/a], [n]Link title 3[/n][a]URL 3[/a]"') + '</li>' +
                '<li>' + app.t('tabs[.]Use !link! prefix to create link. Example: !link!My link. Value must contain URL.') + '</li>' +
            '</ul>')
        .insertBefore('#cs-motdtext')
        .hide();


    this.$tabSettingsBtn = $('<button type="button" class="btn btn-primary motd-bottom-btn" id="show-tabs-settings">')
        .text(app.t('tabs[.]Show tabs settings (cytube enhanced)'))
        .appendTo('#cs-motdeditor')
        .on('click', function () {
            if ($(this).hasClass('btn-primary')) {
                that.$tabsSettings.show();

                $(this).removeClass('btn-primary');
                $(this).addClass('btn-success');
            } else {
                that.$tabsSettings.hide();

                $(this).removeClass('btn-success');
                $(this).addClass('btn-primary');
            }
        });

    $('#cs-motdtext').before('<hr>');


    this.$channelDescriptionInputWrapper = $('<div class="form-group">').appendTo(this.$tabsSettings);
    this.$channelDescriptionLabel = $('<label for="channel-description-input">' + app.t('tabs[.]Channel description') + '</label>').appendTo(this.$channelDescriptionInputWrapper);
    this.$channelDescriptionInput = $('<input id="channel-description-input" placeholder="' + app.t('tabs[.]Channel description') + '" class="form-control">').appendTo(this.$channelDescriptionInputWrapper);


    this.$tabsArea = $('<div id="tabs-settings-area">').appendTo(this.$tabsSettings);

    $('<p>Вкладки</p>').insertBefore(this.$tabsArea);


    this.$addTabToTabsSettingsBtn = $('<button type="button" class="btn btn-sm btn-primary" id="tabs-settings-add">')
        .text(app.t('tabs[.]Add tab'))
        .appendTo(this.$tabsSettings)
        .on('click', function () {
            that.addTabInput(that.$tabsArea);
        });


    this.$removeLastTabFromTabsSettingsBtn = $('<button type="button" class="btn btn-sm btn-primary" id="tabs-settings-remove">')
        .text(app.t('tabs[.]Remove the last tab'))
        .appendTo(this.$tabsSettings)
        .on('click', function () {
            that.$tabsArea.children('.tab-option-wrapper').last().remove();
        });


    this.$tabsToHtml = $('<button type="button" class="btn btn-sm btn-primary" id="tabs-settings-to-html">')
        .text(app.t('tabs[.]Convert to the editor\'s code'))
        .appendTo(this.$tabsSettings)
        .on('click', function () {
            if (window.confirm(app.t('tabs[.]The code in the editor will be replaced with the new code, continue?'))) {
                $(this).removeClass('btn-success');

                var tabsConfig = []; //list of arrays like [tabTitle, tabContent]

                that.$tabsArea.find('.tab-option-wrapper').each(function () {
                    var tabName = $(this).find('input[name="title"]').val().trim();
                    var tabContent = $(this).find('input[name="content"]').val().trim();

                    if (tabName.indexOf('!dropdown!') === 0) {
                        if (!/^(?:\[n\](.+?)\[\/n\]\[a\](.+?)\[\/a\][ ]*,[ ]*)*\[n\](.+?)\[\/n\]\[a\](.+?)\[\/a\]$/.test(tabContent)) {
                            window.alert(app.t('tabs[.]Wrong content for the dropdown') + tabName.replace('!dropdown!', '') + '.');
                            return;
                        }

                        tabContent = tabContent.split(',').map(function (linkInfo) {
                            linkInfo = linkInfo.trim().match(/^\[n\](.+?)\[\/n\]\[a\](.+?)\[\/a\]$/);

                            return [linkInfo[1].trim(), linkInfo[2].trim()];
                        });
                    } else if (tabName.indexOf('!link!') === 0) {

                    }

                    tabsConfig.push([tabName, tabContent]);
                });


                $('#cs-motdtext').val(that.tabsConfigToHtml(that.$channelDescriptionInput.val(), tabsConfig));
            }
        });


    this.$htmlToTabs = $('<button type="button" class="btn btn-sm btn-primary" id="tabs-settings-from-html">')
        .text(app.t('tabs[.]Convert from the editor\'s code'))
        .appendTo(this.$tabsSettings)
        .on('click', function () {
            if (window.confirm(app.t('tabs[.]Tabs settings will be replaced with the code from the editor, continue?'))) {
                $(this).removeClass('btn-success');
                that.tabsHtmlToCondig($('#cs-motdtext').val());
            }
        });


    this.showMotdTab = function ($tabBtn) {
        var $tabContent = $('#motd-tabs-content').find('[data-tab-index="' + $tabBtn.data('tabIndex') + '"]');

        if ($tabBtn.hasClass('btn-default')) { //closed
            $('.motd-tab-content').hide();
            $tabContent.show();

            $('.motd-tab-btn').removeClass('btn-success');
            $('.motd-tab-btn').addClass('btn-default');

            $tabBtn.removeClass('btn-default');
            $tabBtn.addClass('btn-success');
        } else { //opened
            $tabContent.hide();

            $tabBtn.removeClass('btn-success');
            $tabBtn.addClass('btn-default');
        }
    };
    $(document.body).on('click', '#motd-tabs .motd-tab-btn', function () {
        that.showMotdTab($(this));
    });


    this.motdHandleDropdown = function () {
        $('.motd-tab-btn').removeClass('btn-success');
        $('.motd-tab-btn').addClass('btn-default');

        $('.motd-tab-content').hide();
    };
    $(document.body).on('click', '#motd-tabs .dropdown-toggle', function () {
        that.motdHandleDropdown();
    });




    this.tabsHtmlToCondig($('#cs-motdtext').val());

    this.fixMotdCut();
    window.socket.on('setMotd', function () {
        that.fixMotdCut();
    });


    $(document).on('change keypress', '#tabs-settings-area input, #tabs-settings-area textarea', function () {
        that.$tabsToHtml.addClass('btn-success');
    });

    $(document).on('change keypress', '#cs-motdtext', function () {
        that.$htmlToTabs.addClass('btn-success');
    });
});