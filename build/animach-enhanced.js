function AnimachEnhancedApp(permittedModules) {
    this.modules = {};
    this.permittedModules = permittedModules;

    this.addModule = function (moduleName, moduleCallback) {
        if (this.permittedModules[moduleName] === true) {
            this.modules[moduleName] = moduleCallback(this) || {};
        }
    };
}

var animachEnhancedApp = new AnimachEnhancedApp({
    utils: true,
    chatHelp: true,
    favouritePictures: true,
    smiles: true,
    videoControls: true,
    progressBar: true,
    chatCommands: true,
    chatControls: true,
    uiTranslate: true,
    navMenuTabs: true,
    userConfig: true,
    schedule: true
});

/*!
 * jQuery Mousewheel 3.1.12
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

(function (factory) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var toFix  = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
        toBind = ( 'onwheel' in document || document.documentMode >= 9 ) ?
                    ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
        slice  = Array.prototype.slice,
        nullLowestDeltaTimeout, lowestDelta;

    if ( $.event.fixHooks ) {
        for ( var i = toFix.length; i; ) {
            $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
        }
    }

    var special = $.event.special.mousewheel = {
        version: '3.1.12',

        setup: function() {
            if ( this.addEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.addEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = handler;
            }
            // Store the line height and page height for this particular element
            $.data(this, 'mousewheel-line-height', special.getLineHeight(this));
            $.data(this, 'mousewheel-page-height', special.getPageHeight(this));
        },

        teardown: function() {
            if ( this.removeEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.removeEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = null;
            }
            // Clean up the data we added to the element
            $.removeData(this, 'mousewheel-line-height');
            $.removeData(this, 'mousewheel-page-height');
        },

        getLineHeight: function(elem) {
            var $elem = $(elem),
                $parent = $elem['offsetParent' in $.fn ? 'offsetParent' : 'parent']();
            if (!$parent.length) {
                $parent = $('body');
            }
            return parseInt($parent.css('fontSize'), 10) || parseInt($elem.css('fontSize'), 10) || 16;
        },

        getPageHeight: function(elem) {
            return $(elem).height();
        },

        settings: {
            adjustOldDeltas: true, // see shouldAdjustOldDeltas() below
            normalizeOffset: true  // calls getBoundingClientRect for each event
        }
    };

    $.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.bind('mousewheel', fn) : this.trigger('mousewheel');
        },

        unmousewheel: function(fn) {
            return this.unbind('mousewheel', fn);
        }
    });


    function handler(event) {
        var orgEvent   = event || window.event,
            args       = slice.call(arguments, 1),
            delta      = 0,
            deltaX     = 0,
            deltaY     = 0,
            absDelta   = 0,
            offsetX    = 0,
            offsetY    = 0;
        event = $.event.fix(orgEvent);
        event.type = 'mousewheel';

        // Old school scrollwheel delta
        if ( 'detail'      in orgEvent ) { deltaY = orgEvent.detail * -1;      }
        if ( 'wheelDelta'  in orgEvent ) { deltaY = orgEvent.wheelDelta;       }
        if ( 'wheelDeltaY' in orgEvent ) { deltaY = orgEvent.wheelDeltaY;      }
        if ( 'wheelDeltaX' in orgEvent ) { deltaX = orgEvent.wheelDeltaX * -1; }

        // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
        if ( 'axis' in orgEvent && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
            deltaX = deltaY * -1;
            deltaY = 0;
        }

        // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
        delta = deltaY === 0 ? deltaX : deltaY;

        // New school wheel delta (wheel event)
        if ( 'deltaY' in orgEvent ) {
            deltaY = orgEvent.deltaY * -1;
            delta  = deltaY;
        }
        if ( 'deltaX' in orgEvent ) {
            deltaX = orgEvent.deltaX;
            if ( deltaY === 0 ) { delta  = deltaX * -1; }
        }

        // No change actually happened, no reason to go any further
        if ( deltaY === 0 && deltaX === 0 ) { return; }

        // Need to convert lines and pages to pixels if we aren't already in pixels
        // There are three delta modes:
        //   * deltaMode 0 is by pixels, nothing to do
        //   * deltaMode 1 is by lines
        //   * deltaMode 2 is by pages
        if ( orgEvent.deltaMode === 1 ) {
            var lineHeight = $.data(this, 'mousewheel-line-height');
            delta  *= lineHeight;
            deltaY *= lineHeight;
            deltaX *= lineHeight;
        } else if ( orgEvent.deltaMode === 2 ) {
            var pageHeight = $.data(this, 'mousewheel-page-height');
            delta  *= pageHeight;
            deltaY *= pageHeight;
            deltaX *= pageHeight;
        }

        // Store lowest absolute delta to normalize the delta values
        absDelta = Math.max( Math.abs(deltaY), Math.abs(deltaX) );

        if ( !lowestDelta || absDelta < lowestDelta ) {
            lowestDelta = absDelta;

            // Adjust older deltas if necessary
            if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
                lowestDelta /= 40;
            }
        }

        // Adjust older deltas if necessary
        if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
            // Divide all the things by 40!
            delta  /= 40;
            deltaX /= 40;
            deltaY /= 40;
        }

        // Get a whole, normalized value for the deltas
        delta  = Math[ delta  >= 1 ? 'floor' : 'ceil' ](delta  / lowestDelta);
        deltaX = Math[ deltaX >= 1 ? 'floor' : 'ceil' ](deltaX / lowestDelta);
        deltaY = Math[ deltaY >= 1 ? 'floor' : 'ceil' ](deltaY / lowestDelta);

        // Normalise offsetX and offsetY properties
        if ( special.settings.normalizeOffset && this.getBoundingClientRect ) {
            var boundingRect = this.getBoundingClientRect();
            offsetX = event.clientX - boundingRect.left;
            offsetY = event.clientY - boundingRect.top;
        }

        // Add information to the event object
        event.deltaX = deltaX;
        event.deltaY = deltaY;
        event.deltaFactor = lowestDelta;
        event.offsetX = offsetX;
        event.offsetY = offsetY;
        // Go ahead and set deltaMode to 0 since we converted to pixels
        // Although this is a little odd since we overwrite the deltaX/Y
        // properties with normalized deltas.
        event.deltaMode = 0;

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);

        // Clearout lowestDelta after sometime to better
        // handle multiple device types that give different
        // a different lowestDelta
        // Ex: trackpad = 3 and mouse wheel = 120
        if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
        nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }

    function nullLowestDelta() {
        lowestDelta = null;
    }

    function shouldAdjustOldDeltas(orgEvent, absDelta) {
        // If this is an older event and the delta is divisable by 120,
        // then we are assuming that the browser is treating this as an
        // older mouse wheel event and that we should divide the deltas
        // by 40 to try and get a more usable deltaFactor.
        // Side note, this actually impacts the reported scroll distance
        // in older browsers and can cause scrolling to be slower than native.
        // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
        return special.settings.adjustOldDeltas && orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
    }

}));

animachEnhancedApp.addModule('chatCommands', function () {
    var IS_COMMAND = false;
    var prepareMessage = function (msg) {
        var askAnswers = ["100%", "Определенно да", "Да", "Вероятно", "Ни шанса", "Определенно нет", "Вероятность мала", "Нет", "50/50", "Фея устала и отвечать не будет", "Отказываюсь отвечать"];

        var randomQuotes = [
            'Не поддавайся сожалениям, о которых тебе напоминает прошлое.',
            'Честно говоря, я всегда думал, что лучше умереть, чем жить в одиночестве...',
            'Прошу прощения, но валите прочь.',
            'По-настоящему силён лишь тот, кто знает свои слабости.',
            'Быть умным и хорошо учиться — две разные вещи.',
            'Когда я стану главнокомандующим, я заставлю всех девушек носить мини-юбки!',
            'Тот кто правит временем, правит всем миром.',
            'Я должен познакомить тебя с моими друзьями. Они еще те извращенцы, но они хорошие люди.',
            'Победа не важна, если она лишь твоя.',
            'Наркотики убивают в людях человечность.',
            'Если бы меня волновало мнение других людей, то я давно бы уже покрасил волосы в другой цвет.',
            'Слезы — кровотечение души....',
            'Весело создавать что-то вместе.',
            'Как ты не понимаешь, что есть люди, которые умрут от горя, если тебя не станет!',
            'Я частенько слышал, что пары, которые внешне любят друг друга, частенько холодны внутри.',
            'Если хочешь, что бы люди поверили в мечту, сначала поверь в нее сам.',
            'Жизнь, в которой человек имеет всё, что желает, пуста и неинтересна.',
            'Чтобы чего-то достичь, необходимо чем-то пожертвовать.',
            'Я не одинока. Я просто люблю играть соло. Краситься, укорачивать юбку и заигрывать с парнями — это для потаскух.',
            'Очень страшно, когда ты не помнишь, кто ты такая.',
            'Больно помнить о своих слабостях.',
            'Похоже, мудрость и алкоголь несовместимы.',
            'Почему... Почему... Почему со мной вечно происходит какая-то херня?!',
            'Красивое нельзя ненавидеть.',
            'Если ты хочешь написать что-то плохое в комментариях в интернете, пиши, но это будет лишь выражением твоей зависти.',
            'Хочешь сбежать от повседневности — не останавливайся в развитии.',
            'Одинокие женщины ищут утешение в домашних животных.',
            'В эпоху, когда информация правит миром, жить без компьютера совершенно непростительно!',
            'Каждый человек одинок. Звезды в ночном небе тоже вроде бы все вместе, но на самом деле они разделены бездной. Холодной, тёмной, непреодолимой бездной.',
            'Умные люди умны ещё до того, как начинают учиться.',
            'Только те, у кого явные проблемы, говорят, что у них всё хорошо.',
            'Не важно если меня победит другой, но... Себе я не проиграю!',
            'Немногие способны на правильные поступки, когда это необходимо.',
            'Я мечтаю о мире, где все смогут улыбаться и спать, когда им того захочется.',
            'Девушке не обмануть меня… даже если она без трусиков!',
            'Это не мир скучный, это я не выделяюсь.',
            'С людьми без воображения одни проблемы.',
            'Нечестно это — своей слабостью шантажировать.',
            'То ли я уже не человек, то ли вы еще не люди.',
            'Чего я действительно опасаюсь, так это не потери своей памяти, а исчезновения из памяти остальных.',
            'Даже если небо погружено во тьму, и ничего не видно, где-то обязательно будет светиться звезда. Если она будет сиять ярче и ярче, её обязательно увидят...',
            'Никто не может нырнуть в бездну и вынырнуть прежним.',
            'Когда теряешь всё разом, мир начинает казаться довольно хреновым местечком.',
            'Не хочу видеть, что будет, когда Маяка узнает, что её шоколад украли. Не люблю ужастики.',
            'В мире есть добро потому, что есть кошки.',
            'Девчата, пойте! Зажигайте свет вашей души!',
            'И что ты собираешься делать, рождённый неизвестно зачем, и умирающий неизвестно за что?',
            'А давай станем с тобой чудовищами, и поставим весь мир на уши?',
            'Не забывай только, что и доброта может причинить боль.',
            'Тяжело признать плохим то, за что отдал 20 баксов.',
            'Говорят, в вере спасение… Но мне что-то никогда в это не верилось.',
            'Клубничка — это сердце тортика!',
            'Бабушка мне всегда говорила: «Юи-тян, ты запомнишь всё что угодно, но при этом ты забудешь всё остальное».',
            'Как жаль, что люди начинают ценить что-то только тогда, когда теряют это.',
            'У людей с холодными руками тёплое сердце.',
            'Я всегда думала, что это здорово: Посмеяться перед серьёзным делом.',
            'Мир не так жесток, как ты думаешь.',
            'Даже отдав все свои силы, не каждый способен стать победителем.',
            'Наше общество — просто стадо баранов.',
            'Пока сами чего-то не сделаете, это ваше «однажды» никогда не наступит.',
            'Чтобы что-то выбрать, нужно что-то потерять.',
            'За каждой улыбкой, что ты увидишь, будут скрываться чьи-то слёзы.',
            'Приключения — мечта настоящего мужчины!',
            'Твоя хитрость всегда будет оценена по достоинству.',
            'Я гораздо лучше орудую мечами, нежели словами.',
            'Прошлое всегда сияет ярче настоящего.',
            'Становиться взрослой так грустно...',
            'Романтические чувства — всего лишь химическая реакция',
            'Говорят, что в море ты или плывёшь, или тонешь.',
            'Не важно как ты осторожен, всегда есть опасность споткнуться.',
            'Я насилие не люблю, оно у меня само получается.',
            'Когда я смотрю аниме от КёАни, Господь подымает меня над полом и приближает к себе.',
            'Бака, бака, бака!',
            'Ты так говоришь, будто это что-то плохое.',
            'Мне вас жаль.',
            'Ваше мнение очень важно для нас.',
            'А в глубине души я всех вас ненавижу, как и весь этот мир.',
            'А разгадка одна — безблагодатность.',
            'Умерьте пыл.',
            'Меня трудно найти, легко потерять и невозможно забыть....',
            'Не твоя, вот ты и бесишься.',
            'Ваш ребенок - аниме.',
            'Здесь все твои друзья.',
            'Мне 20 и я бородат',
            'Ребята не стоит вскрывать эту тему. Вы молодые, шутливые, вам все легко. Это не то. Это не Чикатило и даже не архивы спецслужб. Сюда лучше не лезть. Серьезно, любой из вас будет жалеть. Лучше закройте тему и забудьте что тут писалось.',
            'Ты понимаешь, что ты няшка? Уже всё. Не я, блин, няшка… не он, блин, а ты!', 'Меня твои истории просто невероятно заинтересовали уже, я уже могу их слушать часами, блин! Одна история няшней другой просто!', 'НАЧАЛЬНИК, БЛИН, ЭТОТ НЯША ОБКАВАИЛСЯ! ИДИТЕ МОЙТЕ ЕГО, Я С НИМ ЗДЕСЬ НЯШИТСЯ БУДУ!', 'ЧЕГО ВЫ МЕНЯ С НЯШЕЙ ПОСЕЛИЛИ, БЛИН, ОН ЖЕ КАВАЙ ПОЛНЫЙ, БЛИН!!!',
            'Ну… Чаю выпил, блин, ну, бутылку, с одной тян. Ну, а потом под пледиком поняшились.',
            'Хочешь я на одной ноге понякаю, а ты мне погону отдашь? Как нека, хочешь?',
            'ЭТО ЗНАТЬ НАДО! ЭТО ЗОЛОТОЙ ФОНД, БЛИН!',
            'Как п… как поспал, онии-чан? Проголодался, наверное! Онии-чан…',
            'Ты что, обняшился что ли, няшка, блин?!',
            'Не, я не обняшился. Я тебе покушать принёс, Онии-чан!'
        ];


        IS_COMMAND = true;

        if (msg.indexOf("!r") === 0) {
            // if () {
            //     msg =
            // } else {
            //     msg = 'Расписание отсутствует';
            // }
        } else if (msg.indexOf("!pick ") === 0) {
            var variants = msg.split("!pick ")[1].split(",");
            msg = variants[Math.floor(Math.random() * (variants.length - 1))];
        } else if (msg.indexOf("!ask ") === 0) {
            msg = askAnswers[Math.floor(Math.random() * (askAnswers.length - 1))];
        } else if (msg.indexOf("!time") === 0) {
            var h = new Date().getHours();
            if (h < 10) {
                h = '0' + h;
            }

            var m = new Date().getMinutes();
            if (m < 10) {
                m = '0' + m;
            }

            msg = 'текущее время: ' + h + ':' + m;
        } else if (msg.indexOf("!dice") === 0) {
            msg= '' + (Math.floor(Math.random() * 5) + 1);
        } else if (msg.indexOf("!roll") === 0) {
            var randomNumber = Math.floor(Math.random() * 999);

            if (randomNumber < 100) {
                randomNumber = '0' + randomNumber;
            } else if (randomNumber < 10) {
                randomNumber= '00' + randomNumber;
            }

            msg = '' + randomNumber;
        } else if (msg.indexOf("!q") === 0) {
            if (randomQuotes.length === 0) {
                msg = 'цитаты отсутствуют';
            } else {
                msg = randomQuotes[Math.floor(Math.random() * (randomQuotes.length - 1))];
            }
        } else if (msg.indexOf("!skip") === 0 && hasPermission("voteskip")) {
            socket.emit("voteskip");
            msg = 'отдан голос за пропуск текущего видео';
        } else if (msg.indexOf("!next") === 0 && hasPermission("playlistjump")) {
            socket.emit("playNext");
            msg = 'начато проигрывание следующего видео';
        } else if (msg.indexOf("!bump") === 0 && hasPermission("playlistmove")) {
            var last = $("#queue").children().length;
            var uid = $("#queue .queue_entry:nth-child("+last+")").data("uid");
            var title = $("#queue .queue_entry:nth-child("+last+") .qe_title").html();
            socket.emit("moveMedia", {from: uid, after: PL_CURRENT});

            msg = 'поднято последнее видео: ' + title;
        } else if (msg.indexOf("!add ") === 0 && hasPermission("playlistadd")) {
            var parsed = parseMediaLink(msg.split("!add ")[1]);
            if (parsed.id === null) {
                msg = 'ошибка: неверная ссылка';
            } else {
                socket.emit("queue", {id: parsed.id, pos: "end", type: parsed.type});
                msg = 'видео было добавлено';
            }
        } else if (msg.indexOf("!now") === 0) {
            msg = 'сейчас играет: ' + $(".queue_active a").html();
        } else if (msg.indexOf("!sm") === 0) {
            var smilesArray = CHANNEL.emotes.map(function (smile) {
                return smile.name;
            });

            msg = smilesArray[Math.floor(Math.random() * smilesArray.length)] + ' ';
        } else if (msg.indexOf("!yoba") === 0) {
            var $yoba = $('<div class="yoba">').appendTo($(document.body));
            $('<img src="http://apachan.net/thumbs/201102/24/ku1yjahatfkc.jpg">').appendTo($yoba);

            var IMBA=new Audio("https://dl.dropboxusercontent.com/s/xdnpynq643ziq9o/inba.ogg");
            IMBA.volume=0.6;
            IMBA.play();
            var BGCHANGE = 0;
            var inbix = setInterval(function() {
                $("body").css('background-image', 'none');
                BGCHANGE++;

                if (BGCHANGE % 2 === 0) {
                    $("body").css('background-color', 'red');
                } else {
                    $("body").css('background-color', 'blue');
                }
            }, 200);

            setTimeout(function() {
                var BGCHANGE=0;
                clearInterval(inbix);
                $("body").css({'background-image':'', 'background-color':''});
                $yoba.remove();
            }, 12000);


            msg = 'YOBA';
        } else {
            IS_COMMAND = false;
        }

        return msg;
    };

    var sendUserChatMessage = function (e) {
        if(e.keyCode === 13) {
            if (CHATTHROTTLE) {
                return;
            }

            var msg = $("#chatline").val().trim();

            if(msg !== '') {
                var meta = {};

                if (USEROPTS.adminhat && CLIENT.rank >= 255) {
                    msg = "/a " + msg;
                } else if (USEROPTS.modhat && CLIENT.rank >= Rank.Moderator) {
                    meta.modflair = CLIENT.rank;
                }

                // The /m command no longer exists, so emulate it clientside
                if (CLIENT.rank >= 2 && msg.indexOf("/m ") === 0) {
                    meta.modflair = CLIENT.rank;
                    msg = msg.substring(3);
                }


                var msgForCommand = prepareMessage(msg);

                if (IS_COMMAND) {
                    socket.emit("chatMsg", {msg: msg, meta: meta});
                    socket.emit("chatMsg", {msg: 'Сырно: ' + msgForCommand});

                    IS_COMMAND = false;
                } else {
                    socket.emit("chatMsg", {msg: msg, meta: meta});
                }


                CHATHIST.push($("#chatline").val());
                CHATHISTIDX = CHATHIST.length;
                $("#chatline").val('');
            }

            return;
        }
        else if(e.keyCode === 9) { // Tab completion
            chatTabComplete();
            e.preventDefault();
            return false;
        }
        else if(e.keyCode === 38) { // Up arrow (input history)
            if(CHATHISTIDX == CHATHIST.length) {
                CHATHIST.push($("#chatline").val());
            }
            if(CHATHISTIDX > 0) {
                CHATHISTIDX--;
                $("#chatline").val(CHATHIST[CHATHISTIDX]);
            }

            e.preventDefault();
            return false;
        }
        else if(e.keyCode === 40) { // Down arrow (input history)
            if(CHATHISTIDX < CHATHIST.length - 1) {
                CHATHISTIDX++;
                $("#chatline").val(CHATHIST[CHATHISTIDX]);
            }

            e.preventDefault();
            return false;
        }
    };

    $('#chatline, #chatbtn').unbind();

    $('#chatline').on('keydown', sendUserChatMessage);
    $('#chatbtn').on('click', sendUserChatMessage);
});

animachEnhancedApp.addModule('chatControls', function () {
    var $afkButton = $('<span id="afk-btn" class="label label-default pull-right pointer">АФК</span>')
        .appendTo($('#chatheader'))
        .on('click', function () {
            socket.emit('chatMsg', {msg: '/afk'});
        });

    socket.on('setAFK', function (data) {
        if (data.name === CLIENT.name) {
            if (data.afk) {
                $afkButton.removeClass('label-default');
                $afkButton.addClass('label-success');
            } else {
                $afkButton.addClass('label-default');
                $afkButton.removeClass('label-success');
            }
        }
    });


    if (hasPermission("chatclear")) {
        var $clearChatButton = $('<span id="clear-chat-btn" class="label label-default pull-right pointer">Очистить чат</span>')
            .insertAfter($afkButton)
            .on('click', function () {
                if (confirm('Вы уверены, что хотите очистить чат?')) {
    				socket.emit("chatMsg", {msg: '/clear'});
    			}
            });
    }
});

animachEnhancedApp.addModule('chatHelp', function (app) {
    if ($('#chat-controls').length === 0) {
        $('<div id="chat-controls" class="btn-group">').appendTo("#chatwrap");
    }

    $('<button id="chat-help-btn" class="btn btn-sm btn-default">Список команд</button>').appendTo($('#chat-controls'))
        .on('click', function () {
            var $bodyWrapper = $('<div>');
            var $ul;
            var commands;
            var command;

            if (app.permittedModules.chatCommands === true) {
                commands = {
                    'r': 'показать расписание',
                    'pick':'выбор случайной опции из указанного списка слов, разделенных запятыми (Например: <i>!pick japan,korea,china</i>)',
                    'ask':'задать вопрос с вариантами ответа да/нет (Например: <i>!ask Сегодня пойдет дождь?</i>)',
                    'q':'показать случайную цитату',
                    'sm': 'показать случайный смайлик',
                    'dice':'кинуть кубики',
                    'roll':'случайное трехзначное число',
                    'time':'показать текущее время',
                    'now':'displaying current playing title (<i>!now</i>)',
                    'skip':'проголосовать за пропуск текущего видео (<i>!skip</i>)',
                    'add':'добавляет видео в конец плейлиста (Например: <i>!add https://www.youtube.com/watch?v=29FFHC2D12Q</i>)',
                    'stat': 'показать статистику за данную сессию (<i>!stat</i>)',
                    'yoba': 'секретная команда'
                };

                $bodyWrapper.append('<p><strong>Новые команды чата</strong><p>');
                $ul = $('<ul>').appendTo($bodyWrapper);
                for (command in commands) {
                    $ul.append('<li><code>!'+command+'</code> - '+commands[command]+'</li>');
                }
            }


            commands = {
                'me':'%username% что-то сделал. Например: <i>/me танцует</i>',
                'sp':'Спойлер',
                'afk':'Устанавливает статус "Отошёл".',
            };

            $bodyWrapper.append('<p><strong>Стандартные команды</strong><p>');
            $ul = $('<ul>').appendTo($bodyWrapper);
            for (command in commands) {
                $ul.append('<li><code>/'+command+'</code> - '+commands[command]+'</li>');
            }

            var $modalWindow = createModalWindow('Список команд', $bodyWrapper);
        });
});

animachEnhancedApp.addModule('favouritePictures', function (app) {
    if ($('#chat-panel').length === 0) {
        $('<div id="chat-panel" class="row">').insertAfter("#main");
    }

    if ($('#chat-controls').length === 0) {
        $('<div id="chat-controls" class="btn-group">').appendTo("#chatwrap");
    }

    var $favouritePicturesBtn = $('<button id="favourite-pictures-btn" class="btn btn-sm btn-default" title="Показать избранные картинки">')
        .html('<i class="glyphicon glyphicon-th"></i>');
    if ($('#smiles-btn').length !== 0) {
        $('#smiles-btn').after($favouritePicturesBtn);
    } else {
        $favouritePicturesBtn.prependTo($('#chat-controls'));
    }

    var $favouritePicturesPanel = $('<div id="favourite-pictures-panel">')
        .appendTo($('#chat-panel'))
        .hide();
    var $favouritePicturesBodyPanel = $('<div id="pictures-body-panel" class="row">')
        .appendTo($favouritePicturesPanel);
    var $favouritePicturesControlPanel = $('<div id="pictures-control-panel" class="row">')
        .appendTo($favouritePicturesPanel);

    var $favouritePicturesControlPanelForm = $('<div class="col-md-12">')
        .html('<div class="input-group">' +
            '<span class="input-group-btn">' +
                '<button id="pictures-export" class="btn btn-default" style="border-radius: 0;" type="button">Экспорт картинок</button>' +
            '</span>' +
             '<span class="input-group-btn">' +
                '<label for="pictures-import" class="btn btn-default" style="border-radius: 0;">Импорт картинок</label>' +
                '<input type="file" style="display: none" id="pictures-import" name="pictures-import">' +
            '</span>' +
            '<input type="text" id="add-picture-address" class="form-control" placeholder="Адрес картинки">' +
            '<span class="input-group-btn">' +
                '<button id="add-picture-btn" class="btn btn-default" style="border-radius: 0;" type="button">Добавить</button>' +
            '</span>' +
            '<span class="input-group-btn">' +
                '<button id="remove-picture-btn" class="btn btn-default" type="button">Удалить</button>' +
            '</span>' +
        '</div>')
        .appendTo($favouritePicturesControlPanel);


    var renderFavouritePictures = function () {
        var favouritePictures = JSON.parse(window.localStorage.getItem('favouritePictures')) || [];

        $favouritePicturesBodyPanel.empty();

        var escapedAddress;
        var entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;'
        };
        for (var n = 0, favouritePicturesLen = favouritePictures.length; n < favouritePicturesLen; n++) {
            escapedAddress = favouritePictures[n].replace(/[&<>"']/g, function (s) {
                return entityMap[s];
            });

            $('<img onclick="insertText(\' ' + escapedAddress + ' \')">')
                 .attr({src: escapedAddress})
                  .appendTo($favouritePicturesBodyPanel);
        }
    };
    renderFavouritePictures();


    $favouritePicturesBtn.on('click', function() {
        var isSmilesAndPictures = app.permittedModules.userConfig === true && app.modules.userConfig !== undefined && app.modules.userConfig.options['smiles-and-pictures'] === true;

        if ($('#smiles-panel').length !== 0 && !isSmilesAndPictures) {
            $('#smiles-panel').hide();
        }

        $favouritePicturesPanel.toggle();


        if (!isSmilesAndPictures) {
            if ($(this).hasClass('btn-default')) {
                if ($('#smiles-btn').length !== 0 && $('#smiles-btn').hasClass('btn-success')) {
                    $('#smiles-btn').removeClass('btn-success');
                    $('#smiles-btn').addClass('btn-default');
                }

                $(this).removeClass('btn-default');
                $(this).addClass('btn-success');
            } else {
                $(this).removeClass('btn-success');
                $(this).addClass('btn-default');
            }
        }
    });

    $(document.body).on('click', '.chat-picture', function () {
        $picture = $('<img src="' + $(this).prop('src') + '">');

        $picture.ready(function () {
            var $modalPictureOverlay = $('<div id="modal-picture-overlay">').appendTo($(document.body));
            var $modalPicture = $('<div id="modal-picture">').appendTo($(document.body)).draggable();

            var pictureWidth = $picture.prop('width');
            var pictureHeight = $picture.prop('height');


            var $modalPictureOptions = $('<div id="modal-picture-options">');
            $modalPicture.append($('<div id="modal-picture-options-wrapper">').append($modalPictureOptions));

            var $openImageBtn = $('<a href="' + $picture.prop('src') + '" target="_blank" class="btn btn-sm btn-default" style="width:40px;"><i class="glyphicon glyphicon-eye-open"></i></button>')
                .appendTo($modalPictureOptions);

            var $searchByPictureBtn = $('<a href="https://www.google.nl/searchbyimage?image_url=' + $picture.prop('src') + '" target="_blank" class="btn btn-sm btn-default" style="width:40px;"><i class="glyphicon glyphicon-search"></i></button>')
                .appendTo($modalPictureOptions);


            if (pictureWidth > document.documentElement.clientWidth || pictureHeight > document.documentElement.clientHeight) {
                var scaleFactor;
                if (pictureWidth > pictureHeight) {
                    scaleFactor = pictureWidth / (document.documentElement.clientWidth * 0.8);

                    pictureHeight /= scaleFactor;
                    pictureWidth /= scaleFactor;
                } else {
                    scaleFactor = pictureHeight / (document.documentElement.clientHeight * 0.8);

                    pictureHeight /= scaleFactor;
                    pictureWidth /= scaleFactor;
                }
            }

            $modalPicture.css({
                width: pictureWidth,
                height: pictureHeight,
                marginLeft: -(pictureWidth / 2),
                marginTop: -(pictureHeight / 2),
            });


            $picture.appendTo($modalPicture);
        });
    });

    $(document.body).on('mousewheel', '#modal-picture', function (e) {
        var ZOOM_CONST = 0.15;
        var pictureWidth = parseInt($('#modal-picture').css('width'), 10);
        var pictureHeight = parseInt($('#modal-picture').css('height'), 10);
        var pictureMarginLeft = parseInt($('#modal-picture').css('marginLeft'), 10);
        var pictureMarginTop = parseInt($('#modal-picture').css('marginTop'), 10);

        if (e.deltaY > 0) { //up
            $('#modal-picture').css({
                width: pictureWidth * (1 + ZOOM_CONST),
                height: pictureHeight * (1 + ZOOM_CONST),
                marginLeft: pictureMarginLeft + (-pictureWidth * ZOOM_CONST / 2),
                marginTop: pictureMarginTop + (-pictureHeight * ZOOM_CONST / 2),
            });
        } else { //down
            $('#modal-picture').css({
                width: pictureWidth * (1 - ZOOM_CONST),
                height: pictureHeight * (1 - ZOOM_CONST),
                marginLeft: pictureMarginLeft + (pictureWidth * ZOOM_CONST / 2),
                marginTop: pictureMarginTop + (pictureHeight * ZOOM_CONST / 2),
            });
        }
    });

    $(document.body).on('click', '#modal-picture-overlay, #modal-picture', function () {
        $('#modal-picture-overlay').remove();
        $('#modal-picture').remove();
    });

    $(document.body).on('keydown', function (e) {
        if (e.which === 27 && $('#modal-picture').length !== 0) {
            $('#modal-picture-overlay').remove();
            $('#modal-picture').remove();
        }
    });

    $('#add-picture-btn').on('click', function () {
        favouritePictures = JSON.parse(window.localStorage.getItem('favouritePictures')) || [];

        if (favouritePictures.indexOf($('#add-picture-address').val()) === -1) {
            if ($('#add-picture-address').val() !== '') {
                favouritePictures.push($('#add-picture-address').val());
            }
        } else {
            makeAlert("Такая картинка уже была добавлена").prependTo($favouritePicturesBodyPanel);
            $('#add-picture-address').val('');

            return false;
        }
        $('#add-picture-address').val('');

        window.localStorage.setItem('favouritePictures', JSON.stringify(favouritePictures));

        renderFavouritePictures();

        return false;
    });

    $('#remove-picture-btn').on('click', function () {
        favouritePictures = JSON.parse(window.localStorage.getItem('favouritePictures')) || [];

        var removePosition = favouritePictures.indexOf($('#add-picture-address').val());
        if (removePosition !== -1) {
            favouritePictures.splice(removePosition, 1);

            window.localStorage.setItem('favouritePictures', JSON.stringify(favouritePictures));

            renderFavouritePictures();
        }

        $('#add-picture-address').val('');

        return false;
    });

    $('#pictures-export').on('click', function () {
        var $downloadLink = $('<a>')
            .attr({
                href: 'data:text/plain;charset=utf-8,' + encodeURIComponent(window.localStorage.getItem('favouritePictures') || JSON.stringify([])),
                download: 'animach_images.txt'
            })
            .hide()
            .appendTo($(document.body));

        $downloadLink[0].click();

        $downloadLink.remove();
    });

    $('#pictures-import').on('change', function (e) {
        var importFile = e.target.files[0];
        var favouritePicturesAdressesReader = new FileReader();

        favouritePicturesAdressesReader.addEventListener('load', function(e) {
            window.localStorage.setItem('favouritePictures', e.target.result);

            renderFavouritePictures();
        });

        favouritePicturesAdressesReader.readAsText(importFile);

        return false;
    });
});

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

    var fixIframeCut = function () {
        $('#motd-tabs-content').find('.motd-tab-content').each(function () {
            $(this).html($(this).html().replace(/\[iframe(.*?)\](.*?)[/iframe]]/g, '<iframe $1>$2</iframe>'));
        });
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

    var $tabSettingsBtn = $('<button type="button" class="btn btn-primary" id="show-tabs-settings">Показать настройки вкладок</button>')
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

    var $channelDescriptionInputWrapper = $('<div class="form-group">').appendTo($tabsSettings);
    var $channelDescriptionLabel = $('<label for="channel-description-input">Описание канала</label>').appendTo($channelDescriptionInputWrapper);
    var $channelDescriptionInput = $('<input id="channel-description-input" placeholder="Описание канала" class="form-control">').appendTo($channelDescriptionInputWrapper);

    var $tabsArea = $('<div id="tabs-settings-area">')
        .html('<p>Вкладки</p>')
        .appendTo($tabsSettings);

    var $addTabToTabsSettingsBtn = $('<button type="button" class="btn btn-default" id="tabs-settings-add">Добавить вкладку</button>')
        .appendTo($tabsSettings)
        .on('click', function () {
            addTabInput($tabsArea);
        });

    var $removeLastTabFromTabsSettingsBtn = $('<button type="button" class="btn btn-default" id="tabs-settings-remove">Удалить последнюю вкладку</button>')
        .appendTo($tabsSettings)
        .on('click', function () {
            $tabsArea.children('.tab-option-wrapper').last().remove();
        });


    var $generateTabsHtml = $('<button type="button" class="btn btn-default" id="tabs-settings-add">Преобразовать в HTML в редакторе ниже</button>')
        .appendTo($tabsSettings)
        .on('click', function () {
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


    $('#cs-motdtext').before('<hr>');




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

    fixIframeCut();




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

animachEnhancedApp.addModule('progressBar', function () {
    var $titlerow = $('<div id="titlerow" class="row" />').insertBefore("#main");
	var $titlerowouter = $('<div id="titlerow-outer" class="col-md-12" />')
        .html($("#currenttitle").text($(".queue_active a").text() !== '' ? $("#currenttitle").text().replace(/^Currently Playing:/, 'Сейчас:') : '').detach())
        .appendTo($titlerow);
	var $mediainfo = $('<p id="mediainfo">').prependTo("#videowrap");

    var showPlaylistInfo = function () {
//        $("#currenttitle").text($("#currenttitle").text().replace('Currently Playing:', 'Сейчас: '));
//
//        var infoString = 'СЛЕДУЩЕЕ:';
//
//        var $currentItem = $(".queue_active");
//        for (var position = 1; position <= 3; position++) {
//            $currentItem = $currentItem.next();
//            if ($currentItem.length !== 0) {
//                infoString += ' ' + position + ' ▸ ' + $currentItem.children('a').html() + ' (' + $currentItem.prop('title').replace('Added by: ', '') + ')';
//            }
//        }
//
//        if ($currentItem.length === 0) {
//            infoString += ' // КОНЕЦ ПЛЕЙЛИСТА //';
//        }
//
//		$mediainfo.html('<marquee scrollamount="5">' + infoString + '</marquee>');
        if ($(".queue_active").length !== 0) {
            $("#currenttitle").text($("#currenttitle").text().replace(/^Currently Playing:/, 'Сейчас:'));

            $mediainfo.text($('.queue_active').attr('title').replace('Added by', 'Добавлено'));
        } else {
            $("#currenttitle").text('');

            $mediainfo.text('Ничего не воспроизводится');
        }
    };
    showPlaylistInfo();

    socket.on("changeMedia", showPlaylistInfo);
});

animachEnhancedApp.addModule('schedule', function (app) {
     //if (app.permittedModules.navMenuTabs === true) {
     //
     //} else if (app.permittedModules.chatHelp === true) {
     //
     //} else {
     //
     //}
});

animachEnhancedApp.addModule('smiles', function (app) {
    if ($('#chat-panel').length === 0) {
        $('<div id="chat-panel" class="row">').insertAfter("#main");
    }

    if ($('#chat-controls').length === 0) {
        $('<div id="chat-controls" class="btn-group">').appendTo("#chatwrap");
    }

    $('#emotelistbtn').hide();

    var $smilesBtn = $('<button id="smiles-btn" class="btn btn-sm btn-default" title="Показать смайлики">')
        .html('<i class="glyphicon glyphicon-picture"></i>')
        .prependTo($('#chat-controls'));

    var $smilesPanel = $('<div id="smiles-panel">')
        .prependTo($('#chat-panel'))
        .hide();

    var rendersmiles = function () {
        var smiles = CHANNEL.emotes;

        for (var n = 0, smilesLen = smiles.length; n < smilesLen; n++) {
            $('<img onclick="insertText(\' ' + smiles[n].name + ' \')">')
                 .attr({src: smiles[n].image})
                  .appendTo($smilesPanel);
        }
    };
    rendersmiles();

    $smilesBtn.on('click', function() {
        var isSmilesAndPictures = app.permittedModules.userConfig === true && app.modules.userConfig !== undefined && app.modules.userConfig.options['smiles-and-pictures'] === true;

        if ($('#favourite-pictures-panel').length !== 0 && !isSmilesAndPictures) {
            $('#favourite-pictures-panel').hide();
        }

        $smilesPanel.toggle();

        if (!isSmilesAndPictures) {
            if ($(this).hasClass('btn-default')) {
                if ($('#favourite-pictures-btn').length !== 0 && $('#favourite-pictures-btn').hasClass('btn-success')) {
                    $('#favourite-pictures-btn').removeClass('btn-success');
                    $('#favourite-pictures-btn').addClass('btn-default');
                }

                $(this).removeClass('btn-default');
                $(this).addClass('btn-success');
            } else {
                $(this).removeClass('btn-success');
                $(this).addClass('btn-default');
            }
        }
    });
});

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
        Layout: 'Оформление',
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

animachEnhancedApp.addModule('userConfig', function () {
    var layoutOptions = {
        'hide-header': {
            title: 'Скрывать шапку',
            'default': 'no',
            values: {
                yes: 'Да',
                no: 'Нет'
            }
        },
        'player-position': {
            title: 'Положение плеера',
            'default': 'right',
            values: {
                left: 'Слева',
                right: 'Справа',
                center: 'По центру'
            }
        },
        'playlist-position': {
            title: 'Положение плейлиста',
            'default': 'right',
            values: {
                left: 'Слева',
                right: 'Справа'
            }
        },
        'userlist-position': {
            title: 'Позиция списка пользователей чата',
            'default': 'left',
            values: {
                left: 'Слева',
                right: 'Справа'
            }
        }
    };

    var UserConfig = function () {
        this.options = {};

        this.set = function (name, value) {
            this.options[name] = value;
            setOpt(CHANNEL.name + "_config-" + name, value);
        };

        this.get = function (name) {
            return this.options[name];
        };

        this.toggle = function (name) {
            var result = !userConfig.get(name);

            userConfig.set(name, result);

            return result;
        };

        this.loadOption = function (name, defaultValue) {
            var option = getOrDefault(CHANNEL.name + "_config-" + name, defaultValue);

            if (this.configFunctions[name] !== undefined) {
                this.configFunctions[name](option);
            }

            return option;
        };
    };


    var userConfig = new UserConfig();

    userConfig.loadDefaults = function () {
        var options = this.options;


        options.minimize = this.loadOption('minimize', false);

        if ($('#smiles-btn').length !== 0 && $('#favourite-pictures-btn').length !== 0) {
            options['smiles-and-pictures'] = this.loadOption('smiles-and-pictures', false);
        }

        for (var layoutOption in layoutOptions) {
            options[layoutOption] = this.loadOption(layoutOption, layoutOptions[layoutOption].default || false);
        }
        options['user-css'] = this.loadOption('user-css', '');
    };

    userConfig.configFunctions = {
        minimize: function (isMinimized) {
            if (isMinimized) {
                $('#motdrow').hide();
                $('#queue').parent().hide();
                $configWrapper.hide();

                $minBtn.removeClass('btn-default');
                $minBtn.addClass('btn-success');
            } else {
                $('#motdrow').show();
                $('#queue').parent().show();
                $configWrapper.show();

                $minBtn.removeClass('btn-success');
                $minBtn.addClass('btn-default');
            }
        },
        'smiles-and-pictures': function (isTurnedOn) {
            if (isTurnedOn) {
                $smilesAndPicturesBtn.removeClass('btn-default');
                $smilesAndPicturesBtn.addClass('btn-success');

                $('#smiles-btn').hide();
                $('#smiles-panel').hide();
                $('#smiles-btn').addClass('btn-default');
                $('#smiles-btn').removeClass('btn-success');

                $('#favourite-pictures-btn').hide();
                $('#favourite-pictures-panel').hide();
                $('#favourite-pictures-btn').addClass('btn-default');
                $('#favourite-pictures-btn').removeClass('btn-success');

                $('<button id="smiles-and-picture-btn" class="btn btn-sm btn-default" title="Показать смайлики и избранные картинки">')
                    .html('<i class="glyphicon glyphicon-picture"></i> и <i class="glyphicon glyphicon-th"></i>')
                    .prependTo($('#chat-controls'))
                    .on('click', function () {
                        $('#smiles-btn').click();
                        $('#favourite-pictures-btn').click();

                        if ($(this).hasClass('btn-default')) {
                            $(this).removeClass('btn-default');
                            $(this).addClass('btn-success');
                        } else {
                            $(this).removeClass('btn-success');
                            $(this).addClass('btn-default');
                        }
                    });
            } else {
                $('#smiles-and-picture-btn').remove();

                $smilesAndPicturesBtn.addClass('btn-default');
                $smilesAndPicturesBtn.removeClass('btn-success');

                $('#smiles-btn').show();
                $('#favourite-pictures-btn').show();

                $('#smiles-panel').hide();
                $('#favourite-pictures-panel').hide();

                if ($('#smiles-and-picture-btn').length !== 0) {
                    $('#smiles-and-picture-btn').remove();
                }
            }
        },
        'user-layout': function (userConfig) {
            var $settingsWrapper = $('<div class="form-horizontal">');

            for (var layoutOption in layoutOptions) {
                var $formGroup = $('<div class="form-group">').appendTo($settingsWrapper);

                var $label = $('<label for="' + layoutOption + '" class="col-sm-2 control-label">' + layoutOptions[layoutOption].title + '</label>').appendTo($formGroup);

                var $selectWrapper = $('<div class="col-sm-10">').appendTo($formGroup);
                var $select = $('<select id="' + layoutOption + '" class="form-control">').appendTo($selectWrapper);

                for (var selectOption in layoutOptions[layoutOption].values) {
                    var $selectOption = $('<option value="' + selectOption + '">' + layoutOptions[layoutOption].values[selectOption] + '</option>').appendTo($select);

                    if (selectOption === userConfig.get(layoutOption)) {
                        $select.val(selectOption);
                    }
                }
            }

            var $userCssWrapper = $('<div class="form-group">').appendTo($settingsWrapper);
            var $userCssLabel = $('<label for="user-css" class="col-sm-2 control-label">Пользовательское CSS</label>').appendTo($userCssWrapper);
            var $userCssTextareaWrapper = $('<div class="col-sm-10">').appendTo($userCssWrapper);
            var $userCssTextarea = $('<textarea id="user-css" class="form-control" rows="7">')
                .appendTo($userCssTextareaWrapper)
                .val(userConfig.get('user-css'));

            var $btnWrapper = $('<div>');

            $('<button type="button" id="reset-user-layout" class="btn btn-info" data-dismiss="modal">Отмена</button>').appendTo($btnWrapper);

            $('<button type="button" id="reset-user-layout" class="btn btn-danger">Сбросить настройки</button>')
                .appendTo($btnWrapper)
                .on('click', function () {
                    if (confirm('Все настройки, в том числе и пользовательское CSS будут сброшены, вы уверены?')) {
                        for (var layoutOption in layoutOptions) {
                            userConfig.set(layoutOption, layoutOptions[layoutOption].default);
                        }

                        userConfig.set('user-css', '');

                        applyLayoutSettings();
                        $modalWindow.modal('hide');
                    }
                });

            $('<button type="button" id="save-user-layout" class="btn btn-success">Сохранить</button>')
                .appendTo($btnWrapper)
                .on('click', function () {
                    for (var layoutOption in layoutOptions) {
                        if ($('#' + layoutOption).length !== 0) {
                            userConfig.set(layoutOption, $('#' + layoutOption).val());
                        }
                    }

                    if ($('#user-css').length !== 0) {
                        userConfig.set('user-css', $('#user-css').val());
                    }

                    applyLayoutSettings();
                    $modalWindow.modal('hide');
                });


            var $modalWindow = createModalWindow('Настройки оформления', $settingsWrapper, $btnWrapper);
        }
    };


    var $configWrapper = $('<div id="config-wrapper" class="col-lg-12 col-md-12">').appendTo("#leftpane-inner");
    var $configBody = $('<div id="config-body" class="well form-horizontal">').appendTo($configWrapper);
    var $configBtn = $('<button id="layout-btn" class="btn btn-sm btn-default pull-right">')
        .html('<span class="glyphicon glyphicon-cog"></span> Настройки')
        .appendTo('#leftcontrols')
        .on('click', function() {
            $configWrapper.toggle();
        });


    var $layoutForm = $('<div id="layout-config-form" class="form-group">').appendTo($configBody)
        .append($('<div class="col-lg-3 col-md-3 control-label">Оформление</div>'));
    var $layoutWrapper = $('<div id="layout-config-wrapper" class="col-lg-9 col-md-9 text-center">').appendTo($layoutForm);
    var $layoutBtnWrapper = $('<div id="layout-config-btn-wrapper" class="btn-group">').appendTo($layoutWrapper);

    var $layoutConfigBtn = $('<button id="layout-configuration-btn" class="btn btn-default">Настройка</button>')
        .appendTo($layoutBtnWrapper)
        .on('click', function() {
            userConfig.configFunctions['user-layout'](userConfig);
        });

    var $minBtn = $('<button id="layout-min-btn" class="btn btn-default">Минимизировать</button>')
        .appendTo($layoutBtnWrapper)
        .on('click', function() {
            var isMinimized = userConfig.toggle('minimize');
            userConfig.configFunctions.minimize(isMinimized);
        });


    var $commonConfigForm = $('<div id="common-config-form" class="form-group">').appendTo($configBody)
        .append($('<div class="col-lg-3 col-md-3 control-label">Общее</div>'));
    var $commonConfigWrapper = $('<div id="common-config-wrapper" class="col-lg-9 col-md-9 text-center">').appendTo($commonConfigForm);
    var $commonConfigBtnWrapper = $('<div id="common-config-btn-wrapper" class="btn-group">').appendTo($commonConfigWrapper);

    if ($('#smiles-btn').length !== 0 && $('#favourite-pictures-btn').length !== 0) {
        var $smilesAndPicturesBtn = $('<button id="common-config-smiles-and-pictures-btn" class="btn btn-default"></button>')
            .html('<i class="glyphicon glyphicon-picture"></i> и <i class="glyphicon glyphicon-th"></i>')
            .appendTo($commonConfigBtnWrapper)
            .on('click', function() {
                var isTurnedOn = userConfig.toggle('smiles-and-pictures');
                userConfig.configFunctions['smiles-and-pictures'](isTurnedOn);
            });
    }

    var applyLayoutSettings = function () {
        if (userConfig.get('hide-header') === 'yes') {
            $('#motdrow').hide();
            //TODO: приделать кнопку расписания к чату
        } else { //no
            $('#motdrow').show();
        }

        if (userConfig.get('player-position') === 'left') {
            if ($('#chatwrap').hasClass('col-md-10 col-md-offset-1')) {
                $('#chatwrap').removeClass('col-md-10 col-md-offset-1');
                $('#chatwrap').addClass('col-lg-5 col-md-5');
            }
            if ($('#videowrap').hasClass('col-md-10 col-md-offset-1')) {
                $('#videowrap').removeClass('col-md-10 col-md-offset-1');
                $('#videowrap').addClass('col-lg-7 col-md-7');
            }

            $('#videowrap').detach().insertBefore($('#chatwrap'));
        } else if (userConfig.get('player-position') === 'center') {
            $('#chatwrap').removeClass('col-lg-5 col-md-5');
            $('#videowrap').removeClass('col-lg-7 col-md-7');

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

        if (userConfig.get('playlist-position') === 'left') {
            $('#rightcontrols').detach().insertBefore($('#leftcontrols'));
            $('#rightpane').detach().insertBefore($('#leftpane'));
        } else { //right
            $('#leftcontrols').detach().insertBefore($('#rightcontrols'));
            $('#leftpane').detach().insertBefore($('#rightpane'));
        }

        if (userConfig.get('userlist-position') === 'right') {
            $('#userlist').addClass('pull-right');
        } else {
            $('#userlist').removeClass('pull-right');
        }

        if (userConfig.get('user-css') !== '') {
            $("head").append('<style id="user-style" type="text/css">' + userConfig.get('user-css') + '</style>');
        } else if ($('#user-style').length !== 0) {
            $('#user-style').remove();
        }


        $('#refresh-video').click();
    };

    userConfig.loadDefaults();

    $configWrapper.hide();
    applyLayoutSettings();


    return userConfig;
});

animachEnhancedApp.addModule('utils', function () {
    $('#wrap').find('.navbar-fixed-top').removeClass('navbar-fixed-top');

    $('#messagebuffer').on('click', '.username', function() {
        $('#chatline').val($(this).text() + $("#chatline").val()).focus();
    });

    insertText = function (str) {
        $("#chatline").val($("#chatline").val()+str).focus();
    };

    createModalWindow = function($headerContent, $bodyContent, $footerContent) {
        var $outer = $('<div class="modal fade chat-help-modal" role="dialog" tabindex="-1">').appendTo($("body"));
        var $modal = $('<div class="modal-dialog modal-lg">').appendTo($outer);
        var $content = $('<div class="modal-content">').appendTo($modal);

        if ($headerContent !== undefined) {
            var $header = $('<div class="modal-header">').appendTo($content);

            $('<button type="button" class="close" data-dismiss="modal" aria-label="Закрыть">').html('<span aria-hidden="true">&times;</span>').appendTo($header);
            $('<h3 class="modal-title">').append($headerContent).appendTo($header);
        }

        if ($bodyContent !== undefined) {
            $('<div class="modal-body">').append($bodyContent).appendTo($content);
        }

        if ($footerContent !== undefined) {
            $('<div class="modal-footer">').append($footerContent).appendTo($content);
        }

        $outer.on('hidden.bs.modal', function () {
            $(this).remove();
        });

        $outer.modal({keyboard: true});

        return $outer;
    };





    //Only for Google docs
    //https://developers.google.com/youtube/js_api_reference?hl=ru
    youtubeJavascriptPlayer = function (data) {
        var self = this;

        self.videoId = data.id;
        self.videoLength = data.seconds;

        self.init = function () {
            removeOld();

            self.videoURL = 'https://video.google.com/get_player?wmode=opaque&ps=docs&partnerid=30&version=3'; //Basic URL to the Player
            self.videoURL += '&docid=' + self.videoId; //Specify the fileID ofthe file to show
            self.videoURL += '&autoplay=1';
            self.videoURL += '&fs=1';
            self.videoURL += '&showinfo=0';
            self.videoURL += '&vq=' + (USEROPTS.default_quality || "auto");
            self.videoURL += '&start=' + parseInt(data.currentTime, 10);
            self.videoURL += '&enablejsapi=1'; //Enable Youtube Js API to interact with the video editor
            self.videoURL += '&playerapiid=' + self.videoId; //Give the video player the same name as the video for future reference
            self.videoURL += '&cc_load_policy=0'; //No caption on this video (not supported for Google Drive Videos)

            var atts = {
                id: "ytapiplayer"
            };
            var params = {
                allowScriptAccess: "always",
                allowFullScreen: "true"
            };
            swfobject.embedSWF(self.videoURL,
                "ytapiplayer",
                VWIDTH,
                VHEIGHT,
                "8",
                null,
                null,
                params,
                atts);

            onYouTubePlayerReady = function (playerId) {
                self.player = document.getElementById("ytapiplayer");
                self.player.addEventListener("onStateChange", "onytplayerStateChange");
            };

            onytplayerStateChange = function (newState) {
                var statesMap = {
                    '-1': 'beforeVideo',
                    0: 'end',
                    1: 'play',
                    2: 'pause',
                    3: 'buf',
                    5: 'queue'
                };


                if (statesMap[newState] === 'beforeVideo') {
                    self.setVolume(VOLUME);
                } else if (statesMap[newState] === 'play') {
                    PLAYER.paused = false;

                    if (CLIENT.leader) {
                        sendVideoUpdate();
                    }
                } else if (statesMap[newState] === 'pause') {
                    PLAYER.paused = true;

                    if (CLIENT.leader) {
                        sendVideoUpdate();
                    }
                } else if (statesMap[newState] === 'end') {
                    if (CLIENT.leader) {
                        socket.emit("playNext");
                    }
                }
            };
        };

        self.load = function (data) {
            self.videoId = data.id;
            self.videoLength = data.seconds;
            self.init();
        };

        self.pause = function () {
            if (self.player && self.player.pauseVideo) {
                self.player.pauseVideo();
            }
        };

        self.play = function () {
            if (self.player && self.player.playVideo) {
                self.player.playVideo();
            }
        };

        self.getTime = function (callback) {
            if (self.player && self.player.getCurrentTime) {
                var t = parseFloat(self.player.getCurrentTime());
                callback(t);
            }
        };

        self.seek = function (time) {
            if (self.player.seekTo) {
                self.player.seekTo(time);
            }
        };

        self.getVolume = function (callback) {
            if (self.player && self.player.getVolume) {
                callback(self.player.getVolume() / 100);
            }
        };

        self.setVolume = function (volume) {
            self.player.setVolume(volume * 100);
        };

        self.init();
    };
});

animachEnhancedApp.addModule('videoControls', function () {
    $('#mediarefresh').hide();


    var $topVideoControls = $('<div id="top-video-controls" class="btn-group">').appendTo("#videowrap");


    var $refreshVideoBtn = $('<button id="refresh-video" class="btn btn-sm btn-default" title="Обновить видео">')
        .html('<i class="glyphicon glyphicon-refresh">')
        .appendTo($topVideoControls)
        .on('click', function () {
            PLAYER.type = '';
            PLAYER.id = '';
            socket.emit('playerReady');
        });


    //var STORE_VOLUME;
    //var $muteVolumeBtn = $('<button id="mute-volume-btn" class="btn btn-sm btn-default" title="Выключить звук">')
    //    .html('<i class="glyphicon glyphicon-volume-off">')
    //    .appendTo($topVideoControls)
    //    .on('click', function() {
    //        if (VOLUME !== 0) {
    //            STORE_VOLUME = VOLUME;
    //
    //            if (PLAYER.player.mute !== undefined) {
    //                PLAYER.player.mute();
    //            } else if (PLAYER.player.volume !== undefined) {
    //                PLAYER.player.volume = 0;
    //            } else if (PLAYER.player.setVolume !== undefined) {
    //                PLAYER.player.setVolume(0);
    //            }
    //
    //            $muteVolumeBtn.html('<i class="glyphicon glyphicon-volume-up">');
    //            $(this).removeClass('btn-default');
    //            $(this).addClass('btn-success');
    //        } else {
    //            VOLUME = STORE_VOLUME;
    //
    //            if (PLAYER.player.unMute !== undefined) {
    //                PLAYER.player.unMute();
    //            } else if (PLAYER.player.volume !== undefined) {
    //                PLAYER.player.volume = VOLUME;
    //            } else if (PLAYER.player.setVolume !== undefined) {
    //                PLAYER.player.setVolume(VOLUME);
    //            }
    //
    //            $muteVolumeBtn.html('<i class="glyphicon glyphicon-volume-off">');
    //            $(this).removeClass('btn-success');
    //            $(this).addClass('btn-default');
    //        }
    //    });
    //(function checkVolume() {
    //    setTimeout(function () {
    //        if (PLAYER && typeof PLAYER.getVolume === "function") {
    //            PLAYER.getVolume(function (v) {
    //                if (typeof v === "number") {
    //                    if (v > 1) {
    //                        v /= 100;
    //                    }
    //
    //                    if (v >= 0 && v <= 1) {
    //                        VOLUME = v;
    //                    } else {
    //                        VOLUME = 1;
    //                    }
    //
    //                    setOpt("volume", VOLUME);
    //                }
    //            });
    //        }
    //
    //        if (VOLUME !== 0) {
    //            STORE_VOLUME = VOLUME;
    //
    //            $muteVolumeBtn.html('<i class="glyphicon glyphicon-volume-off">');
    //            $muteVolumeBtn.removeClass('btn-success');
    //            $muteVolumeBtn.addClass('btn-default');
    //        } else {
    //            $muteVolumeBtn.html('<i class="glyphicon glyphicon-volume-up">');
    //            $muteVolumeBtn.removeClass('btn-default');
    //            $muteVolumeBtn.addClass('btn-success');
    //        }
    //
    //        checkVolume();
    //    }, 1500);
    //})();


    var $hidePlayerBtn = $('<button id="hide-player-btn" class="btn btn-sm btn-default" data-hidden="0" title="Скрыть видео">')
        .html('<i class="glyphicon glyphicon-ban-circle">')
        .appendTo($topVideoControls)
        .on('click', function() {
            if (+$(this).data('hidden') === 0) {
                var $playerWindow = $('#videowrap').find('.embed-responsive');
                $playerWindow.css({position: 'relative'});

                $playerWindow.append($('<div id="hidden-player-overlay">'));

                $(this).data('hidden', 1);

                $(this).html('<i class="glyphicon glyphicon-film">');
                $(this).removeClass('btn-default');
                $(this).addClass('btn-success');
            } else {
                $('#hidden-player-overlay').remove();

                $(this).data('hidden', 0);

                $(this).html('<i class="glyphicon glyphicon-ban-circle">');
                $(this).removeClass('btn-success');
                $(this).addClass('btn-default');
            }
        });


    var qualityLabelsTranslate = {
        auto: 'авто',
        small: '240p',
        medium: '380p',
        large: '480p',
        hd720: '720p',
        hd1080: '1080p',
        highres: 'наивысшее'
    };
    var $videoQualityBtn = $('<div class="btn-group">').appendTo($topVideoControls)
        .html('<button type="button" class="btn btn-default btn-sm video-dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Качество: ' + qualityLabelsTranslate[USEROPTS.default_quality || 'auto'] + ' <span class="caret"></span></button>' +
            '<ul class="dropdown-menu">' +
                '<li><a href="#" data-quality="auto">авто</a></li>' +
                '<li><a href="#" data-quality="small">240p</a></li>' +
                '<li><a href="#" data-quality="medium">360p</a></li>' +
                '<li><a href="#" data-quality="large">480p</a></li>' +
                '<li><a href="#" data-quality="hd720">720p</a></li>' +
                '<li><a href="#" data-quality="hd1080">1080p</a></li>' +
                '<li><a href="#" data-quality="highres">наивысшее</a></li>' +
            '</ul>')
        .on('click', 'a', function () {
            if (YOUTUBE_JS_PLAYER) {
                var quality = $(this).data('quality');
                var youtubeQualityMap = {
                    auto: 'default'
                };

                quality = youtubeQualityMap[quality] !== undefined ?
                    youtubeQualityMap[quality] :
                    quality;

                PLAYER.player.setPlaybackQuality(quality);
            }

            settingsFix();

            $("#us-default-quality").val($(this).data('quality'));
            saveUserOptions();

            $('#refresh-video').click();

            $videoQualityBtn.find('button').html('Качество: ' + $(this).text() + ' <span class="caret"></span>');
            $('.video-dropdown-toggle').dropdown();

            return false;
        });

    var settingsFix = function () {
        $("#us-theme").val(USEROPTS.theme);
        $("#us-layout").val(USEROPTS.layout);
        $("#us-no-channelcss").prop("checked", USEROPTS.ignore_channelcss);
        $("#us-no-channeljs").prop("checked", USEROPTS.ignore_channeljs);
        var conninfo = "<strong>Информация о соединении: </strong>" +
                       "Connected to <code>" + IO_URL + "</code> (";
        if (IO_V6) {
            conninfo += "IPv6, ";
        } else {
            conninfo += "IPv4, ";
        }

        if (IO_URL === IO_URLS["ipv4-ssl"] || IO_URL === IO_URLS["ipv6-ssl"]) {
            conninfo += "SSL)";
        } else {
            conninfo += "no SSL)";
        }

        conninfo += ".  SSL включено по умолчанию если оно поддерживается сервером.";
        $("#us-conninfo").html(conninfo);


        $("#us-synch").prop("checked", USEROPTS.synch);
        $("#us-synch-accuracy").val(USEROPTS.sync_accuracy);
        $("#us-wmode-transparent").prop("checked", USEROPTS.wmode_transparent);
        $("#us-hidevideo").prop("checked", USEROPTS.hidevid);
        $("#us-playlistbuttons").prop("checked", USEROPTS.qbtn_hide);
        $("#us-oldbtns").prop("checked", USEROPTS.qbtn_idontlikechange);
        $("#us-default-quality").val(USEROPTS.default_quality || "auto");

        $("#us-chat-timestamp").prop("checked", USEROPTS.show_timestamps);
        $("#us-sort-rank").prop("checked", USEROPTS.sort_rank);
        $("#us-sort-afk").prop("checked", USEROPTS.sort_afk);
        $("#us-blink-title").val(USEROPTS.blink_title);
        $("#us-ping-sound").val(USEROPTS.boop);
        $("#us-sendbtn").prop("checked", USEROPTS.chatbtn);
        $("#us-no-emotes").prop("checked", USEROPTS.no_emotes);

        $("#us-modflair").prop("checked", USEROPTS.modhat);
        $("#us-joinmessage").prop("checked", USEROPTS.joinmessage);
        $("#us-shadowchat").prop("checked", USEROPTS.show_shadowchat);
    };


    YOUTUBE_JS_PLAYER = getOrDefault(CHANNEL.name + '_config-yt-js-player', false);
    socket.on('changeMedia', function (data) {
        if (YOUTUBE_JS_PLAYER && data.type === 'fi' && /google/.test(data.url)) {
            PLAYER = new youtubeJavascriptPlayer(data);
            PLAYER.type = data.type;
        }
    });
    var $youtubeJavascriptPlayerBtn = $('<button id="youtube-javascript-player-btn" class="btn btn-sm btn-default">Использовать Youtube JS Player</button>')
        .appendTo($topVideoControls)
        .on('click', function() {
            YOUTUBE_JS_PLAYER = !YOUTUBE_JS_PLAYER;
            setOpt(CHANNEL.name + '_config-yt-js-player', YOUTUBE_JS_PLAYER);

            if (YOUTUBE_JS_PLAYER) {
                $(this).removeClass('btn-default');
                $(this).addClass('btn-success');
            } else {
                $(this).removeClass('btn-success');
                $(this).addClass('btn-default');
            }

            $('#refresh-video').click();
        });
    if (YOUTUBE_JS_PLAYER) {
        $youtubeJavascriptPlayerBtn.removeClass('btn-default');
        $youtubeJavascriptPlayerBtn.addClass('btn-success');

        $('#refresh-video').click();
    }




    var $expandPlaylistBtn = $('<button id="expand-playlist-btn" class="btn btn-sm btn-default" data-expanded="0" title="Развернуть плейлист">')
        .append('<span class="glyphicon glyphicon-resize-full">')
        .prependTo('#videocontrols')
        .on('click', function() {
            if (+$(this).data('expanded') === 1) {
                $('#queue').css('max-height', '500px');
                $(this).attr('title', 'Свернуть плейлист');

                $(this).data('expanded', 0);
                $(this).removeClass('btn-default');
                $(this).addClass('btn-success');

                scrollQueue();
            } else {
                $('#queue').css('max-height', '100000px');
                $(this).attr('title', 'Развернуть плейлист');

                $(this).data('expanded', 1);
                $(this).removeClass('btn-success');
                $(this).addClass('btn-default');
            }
        });


    var $scrollToCurrentBtn = $('<button id="scroll-to-current-btn" class="btn btn-sm btn-default" title="Прокрутить плейлист к текущему видео">')
        .append('<span class="glyphicon glyphicon-hand-right">')
        .prependTo('#videocontrols')
        .on('click', function() {
            scrollQueue();
        });

    var $contribBtn = $('<button id="contrib-btn" class="btn btn-sm btn-default" title="Contributors list" />')
        .append('<span class="glyphicon glyphicon-user">')
        .prependTo('#videocontrols')
        .on('click', function() {
            var $bodyWrapper = $('<div>');

            var contributorsList = {};
            $("#queue .queue_entry").each(function () {
                var username = $(this).attr('title').replace('Added by: ', '');

                if (contributorsList[username] === undefined) {
                    contributorsList[username] = 1;
                } else {
                    contributorsList[username] += 1;
                }
            });

            $bodyWrapper.append($('<p>Всего добавлено: ' + ($("#queue .queue_entry").length + 1) + ' видео.</p>'));

            var $contributorsListOl = $('<ol>');
            for (var contributor in contributorsList) {
                $contributorsListOl.append($('<li>' + contributor + ': ' + contributorsList[contributor] + '.</li>'));
            }
            $contributorsListOl.appendTo($bodyWrapper);

            createModalWindow('Список пользователей, добавивших видео', $bodyWrapper);
        });
});
