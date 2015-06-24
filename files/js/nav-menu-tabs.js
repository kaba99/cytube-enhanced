animachEnhancedApp.addModule('navMenuTabs', function () {
    var tabsCSS = {
        'padding':		'20px',
        'color':		'white',
        'background-color':	'black'
    };


    var $channelDescription = $('<h1 class="text-center channel-description">Добро пожаловать на аниме канал имиджборда <a href="https://2ch.hk" style="color:#FF6600" target="_blank">Два.ч</a>. Снова.</h1>');

    //если ключ начинается с подстроки !dropdown!, то создаётся кнопка с выпадающим меню, в котором содержатся ссылки из массива значения ключа
    var tabsArray = [
        ['Расписание', '<div class="text-center"><img src="http://i.imgur.com/R9buKtU.png" style="width: 90%; max-width: 950px;"></div>'],
        ['FAQ и правила', '<strong>Канал загружается, но видео отображает сообщение об ошибке</strong><br/>Некоторые расширения могут вызывать проблемы со встроенными плеерами. Отключите расширения и попробуйте снова. Так же попробуйте почистить кэш/куки и нажать <img src="https://i840.photobucket.com/albums/zz324/cpu_fan/reload_zpsf14999c3.png">.<br/><br/><strong>Страница загружается, но не происходит подключение</strong><br/>Это проблема соединения вашего браузера с сервером. Некоторые провайдеры, фаерволы или антивирусы могут блокировать или фильтровать порты.<br/><br/><strong>Меня забанили. Я осознал свою ошибку и хочу разбана. Что я должен сделать?</strong><br/>Реквестировать разбан можно у администраторов/модераторов канала, указав забаненный ник.<br/><br/><strong>Как отправлять смайлики</strong><br/>Смайлики имеют вид `:abu:`. Под чатом есть кнопка для отправления смайлов.<br/><br/><strong>Как пользоваться личными сообщениями?</strong><br/>Выбираем пользователя в списке, жмем второй кнопкой мыши и выбираем "Private Message".<br/><br/<strong>Как добавить свое видео в плейлист?</strong><br/>Добавить видео - Вставляем ссылку на видео (список поддерживаемых источников ниже) - At End. Ждем очереди.<br/><br/><strong>Как проголосовать за пропуск видео?</strong><br/>Кнопка <img src="https://i840.photobucket.com/albums/zz324/cpu_fan/ss2014-03-10at114058_zps7de4fa28.png">. Если набирается определенное количество голосов (обычно 20-25% от общего числа находящихся на канале), то видео пропускается.<br/><br/><strong>Почему я не могу проголосовать за пропуск?</strong><br/>Во время трансляций и передач по расписанию администрация отключает голосование за пропуск.<br/><br/><strong>Как посмотреть, кто добавил видео в плейлист?</strong><br/>Наводим курсор на название видео в плейлисте.<br/><br/><strong>Как пользоваться поиском видео?</strong><br/>Кнопка <img src="https://i840.photobucket.com/albums/zz324/cpu_fan/search_zps335dfef6.png"> . Вводим название видео. По нажатию на кнопку "Library" можно найти видео в библиотеке канала. Найти видео на YouTube можно нажав на одноименную кнопку.<br/><br/><strong>Список поддерживаемых URL:</strong><br/>* YouTube - <code>http://youtube.com/watch?v=(videoid)</code> или <code>http://youtube.com/playlist?list(playlistid)</code><br/>* Vimeo - <code>http://vimeo.com/(videoid)</code><br/>* Soundcloud - <code>http://soundcloud.com/(songname)</code><br/>* Dailymotion - <code>http://dailymotion.com/video/(videoid)</code><br/>* TwitchTV - <code>http://twitch.tv/(stream)</code><br/>* JustinTV - <code>http://justin.tv/(stream)</code><br/>* Livestream - <code>http://livestream.com/(stream)</code><br/>* UStream - <code>http://ustream.tv/(channel)</code><br/>* RTMP Livestreams - <code>rtmp://(stream server)</code><br/>* JWPlayer - <code>jw:(stream url)</code><br/><br/><strong>Ранговая система:</strong><br/>* Администратор сайта - Красный, розовый, фиолетовый<br/>* Администратор канала - Голубой<br/>* Модератор канала - Зеленый<br/>* Пользователь - Белый<br/>* Гость - Серый<br/><br/><strong>Правила:</strong><br/>Не злоупотреблять смайлами<br/>Не вайпать чат и плейлист<br/>Не спамить ссылками<br/>Не спойлерить<br/>Обсуждение политики - /po<br/>'],
        ['Список реквестов', '<div class="text-center"><iframe src="https://docs.google.com/spreadsheets/d/1ZokcogxujqHsR-SoBPnTDTkwDvmFYHajuPLRv7-WjU4/htmlembed?authuser=0" width="780" height="800" title="Реквесты на аниме" frameborder="0" id="505801161"></iframe></div>'],
        ['Реквестировать аниме', '<div class="text-center"><iframe src="https://docs.google.com/forms/viewform?authuser=0&amp;bc=transparent&amp;embedded=true&amp;f=Georgia%252C%2BTimes%2BNew%2BRoman%252C%2Bserif&amp;hl=ru&amp;htc=%2523666666&amp;id=1lEES2KS-S54PXlgAv0O6OK0RweZ6yReYOdV_vmuZzts&amp;lc=%25230080bb&amp;pli=1&amp;tc=%2523333333&amp;ttl=0" width="100%" height="600" title="Форма &quot;Таблица Google&quot;" allowtransparency="true" frameborder="0" marginheight="0" marginwidth="0" id="982139229"></iframe></div>'],
        ['!dropdown!Наши ссылки', {
            'MAL': 'http://myanimelist.net/animelist/animachtv',
            'Наша доска': 'https://2ch.hk/tvch/',
            'Твиттер': 'https://twitter.com/2ch_tv',
            'ВК': 'http://vk.com/tv2ch'
        }]
    ];

     var changeMOTD = function () {
        if (tabsArray.length > 0) {
            $channelDescription.appendTo('#motd');

            var $motdTabsWrap = $('<div id="motd-tabs-wrap">').appendTo("#motd");

            var $motdTabsContent = $('<div id="motdtabscontent"></div>')
                .css(tabsCSS)
                .appendTo("#motd")
                .hide();

            var dropdownBtn;
            var dropdownList;
            for (var tabNumber = 0, tabsArrayLen = tabsArray.length; tabNumber < tabsArrayLen; tabNumber++) {
                if (tabsArray[tabNumber][0].indexOf('!dropdown!') === 0) {
                    dropdownBtn = $('<div class="btn-group">').appendTo($motdTabsWrap)
                        .html('<button type="button" class="btn btn-default motdtabs-btn dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' + tabsArray[tabNumber][0].replace(/^!dropdown!/, '') + ' <span class="caret"></span></button>');

                    dropdownList = $('<ul class="dropdown-menu">').appendTo(dropdownBtn);

                    for (var element in tabsArray[tabNumber][1]) {
                        $('<li>').appendTo(dropdownList)
                            .append($('<a href="' + tabsArray[tabNumber][1][element] + '" target="_blank">' + element + '</a>'));
                    }
                } else {
                    $('<button class="btn btn-default motdtabs-btn" tab="' + tabNumber + '">')
                        .text(tabsArray[tabNumber][0])
                        .appendTo($motdTabsWrap)
                        .on('click', function() {
                            if ($(this).hasClass('btn-success')) {
                                $('.motdtabs-btn').removeClass('btn-success');

                                $motdTabsContent.hide();
                                $motdTabsContent.html('');
                            } else {
                                $('.motdtabs-btn').removeClass('btn-success');
                                $(this).addClass('btn-success');

                                $motdTabsContent.show();
                                $motdTabsContent.html(tabsArray[$(this).attr('tab')][1]);
                            }
                        });
                }
            }
        }
    };

    socket.on('setMotd', changeMOTD);
    changeMOTD();
});
