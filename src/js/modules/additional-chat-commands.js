window.cytubeEnhanced.addModule('additionalChatCommands', function (app, settings) {
    'use strict';

    var that = this;

    var defaultSettings = {
        permittedCommands: ['*']
    };
    settings = $.extend({}, defaultSettings, settings);

    function isCommandPermitted(commandName) {
        return settings.permittedCommands.indexOf('*') !== -1 || settings.permittedCommands.indexOf(commandName) !== -1 || false;
    }


    this.askAnswers = ["100%", app.t('qCommands[.]of course'), app.t('qCommands[.]yes'), app.t('qCommands[.]maybe'), app.t('qCommands[.]impossible'), app.t('qCommands[.]no way'), app.t('qCommands[.]don\'t think so'), app.t('qCommands[.]no'), "50/50", app.t('qCommands[.]cirno is busy'), app.t('qCommands[.]I regret to inform you')];


    this.randomQuotes = [];


    /**
     *The list of commands
     *
     * Every command must have method value(message) which returns command's message.
     * Commands can also have description property for chatCommandsHelp module and isAvailable method which returns false if command is not permitted (by default returns true)
     *
     * @type {object}
     */
    this.commandsList = {
        '!pick ': {
            description: app.t('chatCommands[.]random option from the list of options (!pick option1, option2, option3)'),
            value: function (msg) {
                var variants = msg.replace('!pick ', '').split(',');
                return variants[Math.floor(Math.random() * variants.length)].trim();
            }
        },
        '!ask ': {
            description: app.t('chatCommands[.]asking a question with yes/no/... type answer (e.g. <i>!ask Will i be rich?</i>)'),
            value: function () {
                return that.askAnswers[Math.floor(Math.random() * that.askAnswers.length)];
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
            }
        },
        '!dice': {
            description: app.t('chatCommands[.]throw a dice'),
            value: function () {
                return Math.floor(Math.random() * 5) + 1;
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
            }
        },
        '!q': {
            description: app.t('chatCommands[.]show the random quote'),
            value: function (msg) {
                if (that.randomQuotes.length === 0) {
                    msg = app.t('chatCommands[.]there aren\'t any quotes.');
                } else {
                    msg = that.randomQuotes[Math.floor(Math.random() * (that.randomQuotes.length - 1))];
                }

                return msg;
            }
        },
        '!skip': {
            description: app.t('chatCommands[.]vote for the video skip'),
            value: function (msg) {
                window.socket.emit("voteskip");
                msg = app.t('chatCommands[.]you have been voted for the video skip');

                return msg;
            },
            isAvailable: function () {
                return window.hasPermission('voteskip');
            }
        },
        '!next': {
            description: app.t('chatCommands[.]play the next video'),
            value: function (msg) {
                window.socket.emit("playNext");
                msg = app.t('chatCommands[.]the next video is playing');

                return msg;
            },
            isAvailable: function () {
                return window.hasPermission('playlistjump');
            }
        },
        '!bump': {
            description: app.t('chatCommands[.]bump the last video'),
            value: function (msg) {
                var $lastEntry = $('#queue').find('.queue_entry').last();
                var uid = $lastEntry.data("uid");
                var title = $lastEntry.find('.qe_title').html();

                window.socket.emit("moveMedia", {from: uid, after: window.PL_CURRENT});

                msg = app.t('chatCommands[.]the last video was bumped') + title;

                return msg;
            },
            isAvailable: function () {
                return window.hasPermission('playlistmove');
            }
        },
        '!add': {
            description: app.t('chatCommands[.]adds the video to the end of the playlist (e.g. <i>!add https://www.youtube.com/watch?v=hh4gpgAZkc8</i>)'),
            value: function (msg) {
                var parsed = window.parseMediaLink(msg.split("!add ")[1]);

                if (parsed.id === null) {
                    msg = app.t('chatCommands[.]error: the wrong link');
                } else {
                    window.socket.emit("queue", {id: parsed.id, pos: "end", type: parsed.type});
                    msg = app.t('chatCommands[.]the video was added');
                }


                return msg;
            },
            isAvailable: function () {
                return window.hasPermission('playlistadd');
            }
        },
        '!now': {
            description: app.t('chatCommands[.]show the current video\'s name'),
            value: function () {
                return app.t('chatCommands[.]now: ') + $(".queue_active a").html();
            }
        },
        '!sm': {
            description: app.t('chatCommands[.]show the random emote'),
            value: function () {
                var smilesArray = window.CHANNEL.emotes.map(function (smile) {
                    return smile.name;
                });

                return smilesArray[Math.floor(Math.random() * smilesArray.length)] + ' ';
            }
        },
        '!yoba': {
            description: app.t('chatCommands[.]the secret command'),
            value: function () {
                var IMBA = new Audio("https://dl.dropboxusercontent.com/s/olpmjho5dfvxho4/11%20Kobaryo%20-%20ヤンデレのハー_cut_192.mp3");
                IMBA.volume = 0.6;
                IMBA.play();

                //var BGCHANGE = 0;
                //var inbix = setInterval(function() {
                //    $('#userlist').css('background', 'rgba(0, 10, 20, 0) none repeat scroll 0% 0%');
                //    $('#chatline').css('background', 'rgba(0, 10, 20, 0.15) !important');
                //    BGCHANGE++;
                //
                //    if (BGCHANGE % 2 === 0) {
                //        $("body").css('background', '#663939 url("http://i.imgur.com/BWdf3Jv.png")');
                //        $('#messagebuffer').css('color', 'black');
                //        $('#messagebuffer').css('background-image', 'url("http://i.imgur.com/vWFTejN.png")');
                //        $('#userlist').css('color', 'black');
                //        $('body').css('color', 'black');
                //    } else {
                //        $("body").css('background', '#663939 url("http://i.imgur.com/MVfHhI5.png")');
                //        $('#messagebuffer').css('color', 'white');
                //        $('#messagebuffer').css('background', 'none');
                //        $('#userlist').css('color', 'white');
                //        $('body').css('color', 'white');
                //    }
                //}, 150);
                //
                //setTimeout(function() {
                //    BGCHANGE = 0;
                //    clearInterval(inbix);
                //    $("body").css({'background-image':'', 'background-color':''});
                //    $('#messagebuffer').css('color', '#cccccc');
                //    $('body').css('font-color', '#EFEFEF');
                //    $('#messagebuffer').css('background', '');
                //    $('#userlist').css('background', 'rgba(0, 10, 20, 0.8) none repeat scroll 0% 0%');
                //    $('#chatline').css('background', 'rgba(0, 10, 20, 0.75) !important');
                //    $('#userlist').css('color', '#C2C2C2');
                //}, 27000);

                return ' :dance: ';
            }
        }
    };


   this.IS_COMMAND = false;
    this.prepareMessage = function (msg) {
        that.IS_COMMAND = false;

        for (var command in this.commandsList) {
            if (this.commandsList.hasOwnProperty(command) && msg.indexOf(command) === 0) {
                if (isCommandPermitted(command) && (this.commandsList[command].isAvailable ? this.commandsList[command].isAvailable() : true)) {
                    that.IS_COMMAND = true;

                    msg = this.commandsList[command].value(msg);
                }

                break;
            }
        }

        return msg;
    };


    this.sendUserChatMessage = function (e) {
        if(e.keyCode === 13) {
            if (window.CHATTHROTTLE) {
                return;
            }

            var msg = $("#chatline").val().trim();

            if(msg !== '') {
                var meta = {};

                if (window.USEROPTS.adminhat && window.CLIENT.rank >= 255) {
                    msg = "/a " + msg;
                } else if (window.USEROPTS.modhat && window.CLIENT.rank >= window.Rank.Moderator) {
                    meta.modflair = window.CLIENT.rank;
                }

                // The /m command no longer exists, so emulate it clientside
                if (window.CLIENT.rank >= 2 && msg.indexOf("/m ") === 0) {
                    meta.modflair = window.CLIENT.rank;
                    msg = msg.substring(3);
                }


                var msgForCommand = this.prepareMessage(msg);

                if (that.IS_COMMAND) {
                    window.socket.emit("chatMsg", {msg: msg, meta: meta});
                    window.socket.emit("chatMsg", {msg: 'Сырно: ' + msgForCommand});

                    that.IS_COMMAND = false;
                } else {
                    window.socket.emit("chatMsg", {msg: msg, meta: meta});
                }


                window.CHATHIST.push($("#chatline").val());
                window.CHATHISTIDX = window.CHATHIST.length;
                $("#chatline").val('');
            }

            return;
        } else if(e.keyCode === 9) { // Tab completion
            window.chatTabComplete();
            e.preventDefault();
            return false;
        } else if(e.keyCode === 38) { // Up arrow (input history)
            if(window.CHATHISTIDX === window.CHATHIST.length) {
                window.CHATHIST.push($("#chatline").val());
            }
            if(window.CHATHISTIDX > 0) {
                window.CHATHISTIDX--;
                $("#chatline").val(window.CHATHIST[window.CHATHISTIDX]);
            }

            e.preventDefault();
            return false;
        } else if(e.keyCode === 40) { // Down arrow (input history)
            if(window.CHATHISTIDX < window.CHATHIST.length - 1) {
                window.CHATHISTIDX++;
                $("#chatline").val(window.CHATHIST[window.CHATHISTIDX]);
            }

            e.preventDefault();
            return false;
        }
    };


    $('#chatline, #chatbtn').off();

    $('#chatline').on('keydown', function (e) {
        that.sendUserChatMessage(e);
    });

    $('#chatbtn').on('click', function (e) {
        that.sendUserChatMessage(e);
    });
});
