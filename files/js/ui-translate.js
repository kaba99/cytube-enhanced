animachEnhancedApp.addModule('uiTranslate', function () {
    if ($('#newpollbtn').length !== 0) {
        $('#newpollbtn').text('Создать опрос');
    }

    if ($('#showmediaurl').length !== 0) {
        $('#showmediaurl').html('Добавить видео')
            .attr({title: 'Добавить видео по ссылке'})
            .detach()
            .insertBefore($('#showsearch'));
    }

    if ($('.navbar-brand').length !== 0) {
        $('.navbar-brand').text('Анимач ТВ');
    }

    if ($('#usercount').length !== 0) {
        $('#usercount').text($('#usercount').text().replace('connected users', 'пользователей').replace('connected user', 'пользователь'));
        socket.on('usercount', function () {
            $('#usercount').text($('#usercount').text().replace('connected users', 'пользователей').replace('connected user', 'пользователь'));
        });
    }
    calcUserBreakdown = (function (oldCalcUserBreakdown) {
        return function () {
            var chatInfo = oldCalcUserBreakdown();
            var translatedChatInfo = {};

            var chatInfoTranslateMap = {
                AFK: 'АФК',
                Anonymous: 'Анонимных',
                'Channel Admins': 'Администраторов канала',
                Guests: 'Гостей',
                Moderators: 'Модераторов',
                'Regular Users': 'Обычных пользователей',
                'Site Admins': 'Администраторов сайта'
            };

            for (var chatInfoElement in chatInfo) {
                translatedChatInfo[chatInfoTranslateMap[chatInfoElement]] = chatInfo[chatInfoElement];
            }

            return translatedChatInfo;
        };
    })(calcUserBreakdown);

    if ($('#welcome').length !== 0) {
        $('#welcome').text('Добро пожаловать, ' + CLIENT.name);
    }
    if ($('#logout').length !== 0) {
        $('#logout').text('Выйти');
    }
    if ($('#username').length !== 0) {
        $('#username').attr({placeholder: 'Логин'});
    }
    if ($('#password').length !== 0) {
        $('#password').attr({placeholder: 'Пароль'});
    }
    if ($('#loginform').find('.checkbox').find('.navbar-text-nofloat').length !== 0) {
        $('#loginform').find('.checkbox').find('.navbar-text-nofloat').text('Запомнить');
    }
    if ($('#login')) {
        $('#login').text('Вход');
    }

    var menuTranslateMap = {
        Home: 'Домой',
        Account: 'Аккаунт',
        Logout: 'Выход',
        Channels: 'Каналы',
        Profile: 'Профиль',
        'Change Password/Email': 'Изменить пароль/почту',
        Login: 'Вход',
        Register: 'Регистрация',
        Options: 'Настройки',
        'Channel Settings': 'Настройки канала',
        Layout: 'Сетка',
        'Chat Only': 'Только чат',
        'Remove Video': 'Удалить видео'
    };
    $('.navbar').find('.navbar-nav').children().each(function () {
        $(this).find('a').each(function () {
            for (var elementToTranslate in menuTranslateMap) {
                $(this).html($(this).html().replace(elementToTranslate, menuTranslateMap[elementToTranslate]));
            }
        });
    });

    if ($('#mediaurl').length !== 0) {
        $('#mediaurl').attr('placeholder', 'Адрес видео');
    }
    if ($('#queue_next').length !== 0) {
        $('#queue_next').text('Следующим');
    }
    if ($('#queue_end').length !== 0) {
        $('#queue_end').text('В конец');
    }

    $('.qbtn-play').each(function () {
        $(this).html($(this).html().replace('Play', ' Проиграть'));
    });
    $('.qbtn-next').each(function () {
        $(this).html($(this).html().replace('Queue Next', ' Поставить следующим'));
    });
    $('.qbtn-tmp').each(function () {
        $(this).html($(this).html().replace('Make Temporary', ' Сделать временным').replace('Make Permanent', 'Сделать постоянным'));
    });
    $('.qbtn-delete').each(function () {
        $(this).html($(this).html().replace('Delete', ' Удалить'));
    });
    addQueueButtons = (function (oldAddQueueButtons) {
        return function (li) {
            var result = oldAddQueueButtons(li);

            if (li.find('.qbtn-play').length !== 0) {
                li.find('.qbtn-play').html(li.find('.qbtn-play').html().replace('Play', ' Проиграть'));
            }
            if (li.find('.qbtn-next').length !== 0) {
                li.find('.qbtn-next').html(li.find('.qbtn-next').html().replace('Queue Next', ' Поставить следующим'));
            }
            if (li.find('.qbtn-tmp').length !== 0) {
                li.find('.qbtn-tmp').html(li.find('.qbtn-tmp').html().replace('Make Temporary', ' Сделать временным').replace('Make Permanent', 'Сделать постоянным'));
            }
            if (li.find('.qbtn-delete').length !== 0) {
                li.find('.qbtn-delete').html(li.find('.qbtn-delete').html().replace('Delete', ' Удалить'));
            }

            return result;
        };
    })(addQueueButtons);
    socket.on('setTemp', function (data) {
        var tmpBtn = $(".pluid-" + data.uid).find(".qbtn-tmp");

        if(tmpBtn.length !== 0) {
            if(data.temp) {
                tmpBtn.html(tmpBtn.html().replace('Сделать временным', 'Сделать постоянным'));
            }
            else {
                tmpBtn.html(tmpBtn.html().replace('Сделать постоянным', 'Сделать временным'));
            }
        }
    });

    // $('#queue').find('.queue_entry').each(function () {
    //     $(this).attr('title', $(this).attr('title').replace('Added by', 'Добавлено'));
    // });
    // socket.on('queue', function () {
    //     $('#queue').find('.queue_entry').last().attr('title', $('.queue_entry').last().attr('title').replace('Added by', 'Добавлено'));
    // });

    if ($('#guestname').length !== 0) {
        $('#guestname').attr('placeholder', 'Имя');
    }
    if ($('#guestlogin')) {
        $('#guestlogin').find('.input-group-addon').text('Гостевой вход');
    }
});
