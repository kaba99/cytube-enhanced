// 10.02.2016
window.cytubeEnhanced.addModule('Название модуля', function (app) {
    var xtractive = false;
    var mlgmode = false;
    var xask = false;
    var xanswer = 'sample text';

    function initXtraUI() {
        var conpl = document.createElement("confplus");
        conpl.innerHTML = '<div style="" class="col-lg-12 col-md-12" id="xtra-config"><div style="display: block;" id="xtra-config-body" class="well form-horizontal"><div id="xtra-config-form" class="form-group"><div id="xtra-config-wrapper-a" class="text-center"><div id="xtra-config-btn-wrapper" class="btn-group"><button id="xtra-reconnect-btn" class="btn btn-default">Переподключение</button><button id="xtra-annoy-btn" class="btn btn-default">Пораздражать модера</button></div></div></div><div id="xtra-config-form-q" class="form-group"><div class="col-lg-3 col-md-2 control-label">Набор цитат</div><div id="xtra-config-wrapper-q" class="col-md-8 col-md-offset-1 col-lg-6 col-lg-offset-2 text-center"><select id="xtra-quotes" class="form-control"><option value="0">Анимач Стандарт</option><option value="1">Зеленый Слоник /a/ edition</option><option value="2">О.Л.Д.фаг</option></select></div></div><div class="form-group"><div class="col-sm-2"><input title="Максимальная длина" placeholder="4" id="xtra-stair-num" class="form-control" type="text"></div><div class="col-sm-7"><input title="Текст" placeholder=" :desire: " id="xtra-stair-text" class="form-control" type="text"></div><div class="btn-group" id="xtra-stair-btn-wrapper"><button title="Отправить в чат" class="btn btn-default" id="xtra-stair-send">OH DESIRE!</button></div></div><div class="form-group"><div class="col-sm-3"><div class="checkbox"><label for="xtra-mlgmode"><input id="xtra-mlgmode" type="checkbox">MLG Mode</label></div></div><div class="col-sm-4"><div class="checkbox"><label for="xtra-answer-chk"><input id="xtra-answer-chk" type="checkbox">Свой ответ !ask</label></div></div><div class="col-sm-4"><input placeholder="Да пошел ты нахер козёл" title="Текст ответа" id="xtra-answer" class="form-control" type="text"></div></div></div></div>';
        document.getElementById("leftpane-inner").appendChild(conpl);
        conpl = document.createElement('plusbtn');
        conpl.innerHTML = '<button id="xtra-btn-main" class="btn btn-sm btn-default"> +++ </button>';
        document.getElementById('leftcontrols').appendChild(conpl);

        $('#xtra-btn-main').click(function() {
            $('#xtra-config').toggle();
        });

        $('#xtra-reconnect-btn').click(function() {
            reconnect();
        });

        $('#xtra-stair-send').click(function() {
            var num = $('#xtra-stair-num').val();
            var txt = $('#xtra-stair-text').val();
            wow(num, txt);
        });

        $('#xtra-quotes').change(function() {
            var v = $('#xtra-quotes').val();
            initXtraQuotes(v);
        });

        $('#xtra-mlgmode').change(function() {
            mlgmode = $('#xtra-mlgmode').prop('checked');
            window.console.log('[Xtra] mlg mode enabled = ' + mlgmode);
        });

        $('#xtra-answer-chk').change(function() {
            xask = $('#xtra-answer-chk').prop('checked');
            window.console.log('[Xtra] custom answer enabled = ' + xask);
            xanswer = $('#xtra-answer').val();
            answerX(xask, xanswer);
        });

        $('#xtra-answer').change(function() {
            xanswer = $('#xtra-answer').val();
            answerX(xask, xanswer);
        });

        $('#chatline').keypress(function(e) {
            if(e.which == 13 && mlgmode == true) {
                mlg.mlghorn();
            } else if(mlgmode == true) {
                mlg.mlghit();
            }
        });

        $('#xtra-annoy-btn').click(function() {
            annoyX();
        });

        window.console.log('[Xtra] UI initialized');

    }

    function sendText(text) {
        window.socket.emit("chatMsg", {
            msg: text,
            meta: {}
        })
    }

    function wow(count, text) {
        if(count <= 10 && text != '') {
            if(text[text.length - 1] == ":") {
                text += ' ';
            }
            sendText('.');
            for(var i = 1; i <= count; i++) {
                var res = '';
                for(j = 0; j < i; j++) {
                    res += text;
                }
                sendText(res);
            }
            for(var i = (count - 1); i > 0; i--) {
                var res = '';
                for(j = 0; j < i; j++) {
                    res += text;
                }
                sendText(res);
            }
            window.console.log('[Xtra] Stairs with text "' + text + '" sent');
        } else {
            window.console.error('[Xtra]', 'Stair is too long or text is incorrect');
        }
    }

    function reconnect() {
        window.socket.disconnect();
        setTimeout(function() {
            window.socket.connect();
            window.console.log('[Xtra] Reconnected');
        }, 500);
    }

    function annoyX() {
        var ann = setInterval(function() {
            window.socket.emit('chatMsg', {
                msg: '/afk'
            });
        }, 50);
        setTimeout(function() {
            clearInterval(ann);
        }, 3000);
    }

    function answerX(isCustom, quote) {
        if(isCustom == true) {
            app.getModule('additionalChatCommands').done(function(commandsModule) {
                commandsModule.askAnswers = [quote];
            });
        } else {
            if(isCustom == false) {
                app.getModule('additionalChatCommands').done(function(commandsModule) {
                    commandsModule.askAnswers = ['100%', 'Определенно да', 'Да', 'Вероятно', 'Ни шанса', 'Определенно нет', 'Вероятность мала', 'Нет', '50/50', 'Фея устала и отвечать не будет', 'Отказываюсь отвечать', ];
                });
            }
        }
    }

    function soundX() {
        var hit = new Audio("https://dl.dropboxusercontent.com/s/wbk3s6s9ze0zwrq/htmrk.ogg");
        var horn = new Audio("https://dl.dropboxusercontent.com/s/9xuf0vpluuylp2o/AIRHORN.ogg");
        var weed = new Audio("http://soundboard.panictank.net/SMOKE%20WEEK%20EVERYDAY.mp3");
        var fcuk = new Audio("https://dl.dropboxusercontent.com/s/bexbx81r63uhi7d/GL1-017.mp3");
        hit.volume = 0.6;
        horn.volume = 0.6;
        weed.volume = 0.6;
        this.mlghit = function() {
            hit.play();
        }
        this.mlghorn = function() {
            horn.play();
        }
        this.mlgweed = function() {
            weed.play();
        }
        fcuk.volume = 0.6;
        fcuk.play();
        window.console.log('[Xtra] Audio module active');
    }

    function initXtraCommands() {
        app.getModule('additionalChatCommands').done(function(commandsModule) {
            commandsModule.commandsList['!baka'] = {
                description: '',
                value: function(msg) {
                    return ' http://i.imgur.com/t6ROFI9.gif ';
                },
                isAvailable: function() {
                    return true;
                }
            };
            commandsModule.commandsList['!raep'] = {
                description: '',
                value: function(msg) {
                    var rname = msg.replace("!raep", "");
                    msg = rname + " was raepd by CHOCO_BROWNIE :yaranaika: ";
                    return msg;
                },
                isAvailable: function() {
                    return true;
                }
            };
            commandsModule.commandsList['!test'] = {
                description: '',
                value: function(msg) {
                    return 'passed';
                },
                isAvailable: function() {
                    return true;
                }
            };
        })

        window.console.log('[Xtra] Extra commands added');
    }

    function initXtraQuotes(num) {
        if(num == 0) {
            app.getModule('additionalChatCommands').done(function(commandsModule) {
                commandsModule.randomQuotes = [
                    'Не поддавайся сожалениям, о которых тебе напоминает прошлое.', 'Честно говоря, я всегда думал, что лучше умереть, чем жить в одиночестве...', 'Прошу прощения, но валите прочь.', 'По-настоящему силён лишь тот, кто знает свои слабости.', 'Быть умным и хорошо учиться — две разные вещи.', 'Когда я стану главнокомандующим, я заставлю всех девушек носить мини-юбки!', 'Тот кто правит временем, правит всем миром.', 'Я должен познакомить тебя с моими друзьями. Они еще те извращенцы, но они хорошие люди.', 'Победа не важна, если она лишь твоя.', 'Наркотики убивают в людях человечность.', 'Если бы меня волновало мнение других людей, то я давно бы уже покрасил волосы в другой цвет.', 'Слезы — кровотечение души....', 'Весело создавать что-то вместе.', 'Как ты не понимаешь, что есть люди, которые умрут от горя, если тебя не станет!', 'Я частенько слышал, что пары, которые внешне любят друг друга, частенько холодны внутри.', 'Если хочешь, что бы люди поверили в мечту, сначала поверь в нее сам.', 'Жизнь, в которой человек имеет всё, что желает, пуста и неинтересна.', 'Чтобы чего-то достичь, необходимо чем-то пожертвовать.', 'Я не одинока. Я просто люблю играть соло. Краситься, укорачивать юбку и заигрывать с парнями — это для потаскух.', 'Очень страшно, когда ты не помнишь, кто ты такая.', 'Больно помнить о своих слабостях.', 'Похоже, мудрость и алкоголь несовместимы.', 'Почему... Почему... Почему со мной вечно происходит какая-то херня?!', 'Красивое нельзя ненавидеть.', 'Если ты хочешь написать что-то плохое в комментариях в интернете, пиши, но это будет лишь выражением твоей зависти.', 'Хочешь сбежать от повседневности — не останавливайся в развитии.', 'Одинокие женщины ищут утешение в домашних животных.', 'В эпоху, когда информация правит миром, жить без компьютера совершенно непростительно!', 'Каждый человек одинок. Звезды в ночном небе тоже вроде бы все вместе, но на самом деле они разделены бездной. Холодной, тёмной, непреодолимой бездной.', 'Умные люди умны ещё до того, как начинают учиться.', 'Только те, у кого явные проблемы, говорят, что у них всё хорошо.', 'Не важно если меня победит другой, но... Себе я не проиграю!', 'Немногие способны на правильные поступки, когда это необходимо.', 'Я мечтаю о мире, где все смогут улыбаться и спать, когда им того захочется.', 'Девушке не обмануть меня… даже если она без трусиков!', 'Это не мир скучный, это я не выделяюсь.', 'С людьми без воображения одни проблемы.', 'Нечестно это — своей слабостью шантажировать.', 'То ли я уже не человек, то ли вы еще не люди.', 'Чего я действительно опасаюсь, так это не потери своей памяти, а исчезновения из памяти остальных.', 'Даже если небо погружено во тьму, и ничего не видно, где-то обязательно будет светиться звезда. Если она будет сиять ярче и ярче, её обязательно увидят...', 'Никто не может нырнуть в бездну и вынырнуть прежним.', 'Когда теряешь всё разом, мир начинает казаться довольно хреновым местечком.', 'Не хочу видеть, что будет, когда Маяка узнает, что её шоколад украли. Не люблю ужастики.', 'В мире есть добро потому, что есть кошки.', 'Девчата, пойте! Зажигайте свет вашей души!', 'И что ты собираешься делать, рождённый неизвестно зачем, и умирающий неизвестно за что?', 'А давай станем с тобой чудовищами, и поставим весь мир на уши?', 'Не забывай только, что и доброта может причинить боль.', 'Тяжело признать плохим то, за что отдал 20 баксов.', 'OBOSSAN', 'Говорят, в вере спасение… Но мне что-то никогда в это не верилось.', 'Клубничка — это сердце тортика!', 'Бабушка мне всегда говорила: «Юи-тян, ты запомнишь всё что угодно, но при этом ты забудешь всё остальное».', 'Как жаль, что люди начинают ценить что-то только тогда, когда теряют это.', 'У людей с холодными руками тёплое сердце.', 'Я всегда думала, что это здорово: Посмеяться перед серьёзным делом.', 'Мир не так жесток, как ты думаешь.', 'Даже отдав все свои силы, не каждый способен стать победителем.', 'Наше общество — просто стадо баранов.', 'Пока сами чего-то не сделаете, это ваше «однажды» никогда не наступит.', 'Чтобы что-то выбрать, нужно что-то потерять.', 'За каждой улыбкой, что ты увидишь, будут скрываться чьи-то слёзы.', 'Приключения — мечта настоящего мужчины!', 'Твоя хитрость всегда будет оценена по достоинству.', 'Я гораздо лучше орудую мечами, нежели словами.', 'Прошлое всегда сияет ярче настоящего.', 'Становиться взрослой так грустно...', 'Романтические чувства — всего лишь химическая реакция', 'Говорят, что в море ты или плывёшь, или тонешь.', 'Не важно как ты осторожен, всегда есть опасность споткнуться.', 'Я насилие не люблю, оно у меня само получается.', 'Когда я смотрю аниме от КёАни, Господь подымает меня над полом и приближает к себе.', 'Бака, бака, бака!', 'Ты так говоришь, будто это что-то плохое.', 'Мне вас жаль.', 'Ваше мнение очень важно для нас.', 'А в глубине души я всех вас ненавижу, как и весь этот мир.', 'А разгадка одна — безблагодатность.', 'Умерьте пыл.', 'Меня трудно найти, легко потерять и невозможно забыть....', 'Не твоя, вот ты и бесишься.', 'Ваш ребенок - аниме.', 'Здесь все твои друзья.', 'Мне 20 и я бородат'
                ];
            });
        } else if(num == 1) {
            app.getModule('additionalChatCommands').done(function(commandsModule) {
                commandsModule.randomQuotes = [
                    'Ты понимаешь, что ты няшка? Уже всё. Не я, блин, няшка… не он, блин, а ты!', 'Меня твои истории просто невероятно заинтересовали уже, я уже могу их слушать часами, блин! Одна история няшней другой просто!', 'НАЧАЛЬНИК, БЛИН, ЭТОТ НЯША ОБКАВАИЛСЯ! ИДИТЕ МОЙТЕ ЕГО, Я С НИМ ЗДЕСЬ НЯШИТСЯ БУДУ!', 'ЧЕГО ВЫ МЕНЯ С НЯШЕЙ ПОСЕЛИЛИ, БЛИН, ОН ЖЕ КАВАЙ ПОЛНЫЙ, БЛИН!!!', 'Ну… Чаю выпил, блин, ну, бутылку, с одной тян. Ну, а потом под пледиком поняшились.', 'Хочешь я на одной ноге понякаю, а ты мне погону отдашь? Как нека, хочешь?', 'ЭТО ЗНАТЬ НАДО! ЭТО ЗОЛОТОЙ ФОНД, БЛИН!', 'Как п… как поспал, онии-чан? Проголодался, наверное! Онии-чан…', 'Ты что, обняшился что ли, няшка, блин?!', 'Не, я не обняшился. Я тебе покушать принёс, Онии-чан!'
                ];
            });
        } else if(num == 2) {
            app.getModule('additionalChatCommands').done(function(commandsModule) {
                commandsModule.randomQuotes = [
                    'Есть два стула...', 'Идет медведь по лесу, видит — машина горит. Сел в нее и сгорел.', 'O rly?', 'Ну давай разберем по частям, тобою написанное )) Складывается впечатление что ты реально контуженный , обиженный жизнью имбицил ))', 'ты чё? ебанутый? чё ты там делаешь?', 'А еще я ебу собак', 'Меня трудно найти, легко потерять и невозможно забыть....', 'Однажды ты придешь и спросишь: Что я люблю больше: Тебя или Йобу? Я скажу, что Йобу, и ты уйдешь, так и не узнав, что... YOBA ETO TY', 'Молодость жива!', 'Ржавая пизда', 'Бака, бака, бака!', 'Дед, смотри, хуйню в плейлисте смотрят', 'Дед, смотри, хуйню в плейлисте смотрят', 'Фюрер знает точно, что для нас хорошо.', 'Не твоя, вот ты и бесишься.', 'Не твоя личная армия', 'Мне 20 и я бородат', 'Опять парашу смотрите, суки!', 'Обоссан', 'Ребята не стоит вскрывать эту тему. Вы молодые, шутливые, вам все легко. Это не то. Это не Чикатило и даже не архивы спецслужб. Сюда лучше не лезть. Серьезно, любой из вас будет жалеть.', 'Время лить говно, ведь говно само себя в лист не добавит!', 'А разгадка одна — безблагодатность.', 'OBOSSAN', 'Ваш ребенок - аниме.'
                ];
            });
        }
        window.console.log('[Xtra] Quotes set changed to ' + $('#xtra-quotes').val());
    }

    function logonX(keyword, fakeword) {
        app.getModule('additionalChatCommands').done(function(module) {
            var originFn = module.sendUserChatMessage;
            module.sendUserChatMessage = function(e) {
                if(e.keyCode === 13) {
                    var msg = $("#chatline").val().trim();
                    /* if(msg == keyword && xtractive == false) {
                         $("#chatline").val(fakeword);
                         initXtraUI();
                         initXtraCommands();
                         xtractive = true;
                         console.log('[Xtra] Activated by "' + keyword + '" word. Logon function is now disabled');
                     }; */
                    if(msg.indexOf(':weed:') !== -1) {
                        mlg.mlgweed();
                    };
                }
                return originFn.call(module, e);
            }
        });
        window.console.log('[Xtra] Logon function active');
    }

    $('#messagebuffer').css('background', 'rgba(0, 10, 20, 0.8) url("https://i.imgur.com/TxjcmfO.png") no-repeat scroll left bottom / contain');

    window.console.log('[Xtra] Main script loaded (v0.5)');
    logonX('Xact', ' ');
    initXtraUI();
    initXtraCommands();
    var mlg = new soundX();
    xtractive = true;

});


