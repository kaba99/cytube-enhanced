window.cytubeEnhanced.addModule('translate', function (app) {
    'use strict';

    if ($('#newpollbtn').length !== 0) {
        $('#newpollbtn').text(app.t('standardUI[.]Create a poll'));
    }

    if ($('#showmediaurl').length !== 0) {
        $('#showmediaurl').html(app.t('standardUI[.]Add video'))
            .attr({title: app.t('standardUI[.]Add video from url')})
            .detach()
            .insertBefore($('#showsearch'));
    }

    if ($('.navbar-brand').length !== 0) {
        $('.navbar-brand').text(app.channelName);
    }

    if ($('#usercount').length !== 0) {
        $('#usercount').text($('#usercount').text().replace('connected users', app.t('standardUI[.]connected users')).replace('connected user', app.t('standardUI[.]connected user')));
        window.socket.on('usercount', function () {
            $('#usercount').text($('#usercount').text().replace('connected users', app.t('standardUI[.]connected users')).replace('connected user', app.t('standardUI[.]connected user')));
        });
    }
    window.calcUserBreakdown = (function (oldCalcUserBreakdown) {
        return function () {
            var chatInfo = oldCalcUserBreakdown();
            var translatedChatInfo = {};

            var chatInfoTranslateMap = {
                AFK: app.t('standardUI[.]AFK'),
                Anonymous: app.t('standardUI[.]Anonymous'),
                'Channel Admins': app.t('standardUI[.]Channel Admins'),
                Guests: app.t('standardUI[.]Guests'),
                Moderators: app.t('standardUI[.]Moderators'),
                'Regular Users': app.t('standardUI[.]Regular Users'),
                'Site Admins': app.t('standardUI[.]Site Admins')
            };

            for (var chatInfoElement in chatInfo) {
                if (chatInfo.hasOwnProperty(chatInfoElement)) {
                    translatedChatInfo[chatInfoTranslateMap[chatInfoElement]] = chatInfo[chatInfoElement];
                }
            }

            return translatedChatInfo;
        };
    })(window.calcUserBreakdown);

    if ($('#welcome').length !== 0) {
        $('#welcome').text(app.t('standardUI[.]Welcome, ') + window.CLIENT.name);
    }
    if ($('#logout').length !== 0) {
        $('#logout').text(app.t('standardUI[.]Log out'));
    }
    if ($('#username').length !== 0) {
        $('#username').attr({placeholder: app.t('standardUI[.]Login')});
    }
    if ($('#password').length !== 0) {
        $('#password').attr({placeholder: app.t('standardUI[.]Password')});
    }
    if ($('#loginform').find('.checkbox').find('.navbar-text-nofloat').length !== 0) {
        $('#loginform').find('.checkbox').find('.navbar-text-nofloat').text(app.t('standardUI[.]Remember me'));
    }
    if ($('#login').length !== 0) {
        $('#login').text(app.t('standardUI[.]Site login'));
    }

    var menuTranslateMap = {
        Home: app.t('standardUI[.]Home'),
        Account: app.t('standardUI[.]Account'),
        Logout: app.t('standardUI[.]Logout'),
        Channels: app.t('standardUI[.]Channels'),
        Profile: app.t('standardUI[.]Profile'),
        'Change Password/Email': app.t('standardUI[.]Change Password/Email'),
        Login: app.t('standardUI[.]Log in'),
        Register: app.t('standardUI[.]Register'),
        Options: app.t('standardUI[.]Options'),
        'Channel Settings': app.t('standardUI[.]Channel Settings'),
        Layout: app.t('standardUI[.]Layout'),
        'Chat Only': app.t('standardUI[.]Chat Only'),
        'Remove Video': app.t('standardUI[.]Remove Video')
    };
    $('.navbar').find('.navbar-nav').children().each(function () {
        $(this).find('a').each(function () {
            for (var elementToTranslate in menuTranslateMap) {
                if (menuTranslateMap.hasOwnProperty(elementToTranslate)) {
                    $(this).html($(this).html().replace(elementToTranslate, menuTranslateMap[elementToTranslate]));
                }
            }
        });
    });

    if ($('#mediaurl').length !== 0) {
        $('#mediaurl').attr('placeholder', app.t('standardUI[.]Video url'));
    }
    if ($('#queue_next').length !== 0) {
        $('#queue_next').text(app.t('standardUI[.]Next'));
    }
    if ($('#queue_end').length !== 0) {
        $('#queue_end').text(app.t('standardUI[.]At end'));
    }

    $('.qbtn-play').each(function () {
        $(this).html($(this).html().replace(/\s*Play/, ' ' + app.t('standardUI[.]Play')));
    });
    $('.qbtn-next').each(function () {
        $(this).html($(this).html().replace(/\s*Queue Next/, ' ' + app.t('standardUI[.]Queue Next')));
    });
    $('.qbtn-tmp').each(function () {
        $(this).html($(this).html().replace(/\s*Make Temporary/, ' ' + app.t('standardUI[.]Make Temporary')).replace(/\s*Make Permanent/, ' ' + app.t('standardUI[.]Make Permanent')));
    });
    $('.qbtn-delete').each(function () {
        $(this).html($(this).html().replace(/\s*Delete/, ' ' + app.t('standardUI[.]Delete')));
    });
    window.addQueueButtons = (function (oldAddQueueButtons) {
        return function (li) {
            var result = oldAddQueueButtons(li);

            if (li.find('.qbtn-play').length !== 0) {
                li.find('.qbtn-play').html(li.find('.qbtn-play').html().replace(/\s*Play/, ' ' + app.t('standardUI[.]Play')));
            }
            if (li.find('.qbtn-next').length !== 0) {
                li.find('.qbtn-next').html(li.find('.qbtn-next').html().replace(/\s*Queue Next/, ' ' + app.t('standardUI[.]Queue Next')));
            }
            if (li.find('.qbtn-tmp').length !== 0) {
                li.find('.qbtn-tmp').html(li.find('.qbtn-tmp').html().replace(/\s*Make Temporary/, ' ' + app.t('standardUI[.]Make Temporary')).replace(/\s*Make Permanent/, ' ' + app.t('standardUI[.]Make Permanent')));
            }
            if (li.find('.qbtn-delete').length !== 0) {
                li.find('.qbtn-delete').html(li.find('.qbtn-delete').html().replace(/\s*Delete/, ' ' + app.t('standardUI[.]Delete')));
            }

            return result;
        };
    })(window.addQueueButtons);

    this.handleTemp = function (data) {
        var tmpBtn = $(".pluid-" + data.uid).find(".qbtn-tmp");

        if(tmpBtn.length !== 0) {
            if(data.temp) {
                tmpBtn.html(tmpBtn.html().replace('Сделать временным', app.t('standardUI[.]Make Temporary')));
            }
            else {
                tmpBtn.html(tmpBtn.html().replace('Сделать постоянным', app.t('standardUI[.]Make Permanent')));
            }
        }
    };
    window.socket.on('setTemp', function (data) {
        that.handleTemp(data);
    });

    if ($('#guestname').length !== 0) {
        $('#guestname').attr('placeholder', app.t('standardUI[.]Name'));
    }
    if ($('#guestlogin')) {
        $('#guestlogin').find('.input-group-addon').text(app.t('standardUI[.]Guest login'));
    }

    if ($('#chatbtn').length !== 0) {
        $('#chatbtn').text('Отправить');
    }
});
