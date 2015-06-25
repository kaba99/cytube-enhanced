animachEnhancedApp.addModule('navMenuTabs', function () {
    var addTabInput = function ($tabsArea, tabName, tabValue) {
        tabName = tabName || '';
        tabValue = tabValue || '';

        var $wrapper = $('<div class="row tab-option-wrapper">').appendTo($tabsArea);

        var $tabNameWrapperOfWrapper = $('<div class="col-sm-4 col-md-3">').appendTo($wrapper);
        var $tabNameWrapper = $('<div class="form-group">').appendTo($tabNameWrapperOfWrapper);
        var $tabNameInput = $('<input name="title" type="text" class="form-control" placeholder="Заголовок">')
            .val(tabName)
            .appendTo($tabNameWrapper);


        var $tabValueWrapperOfWrapper = $('<div class="col-sm-8 col-md-9">').appendTo($wrapper);
        var $tabValueWrapper = $('<div class="form-group">').appendTo($tabValueWrapperOfWrapper);
        var $tabValueInput = $('<input name="content" type="text" class="form-control" placeholder="Содержимое">')
            .val(tabValue)
            .appendTo($tabValueWrapper);
    };

    var tabsConfigToHtml = function (channelDescription, tabsConfig) {
        console.log(tabsConfig);
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
                    var $dropdownBtn = $('<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">')
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

    var tabsHtmlToCondig = function () {
        $tabsArea.empty();

        var $tabsTree = $('<div>').html($('#cs-motdtext').val());
        var $tabsTreeNavBtns = $tabsTree.find('#motd-tabs').children();
        var $tabsTreeTabsContent = $tabsTree.find('#motd-tabs-content');

        $('#channel-description-input').val($tabsTree.find('#motd-channel-description').html());

        $tabsTreeNavBtns.each(function () {
            if ($(this).hasClass('btn-group')) {
                var parsedDropdownItems = '';
                var $dropdownItems = $(this).children('ul').children();

                $dropdownItems.each(function () {
                    var link = $(this).children('a');

                    parsedDropdownItems += '[n]' + link.text() + '[/n][a]' + link.attr('href') + '[/a], ';
                });
                parsedDropdownItems = parsedDropdownItems.slice(0, -2);

                addTabInput($tabsArea, '!dropdown!' + $(this).children('button').html().replace(' <span class="caret"></span>', ''), parsedDropdownItems);
            } else {
                addTabInput($tabsArea, $(this).html(), $tabsTreeTabsContent.find('[data-tab-index="' + $(this).data('tabIndex') + '"]').html());
            }
        });
    };

    var fixMotdCut = function () {
        var cutMap = {
            '<iframe $1>$2</iframe>': /\[iframe(.*?)\](.*?)[/iframe]]/g
        };

        $('#motd-tabs-content').find('.motd-tab-content').each(function () {
            for (var tag in cutMap) {
                $(this).html($(this).html().replace(cutMap[tag], tag));
            }
        });
    };



    var $tabSettingsBtn = $('<button type="button" class="btn btn-primary motd-bottom-btn" id="show-tabs-settings">Показать настройки вкладок</button>')
        .appendTo('#cs-motdeditor')
        .on('click', function () {
            if ($(this).hasClass('btn-primary')) {
                $tabsSettings.show();

                $(this).removeClass('btn-primary');
                $(this).addClass('btn-success');
            } else {
                $tabsSettings.hide();

                $(this).removeClass('btn-success');
                $(this).addClass('btn-primary');
            }
        });

    var $tabsSettings = $('<div id="tabs-settings">')
        .html('<hr><h3>Настройка вкладок</h3>')
        .insertBefore('#cs-motdtext')
        .hide();

    $('#cs-motdtext').before('<hr>');

    var $channelDescriptionInputWrapper = $('<div class="form-group">').appendTo($tabsSettings);
    var $channelDescriptionLabel = $('<label for="channel-description-input">Описание канала</label>').appendTo($channelDescriptionInputWrapper);
    var $channelDescriptionInput = $('<input id="channel-description-input" placeholder="Описание канала" class="form-control">').appendTo($channelDescriptionInputWrapper);

    var $tabsArea = $('<div id="tabs-settings-area">')
        .appendTo($tabsSettings);

    $tabsArea.before('<p>Вкладки</p>');

    var $addTabToTabsSettingsBtn = $('<button type="button" class="btn btn-sm btn-primary" id="tabs-settings-add">Добавить вкладку</button>')
        .appendTo($tabsSettings)
        .on('click', function () {
            addTabInput($tabsArea);
        });

    var $removeLastTabFromTabsSettingsBtn = $('<button type="button" class="btn btn-sm btn-primary" id="tabs-settings-remove">Удалить последнюю вкладку</button>')
        .appendTo($tabsSettings)
        .on('click', function () {
            $tabsArea.children('.tab-option-wrapper').last().remove();
        });

    var $tabsToHtml = $('<button type="button" class="btn btn-sm btn-primary" id="tabs-settings-to-html">Преобразовать в код редактора</button>')
        .appendTo($tabsSettings)
        .on('click', function () {
            if (confirm('Код в редакторе будет удалён и заменен новым, продолжить?')) {
                var tabsConfig = []; //list of arrays like [tabTitle, tabContent]

                $tabsArea.find('.tab-option-wrapper').each(function () {
                    var tabName = $(this).find('input[name="title"]').val().trim();
                    var tabContent = $(this).find('input[name="content"]').val().trim();

                    if (tabName.indexOf('!dropdown!') === 0) {
                        if (!/^(?:\[n\](.+?)\[\/n\]\[a\](.+?)\[\/a\][ ]*,[ ]*)*\[n\](.+?)\[\/n\]\[a\](.+?)\[\/a\]$/.test(tabContent)) {
                            alert('Неправильное выражения для выпадающего списка: ' + tabName.replace('!dropdown!', '') + '.');
                            return;
                        }

                        tabContent = tabContent.split(',').map(function (linkInfo) {
                            linkInfo = linkInfo.trim().match(/^\[n\](.+?)\[\/n\]\[a\](.+?)\[\/a\]$/);

                            return [linkInfo[1].trim(), linkInfo[2].trim()];
                        });
                    }

                    tabsConfig.push([tabName, tabContent]);
                });


                $('#cs-motdtext').val(tabsConfigToHtml($channelDescriptionInput.val(), tabsConfig));
            }
        });

    var $htmlToTabs = $('<button type="button" class="btn btn-sm btn-primary" id="tabs-settings-from-html">Преобразовать из кода редактора</button>')
        .appendTo($tabsSettings)
        .on('click', function () {
            tabsHtmlToCondig();
        });



    $(document.body).on('click', '#motd-tabs .motd-tab-btn', function () {
        var $tabContent = $('#motd-tabs-content').find('[data-tab-index="' + $(this).data('tabIndex') + '"]');

        if ($(this).hasClass('btn-default')) { //closed
            $('.motd-tab-content').hide();
            $tabContent.show();

            $('.motd-tab-btn').removeClass('btn-success');
            $('.motd-tab-btn').addClass('btn-default');

            $(this).removeClass('btn-default');
            $(this).addClass('btn-success');
        } else { //opened
            $tabContent.hide();

            $(this).removeClass('btn-success');
            $(this).addClass('btn-default');
        }
    });

    $(document.body).on('click', '#motd-tabs .dropdown-toggle', function () {
        $('.motd-tab-btn').removeClass('btn-success');
        $('.motd-tab-btn').addClass('btn-default');

        $('.motd-tab-content').hide();
    });



    tabsHtmlToCondig();

    fixMotdCut();
    socket.on('setMotd', function () {
        fixMotdCut();
    });




    //var $channelDescription = $('<h1 class="text-center channel-description">Добро пожаловать на аниме канал имиджборда <a href="https://2ch.hk" style="color:#FF6600" target="_blank">Два.ч</a>. Снова.</h1>');

    //если ключ начинается с подстроки !dropdown!, то создаётся кнопка с выпадающим меню, в котором содержатся ссылки из массива значения ключа
    //var tabsArray = [
    //    ['Расписание', '<div class="text-center"><img src="http://i.imgur.com/R9buKtU.png" style="width: 90%; max-width: 950px;"></div>'],
    //    ['FAQ и правила', '<strong>Канал загружается, но видео отображает сообщение об ошибке</strong><br/>Некоторые расширения могут вызывать проблемы со встроенными плеерами. Отключите расширения и попробуйте снова. Так же попробуйте почистить кэш/куки и нажать <img src="https://i840.photobucket.com/albums/zz324/cpu_fan/reload_zpsf14999c3.png">.<br/><br/><strong>Страница загружается, но не происходит подключение</strong><br/>Это проблема соединения вашего браузера с сервером. Некоторые провайдеры, фаерволы или антивирусы могут блокировать или фильтровать порты.<br/><br/><strong>Меня забанили. Я осознал свою ошибку и хочу разбана. Что я должен сделать?</strong><br/>Реквестировать разбан можно у администраторов/модераторов канала, указав забаненный ник.<br/><br/><strong>Как отправлять смайлики</strong><br/>Смайлики имеют вид `:abu:`. Под чатом есть кнопка для отправления смайлов.<br/><br/><strong>Как пользоваться личными сообщениями?</strong><br/>Выбираем пользователя в списке, жмем второй кнопкой мыши и выбираем "Private Message".<br/><br/<strong>Как добавить свое видео в плейлист?</strong><br/>Добавить видео - Вставляем ссылку на видео (список поддерживаемых источников ниже) - At End. Ждем очереди.<br/><br/><strong>Как проголосовать за пропуск видео?</strong><br/>Кнопка <img src="https://i840.photobucket.com/albums/zz324/cpu_fan/ss2014-03-10at114058_zps7de4fa28.png">. Если набирается определенное количество голосов (обычно 20-25% от общего числа находящихся на канале), то видео пропускается.<br/><br/><strong>Почему я не могу проголосовать за пропуск?</strong><br/>Во время трансляций и передач по расписанию администрация отключает голосование за пропуск.<br/><br/><strong>Как посмотреть, кто добавил видео в плейлист?</strong><br/>Наводим курсор на название видео в плейлисте.<br/><br/><strong>Как пользоваться поиском видео?</strong><br/>Кнопка <img src="https://i840.photobucket.com/albums/zz324/cpu_fan/search_zps335dfef6.png"> . Вводим название видео. По нажатию на кнопку "Library" можно найти видео в библиотеке канала. Найти видео на YouTube можно нажав на одноименную кнопку.<br/><br/><strong>Список поддерживаемых URL:</strong><br/>* YouTube - <code>http://youtube.com/watch?v=(videoid)</code> или <code>http://youtube.com/playlist?list(playlistid)</code><br/>* Vimeo - <code>http://vimeo.com/(videoid)</code><br/>* Soundcloud - <code>http://soundcloud.com/(songname)</code><br/>* Dailymotion - <code>http://dailymotion.com/video/(videoid)</code><br/>* TwitchTV - <code>http://twitch.tv/(stream)</code><br/>* JustinTV - <code>http://justin.tv/(stream)</code><br/>* Livestream - <code>http://livestream.com/(stream)</code><br/>* UStream - <code>http://ustream.tv/(channel)</code><br/>* RTMP Livestreams - <code>rtmp://(stream server)</code><br/>* JWPlayer - <code>jw:(stream url)</code><br/><br/><strong>Ранговая система:</strong><br/>* Администратор сайта - Красный, розовый, фиолетовый<br/>* Администратор канала - Голубой<br/>* Модератор канала - Зеленый<br/>* Пользователь - Белый<br/>* Гость - Серый<br/><br/><strong>Правила:</strong><br/>Не злоупотреблять смайлами<br/>Не вайпать чат и плейлист<br/>Не спамить ссылками<br/>Не спойлерить<br/>Обсуждение политики - /po<br/>'],
    //    ['Список реквестов', '<div class="text-center"><iframe src="https://docs.google.com/spreadsheets/d/1ZokcogxujqHsR-SoBPnTDTkwDvmFYHajuPLRv7-WjU4/htmlembed?authuser=0" width="780" height="800" title="Реквесты на аниме" frameborder="0" id="505801161"></iframe></div>'],
    //    ['Реквестировать аниме', '<div class="text-center"><iframe src="https://docs.google.com/forms/viewform?authuser=0&amp;bc=transparent&amp;embedded=true&amp;f=Georgia%252C%2BTimes%2BNew%2BRoman%252C%2Bserif&amp;hl=ru&amp;htc=%2523666666&amp;id=1lEES2KS-S54PXlgAv0O6OK0RweZ6yReYOdV_vmuZzts&amp;lc=%25230080bb&amp;pli=1&amp;tc=%2523333333&amp;ttl=0" width="100%" height="600" title="Форма &quot;Таблица Google&quot;" allowtransparency="true" frameborder="0" marginheight="0" marginwidth="0" id="982139229"></iframe></div>'],
    //    ['!dropdown!Наши ссылки', {
    //        'MAL': 'http://myanimelist.net/animelist/animachtv',
    //        'Наша доска': 'https://2ch.hk/tvch/',
    //        'Твиттер': 'https://twitter.com/2ch_tv',
    //        'ВК': 'http://vk.com/tv2ch'
    //    }]
    //];
});



//<div id="motd-channel-description"><h1 class="text-center channel-description">Добро пожаловать на аниме канал имиджборда <a href="https://2ch.hk" style="color:#FF6600" target="_blank">Два.ч</a>. Снова.</h1></div><div id="motd-tabs-wrapper"><div id="motd-tabs"><button class="btn btn-default motd-tab-btn" data-tab-index="0">Расписание</button><button class="btn btn-default motd-tab-btn" data-tab-index="1">FAQ и правила</button><button class="btn btn-default motd-tab-btn" data-tab-index="2">Список реквестов</button><button class="btn btn-default motd-tab-btn" data-tab-index="3">Реквестировать аниме</button><div class="btn-group"><button class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Наши ссылки <span class="caret"></span></button><ul class="dropdown-menu"><li><a href="http://myanimelist.net/animelist/animachtv" target="_blank">MAL</a></li><li><a href="https://2ch.hk/tvch/" target="_blank">Наша доска</a></li><li><a href="https://twitter.com/2ch_tv" target="_blank">Твиттер</a></li><li><a href="http://vk.com/tv2ch" target="_blank">ВК</a></li></ul></div></div><div id="motd-tabs-content"><div class="motd-tab-content" data-tab-index="0" style="display: none;"><div class="text-center"><img src="http://i.imgur.com/R9buKtU.png" style="width: 90%; max-width: 950px;" /></div></div><div class="motd-tab-content" data-tab-index="1" style="display: none;"><strong>Канал загружается, но видео отображает сообщение об ошибке</strong><br />Некоторые расширения могут вызывать проблемы со встроенными плеерами. Отключите расширения и попробуйте снова. Так же попробуйте почистить кэш/куки и нажать <img src="https://i840.photobucket.com/albums/zz324/cpu_fan/reload_zpsf14999c3.png" />.<br /><br /><strong>Страница загружается, но не происходит подключение</strong><br />Это проблема соединения вашего браузера с сервером. Некоторые провайдеры, фаерволы или антивирусы могут блокировать или фильтровать порты.<br /><br /><strong>Меня забанили. Я осознал свою ошибку и хочу разбана. Что я должен сделать?</strong><br />Реквестировать разбан можно у администраторов/модераторов канала, указав забаненный ник.<br /><br /><strong>Как отправлять смайлики</strong><br />Смайлики имеют вид `:abu:`. Под чатом есть кнопка для отправления смайлов.<br /><br /><strong>Как пользоваться личными сообщениями?</strong><br />Выбираем пользователя в списке, жмем второй кнопкой мыши и выбираем "Private Message".<br /><br />Как добавить свое видео в плейлист?<br />Добавить видео - Вставляем ссылку на видео (список поддерживаемых источников ниже) - At End. Ждем очереди.<br /><br /><strong>Как проголосовать за пропуск видео?</strong><br />Кнопка <img src="https://i840.photobucket.com/albums/zz324/cpu_fan/ss2014-03-10at114058_zps7de4fa28.png" />. Если набирается определенное количество голосов (обычно 20-25% от общего числа находящихся на канале), то видео пропускается.<br /><br /><strong>Почему я не могу проголосовать за пропуск?</strong><br />Во время трансляций и передач по расписанию администрация отключает голосование за пропуск.<br /><br /><strong>Как посмотреть, кто добавил видео в плейлист?</strong><br />Наводим курсор на название видео в плейлисте.<br /><br /><strong>Как пользоваться поиском видео?</strong><br />Кнопка <img src="https://i840.photobucket.com/albums/zz324/cpu_fan/search_zps335dfef6.png" /> . Вводим название видео. По нажатию на кнопку "Library" можно найти видео в библиотеке канала. Найти видео на YouTube можно нажав на одноименную кнопку.<br /><br /><strong>Список поддерживаемых URL:</strong><br />* YouTube - <code>http://youtube.com/watch?v=(videoid)</code> или <code>http://youtube.com/playlist?list(playlistid)</code><br />* Vimeo - <code>http://vimeo.com/(videoid)</code><br />* Soundcloud - <code>http://soundcloud.com/(songname)</code><br />* Dailymotion - <code>http://dailymotion.com/video/(videoid)</code><br />* TwitchTV - <code>http://twitch.tv/(stream)</code><br />* JustinTV - <code>http://justin.tv/(stream)</code><br />* Livestream - <code>http://livestream.com/(stream)</code><br />* UStream - <code>http://ustream.tv/(channel)</code><br />* RTMP Livestreams - <code>rtmp://(stream server)</code><br />* JWPlayer - <code>jw:(stream url)</code><br /><br /><strong>Ранговая система:</strong><br />* Администратор сайта - Красный, розовый, фиолетовый<br />* Администратор канала - Голубой<br />* Модератор канала - Зеленый<br />* Пользователь - Белый<br />* Гость - Серый<br /><br /><strong>Правила:</strong><br />Не злоупотреблять смайлами<br />Не вайпать чат и плейлист<br />Не спамить ссылками<br />Не спойлерить<br />Обсуждение политики - /po<br /></div><div class="motd-tab-content" data-tab-index="2" style="display: none;"><div class="text-center">[iframe src="https://docs.google.com/forms/viewform?authuser=0&amp;bc=transparent&amp;embedded=true&amp;f=Georgia%252C%2BTimes%2BNew%2BRoman%252C%2Bserif&amp;hl=ru&amp;htc=%2523666666&amp;id=1lEES2KS-S54PXlgAv0O6OK0RweZ6yReYOdV_vmuZzts&amp;lc=%25230080bb&amp;pli=1&amp;tc=%2523333333&amp;ttl=0" width="100%" height="600" title="Форма "Таблица Google"" allowtransparency="true" frameborder="0" marginheight="0" marginwidth="0" id="982139229"]</div></div><div class="motd-tab-content" data-tab-index="3" style="display: none;"><div class="text-center">[iframe src="https://docs.google.com/spreadsheets/d/1ZokcogxujqHsR-SoBPnTDTkwDvmFYHajuPLRv7-WjU4/htmlembed?authuser=0" width="780" height="800" title="Реквесты на аниме" frameborder="0" id="505801161"]</div></div></div></div>
