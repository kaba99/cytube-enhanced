function CytubeEnhanced(channelName, language, modulesSettings) {
    'use strict';

    this.channelName = channelName;

    var translations = {};

    var modules = {};
    var MODULE_LOAD_TIMEOUT = 10000; //ms
    var MODULE_LOAD_PERIOD = 100; //ms


    /**
     * Gets the module
     *
     * Returns $.Deferred() object and throws error exception if timeout
     *
     * @param {string} moduleName The name of the module
     * @returns {object}
     */
    this.getModule = function (moduleName) {
        var promise = $.Deferred();
        var time = MODULE_LOAD_TIMEOUT;

        (function getModuleRecursive() {
            if (modules[moduleName] !== undefined) {
                promise.resolve(modules[moduleName]);
            } else if (time <= 0) {
                throw new Error("Load timeout for module " + moduleName + '.');
            } else {
                time -= MODULE_LOAD_PERIOD;

                setTimeout(getModuleRecursive, MODULE_LOAD_PERIOD);
            }
        })();

        return promise;
    };


    /**
     * Adds the module
     *
     * @param {string} moduleName The name of the module
     * @param moduleConstructor The module's constructor
     */
    this.addModule = function (moduleName, ModuleConstructor) {
        if (this.isModulePermitted(moduleName)) {
            var moduleSettings = modulesSettings[moduleName] || {};

            modules[moduleName] = new ModuleConstructor(this, moduleSettings);
            modules[moduleName].settings = moduleSettings;
        }
    };


    /**
     * Configures the module
     *
     * Previous options don't reset.
     *
     * @param {string} moduleName  The name of the module
     * @param moduleOptions The module's options
     */
    this.configureModule = function (moduleName, moduleOptions) {
        $.extend(true, modulesSettings[moduleName], moduleOptions);
    };


    /**
     * Checks if module is permitted
     *
     * @param moduleName The name of the module to check
     * @returns {boolean}
     */
    this.isModulePermitted = function (moduleName) {
        return modulesSettings.hasOwnProperty('moduleName') ?
            (modulesSettings[moduleName].hasOwnProperty('enabled') ? modulesSettings[moduleName].enabled : true) :
            true;
    };


    /**
     * Adds the translation object
     * @param language The language identifier
     * @param translationObject The translation object
     */
    this.addTranslation = function (language, translationObject) {
        translations[language] = translationObject;
    };


    /**
     * Translates the text
     * @param text The text to translate
     * @returns {string}
     */
    this.t = function (text) {
        var translatedText = text;

        if (language !== 'en' && translations[language] !== undefined) {
            if (text.indexOf('[.]') !== -1) {
                var textWithNamespaces = text.split('[.]');

                translatedText = translations[language][textWithNamespaces[0]];
                for (var namespace = 1, namespacesLen = textWithNamespaces.length; namespace < namespacesLen; namespace++) {
                    translatedText = translatedText[textWithNamespaces[namespace]];
                }
            } else {
                translatedText = translations[language][text];
            }
        } else if (text.indexOf('[.]') !== -1) { //English text by default
            translatedText = text.split('[.]').pop();
        }

        return translatedText;
    };
}

window.cytubeEnhanced = new CytubeEnhanced(
    $('title').text(),
    (window.cytubeEnhancedSettings ? (window.cytubeEnhancedSettings.language || 'ru') : 'ru'),
    (window.cytubeEnhancedSettings ? (window.cytubeEnhancedSettings.modulesSettings || {}) : {})
);

cytubeEnhanced.addTranslation('ru', {
    qCommands: {
        'of course': 'определенно да',
        'yes': 'да',
        'maybe': 'возможно',
        'impossible': 'ни шанса',
        'no way': 'определенно нет',
        'don\'t think so': 'вероятность мала',
        'no': 'нет',
        'fairy is busy': 'фея устала и отвечать не будет',
        'I regret to inform you': 'отказываюсь отвечать'
    },
    chatCommands: {
        '%username% action (e.g: <i>/me is dancing</i>)': '%username% что-то сделал. Например: <i>/me танцует</i>',
        'spoiler': 'спойлер',
        'sets the "AFK" status': 'устанавливает статус "Отошёл"',
        'random option from the list of options (!pick option1, option2, option3)': 'выбор случайной опции из указанного списка слов, разделенных запятыми (Например: <i>!pick слово1, слово2, слово3</i>)',
        'asking a question with yes/no/... type answer (e.g. <i>!ask Will i be rich?</i>)': 'задать вопрос с вариантами ответа да/нет/... (Например: <i>!ask Сегодня пойдет дождь?</i>)',
        'show the current time': 'показать текущее время',
        'current time': 'текущее время',
        'throw a dice': 'кинуть кость',
        'random number between 0 and 999': 'случайное число от 0 до 999',
        'show the random quote': 'показать случайную цитату',
        'there aren\'t any quotes. If you are the channel administrator, you can download them from https://github.com/kaba99/cytube-enhanced/tree/master/files/extra/quotes_for_!q': 'цитаты отсутствуют. Если вы администратор канала, то вы можете скачать их на https://github.com/kaba99/cytube-enhanced/tree/master/files/extra/quotes_for_!q',
        'vote for the video skip': 'проголосовать за пропуск текущего видео',
        'you have been voted for the video skip': 'отдан голос за пропуск текущего видео',
        'play the next video': 'проиграть следующее видео',
        'the next video is playing': 'начато проигрывание следующего видео',
        'bump the last video': 'поднять последнее видео',
        'the last video was bumped: ': 'поднято последнее видео: ',
        'adds the video to the end of the playlist (e.g. <i>!add https://www.youtube.com/watch?v=hh4gpgAZkc8</i>)': 'добавляет видео в конец плейлиста (Например: <i>!add https://www.youtube.com/watch?v=hh4gpgAZkc8</i>)',
        'error: the wrong link': 'ошибка: неверная ссылка',
        'the video was added': 'видео было добавлено',
        'show the current video\'s name': 'показать название текущего видео',
        'now: ': 'сейчас играет: ',
        'show the random emote': 'показать случайный смайлик',
        'the secret command': 'секретная команда'
    },
    'The list of chat commands': 'Список команд чата',
    'Standard commands': 'Стандартные команды',
    'Extra commands': 'Дополнительные команды',
    'Commands list': 'Список команд',
    'AFK': 'АФК',
    'Clear chat': 'Очистить чат',
    'Are you sure, that you want to clear the chat?': 'Вы уверены, что хотите очистить чат?',
    favPics: {
        'Show your favorite images': 'Показать избранные картинки',
        'Export pictures': 'Экспорт картинок',
        'Import pictures': 'Импорт картинок',
        'Picture address': 'Адрес картинки',
        'Add': 'Добавить',
        'Remove': 'Удалить',
        'The image already exists': 'Такая картинка уже была добавлена'
    },
    videoInfo: {
        'Now:': 'Сейчас:',
        'Added by': 'Добавлено',
        'Nothing is playing now': 'Сейчас ничего не воспроизводится'
    },
    tabs: {
        'Title': 'Заголовок',
        'Content': 'Содержимое',
        'Show tabs settings (cytube enhanced)': 'Показать настройки вкладок (cytube enhanced)',
        'Tabs settings': 'Настройка вкладок',
        'Channel description': 'Описание канала',
        'Add tab': 'Добавить вкладку',
        'Remove the last tab': 'Удалить последнюю вкладку',
        'Convert to the editor\'s code': 'Преобразовать в код редактора',
        'The code in the editor will be replaced with the new code, continue?': 'Код в редакторе будет удалён и заменен новым, продолжить?',
        'Wrong content for the dropdown': 'Неправильное содержимое для выпадающего списка: ',
        'Convert from the editor\'s code': 'Преобразовать из кода редактора'
    },
    emotes: {
        'Show emotes': 'Показать смайлики'
    },
    userConfig: {
        'Hide header': 'Скрывать шапку',
        'Player position': 'Положение плеера',
        'Playlist position': 'Положение плейлиста',
        'Chat\'s userlist position': 'Позиция списка пользователей чата',
        'Yes': 'Да',
        'No': 'Нет',
        'Left': 'Слева',
        'Right': 'Справа',
        'Center': 'По центру',
        'Show emotes and favorite images': 'Показать смайлики и избранные картинки',
        'Settings': 'Настройки',
        'Layout': 'Оформление',
        'User CSS': 'Пользовательское CSS',
        'Cancel': 'Отмена',
        'Reset settings': 'Сбросить настройки',
        'All the settings including user css will be reset, continue?': 'Все настройки, в том числе и пользовательское CSS будут сброшены, продолжить?',
        'Save': 'Сохранить',
        'Layout settings': 'Настройки оформления',
        'Minimize': 'Минимизировать',
        'Common': 'Общее',
        'and': 'и'
    },
    standardUI: {   //app.t('standardUI[.]')
        'Create a poll': 'Создать опрос',
        'Add video': 'Добавить видео',
        'Add video from url': 'Добавить видео по ссылке',
        'connected users': 'пользователей',
        'connected user': 'пользователь',
        'AFK': 'АФК',
        'Anonymous': 'Анонимных',
        'Channel Admins': 'Администраторов канала',
        'Guests': 'Гостей',
        'Moderators': 'Модераторов',
        'Regular Users': 'Обычных пользователей',
        'Site Admins': 'Администраторов сайта',
        'Welcome, ': 'Добро пожаловать, ',
        'Log out': 'Выйти',
        'Login': 'Логин',
        'Password': 'Пароль',
        'Remember me': 'Запомнить',
        'Log in': 'Вход',
        'Home': 'На главную',
        'Account': 'Аккаунт',
        'Logout': 'Выход',
        'Channels': 'Каналы',
        'Profile': 'Профиль',
        'Change Password/Email': 'Изменить пароль/почту',
        'Register': 'Регистрация',
        'Options': 'Настройки',
        'Channel Settings': 'Настройки канала',
        'Layout': 'Оформление',
        'Chat Only': 'Только чат',
        'Remove Video': 'Удалить видео',
        'Video url': 'Адрес видео',
        'Next': 'Следующим',
        'At end': 'В конец',
        'Play': 'Проиграть',
        'Queue Next': 'Поставить следующим',
        'Make Temporary': 'Сделать временным',
        'Make Permanent': 'Сделать постоянным',
        'Delete': 'Удалить',
        'Name': 'Имя',
        'Guest login': 'Гостевой вход'
    },
    video: {
        'Refresh video': 'Обновить видео',
        'Hide video': 'Скрыть видео',
        'best': 'наивысшее',
        'Quality': 'Качество',
        'Use Youtube JS Player': 'Использовать Youtube JS Player',
        'Expand playlist': 'Развернуть плейлист',
        'Unexpand playlist': 'Свернуть плейлист',
        'Scroll the playlist to the current video': 'Прокрутить плейлист к текущему видео',
        'Contributors\' list': 'Список пользователей, добавивших видео',
        'Video\'s count': 'Всего видео'
    }
});

/*!
 * jQuery Mousewheel 3.1.13
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
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


    this.askAnswers = ["100%", app.t('qCommands[.]of course'), app.t('qCommands[.]yes'), app.t('qCommands[.]maybe'), app.t('qCommands[.]impossible'), app.t('qCommands[.]no way'), app.t('qCommands[.]don\'t think so'), app.t('qCommands[.]no'), "50/50", app.t('qCommands[.]fairy is busy'), app.t('qCommands[.]I regret to inform you')];


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
                return variants[Math.floor(Math.random() * (variants.length - 1))].trim();
            }
        },
        '!ask ': {
            description: app.t('chatCommands[.]asking a question with yes/no/... type answer (e.g. <i>!ask Will i be rich?</i>)'),
            value: function () {
                return that.askAnswers[Math.floor(Math.random() * (that.askAnswers.length - 1))];
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
                    msg = app.t('chatCommands[.]there aren\'t any quotes. If you are the channel administrator, you can download them from https://github.com/kaba99/cytube-enhanced/tree/master/files/extra/quotes_for_!q');
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
                var $yoba = $('<div class="yoba">').appendTo($(document.body));
                $('<img src="http://apachan.net/thumbs/201102/24/ku1yjahatfkc.jpg">').appendTo($yoba);

                var IMBA = new Audio("https://dl.dropboxusercontent.com/s/xdnpynq643ziq9o/inba.ogg");
                IMBA.volume = 0.6;
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
                    BGCHANGE = 0;
                    clearInterval(inbix);
                    $("body").css({'background-image':'', 'background-color':''});
                    $yoba.remove();
                }, 12000);


                return 'YOBA';
            }
        }
    };


    var IS_COMMAND = false;
    this.prepareMessage = function (msg) {
        IS_COMMAND = false;

        for (var command in this.commandsList) {
            if (this.commandsList.hasOwnProperty(command) && msg.indexOf(command) === 0) {
                if (isCommandPermitted(command) && (this.commandsList[command].isAvailable ? this.commandsList[command].isAvailable() : true)) {
                    IS_COMMAND = true;

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

                if (IS_COMMAND) {
                    window.socket.emit("chatMsg", {msg: msg, meta: meta});
                    window.socket.emit("chatMsg", {msg: 'Сырно: ' + msgForCommand});

                    IS_COMMAND = false;
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

window.cytubeEnhanced.addModule('chatCommandsHelp', function (app) {
    'use strict';

    var that = this;


    if ($('#chat-controls').length === 0) {
        $('<div id="chat-controls" class="btn-group">').appendTo("#chatwrap");
    }


    this.commands = {};

    this.commands[app.t('Standard commands')] = {
        '/me': app.t('chatCommands[.]%username% action (e.g: <i>/me is dancing</i>)'),
        '/sp': app.t('chatCommands[.]spoiler'),
        '/afk': app.t('chatCommands[.]sets the "AFK" status')
    };

    if (app.isModulePermitted('additionalChatCommands')) {
        app.getModule('additionalChatCommands').done(function (commandsModule) {
            var additionalCommands = {};

            for (var command in commandsModule.commandsList) {
                if (commandsModule.commandsList.hasOwnProperty(command) && (commandsModule.commandsList[command].isAvailable ? commandsModule.commandsList[command].isAvailable() : true)) {
                    additionalCommands[command] = commandsModule.commandsList[command].description || '';
                }
            }

            that.commands[app.t('Extra commands')] = additionalCommands;
        });
    }


    this.handleChatHelpBtn = function (commands) {
        var $bodyWrapper = $('<div>');

        for (var commandsPart in commands) {
            if (commands.hasOwnProperty(commandsPart)) {
                $('<h3>').html(commandsPart).appendTo($bodyWrapper);

                var $ul = $('<ul>');
                for (var command in commands[commandsPart]) {
                    if (commands[commandsPart].hasOwnProperty(command)) {
                        $('<li>').html('<code>' + command + '</code> - ' + commands[commandsPart][command] + '.').appendTo($ul);
                    }
                }

                $ul.appendTo($bodyWrapper);
            }
        }

        app.getModule('utils').done(function (utilsModule) {
            utilsModule.createModalWindow(app.t('The list of chat commands'), $bodyWrapper);
        });
    };
    this.$chatHelpBtn = $('<button id="chat-help-btn" class="btn btn-sm btn-default">')
        .text(app.t('Commands list'))
        .appendTo('#chat-controls')
        .on('click', function () {
            that.handleChatHelpBtn(that.commands);
        });
});

window.cytubeEnhanced.addModule('chatControls', function (app, settings) {
    'use strict';

    var that = this;

    var defaultSettings = {
        afkButton: true,
        clearChatButton: true
    };
    settings = $.extend({}, defaultSettings, settings);




    this.handleAfkBtn = function () {
        window.socket.emit('chatMsg', {msg: '/afk'});
    };
    this.$afkBtn = $('<span id="afk-btn" class="label label-default pull-right pointer">')
        .text(app.t('AFK'))
        .appendTo('#chatheader')
        .on('click', function () {
            that.handleAfkBtn();
        });



    this.handleAfk = function (data) {
        if (data.name === window.CLIENT.name) {
            if (data.afk) {
                that.$afkBtn.removeClass('label-default');
                that.$afkBtn.addClass('label-success');
            } else {
                that.$afkBtn.addClass('label-default');
                that.$afkBtn.removeClass('label-success');
            }
        }
    };

    if (settings.afkButton) {
        window.socket.on('setAFK', function (data) {
            that.handleAfk(data);
        });
    } else {
        this.$afkBtn.hide();
    }




    this.handleClearBtn = function () {
        if (window.confirm(app.t('Are you sure, that you want to clear the chat?'))) {
            window.socket.emit("chatMsg", {msg: '/clear'});
        }
    };
    this.$clearChatBtn = $('<span id="clear-chat-btn" class="label label-default pull-right pointer">')
        .text(app.t('Clear chat'))
        .insertAfter(this.$afkBtn)
        .on('click', function () {
            that.handleClearBtn();
        });

    if (!window.hasPermission("chatclear")) {
        this.$clearChatBtn.hide();
    }


    this.handleChatClear = function () {
        if (window.hasPermission("chatclear") && settings.clearChatButton) {
            that.$clearChatBtn.show();
        } else {
            that.$clearChatBtn.hide();
        }
    };

    window.socket.on('setUserRank', function () {
        that.handleChatClear();
    });
});

window.cytubeEnhanced.addModule('favouritePictures', function (app) {
    'use strict';

    var that = this;


    if ($('#chat-panel').length === 0) {
        $('<div id="chat-panel" class="row">').insertAfter("#main");
    }

    if ($('#chat-controls').length === 0) {
        $('<div id="chat-controls" class="btn-group">').appendTo("#chatwrap");
    }


    this.$toggleFavouritePicturesPanelBtn = $('<button id="favourite-pictures-btn" class="btn btn-sm btn-default" title="' + app.t('favPics[.]Show your favorite images') + '">')
        .html('<i class="glyphicon glyphicon-th"></i>');
    if ($('#smiles-btn').length !== 0) {
        this.$toggleFavouritePicturesPanelBtn.insertAfter('#smiles-btn');
    } else {
        this.$toggleFavouritePicturesPanelBtn.prependTo('#chat-controls');
    }


    this.$favouritePicturesPanel = $('<div id="favourite-pictures-panel">')
        .appendTo('#chat-panel')
        .hide();

    this.$favouritePicturesBodyPanel = $('<div id="pictures-body-panel" class="row">')
        .appendTo(this.$favouritePicturesPanel);

    this.$favouritePicturesControlPanel = $('<div id="pictures-control-panel" class="row">')
        .appendTo(this.$favouritePicturesPanel);

    this.$favouritePicturesControlPanelForm = $('<div class="col-md-12">')
        .html('<div class="input-group">' +
            '<span class="input-group-btn">' +
                '<button id="export-pictures" class="btn btn-default" style="border-radius: 0;" type="button">' + app.t('favPics[.]Export pictures') + '</button>' +
            '</span>' +
             '<span class="input-group-btn">' +
                '<label for="import-pictures" class="btn btn-default" style="border-radius: 0;">' + app.t('favPics[.]Import pictures') + '</label>' +
                '<input type="file" style="display: none" id="import-pictures" name="pictures-import">' +
            '</span>' +
            '<input type="text" id="picture-address" class="form-control" placeholder="' + app.t('favPics[.]Picture address') + '">' +
            '<span class="input-group-btn">' +
                '<button id="add-picture-btn" class="btn btn-default" style="border-radius: 0;" type="button">' + app.t('favPics[.]Add') + '</button>' +
            '</span>' +
            '<span class="input-group-btn">' +
                '<button id="remove-picture-btn" class="btn btn-default" type="button">' + app.t('favPics[.]Remove') + '</button>' +
            '</span>' +
        '</div>')
        .appendTo(this.$favouritePicturesControlPanel);


    this.entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;'
    };
    this.replaceUnsafeSymbol = function (symbol) {
        return this.entityMap[symbol];
    };
    this.renderFavouritePictures = function () {
        var favouritePictures = JSON.parse(window.localStorage.getItem('favouritePictures')) || [];

        this.$favouritePicturesBodyPanel.empty();

        for (var n = 0, favouritePicturesLen = favouritePictures.length; n < favouritePicturesLen; n++) {
            var escapedAddress = favouritePictures[n].replace(/[&<>"']/g, this.replaceUnsafeSymbol);

            $('<img class="favourite-picture-on-panel">').attr({src: escapedAddress}).appendTo(this.$favouritePicturesBodyPanel);
        }
    };


    this.insertFavouritePicture = function (address) {
        app.getModule('utils').done(function (utilsModule) {
            utilsModule.addMessageToChatInput(' ' + address + ' ', 'end');
        });
    };
    $(document.body).on('click', '.favourite-picture-on-panel', function () {
        that.insertFavouritePicture($(this).attr('src'));
    });


    this.handleFavouritePicturesPanel = function ($toggleFavouritePicturesPanelBtn) {
        var smilesAndPicturesTogether = this.smilesAndPicturesTogether || false; //setted up by userConfig module

        if ($('#smiles-panel').length !== 0 && !smilesAndPicturesTogether) {
            $('#smiles-panel').hide();
        }

        this.$favouritePicturesPanel.toggle();


        if (!smilesAndPicturesTogether) {
            if ($toggleFavouritePicturesPanelBtn.hasClass('btn-default')) {
                if ($('#smiles-btn').length !== 0 && $('#smiles-btn').hasClass('btn-success')) {
                    $('#smiles-btn').removeClass('btn-success');
                    $('#smiles-btn').addClass('btn-default');
                }

                $toggleFavouritePicturesPanelBtn.removeClass('btn-default');
                $toggleFavouritePicturesPanelBtn.addClass('btn-success');
            } else {
                $toggleFavouritePicturesPanelBtn.removeClass('btn-success');
                $toggleFavouritePicturesPanelBtn.addClass('btn-default');
            }
        }
    };
    this.$toggleFavouritePicturesPanelBtn.on('click', function() {
        that.handleFavouritePicturesPanel($(this));
    });


    this.addFavouritePicture = function () {
        if ($('#picture-address').val() !== '') {
            var favouritePictures = JSON.parse(window.localStorage.getItem('favouritePictures')) || [];

            if (favouritePictures.indexOf($('#picture-address').val()) === -1) {
                if ($('#picture-address').val() !== '') {
                    favouritePictures.push($('#picture-address').val());
                }
            } else {
                window.makeAlert(app.t('favPics[.]The image already exists')).prependTo(this.$favouritePicturesBodyPanel);
                $('#picture-address').val('');

                return false;
            }
            $('#picture-address').val('');

            window.localStorage.setItem('favouritePictures', JSON.stringify(favouritePictures));

            this.renderFavouritePictures();
        }
    };
    $('#add-picture-btn').on('click', function () {
        that.addFavouritePicture();
    });


    this.removeFavouritePicture = function () {
        var favouritePictures = JSON.parse(window.localStorage.getItem('favouritePictures')) || [];

        var removePosition = favouritePictures.indexOf($('#picture-address').val());
        if (removePosition !== -1) {
            favouritePictures.splice(removePosition, 1);

            window.localStorage.setItem('favouritePictures', JSON.stringify(favouritePictures));

            this.renderFavouritePictures();
        }

        $('#picture-address').val('');
    };
    $('#remove-picture-btn').on('click', function () {
        that.removeFavouritePicture();
    });


    this.exportPictures = function () {
        var $downloadLink = $('<a>')
            .attr({
                href: 'data:text/plain;charset=utf-8,' + encodeURIComponent(window.localStorage.getItem('favouritePictures') || JSON.stringify([])),
                download: 'cytube_enhanced_favourite_images.txt'
            })
            .hide()
            .appendTo($(document.body));

        $downloadLink[0].click();

        $downloadLink.remove();
    };
    $('#export-pictures').on('click', function () {
        that.exportPictures();
    });


    this.importPictures = function (importFile) {
        var favouritePicturesAddressesReader = new FileReader();

        favouritePicturesAddressesReader.addEventListener('load', function(e) {
            window.localStorage.setItem('favouritePictures', e.target.result);

            that.renderFavouritePictures();
        });
        favouritePicturesAddressesReader.readAsText(importFile);
    };
    $('#import-pictures').on('change', function () {
        that.importPictures($(this)[0].files[0]);
    });


    this.renderFavouritePictures();
});

window.cytubeEnhanced.addModule('imagePreview', function (app, settings) {
    'use strict';

    var that = this;

    var defaultSettings = {
        selectorsToPreview: '.chat-picture', // 'selector1, selector2'. Every selector's node must have attribute src
        zoom: 0.15
    };
    settings = $.extend({}, defaultSettings, settings);

    this.showPicturePreview = function (pictureToPreview) {
        if ($(pictureToPreview).is(settings.selectorsToPreview)) {
            var $picture = $('<img src="' + $(pictureToPreview).attr('src') + '">');

            $picture.ready(function () {
                $('<div id="modal-picture-overlay">').appendTo($(document.body));
                var $modalPicture = $('<div id="modal-picture">').appendTo($(document.body)).draggable();

                var pictureWidth = $picture.prop('width');
                var pictureHeight = $picture.prop('height');


                var $modalPictureOptions = $('<div id="modal-picture-options">');
                $modalPicture.append($('<div id="modal-picture-options-wrapper">').append($modalPictureOptions));

                $('<a href="' + $picture.prop('src') + '" target="_blank" class="btn btn-sm btn-default" style="width:40px;"><i class="glyphicon glyphicon-eye-open"></i></button>')
                    .appendTo($modalPictureOptions);
                $('<a href="https://www.google.com/searchbyimage?image_url=' + $picture.prop('src') + '" target="_blank" class="btn btn-sm btn-default" style="width:40px;"><i class="glyphicon glyphicon-search"></i></button>')
                    .appendTo($modalPictureOptions);


                var scaleFactor = 1;
                if (pictureWidth > document.documentElement.clientWidth && pictureHeight > document.documentElement.clientHeight) {
                    if ((pictureHeight - document.documentElement.clientHeight) > (pictureWidth - document.documentElement.clientWidth)) {
                        scaleFactor = pictureHeight / (document.documentElement.clientHeight * 0.8);
                    } else {
                        scaleFactor = pictureWidth / (document.documentElement.clientWidth * 0.8);
                    }
                } else if (pictureHeight > document.documentElement.clientHeight) {
                    scaleFactor = pictureHeight / (document.documentElement.clientHeight * 0.8);
                } else if (pictureWidth > document.documentElement.clientWidth) {
                    scaleFactor = pictureWidth / (document.documentElement.clientWidth * 0.8);
                }

                pictureHeight /= scaleFactor;
                pictureWidth /= scaleFactor;

                $modalPicture.css({
                    width: pictureWidth,
                    height: pictureHeight,
                    marginLeft: -(pictureWidth / 2),
                    marginTop: -(pictureHeight / 2)
                });


                $picture.appendTo($modalPicture);
            });
        }
    };
    $(document.body).on('click', function () {
        that.showPicturePreview(event.target);
    });


    this.handleModalPictureMouseWheel = function (e) {
        var pictureWidth = parseInt($('#modal-picture').css('width'), 10);
        var pictureHeight = parseInt($('#modal-picture').css('height'), 10);
        var pictureMarginLeft = parseInt($('#modal-picture').css('marginLeft'), 10);
        var pictureMarginTop = parseInt($('#modal-picture').css('marginTop'), 10);

        if (e.deltaY > 0) { //up
            $('#modal-picture').css({
                width: pictureWidth * (1 + settings.zoom),
                height: pictureHeight * (1 + settings.zoom),
                marginLeft: pictureMarginLeft + (-pictureWidth * settings.zoom / 2),
                marginTop: pictureMarginTop + (-pictureHeight * settings.zoom / 2)
            });
        } else { //down
            $('#modal-picture').css({
                width: pictureWidth * (1 - settings.zoom),
                height: pictureHeight * (1 - settings.zoom),
                marginLeft: pictureMarginLeft + (pictureWidth * settings.zoom / 2),
                marginTop: pictureMarginTop + (pictureHeight * settings.zoom / 2)
            });
        }
    };
    $(document.body).on('mousewheel', '#modal-picture', function (e) {
        that.handleModalPictureMouseWheel(e);

        return false;
    });


    this.closePictureByClick = function () {
        $('#modal-picture-overlay').remove();
        $('#modal-picture').remove();
    };
    $(document.body).on('click', '#modal-picture-overlay, #modal-picture', function () {
        that.closePictureByClick();
    });

    this.closePictureByEscape = function (e) {
        if (e.which === 27 && $('#modal-picture').length !== 0) {
            $('#modal-picture-overlay').remove();
            $('#modal-picture').remove();
        }
    };
    $(document.body).on('keydown', function (e) {
        that.closePictureByEscape(e);
    });
});

//You can fill motd editor with the example of tabs: <div id="motd-channel-description"><h1 class="text-center channel-description">Добро пожаловать на аниме канал имиджборда <a href="https://2ch.hk" style="color:#FF6600" target="_blank">Два.ч</a>. Снова.</h1></div><div id="motd-tabs-wrapper"><div id="motd-tabs"><button class="btn btn-default motd-tab-btn" data-tab-index="0">Расписание</button><button class="btn btn-default motd-tab-btn" data-tab-index="1">FAQ и правила</button><button class="btn btn-default motd-tab-btn" data-tab-index="2">Список реквестов</button><button class="btn btn-default motd-tab-btn" data-tab-index="3">Реквестировать аниме</button><div class="btn-group"><button class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Наши ссылки <span class="caret"></span></button><ul class="dropdown-menu"><li><a href="http://myanimelist.net/animelist/animachtv" target="_blank">MAL</a></li><li><a href="https://2ch.hk/tvch/" target="_blank">Наша доска</a></li><li><a href="https://twitter.com/2ch_tv" target="_blank">Твиттер</a></li><li><a href="http://vk.com/tv2ch" target="_blank">ВК</a></li></ul></div></div><div id="motd-tabs-content"><div class="motd-tab-content" data-tab-index="0" style="display: none;"><div class="text-center"><img src="http://i.imgur.com/R9buKtU.png" style="width: 90%; max-width: 950px;" /></div></div><div class="motd-tab-content" data-tab-index="1" style="display: none;"><strong>Канал загружается, но видео отображает сообщение об ошибке</strong><br />Некоторые расширения могут вызывать проблемы со встроенными плеерами. Отключите расширения и попробуйте снова. Так же попробуйте почистить кэш/куки и нажать <img src="https://i840.photobucket.com/albums/zz324/cpu_fan/reload_zpsf14999c3.png" />.<br /><br /><strong>Страница загружается, но не происходит подключение</strong><br />Это проблема соединения вашего браузера с сервером. Некоторые провайдеры, фаерволы или антивирусы могут блокировать или фильтровать порты.<br /><br /><strong>Меня забанили. Я осознал свою ошибку и хочу разбана. Что я должен сделать?</strong><br />Реквестировать разбан можно у администраторов/модераторов канала, указав забаненный ник.<br /><br /><strong>Как отправлять смайлики</strong><br />Смайлики имеют вид `:abu:`. Под чатом есть кнопка для отправления смайлов.<br /><br /><strong>Как пользоваться личными сообщениями?</strong><br />Выбираем пользователя в списке, жмем второй кнопкой мыши и выбираем "Private Message".<br /><br />Как добавить свое видео в плейлист?<br />Добавить видео - Вставляем ссылку на видео (список поддерживаемых источников ниже) - At End. Ждем очереди.<br /><br /><strong>Как проголосовать за пропуск видео?</strong><br />Кнопка <img src="https://i840.photobucket.com/albums/zz324/cpu_fan/ss2014-03-10at114058_zps7de4fa28.png" />. Если набирается определенное количество голосов (обычно 20-25% от общего числа находящихся на канале), то видео пропускается.<br /><br /><strong>Почему я не могу проголосовать за пропуск?</strong><br />Во время трансляций и передач по расписанию администрация отключает голосование за пропуск.<br /><br /><strong>Как посмотреть, кто добавил видео в плейлист?</strong><br />Наводим курсор на название видео в плейлисте.<br /><br /><strong>Как пользоваться поиском видео?</strong><br />Кнопка <img src="https://i840.photobucket.com/albums/zz324/cpu_fan/search_zps335dfef6.png" /> . Вводим название видео. По нажатию на кнопку "Library" можно найти видео в библиотеке канала. Найти видео на YouTube можно нажав на одноименную кнопку.<br /><br /><strong>Список поддерживаемых URL:</strong><br />* YouTube - <code>http://youtube.com/watch?v=(videoid)</code> или <code>http://youtube.com/playlist?list(playlistid)</code><br />* Vimeo - <code>http://vimeo.com/(videoid)</code><br />* Soundcloud - <code>http://soundcloud.com/(songname)</code><br />* Dailymotion - <code>http://dailymotion.com/video/(videoid)</code><br />* TwitchTV - <code>http://twitch.tv/(stream)</code><br />* JustinTV - <code>http://justin.tv/(stream)</code><br />* Livestream - <code>http://livestream.com/(stream)</code><br />* UStream - <code>http://ustream.tv/(channel)</code><br />* RTMP Livestreams - <code>rtmp://(stream server)</code><br />* JWPlayer - <code>jw:(stream url)</code><br /><br /><strong>Ранговая система:</strong><br />* Администратор сайта - Красный, розовый, фиолетовый<br />* Администратор канала - Голубой<br />* Модератор канала - Зеленый<br />* Пользователь - Белый<br />* Гость - Серый<br /><br /><strong>Правила:</strong><br />Не злоупотреблять смайлами<br />Не вайпать чат и плейлист<br />Не спамить ссылками<br />Не спойлерить<br />Обсуждение политики - /po<br /></div><div class="motd-tab-content" data-tab-index="2" style="display: none;"><div class="text-center">[iframe src="https://docs.google.com/forms/viewform?authuser=0&amp;bc=transparent&amp;embedded=true&amp;f=Georgia%252C%2BTimes%2BNew%2BRoman%252C%2Bserif&amp;hl=ru&amp;htc=%2523666666&amp;id=1lEES2KS-S54PXlgAv0O6OK0RweZ6yReYOdV_vmuZzts&amp;lc=%25230080bb&amp;pli=1&amp;tc=%2523333333&amp;ttl=0" width="100%" height="600" title="Форма "Таблица Google"" allowtransparency="true" frameborder="0" marginheight="0" marginwidth="0" id="982139229"]У вас не поддерживается iframe[/iframe]</div></div><div class="motd-tab-content" data-tab-index="3" style="display: none;"><div class="text-center">[iframe src="https://docs.google.com/spreadsheets/d/1ZokcogxujqHsR-SoBPnTDTkwDvmFYHajuPLRv7-WjU4/htmlembed?authuser=0" width="780" height="800" title="Реквесты на аниме" frameborder="0" id="505801161"]У вас не поддерживается iframe[/iframe]</div></div></div></div>
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
            if ($(this).hasClass('btn-group')) {
                var parsedDropdownItems = '';
                var $dropdownItems = $(this).children('ul').children();

                $dropdownItems.each(function () {
                    var link = $(this).children('a');

                    parsedDropdownItems += '[n]' + link.text() + '[/n][a]' + link.attr('href') + '[/a], ';
                });
                parsedDropdownItems = parsedDropdownItems.slice(0, -2);

                that.addTabInput(that.$tabsArea, '!dropdown!' + $(this).children('button').html().replace(' <span class="caret"></span>', ''), parsedDropdownItems);
            } else {
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


    this.$tabsSettings = $('<div id="tabs-settings">')
        .html('<hr><h3>' + app.t('tabs[.]Tabs settings') + '</h3>')
        .insertBefore('#cs-motdtext')
        .hide();

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
            that.tabsHtmlToCondig($('#cs-motdtext').val());
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
});

window.cytubeEnhanced.addModule('showVideoInfo', function (app) {
    'use strict';

    var that = this;


    this.$titleRow = $('<div id="titlerow" class="row">').insertBefore('#main');

	this.$titleRowOuter = $('<div id="titlerow-outer" class="col-md-12" />')
        .html($("#currenttitle").text($(".queue_active a").text() !== '' ? $("#currenttitle").text().replace(/^Currently Playing:/, app.t('videoInfo[.]Now:')) : '').detach())
        .appendTo(this.$titleRow);

    this.$mediaInfo = $('<p id="mediainfo">').prependTo("#videowrap");


    this.showPlaylistInfo = function () {
        if ($(".queue_active").length !== 0) {
            $("#currenttitle").text($("#currenttitle").text().replace(/^Currently Playing:/, app.t('videoInfo[.]Now:')));

            this.$mediaInfo.text($('.queue_active').attr('title').replace('Added by', app.t('videoInfo[.]Added by')));
        } else {
            $("#currenttitle").text('');

            this.$mediaInfo.text(app.t('videoInfo[.]Nothing is playing now'));
        }
    };




    this.showPlaylistInfo();
    window.socket.on("changeMedia", function () {
        that.showPlaylistInfo();
    });
});

window.cytubeEnhanced.addModule('smiles', function (app) {
    'use strict';

    var that = this;


    if ($('#chat-panel').length === 0) {
        $('<div id="chat-panel" class="row">').insertAfter("#main");
    }

    if ($('#chat-controls').length === 0) {
        $('<div id="chat-controls" class="btn-group">').appendTo("#chatwrap");
    }


    $('#emotelistbtn').hide();


    this.$smilesBtn = $('<button id="smiles-btn" class="btn btn-sm btn-default" title="' + app.t('emotes[.]Show emotes') + '">')
        .html('<i class="glyphicon glyphicon-picture"></i>')
        .prependTo('#chat-controls');


    this.$smilesPanel = $('<div id="smiles-panel">')
        .prependTo('#chat-panel')
        .hide();


    this.renderSmiles = function () {
        var smiles = window.CHANNEL.emotes;

        for (var smileIndex = 0, smilesLen = smiles.length; smileIndex < smilesLen; smileIndex++) {
            $('<img class="smile-on-panel">')
                .attr({src: smiles[smileIndex].image})
                .data('name', smiles[smileIndex].name)
                .appendTo(this.$smilesPanel);
        }
    };


    this.insertSmile = function (smileName) {
        app.getModule('utils').done(function (utilsModule) {
            utilsModule.addMessageToChatInput(' ' + smileName + ' ', 'end');
        });
    };
    $(document.body).on('click', '.smile-on-panel', function () {
        that.insertSmile($(this).data('name'));
    });


    this.handleSmileBtn = function ($smilesBtn) {
        var smilesAndPicturesTogether = this.smilesAndPicturesTogether || false; //setted up by userConfig module

        if ($('#favourite-pictures-panel').length !== 0 && !smilesAndPicturesTogether) {
            $('#favourite-pictures-panel').hide();
        }

        this.$smilesPanel.toggle();

        if (!smilesAndPicturesTogether) {
            if ($smilesBtn.hasClass('btn-default')) {
                if ($('#favourite-pictures-btn').length !== 0 && $('#favourite-pictures-btn').hasClass('btn-success')) {
                    $('#favourite-pictures-btn').removeClass('btn-success');
                    $('#favourite-pictures-btn').addClass('btn-default');
                }

                $smilesBtn.removeClass('btn-default');
                $smilesBtn.addClass('btn-success');
            } else {
                $smilesBtn.removeClass('btn-success');
                $smilesBtn.addClass('btn-default');
            }
        }
    };
    this.$smilesBtn.on('click', function() {
        that.handleSmileBtn($(this));
    });




    this.renderSmiles();
});

window.cytubeEnhanced.addModule('standardUITranslate', function (app) {
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
    if ($('#login')) {
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
});

window.cytubeEnhanced.addModule('userConfig', function (app, settings) {
    'use strict';

    var that = this;

    var defaultSettings = {
        layoutConfigButton: true,
        smilesAndPicturesTogetherButton: true,
        minimizeButton: true
    };
    settings = $.extend({}, defaultSettings, settings);


    this.UserConfig = function () {
        /**
         * UserConfig options
         * @type {object}
         */
        this.options = {};

        /**
         * Sets the user's option and saves it in the user's cookies
         * @param name The name ot the option
         * @param value The value of the option
         */
        this.set = function (name, value) {
            this.options[name] = value;
            window.setOpt(window.CHANNEL.name + "_config-" + name, value);
        };

        /**
         * Gets the value of the user's option
         *
         * User's values are setted up from user's cookies at the beginning of the script by the method loadDefaults()
         *
         * @param name Option's name
         * @returns {*}
         */
        this.get = function (name) {
            if (!this.options.hasOwnProperty(name)) {
                this.options[name] = window.getOrDefault(window.CHANNEL.name + "_config-" + name, undefined);
            }

            return this.options[name];
        };

        /**
         * Toggles user's boolean option
         * @param name Boolean option's name
         * @returns {boolean}
         */
        this.toggle = function (name) {
            var result = !this.get(name);

            this.set(name, result);

            return result;
        };
    };

    this.userConfig = new this.UserConfig();

    this.$configWrapper = $('<div id="config-wrapper" class="col-lg-12 col-md-12">').appendTo("#leftpane-inner");
    this.$configBody = $('<div id="config-body" class="well form-horizontal">').appendTo(this.$configWrapper);

    this.handleConfigBtn = function () {
        this.userConfig.toggle('hide-config-panel');
        this.$configWrapper.toggle();
    };
    this.$configBtn = $('<button id="layout-btn" class="btn btn-sm btn-default pull-right">')
        .html('<span class="glyphicon glyphicon-cog"></span> ' + app.t('userConfig[.]Settings'))
        .appendTo('#leftcontrols')
        .on('click', function() {
            that.handleConfigBtn();
        });

    if (this.userConfig.get('hide-config-panel')) {
        this.$configWrapper.hide();
    } else {
        this.$configWrapper.show();
    }




    this.$layoutForm = $('<div id="layout-config-form" class="form-group">').appendTo(this.$configBody)
        .append($('<div class="col-lg-3 col-md-3 control-label">' + app.t('userConfig[.]Layout') + '</div>'));
    this.$layoutWrapper = $('<div id="layout-config-wrapper" class="col-lg-9 col-md-9 text-center">').appendTo(this.$layoutForm);
    this.$layoutBtnWrapper = $('<div id="layout-config-btn-wrapper" class="btn-group">').appendTo(this.$layoutWrapper);
    if (!settings.layoutConfigButton && !settings.minimizeButton) {
        this.$layoutForm.hide();
    }


    this.layoutOptions = {
        'hide-header': {
            title: app.t('userConfig[.]Hide header'),
            default: 'no',
            values: {
                yes: app.t('userConfig[.]Yes'),
                no: app.t('userConfig[.]No')
            }
        },
        'player-position': {
            title: app.t('userConfig[.]Player position'),
            default: 'right',
            values: {
                left: app.t('userConfig[.]Left'),
                right: app.t('userConfig[.]Right'),
                center: app.t('userConfig[.]Center')
            }
        },
        'playlist-position': {
            title: app.t('userConfig[.]Playlist position'),
            default: 'right',
            values: {
                left: app.t('userConfig[.]Left'),
                right: app.t('userConfig[.]Right')
            }
        },
        'userlist-position': {
            title: app.t('userConfig[.]Chat\'s userlist position'),
            default: 'left',
            values: {
                left: app.t('userConfig[.]Left'),
                right: app.t('userConfig[.]Right')
            }
        }
    };

    this.configUserLayout = function (layoutValues) {
        var $settingsWrapper = $('<div class="form-horizontal">');

        for (var layoutOption in this.layoutOptions) {
            if (this.layoutOptions.hasOwnProperty(layoutOption)) {
                var $formGroup = $('<div class="form-group">').appendTo($settingsWrapper);

                $('<label for="' + layoutOption + '" class="col-sm-2 control-label">' + this.layoutOptions[layoutOption].title + '</label>').appendTo($formGroup);

                var $selectWrapper = $('<div class="col-sm-10">').appendTo($formGroup);
                var $select = $('<select id="' + layoutOption + '" class="form-control">').appendTo($selectWrapper);

                for (var selectOption in this.layoutOptions[layoutOption].values) {
                    if (this.layoutOptions[layoutOption].values.hasOwnProperty(selectOption)) {
                        $('<option value="' + selectOption + '">' + this.layoutOptions[layoutOption].values[selectOption] + '</option>').appendTo($select);
                    }
                }

                if (layoutValues.hasOwnProperty(layoutOption)) {
                    $select.val(layoutValues[layoutOption]);
                } else {
                    $select.val(this.layoutOptions[layoutOption].default);
                }
            }
        }

        var $userCssWrapper = $('<div class="form-group">').appendTo($settingsWrapper);
        $('<label for="user-css" class="col-sm-2 control-label">' + app.t('userConfig[.]User CSS') + '</label>').appendTo($userCssWrapper);
        var $userCssTextareaWrapper = $('<div class="col-sm-10">').appendTo($userCssWrapper);
        $('<textarea id="user-css" class="form-control" rows="7">')
            .appendTo($userCssTextareaWrapper)
            .val(layoutValues['user-css'] || '');


        var $btnWrapper = $('<div>');

        $('<button type="button" id="cancel-user-layout" class="btn btn-info" data-dismiss="modal">' + app.t('userConfig[.]Cancel') + '</button>').appendTo($btnWrapper);

        $('<button type="button" id="reset-user-layout" class="btn btn-danger">' + app.t('userConfig[.]Reset settings') + '</button>')
            .appendTo($btnWrapper)
            .on('click', function () {
                if (window.confirm(app.t('userConfig[.]All the settings including user css will be reset, continue?'))) {
                    for (var layoutOption in that.layoutOptions) {
                        if (that.layoutOptions.hasOwnProperty(layoutOption)) {
                            layoutValues[layoutOption] = that.layoutOptions[layoutOption].default;
                        }
                    }
                    layoutValues['user-css'] = '';


                    that.userConfig.set('layout', JSON.stringify(layoutValues));

                    that.applyLayoutSettings(layoutValues);

                    $modalWindow.modal('hide');
                }
            });

        $('<button type="button" id="save-user-layout" class="btn btn-success">')
            .text(app.t('userConfig[.]Save'))
            .appendTo($btnWrapper)
            .on('click', function () {
                for (var layoutOption in that.layoutOptions) {
                    if (that.layoutOptions.hasOwnProperty(layoutOption)) {
                        if ($('#' + layoutOption).length !== 0) {
                            layoutValues[layoutOption] = $('#' + layoutOption).val();
                        } else {
                            layoutValues[layoutOption] = that.layoutOptions[layoutOption].default;
                        }
                    }
                }
                if ($('#user-css').length !== 0) {
                    layoutValues['user-css'] = $('#user-css').val();
                } else {
                    layoutValues['user-css'] = '';
                }


                that.userConfig.set('layout', JSON.stringify(layoutValues));

                that.applyLayoutSettings(layoutValues);

                $modalWindow.modal('hide');
            });


        var $modalWindow;
        app.getModule('utils').done(function (utilsModule) {
            $modalWindow = utilsModule.createModalWindow(app.t('userConfig[.]Layout settings'), $settingsWrapper, $btnWrapper);
        });
    };

    this.applyLayoutSettings = function (layoutValues) {
        if (layoutValues['hide-header'] === 'yes') {
            $('#motdrow').hide();
            $('#motdrow').data('hiddenByLayout', '1');
        } else {
            if ($('#motdrow').data('hiddenByMinimize') !== '1') {
                $('#motdrow').show();
            }
            $('#motdrow').data('hiddenByLayout', '0');
        }

        if (layoutValues['player-position'] === 'left') {
            if ($('#chatwrap').hasClass('col-md-10 col-md-offset-1')) {
                $('#chatwrap').removeClass('col-md-10 col-md-offset-1');
                $('#chatwrap').addClass('col-lg-5 col-md-5');
            }
            if ($('#videowrap').hasClass('col-md-10 col-md-offset-1')) {
                $('#videowrap').removeClass('col-md-10 col-md-offset-1');
                $('#videowrap').addClass('col-lg-7 col-md-7');
            }

            $('#videowrap').detach().insertBefore($('#chatwrap'));
        } else if (layoutValues['player-position'] === 'center') {
            $('#chatwrap').removeClass(function (index, css) { //remove all col-* classes
                return (css.match(/(\s)*col-(\S)+/g) || []).join('');
            });
            $('#videowrap').removeClass(function (index, css) { //remove all col-* classes
                return (css.match(/(\s)*col-(\S)+/g) || []).join('');
            });

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

        if (layoutValues['playlist-position'] === 'left') {
            $('#rightcontrols').detach().insertBefore($('#leftcontrols'));
            $('#rightpane').detach().insertBefore($('#leftpane'));
        } else { //right
            $('#leftcontrols').detach().insertBefore($('#rightcontrols'));
            $('#leftpane').detach().insertBefore($('#rightpane'));
        }

        if (layoutValues['userlist-position'] === 'right') {
            $('#userlist').addClass('pull-right');
        } else { //left
            $('#userlist').removeClass('pull-right');
        }

        if (layoutValues.hasOwnProperty('user-css') && layoutValues['user-css'] !== '') {
            $("head").append('<style id="user-style" type="text/css">' + userConfig.get('user-css') + '</style>');
        } else if ($('#user-style').length !== 0) {
            $('#user-style').remove();
        }


        $('#refresh-video').click();
    };

    this.handleLayout = function () {
        var userLayout;
        try {
            userLayout = window.JSON.parse(this.userConfig.get('layout')) || {};
        } catch (e) {
            userLayout = {};
        }

        this.configUserLayout(userLayout);
    };
    this.$layoutConfigBtn = $('<button id="layout-configuration-btn" class="btn btn-default">')
        .text(app.t('userConfig[.]Settings'))
        .appendTo(this.$layoutBtnWrapper)
        .on('click', function() {
            that.handleLayout();
        });

    var userLayout;
    if (settings.layoutConfigButton) {
        try {
            userLayout = window.JSON.parse(this.userConfig.get('layout')) || {};
        } catch (e) {
            userLayout = {};
        }

        this.applyLayoutSettings(userLayout);
    } else {
        this.$layoutConfigBtn.hide();
    }




    this.applyMinimize = function (isMinimized) {
        if (isMinimized) {
            $('#motdrow').data('hiddenByMinimize', '1');
            $('#motdrow').hide();
            $('#queue').parent().hide();

            that.$minBtn.removeClass('btn-default');
            that.$minBtn.addClass('btn-success');
        } else {
            if ($('#motdrow').data('hiddenByLayout') !== '1') {
                $('#motdrow').show();
            }
            $('#motdrow').data('hiddenByMinimize', '0');
            $('#queue').parent().show();

            that.$minBtn.removeClass('btn-success');
            that.$minBtn.addClass('btn-default');
        }
    };

    this.$minBtn = $('<button id="layout-min-btn" class="btn btn-default">')
        .text(app.t('userConfig[.]Minimize'))
        .appendTo(this.$layoutBtnWrapper)
        .on('click', function() {
            that.applyMinimize(that.userConfig.toggle('isMinimized'));
        });

    if (settings.minimizeButton) {
        this.applyMinimize(this.userConfig.get('isMinimized'));
    } else {
        this.$minBtn.hide();
    }




    this.$commonConfigForm = $('<div id="common-config-form" class="form-group">')
        .append($('<div class="col-lg-3 col-md-3 control-label">').text(app.t('userConfig[.]Common')))
        .appendTo(this.$configBody);
    this.$commonConfigWrapper = $('<div id="common-config-wrapper" class="col-lg-9 col-md-9 text-center">').appendTo(this.$commonConfigForm);
    this.$commonConfigBtnWrapper = $('<div id="common-config-btn-wrapper" class="btn-group">').appendTo(this.$commonConfigWrapper);

    if (!(settings.smilesAndPicturesTogetherButton && app.isModulePermitted('smiles') && app.isModulePermitted('favouritePictures'))) {
        this.$commonConfigForm.hide();
    }


    this.applySmilesAndPictures = function (isTurnedOn) {
        app.getModule('smiles').done(function (smilesModule) {
            smilesModule.smilesAndPicturesTogether = isTurnedOn;
        });

        app.getModule('favouritePictures').done(function (favouritePicturesModule) {
            favouritePicturesModule.smilesAndPicturesTogether = isTurnedOn;
        });


        if (isTurnedOn) {
            that.$smilesAndPicturesBtn.removeClass('btn-default');
            that.$smilesAndPicturesBtn.addClass('btn-success');

            $('#smiles-btn').hide();
            $('#smiles-panel').hide();
            $('#smiles-btn').addClass('btn-default');
            $('#smiles-btn').removeClass('btn-success');

            $('#favourite-pictures-btn').hide();
            $('#favourite-pictures-panel').hide();
            $('#favourite-pictures-btn').addClass('btn-default');
            $('#favourite-pictures-btn').removeClass('btn-success');

            $('<button id="smiles-and-picture-btn" class="btn btn-sm btn-default" title="' + app.t('userConfig[.]Show emotes and favorite images') + '">')
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
            if ($('#smiles-and-picture-btn').length !== 0) {
                $('#smiles-and-picture-btn').remove();
            }

            that.$smilesAndPicturesBtn.removeClass('btn-success');
            that.$smilesAndPicturesBtn.addClass('btn-default');

            $('#smiles-btn').show();
            $('#favourite-pictures-btn').show();

            $('#smiles-panel').hide();
            $('#favourite-pictures-panel').hide();
        }
    };

    this.$smilesAndPicturesBtn = $('<button id="common-config-smiles-and-pictures-btn" class="btn btn-default">')
        .html('<i class="glyphicon glyphicon-picture"></i> ' + app.t('userConfig[.]and') + ' <i class="glyphicon glyphicon-th"></i>')
        .appendTo(that.$commonConfigBtnWrapper)
        .on('click', function() {
            that.applySmilesAndPictures(that.userConfig.toggle('smiles-and-pictures'));
        });

    if (settings.smilesAndPicturesTogetherButton && app.isModulePermitted('smiles') && app.isModulePermitted('favouritePictures')) {
        this.applySmilesAndPictures(this.userConfig.get('smiles-and-pictures'));
    } else {
        this.$smilesAndPicturesBtn.hide();
    }
});

window.cytubeEnhanced.addModule('utils', function (app, settings) {
    'use strict';

    var that = this;

    var defaultSettings = {
        unfixedTopNavbar: true,
        insertUsernameOnClick: true,
        showScriptInfo: true
    };
    settings = $.extend({}, defaultSettings, settings);


    /**
     * Adds the text to chat input
     * @param message The text to add.
     * @param position The position of the adding. It can be 'begin' or 'end'.
     */
    this.addMessageToChatInput = function (message, position) {
        position = position || 'end';

        if (position === 'begin') {
            message = message + $("#chatline").val();
        } else {
            message = $("#chatline").val() + message;
        }

        $('#chatline').val(message).focus();
    };


    if (settings.insertUsernameOnClick) {
        $('#messagebuffer').on('click', '.username', function() {
            that.addMessageToChatInput($(this).text(), 'begin');
        });
    }


    this.createModalWindow = function($headerContent, $bodyContent, $footerContent) {
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



    if (settings.unfixedTopNavbar) {
        $('#wrap').children('.navbar-fixed-top').removeClass('navbar-fixed-top');
    }

    if (settings.showScriptInfo) {
        $('#footer').children('.container').append('<p class="text-muted credit">CyTube Enhanced (<a href="https://github.com/kaba99/cytube-enhanced">GitHub</a>)</p>');
    }

    setTimeout(function () {
        window.handleWindowResize(); //chat height fix
    }, 3000);
});

window.cytubeEnhanced.addModule('videoControls', function (app, settings) {
    'use strict';

    var that = this;

    var defaultSettings = {
        turnOffVideoOption: true,
        selectQualityOption: true,
        expandPlaylistOption: true,
        showVideoContributorsOption: true,
        playlistHeight: 500
    };
    settings = $.extend({}, defaultSettings, settings);

    $('#mediarefresh').hide();


    this.$topVideoControls = $('<div id="top-video-controls" class="btn-group">').appendTo("#videowrap");

    this.refreshVideo = function () {
        $('#mediarefresh').click();
    };
    this.$refreshVideoBtn = $('<button id="refresh-video" class="btn btn-sm btn-default" title="' + app.t('video[.]Refresh video') + '">')
        .html('<i class="glyphicon glyphicon-refresh">')
        .appendTo(this.$topVideoControls)
        .on('click', function () {
            that.refreshVideo();
        });


    this.hidePlayer = function ($hidePlayerBtn) {
        if ($hidePlayerBtn.hasClass('btn-default')) { //video visible
            var $playerWindow = $('#videowrap').find('.embed-responsive');
            $playerWindow.css({position: 'relative'});

            $('<div id="player-overlay">').appendTo($playerWindow);

            $hidePlayerBtn.html('<i class="glyphicon glyphicon-film">');
            $hidePlayerBtn.removeClass('btn-default');
            $hidePlayerBtn.addClass('btn-success');
        } else { //video hidden
            $('#player-overlay').remove();

            $hidePlayerBtn.html('<i class="glyphicon glyphicon-ban-circle">');
            $hidePlayerBtn.removeClass('btn-success');
            $hidePlayerBtn.addClass('btn-default');
        }
    };
    this.$hidePlayerBtn = $('<button id="hide-player-btn" class="btn btn-sm btn-default" title="' + app.t('video[.]Hide video') + '">')
        .html('<i class="glyphicon glyphicon-ban-circle">')
        .appendTo(this.$topVideoControls)
        .on('click', function() {
            that.hidePlayer($(this));
        });
    if (!settings.turnOffVideoOption) {
        this.$hidePlayerBtn.hide();
    }


    this.qualityLabelsTranslate = {
        auto: 'авто',
        240: '240p',
        360: '360p',
        480: '480p',
        720: '720p',
        1080: '1080p',
        best: app.t('video[.]best')
    };
    var qualityLabelsTranslateOrder = ['auto', 240, 360, 480, 720, 1080, 'best'];

    this.$videoQualityBtnGroup = $('<div class="btn-group">')
        .html('<button type="button" class="btn btn-default btn-sm video-dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' + app.t('video[.]Quality') + ': ' + this.qualityLabelsTranslate[window.USEROPTS.default_quality || 'auto'] + ' <span class="caret"></span></button>')
        .appendTo(this.$topVideoControls);

    this.$videoQualityList = $('<ul class="dropdown-menu">');
    for (var labelIndex = 0, labelsLength = qualityLabelsTranslateOrder.length; labelIndex < labelsLength; labelIndex++) {
        $('<li>')
            .html('<a href="#" data-quality="' + qualityLabelsTranslateOrder[labelIndex] + '">' + this.qualityLabelsTranslate[qualityLabelsTranslateOrder[labelIndex]] + '</a>')
            .appendTo(this.$videoQualityList);
    }
    this.$videoQualityList.appendTo(this.$videoQualityBtnGroup);

    this.changeVideoQuality = function ($qualityLink) {
        this.settingsFix();
        $("#us-default-quality").val($qualityLink.data('quality'));
        window.saveUserOptions();

        this.$refreshVideoBtn.click();

        this.$videoQualityBtnGroup.find('button').html(app.t('video[.]Quality') + ': ' + $qualityLink.text() + ' <span class="caret"></span>');
        $('.video-dropdown-toggle').dropdown();
    };
    this.$videoQualityBtnGroup.on('click', 'a', function () {
        that.changeVideoQuality($(this));

        return false;
    });

    $("#us-default-quality").on('change', function () {
        that.$videoQualityBtnGroup.find('button').html(app.t('video[.]Quality') + ': ' + that.qualityLabelsTranslate[$(this).val()] + ' <span class="caret"></span>');
    });

    if (!settings.selectQualityOption) {
        this.$videoQualityBtnGroup.hide();
    }


    this.settingsFix = function () {
        $("#us-theme").val(window.USEROPTS.theme);
        $("#us-layout").val(window.USEROPTS.layout);
        $("#us-no-channelcss").prop("checked", window.USEROPTS.ignore_channelcss);
        $("#us-no-channeljs").prop("checked", window.USEROPTS.ignore_channeljs);

        $("#us-synch").prop("checked", window.USEROPTS.synch);
        $("#us-synch-accuracy").val(window.USEROPTS.sync_accuracy);
        $("#us-wmode-transparent").prop("checked", window.USEROPTS.wmode_transparent);
        $("#us-hidevideo").prop("checked", window.USEROPTS.hidevid);
        $("#us-playlistbuttons").prop("checked", window.USEROPTS.qbtn_hide);
        $("#us-oldbtns").prop("checked", window.USEROPTS.qbtn_idontlikechange);
        $("#us-default-quality").val(window.USEROPTS.default_quality || "auto");

        $("#us-chat-timestamp").prop("checked", window.USEROPTS.show_timestamps);
        $("#us-sort-rank").prop("checked", window.USEROPTS.sort_rank);
        $("#us-sort-afk").prop("checked", window.USEROPTS.sort_afk);
        $("#us-blink-title").val(window.USEROPTS.blink_title);
        $("#us-ping-sound").val(window.USEROPTS.boop);
        $("#us-sendbtn").prop("checked", window.USEROPTS.chatbtn);
        $("#us-no-emotes").prop("checked", window.USEROPTS.no_emotes);

        $("#us-modflair").prop("checked", window.USEROPTS.modhat);
        $("#us-joinmessage").prop("checked", window.USEROPTS.joinmessage);
        $("#us-shadowchat").prop("checked", window.USEROPTS.show_shadowchat);
    };


    this.expandPlaylist = function ($expandPlaylistBtn) {
        if ($expandPlaylistBtn.hasClass('btn-success')) {//expanded
            $('#queue').css('max-height', settings.playlistHeight + 'px');

            $expandPlaylistBtn.attr('title', app.t('video[.]Expand playlist'));

            $expandPlaylistBtn.removeClass('btn-success');
            $expandPlaylistBtn.addClass('btn-default');
        } else {//not expanded
            $('#queue').css('max-height', '100000px');

            $expandPlaylistBtn.attr('title', app.t('video[.]Unexpand playlist'));

            $expandPlaylistBtn.removeClass('btn-default');
            $expandPlaylistBtn.addClass('btn-success');

            window.scrollQueue();
        }
    };
    this.$expandPlaylistBtn = $('<button id="expand-playlist-btn" class="btn btn-sm btn-default" data-expanded="0" title="' + app.t('video[.]Expand playlist') + '">')
        .append('<span class="glyphicon glyphicon-resize-full">')
        .prependTo('#videocontrols')
        .on('click', function() {
            that.expandPlaylist($(this));
        });
    if (!settings.expandPlaylistOption) {
        this.$expandPlaylistBtn.hide();
    }


    this.$scrollToCurrentBtn = $('<button id="scroll-to-current-btn" class="btn btn-sm btn-default" title="' + app.t('video[.]Scroll the playlist to the current video') + '">')
        .append('<span class="glyphicon glyphicon-hand-right">')
        .prependTo('#videocontrols')
        .on('click', function() {
            window.scrollQueue();
        });


    this.showVideoContributorsList = function () {
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

        $bodyWrapper.append($('<p>' + app.t('video[.]Video\'s count') + ': ' + ($("#queue .queue_entry").length + 1) + '</p>'));

        var $contributorsListOl = $('<ol>');
        for (var contributor in contributorsList) {
            if (contributorsList.hasOwnProperty(contributor)) {
                $contributorsListOl.append($('<li>' + contributor + ': ' + contributorsList[contributor] + '.</li>'));
            }
        }
        $contributorsListOl.appendTo($bodyWrapper);

        app.getModule('utils').done(function (utilsModule) {
            utilsModule.createModalWindow(app.t('video[.]Contributors\' list'), $bodyWrapper);
        });
    };
    this.$videoContributorsBtn = $('<button id="video-contributors-btn" class="btn btn-sm btn-default" title="' + app.t('video[.]Contributors\' list') + '">')
        .append('<span class="glyphicon glyphicon-user">')
        .prependTo('#videocontrols')
        .on('click', function() {
            that.showVideoContributorsList();
        });
    if (!settings.showVideoContributorsOption) {
        this.$videoContributorsBtn.hide();
    }
});

/**
 * Fork of https://github.com/mickey/videojs-progressTips
 */
window.cytubeEnhanced.addModule('videojsProgress', function () {
    'use strict';


    function handleProgress() {
        if (window.PLAYER instanceof window.VideoJSPlayer) {
            if (window.PLAYER.player.techName === "Html5" || window.PLAYER.player.Ua === "Html5") { //Ua is uglifier mangle
                $(".vjs-progress-control").after($("<div id='vjs-tip'><div id='vjs-tip-arrow'></div><div id='vjs-tip-inner'></div></div>"));

                $(".vjs-progress-control").on("mousemove", function(e) {
                    var seekBar = window.PLAYER.player.controlBar.progressControl.seekBar;
                    var mousePosition = (e.pageX - $(seekBar.el()).offset().left) / seekBar.width();

                    var timeInSeconds = mousePosition * window.PLAYER.player.duration();
                    if (timeInSeconds === window.PLAYER.player.duration()) {
                        timeInSeconds = timeInSeconds - 0.1;
                    }

                    var minutes = Math.floor(timeInSeconds / 60);
                    var seconds = Math.floor(timeInSeconds - minutes * 60);
                    if (seconds < 10) {
                        seconds = "0" + seconds;
                    }

                    $('#vjs-tip-inner').html("" + minutes + ":" + seconds);

                    var barHeight = $('.vjs-control-bar').height();
                    $("#vjs-tip").css("top", "" + (e.pageY - $(this).offset().top - barHeight - 20) + "px").css("left", "" + (e.pageX - $(this).offset().left - 20) + "px").css("visibility", "visible");
                });

                $(".vjs-progress-control, .vjs-play-control").on("mouseout", function() {
                    $("#vjs-tip").css("visibility", "hidden");
                });
            }
        }
    }


    handleProgress();
    window.socket.on('changeMedia', function () {
        handleProgress();
    });
});

cytubeEnhanced.getModule('additionalChatCommands').done(function (commandsModule) {
    commandsModule.randomQuotes = commandsModule.randomQuotes.concat([
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
        'Мне 20 и я бородат'
    ]);
});

cytubeEnhanced.getModule('additionalChatCommands').done(function (commandsModule) {
    commandsModule.randomQuotes = commandsModule.randomQuotes.concat([
        'Ребята не стоит вскрывать эту тему. Вы молодые, шутливые, вам все легко. Это не то. Это не Чикатило и даже не архивы спецслужб. Сюда лучше не лезть. Серьезно, любой из вас будет жалеть. Лучше закройте тему и забудьте что тут писалось.',
        'Ты понимаешь, что ты няшка? Уже всё. Не я, блин, няшка… не он, блин, а ты!',
        'Меня твои истории просто невероятно заинтересовали уже, я уже могу их слушать часами, блин! Одна история няшней другой просто!',
        'НАЧАЛЬНИК, БЛИН, ЭТОТ НЯША ОБКАВАИЛСЯ! ИДИТЕ МОЙТЕ ЕГО, Я С НИМ ЗДЕСЬ НЯШИТСЯ БУДУ!',
        'ЧЕГО ВЫ МЕНЯ С НЯШЕЙ ПОСЕЛИЛИ, БЛИН, ОН ЖЕ КАВАЙ ПОЛНЫЙ, БЛИН!!!',
        'Ну… Чаю выпил, блин, ну, бутылку, с одной тян. Ну, а потом под пледиком поняшились.',
        'Хочешь я на одной ноге понякаю, а ты мне погону отдашь? Как нека, хочешь?',
        'ЭТО ЗНАТЬ НАДО! ЭТО ЗОЛОТОЙ ФОНД, БЛИН!',
        'Как п… как поспал, онии-чан? Проголодался, наверное! Онии-чан…',
        'Ты что, обняшился что ли, няшка, блин?!',
        'Не, я не обняшился. Я тебе покушать принёс, Онии-чан!'
    ]);
});
