cytubeEnhanced.setModule('additionalChatCommands', function (app, settings) {
    var that = this;

    var defaultSettings = {
        additionalPermittedCommands: ['*']
    };
    settings = $.extend(defaultSettings, settings);
    function isAdditionalCommandPermitted(commandName) {
        return $(settings.additionalPermittedCommands).not(['*']).length === 0 && $(['*']).not(settings.additionalPermittedCommands).length === 0 || settings.additionalPermittedCommands.indexOf(commandName) !== -1 || false;
    }


    this.askAnswers = ["100%", "Определенно да", "Да", "Вероятно", "Ни шанса", "Определенно нет", "Вероятность мала", "Нет", "50/50", "Фея устала и отвечать не будет", "Отказываюсь отвечать"];


    this.randomQuotes = [
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


    this.commandsList = {
        '!pick ': {
            description: 'выбор случайной опции из указанного списка слов, разделенных запятыми (Например: <i>!pick слово1, слово2, слово3</i>)',
            value: function (msg) {
                var variants = msg.replace('!pick ', '').split(',');
                return variants[Math.floor(Math.random() * (variants.length - 1))].trim();
            },
            isAvailable: function () {
                return true;
            }
        },
        '!ask ': {
            description: 'задать вопрос с вариантами ответа да/нет/... (Например: <i>!ask Сегодня пойдет дождь?</i>)',
            value: function () {
                return that.askAnswers[Math.floor(Math.random() * (that.askAnswers.length - 1))];
            },
            isAvailable: function () {
                return true;
            }
        },
        '!time': {
            description: 'показать текущее время',
            value: function () {
                var h = new Date().getHours();
                if (h < 10) {
                    h = '0' + h;
                }

                var m = new Date().getMinutes();
                if (m < 10) {
                    m = '0' + m;
                }

                return 'текущее время: ' + h + ':' + m;
            },
            isAvailable: function () {
                return true;
            }
        },
        '!dice': {
            description: 'кинуть кость',
            value: function () {
                return Math.floor(Math.random() * 5) + 1;
            },
            isAvailable: function () {
                return true;
            }
        },
        '!roll': {
            description: 'случайное число от 0 до 999',
            value: function () {
                var randomNumber = Math.floor(Math.random() * 1000);

                if (randomNumber < 100) {
                    randomNumber = '0' + randomNumber;
                } else if (randomNumber < 10) {
                    randomNumber= '00' + randomNumber;
                }

                return randomNumber;
            },
            isAvailable: function () {
                return true;
            }
        },
        '!q': {
            description: 'показать случайную цитату',
            value: function (msg) {
                if (that.randomQuotes.length === 0) {
                    msg = 'цитаты отсутствуют';
                } else {
                    msg = that.randomQuotes[Math.floor(Math.random() * (that.randomQuotes.length - 1))];
                }

                return msg;
            },
            isAvailable: function () {
                return true;
            }
        },
        '!skip': {
            description: 'проголосовать за пропуск текущего видео',
            value: function (msg) {
                socket.emit("voteskip");
                msg = 'отдан голос за пропуск текущего видео';

                return msg;
            },
            isAvailable: function () {
                return hasPermission('voteskip');
            }
        },
        '!next': {
            description: 'проиграть следующее видео',
            value: function (msg) {
                socket.emit("playNext");
                msg = 'начато проигрывание следующего видео';

                return msg;
            },
            isAvailable: function () {
                return hasPermission('playlistjump');
            }
        },
        '!bump': {
            description: 'поднять последнее видео',
            value: function (msg) {
                var last = $("#queue").children().length;
                var uid = $("#queue .queue_entry:nth-child("+last+")").data("uid");
                var title = $("#queue .queue_entry:nth-child("+last+") .qe_title").html();
                socket.emit("moveMedia", {from: uid, after: PL_CURRENT});

                msg = 'поднято последнее видео: ' + title;

                return msg;
            },
            isAvailable: function () {
                return hasPermission('playlistmove');
            }
        },
        '!add': {
            description: 'добавляет видео в конец плейлиста (Например: <i>!add https://www.youtube.com/watch?v=hh4gpgAZkc8</i>)',
            value: function (msg) {
                var parsed = parseMediaLink(msg.split("!add ")[1]);

                if (parsed.id === null) {
                    msg = 'ошибка: неверная ссылка';
                } else {
                    socket.emit("queue", {id: parsed.id, pos: "end", type: parsed.type});
                    msg = 'видео было добавлено';
                }


                return msg;
            },
            isAvailable: function () {
                return hasPermission('playlistadd');
            }
        },
        '!now': {
            description: 'показать название текущего видео',
            value: function () {
                return 'сейчас играет: ' + $(".queue_active a").html();
            },
            isAvailable: function () {
                return true;
            }
        },
        '!sm': {
            description: 'показать случайный смайлик',
            value: function () {
                var smilesArray = CHANNEL.emotes.map(function (smile) {
                    return smile.name;
                });

                return smilesArray[Math.floor(Math.random() * smilesArray.length)] + ' ';
            },
            isAvailable: function () {
                return true;
            }
        },
        '!yoba': {
            description: 'секретная команда',
            value: function () {
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


                return 'YOBA';
            },
            isAvailable: function () {
                return true;
            }
        }
    };


    var IS_COMMAND = false;
    this.prepareMessage = function (msg) {
        IS_COMMAND = false;

        for (var command in that.commandsList) {
            if (msg.indexOf(command) === 0) {
                if (isAdditionalCommandPermitted(command) && that.commandsList[command].isAvailable()) {
                    IS_COMMAND = true;

                    msg = that.commandsList[command].value(msg);
                }

                break;
            }
        }

        return msg;
    };


    this.sendUserChatMessage = function (e) {
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


                var msgForCommand = that.prepareMessage(msg);

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


    this.run = function () {
        $('#chatline, #chatbtn').unbind();

        $('#chatline').on('keydown', function (e) {
            that.sendUserChatMessage(e);
        });
        $('#chatbtn').on('click', function (e) {
            that.sendUserChatMessage(e);
        });
    };
});