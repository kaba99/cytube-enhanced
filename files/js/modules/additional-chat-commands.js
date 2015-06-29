cytubeEnhanced.setModule('additionalChatCommands', function (app, settings) {
    var that = this;

    var defaultSettings = {
        additionalPermittedCommands: ['*']
    };
    settings = $.extend(defaultSettings, settings);
    function isAdditionalCommandPermitted(commandName) {
        return $(settings.additionalPermittedCommands).not(['*']).length === 0 && $(['*']).not(settings.additionalPermittedCommands).length === 0 || settings.additionalPermittedCommands.indexOf(commandName) !== -1 || false;
    }


    this.askAnswers = ["100%", app.t('qCommands[.]of course'), app.t('qCommands[.]yes'), app.t('qCommands[.]maybe'), app.t('qCommands[.]impossible'), app.t('qCommands[.]no way'), app.t('qCommands[.]don\'t think so'), app.t('qCommands[.]no'), "50/50", app.t('qCommands[.]fairy is busy'), app.t('qCommands[.]I regret to inform you')];


    this.randomQuotes = [];


    this.commandsList = {
        '!pick ': {
            description: app.t('chatCommands[.]random option from the list of options (!pick option1, option2, option3)'),
            value: function (msg) {
                var variants = msg.replace('!pick ', '').split(',');
                return variants[Math.floor(Math.random() * (variants.length - 1))].trim();
            },
            isAvailable: function () {
                return true;
            }
        },
        '!ask ': {
            description: app.t('chatCommands[.]asking a question with yes/no/... type answer (e.g. <i>!ask Will i be rich?</i>)'),
            value: function () {
                return that.askAnswers[Math.floor(Math.random() * (that.askAnswers.length - 1))];
            },
            isAvailable: function () {
                return true;
            }
        },
        '!time': {
            description: app.t('chatCommands[.]show the current time'),
            value: function () {
                var h = new Date().getHours();
                if (h < 10) {
                    h = '0' + h;
                }

                var m = new Date().getMinutes();
                if (m < 10) {
                    m = '0' + m;
                }

                return app.t('chatCommands[.]current time') + ': ' + h + ':' + m;
            },
            isAvailable: function () {
                return true;
            }
        },
        '!dice': {
            description: app.t('chatCommands[.]throw a dice'),
            value: function () {
                return Math.floor(Math.random() * 5) + 1;
            },
            isAvailable: function () {
                return true;
            }
        },
        '!roll': {
            description: app.t('chatCommands[.]random number between 0 and 999'),
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
            description: app.t('chatCommands[.]show the random quote'),
            value: function (msg) {
                if (that.randomQuotes.length === 0) {
                    msg = app.t('chatCommands[.]there aren\'t any quotes. If you are the channel administrator, you can download them from https://github.com/kaba99/cytube-enhanced/tree/master/files/extra/quotes_for_!q');
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
            description: app.t('chatCommands[.]vote for the video skip'),
            value: function (msg) {
                socket.emit("voteskip");
                msg = app.t('chatCommands[.]you have been voted for the video skip');

                return msg;
            },
            isAvailable: function () {
                return hasPermission('voteskip');
            }
        },
        '!next': {
            description: app.t('chatCommands[.]play the next video'),
            value: function (msg) {
                socket.emit("playNext");
                msg = app.t('chatCommands[.]the next video is playing');

                return msg;
            },
            isAvailable: function () {
                return hasPermission('playlistjump');
            }
        },
        '!bump': {
            description: app.t('chatCommands[.]bump the last video'),
            value: function (msg) {
                var last = $("#queue").children().length;
                var uid = $("#queue .queue_entry:nth-child("+last+")").data("uid");
                var title = $("#queue .queue_entry:nth-child("+last+") .qe_title").html();
                socket.emit("moveMedia", {from: uid, after: PL_CURRENT});

                msg = app.t('chatCommands[.]the last video was bumped') + title;

                return msg;
            },
            isAvailable: function () {
                return hasPermission('playlistmove');
            }
        },
        '!add': {
            description: app.t('chatCommands[.]adds the video to the end of the playlist (e.g. <i>!add https://www.youtube.com/watch?v=hh4gpgAZkc8</i>)'),
            value: function (msg) {
                var parsed = parseMediaLink(msg.split("!add ")[1]);

                if (parsed.id === null) {
                    msg = app.t('chatCommands[.]error: the wrong link');
                } else {
                    socket.emit("queue", {id: parsed.id, pos: "end", type: parsed.type});
                    msg = app.t('chatCommands[.]the video was added');
                }


                return msg;
            },
            isAvailable: function () {
                return hasPermission('playlistadd');
            }
        },
        '!now': {
            description: app.t('chatCommands[.]show the current video\'s name'),
            value: function () {
                return app.t('chatCommands[.]now: ') + $(".queue_active a").html();
            },
            isAvailable: function () {
                return true;
            }
        },
        '!sm': {
            description: app.t('chatCommands[.]show the random emote'),
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
            description: app.t('chatCommands[.]the secret command'),
            value: function () {
                var $yoba = $('<div class="yoba">').appendTo($(document.body));
                $('<img src="http://apachan.net/thumbs/201102/24/ku1yjahatfkc.jpg">').appendTo($yoba);

                var IMBA = new Audio("https://dl.dropboxusercontent.com/s/xdnpynq643ziq9o/inba.ogg");
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
