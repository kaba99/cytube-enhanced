(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
/*!
 * jQuery.selection - jQuery Plugin
 *
 * Copyright (c) 2010-2014 IWASAKI Koji (@madapaja).
 * http://blog.madapaja.net/
 * Under The MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function($, win, doc) {
    /**
     * get caret status of the selection of the element
     *
     * @param   {Element}   element         target DOM element
     * @return  {Object}    return
     * @return  {String}    return.text     selected text
     * @return  {Number}    return.start    start position of the selection
     * @return  {Number}    return.end      end position of the selection
     */
    var _getCaretInfo = function(element){
        var res = {
            text: '',
            start: 0,
            end: 0
        };

        if (!element.value) {
            /* no value or empty string */
            return res;
        }

        try {
            if (win.getSelection) {
                /* except IE */
                res.start = element.selectionStart;
                res.end = element.selectionEnd;
                res.text = element.value.slice(res.start, res.end);
            } else if (doc.selection) {
                /* for IE */
                element.focus();

                var range = doc.selection.createRange(),
                    range2 = doc.body.createTextRange();

                res.text = range.text;

                try {
                    range2.moveToElementText(element);
                    range2.setEndPoint('StartToStart', range);
                } catch (e) {
                    range2 = element.createTextRange();
                    range2.setEndPoint('StartToStart', range);
                }

                res.start = element.value.length - range2.text.length;
                res.end = res.start + range.text.length;
            }
        } catch (e) {
            /* give up */
        }

        return res;
    };

    /**
     * caret operation for the element
     * @type {Object}
     */
    var _CaretOperation = {
        /**
         * get caret position
         *
         * @param   {Element}   element         target element
         * @return  {Object}    return
         * @return  {Number}    return.start    start position for the selection
         * @return  {Number}    return.end      end position for the selection
         */
        getPos: function(element) {
            var tmp = _getCaretInfo(element);
            return {start: tmp.start, end: tmp.end};
        },

        /**
         * set caret position
         *
         * @param   {Element}   element         target element
         * @param   {Object}    toRange         caret position
         * @param   {Number}    toRange.start   start position for the selection
         * @param   {Number}    toRange.end     end position for the selection
         * @param   {String}    caret           caret mode: any of the following: "keep" | "start" | "end"
         */
        setPos: function(element, toRange, caret) {
            caret = this._caretMode(caret);

            if (caret === 'start') {
                toRange.end = toRange.start;
            } else if (caret === 'end') {
                toRange.start = toRange.end;
            }

            element.focus();
            try {
                if (element.createTextRange) {
                    var range = element.createTextRange();

                    if (win.navigator.userAgent.toLowerCase().indexOf("msie") >= 0) {
                        toRange.start = element.value.substr(0, toRange.start).replace(/\r/g, '').length;
                        toRange.end = element.value.substr(0, toRange.end).replace(/\r/g, '').length;
                    }

                    range.collapse(true);
                    range.moveStart('character', toRange.start);
                    range.moveEnd('character', toRange.end - toRange.start);

                    range.select();
                } else if (element.setSelectionRange) {
                    element.setSelectionRange(toRange.start, toRange.end);
                }
            } catch (e) {
                /* give up */
            }
        },

        /**
         * get selected text
         *
         * @param   {Element}   element         target element
         * @return  {String}    return          selected text
         */
        getText: function(element) {
            return _getCaretInfo(element).text;
        },

        /**
         * get caret mode
         *
         * @param   {String}    caret           caret mode
         * @return  {String}    return          any of the following: "keep" | "start" | "end"
         */
        _caretMode: function(caret) {
            caret = caret || "keep";
            if (caret === false) {
                caret = 'end';
            }

            switch (caret) {
                case 'keep':
                case 'start':
                case 'end':
                    break;

                default:
                    caret = 'keep';
            }

            return caret;
        },

        /**
         * replace selected text
         *
         * @param   {Element}   element         target element
         * @param   {String}    text            replacement text
         * @param   {String}    caret           caret mode: any of the following: "keep" | "start" | "end"
         */
        replace: function(element, text, caret) {
            var tmp = _getCaretInfo(element),
                orig = element.value,
                pos = $(element).scrollTop(),
                range = {start: tmp.start, end: tmp.start + text.length};

            element.value = orig.substr(0, tmp.start) + text + orig.substr(tmp.end);

            $(element).scrollTop(pos);
            this.setPos(element, range, caret);
        },

        /**
         * insert before the selected text
         *
         * @param   {Element}   element         target element
         * @param   {String}    text            insertion text
         * @param   {String}    caret           caret mode: any of the following: "keep" | "start" | "end"
         */
        insertBefore: function(element, text, caret) {
            var tmp = _getCaretInfo(element),
                orig = element.value,
                pos = $(element).scrollTop(),
                range = {start: tmp.start + text.length, end: tmp.end + text.length};

            element.value = orig.substr(0, tmp.start) + text + orig.substr(tmp.start);

            $(element).scrollTop(pos);
            this.setPos(element, range, caret);
        },

        /**
         * insert after the selected text
         *
         * @param   {Element}   element         target element
         * @param   {String}    text            insertion text
         * @param   {String}    caret           caret mode: any of the following: "keep" | "start" | "end"
         */
        insertAfter: function(element, text, caret) {
            var tmp = _getCaretInfo(element),
                orig = element.value,
                pos = $(element).scrollTop(),
                range = {start: tmp.start, end: tmp.end};

            element.value = orig.substr(0, tmp.end) + text + orig.substr(tmp.end);

            $(element).scrollTop(pos);
            this.setPos(element, range, caret);
        }
    };

    /* add jQuery.selection */
    $.extend({
        /**
         * get selected text on the window
         *
         * @param   {String}    mode            selection mode: any of the following: "text" | "html"
         * @return  {String}    return
         */
        selection: function(mode) {
            var getText = ((mode || 'text').toLowerCase() === 'text');

            try {
                if (win.getSelection) {
                    if (getText) {
                        // get text
                        return win.getSelection().toString();
                    } else {
                        // get html
                        var sel = win.getSelection(), range;

                        if (sel.getRangeAt) {
                            range = sel.getRangeAt(0);
                        } else {
                            range = doc.createRange();
                            range.setStart(sel.anchorNode, sel.anchorOffset);
                            range.setEnd(sel.focusNode, sel.focusOffset);
                        }

                        return $('<div></div>').append(range.cloneContents()).html();
                    }
                } else if (doc.selection) {
                    if (getText) {
                        // get text
                        return doc.selection.createRange().text;
                    } else {
                        // get html
                        return doc.selection.createRange().htmlText;
                    }
                }
            } catch (e) {
                /* give up */
            }

            return '';
        }
    });

    /* add selection */
    $.fn.extend({
        selection: function(mode, opts) {
            opts = opts || {};

            switch (mode) {
                /**
                 * selection('getPos')
                 * get caret position
                 *
                 * @return  {Object}    return
                 * @return  {Number}    return.start    start position for the selection
                 * @return  {Number}    return.end      end position for the selection
                 */
                case 'getPos':
                    return _CaretOperation.getPos(this[0]);

                /**
                 * selection('setPos', opts)
                 * set caret position
                 *
                 * @param   {Number}    opts.start      start position for the selection
                 * @param   {Number}    opts.end        end position for the selection
                 */
                case 'setPos':
                    return this.each(function() {
                        _CaretOperation.setPos(this, opts);
                    });

                /**
                 * selection('replace', opts)
                 * replace the selected text
                 *
                 * @param   {String}    opts.text            replacement text
                 * @param   {String}    opts.caret           caret mode: any of the following: "keep" | "start" | "end"
                 */
                case 'replace':
                    return this.each(function() {
                        _CaretOperation.replace(this, opts.text, opts.caret);
                    });

                /**
                 * selection('insert', opts)
                 * insert before/after the selected text
                 *
                 * @param   {String}    opts.text            insertion text
                 * @param   {String}    opts.caret           caret mode: any of the following: "keep" | "start" | "end"
                 * @param   {String}    opts.mode            insertion mode: any of the following: "before" | "after"
                 */
                case 'insert':
                    return this.each(function() {
                        if (opts.mode === 'before') {
                            _CaretOperation.insertBefore(this, opts.text, opts.caret);
                        } else {
                            _CaretOperation.insertAfter(this, opts.text, opts.caret);
                        }
                    });

                /**
                 * selection('get')
                 * get selected text
                 *
                 * @return  {String}    return
                 */
                case 'get':
                    /* falls through */
                default:
                    return _CaretOperation.getText(this[0]);
            }

            return this;
        }
    });
})(jQuery, window, window.document);

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
window.cytubeEnhanced = new window.CytubeEnhanced(
    $('title').text(),
    (window.cytubeEnhancedSettings ? (window.cytubeEnhancedSettings.language || 'ru') : 'ru'),
    (window.cytubeEnhancedSettings ? (window.cytubeEnhancedSettings.modulesSettings || {}) : {})
);

},{}],6:[function(require,module,exports){
window.CytubeEnhanced = function(channelName, language, modulesSettings) {
    'use strict';

    this.channelName = channelName;

    var translations = {};

    var modules = {};
    var MODULE_LOAD_TIMEOUT = 10000; //ms
    var MODULE_LOAD_PERIOD = 100; //ms


    /**
     * Gets the module
     *
     * Returns $.Deferred() promise object and throws error exception if timeout
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
     * @param ModuleConstructor The module's constructor
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
        return modulesSettings.hasOwnProperty(moduleName) ?
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


    /**
     * UserConfig constructor
     * @constructor
     */
    var UserConfig = function () {
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

    /**
     * User's options
     * @type {UserConfig}
     */
    this.userConfig = new UserConfig();
};

},{}],7:[function(require,module,exports){
window.channelEmotesLinks = [];
for (var emote in window.CHANNEL.emotes) {
    window.channelEmotesLinks.push(window.CHANNEL.emotes[emote].image);
}
window.particlesImages = [];

var pJS = function(tag_id, params){

    var canvas_el = document.querySelector('#'+tag_id+' > .particles-js-canvas-el');

    /* particles.js variables with default values */
    this.pJS = {
        canvas: {
            el: canvas_el,
            w: canvas_el.offsetWidth,
            h: canvas_el.offsetHeight
        },
        particles: {
            number: {
                value: 400,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: '#fff'
            },
            shape: {
                type: 'circle',
                stroke: {
                    width: 0,
                    color: '#ff0000'
                },
                polygon: {
                    nb_sides: 5
                },
                image: {
                    src: '',
                    width: 100,
                    height: 100
                }
            },
            opacity: {
                value: 1,
                random: false,
                anim: {
                    enable: false,
                    speed: 2,
                    opacity_min: 0,
                    sync: false
                }
            },
            size: {
                value: 20,
                random: false,
                anim: {
                    enable: false,
                    speed: 20,
                    size_min: 0,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 100,
                color: '#fff',
                opacity: 1,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: 'none',
                random: false,
                straight: false,
                out_mode: 'out',
                bounce: false,
                attract: {
                    enable: false,
                    rotateX: 3000,
                    rotateY: 3000
                }
            },
            array: []
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: {
                    enable: true,
                    mode: 'grab'
                },
                onclick: {
                    enable: true,
                    mode: 'push'
                },
                resize: true
            },
            modes: {
                grab:{
                    distance: 100,
                    line_linked:{
                        opacity: 1
                    }
                },
                bubble:{
                    distance: 200,
                    size: 80,
                    duration: 0.4
                },
                repulse:{
                    distance: 200,
                    duration: 0.4
                },
                push:{
                    particles_nb: 4
                },
                remove:{
                    particles_nb: 2
                }
            },
            mouse:{}
        },
        retina_detect: false,
        fn: {
            interact: {},
            modes: {},
            vendors:{}
        },
        tmp: {}
    };

    var pJS = this.pJS;

    /* params settings */
    if(params){
        Object.deepExtend(pJS, params);
    }

    pJS.tmp.obj = {
        size_value: pJS.particles.size.value,
        size_anim_speed: pJS.particles.size.anim.speed,
        move_speed: pJS.particles.move.speed,
        line_linked_distance: pJS.particles.line_linked.distance,
        line_linked_width: pJS.particles.line_linked.width,
        mode_grab_distance: pJS.interactivity.modes.grab.distance,
        mode_bubble_distance: pJS.interactivity.modes.bubble.distance,
        mode_bubble_size: pJS.interactivity.modes.bubble.size,
        mode_repulse_distance: pJS.interactivity.modes.repulse.distance
    };


    pJS.fn.retinaInit = function(){

        if(pJS.retina_detect && window.devicePixelRatio > 1){
            pJS.canvas.pxratio = window.devicePixelRatio;
            pJS.tmp.retina = true;
        }
        else{
            pJS.canvas.pxratio = 1;
            pJS.tmp.retina = false;
        }

        pJS.canvas.w = pJS.canvas.el.offsetWidth * pJS.canvas.pxratio;
        pJS.canvas.h = pJS.canvas.el.offsetHeight * pJS.canvas.pxratio;

        pJS.particles.size.value = pJS.tmp.obj.size_value * pJS.canvas.pxratio;
        pJS.particles.size.anim.speed = pJS.tmp.obj.size_anim_speed * pJS.canvas.pxratio;
        pJS.particles.move.speed = pJS.tmp.obj.move_speed * pJS.canvas.pxratio;
        pJS.particles.line_linked.distance = pJS.tmp.obj.line_linked_distance * pJS.canvas.pxratio;
        pJS.interactivity.modes.grab.distance = pJS.tmp.obj.mode_grab_distance * pJS.canvas.pxratio;
        pJS.interactivity.modes.bubble.distance = pJS.tmp.obj.mode_bubble_distance * pJS.canvas.pxratio;
        pJS.particles.line_linked.width = pJS.tmp.obj.line_linked_width * pJS.canvas.pxratio;
        pJS.interactivity.modes.bubble.size = pJS.tmp.obj.mode_bubble_size * pJS.canvas.pxratio;
        pJS.interactivity.modes.repulse.distance = pJS.tmp.obj.mode_repulse_distance * pJS.canvas.pxratio;

    };



    /* ---------- pJS functions - canvas ------------ */

    pJS.fn.canvasInit = function(){
        pJS.canvas.ctx = pJS.canvas.el.getContext('2d');
    };

    pJS.fn.canvasSize = function(){

        pJS.canvas.el.width = pJS.canvas.w;
        pJS.canvas.el.height = pJS.canvas.h;

        if(pJS && pJS.interactivity.events.resize){

            window.addEventListener('resize', function(){

                pJS.canvas.w = pJS.canvas.el.offsetWidth;
                pJS.canvas.h = pJS.canvas.el.offsetHeight;

                /* resize canvas */
                if(pJS.tmp.retina){
                    pJS.canvas.w *= pJS.canvas.pxratio;
                    pJS.canvas.h *= pJS.canvas.pxratio;
                }

                pJS.canvas.el.width = pJS.canvas.w;
                pJS.canvas.el.height = pJS.canvas.h;

                /* repaint canvas on anim disabled */
                if(!pJS.particles.move.enable){
                    pJS.fn.particlesEmpty();
                    pJS.fn.particlesCreate();
                    pJS.fn.particlesDraw();
                    pJS.fn.vendors.densityAutoParticles();
                }

                /* density particles enabled */
                pJS.fn.vendors.densityAutoParticles();

            });

        }

    };


    pJS.fn.canvasPaint = function(){
        pJS.canvas.ctx.fillRect(0, 0, pJS.canvas.w, pJS.canvas.h);
    };

    pJS.fn.canvasClear = function(){
        pJS.canvas.ctx.clearRect(0, 0, pJS.canvas.w, pJS.canvas.h);
    };


    /* --------- pJS functions - particles ----------- */

    pJS.fn.particle = function(color, opacity, position){

        /* size */
        this.radius = (pJS.particles.size.random ? Math.random() : 1) * pJS.particles.size.value;
        if(pJS.particles.size.anim.enable){
            this.size_status = false;
            this.vs = pJS.particles.size.anim.speed / 100;
            if(!pJS.particles.size.anim.sync){
                this.vs = this.vs * Math.random();
            }
        }

        /* position */
        this.x = position ? position.x : Math.random() * pJS.canvas.w;
        this.y = position ? position.y : Math.random() * pJS.canvas.h;

        /* check position  - into the canvas */
        if(this.x > pJS.canvas.w - this.radius*2) this.x = this.x - this.radius;
        else if(this.x < this.radius*2) this.x = this.x + this.radius;
        if(this.y > pJS.canvas.h - this.radius*2) this.y = this.y - this.radius;
        else if(this.y < this.radius*2) this.y = this.y + this.radius;

        /* check position - avoid overlap */
        if(pJS.particles.move.bounce){
            pJS.fn.vendors.checkOverlap(this, position);
        }

        /* color */
        this.color = {};
        if(typeof(color.value) == 'object'){

            if(color.value instanceof Array){
                var color_selected = color.value[Math.floor(Math.random() * pJS.particles.color.value.length)];
                this.color.rgb = hexToRgb(color_selected);
            }else{
                if(color.value.r != undefined && color.value.g != undefined && color.value.b != undefined){
                    this.color.rgb = {
                        r: color.value.r,
                        g: color.value.g,
                        b: color.value.b
                    }
                }
                if(color.value.h != undefined && color.value.s != undefined && color.value.l != undefined){
                    this.color.hsl = {
                        h: color.value.h,
                        s: color.value.s,
                        l: color.value.l
                    }
                }
            }

        }
        else if(color.value == 'random'){
            this.color.rgb = {
                r: (Math.floor(Math.random() * (255 - 0 + 1)) + 0),
                g: (Math.floor(Math.random() * (255 - 0 + 1)) + 0),
                b: (Math.floor(Math.random() * (255 - 0 + 1)) + 0)
            }
        }
        else if(typeof(color.value) == 'string'){
            this.color = color;
            this.color.rgb = hexToRgb(this.color.value);
        }

        /* opacity */
        this.opacity = (pJS.particles.opacity.random ? Math.random() : 1) * pJS.particles.opacity.value;
        if(pJS.particles.opacity.anim.enable){
            this.opacity_status = false;
            this.vo = pJS.particles.opacity.anim.speed / 100;
            if(!pJS.particles.opacity.anim.sync){
                this.vo = this.vo * Math.random();
            }
        }

        /* animation - velocity for speed */
        var velbase = {}
        switch(pJS.particles.move.direction){
            case 'top':
                velbase = { x:0, y:-1 };
                break;
            case 'top-right':
                velbase = { x:0.5, y:-0.5 };
                break;
            case 'right':
                velbase = { x:1, y:-0 };
                break;
            case 'bottom-right':
                velbase = { x:0.5, y:0.5 };
                break;
            case 'bottom':
                velbase = { x:0, y:1 };
                break;
            case 'bottom-left':
                velbase = { x:-0.5, y:1 };
                break;
            case 'left':
                velbase = { x:-1, y:0 };
                break;
            case 'top-left':
                velbase = { x:-0.5, y:-0.5 };
                break;
            default:
                velbase = { x:0, y:0 };
                break;
        }

        if(pJS.particles.move.straight){
            this.vx = velbase.x;
            this.vy = velbase.y;
            if(pJS.particles.move.random){
                this.vx = this.vx * (Math.random());
                this.vy = this.vy * (Math.random());
            }
        }else{
            this.vx = velbase.x + Math.random()-0.5;
            this.vy = velbase.y + Math.random()-0.5;
        }

        // var theta = 2.0 * Math.PI * Math.random();
        // this.vx = Math.cos(theta);
        // this.vy = Math.sin(theta);

        this.vx_i = this.vx;
        this.vy_i = this.vy;



        /* if shape is image */

        var shape_type = pJS.particles.shape.type;
        if(typeof(shape_type) == 'object'){
            if(shape_type instanceof Array){
                var shape_selected = shape_type[Math.floor(Math.random() * shape_type.length)];
                this.shape = shape_selected;
            }
        }else{
            this.shape = shape_type;
        }

        if(this.shape == 'image'){
            var sh = pJS.particles.shape;
            this.img = {
                src: sh.image.src,
                ratio: sh.image.width / sh.image.height
            }
            if(!this.img.ratio) this.img.ratio = 1;
            if(pJS.tmp.img_type == 'svg' && pJS.tmp.source_svg != undefined){
                pJS.fn.vendors.createSvgImg(this);
                if(pJS.tmp.pushing){
                    this.img.loaded = false;
                }
            }
        }



    };


    pJS.fn.particle.prototype.draw = function(elIndex) {

        var p = this;

        if(p.radius_bubble != undefined){
            var radius = p.radius_bubble;
        }else{
            var radius = p.radius;
        }

        if(p.opacity_bubble != undefined){
            var opacity = p.opacity_bubble;
        }else{
            var opacity = p.opacity;
        }

        if(p.color.rgb){
            var color_value = 'rgba('+p.color.rgb.r+','+p.color.rgb.g+','+p.color.rgb.b+','+opacity+')';
        }else{
            var color_value = 'hsla('+p.color.hsl.h+','+p.color.hsl.s+'%,'+p.color.hsl.l+'%,'+opacity+')';
        }

        pJS.canvas.ctx.fillStyle = color_value;
        pJS.canvas.ctx.beginPath();

        switch(p.shape){

            case 'circle':
                pJS.canvas.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2, false);
                break;

            case 'edge':
                pJS.canvas.ctx.rect(p.x-radius, p.y-radius, radius*2, radius*2);
                break;

            case 'triangle':
                pJS.fn.vendors.drawShape(pJS.canvas.ctx, p.x-radius, p.y+radius / 1.66, radius*2, 3, 2);
                break;

            case 'polygon':
                pJS.fn.vendors.drawShape(
                    pJS.canvas.ctx,
                    p.x - radius / (pJS.particles.shape.polygon.nb_sides/3.5), // startX
                    p.y - radius / (2.66/3.5), // startY
                    radius*2.66 / (pJS.particles.shape.polygon.nb_sides/3), // sideLength
                    pJS.particles.shape.polygon.nb_sides, // sideCountNumerator
                    1 // sideCountDenominator
                );
                break;

            case 'star':
                pJS.fn.vendors.drawShape(
                    pJS.canvas.ctx,
                    p.x - radius*2 / (pJS.particles.shape.polygon.nb_sides/4), // startX
                    p.y - radius / (2*2.66/3.5), // startY
                    radius*2*2.66 / (pJS.particles.shape.polygon.nb_sides/3), // sideLength
                    pJS.particles.shape.polygon.nb_sides, // sideCountNumerator
                    2 // sideCountDenominator
                );
                break;

            case 'image':

            function draw(){
                pJS.canvas.ctx.drawImage(
                    img_obj,
                    p.x-radius,
                    p.y-radius,
                    radius*2,
                    radius*2 / p.img.ratio
                );
            }

                if(pJS.tmp.img_type == 'svg'){
                    var img_obj = p.img.obj;
                }else{
                    if (!window.particlesImages[elIndex]) {
                        window.particlesImages[elIndex] = window.channelEmotesLinks[Math.floor(Math.random() * window.channelEmotesLinks.length)];
                    }
                    var img_obj = new Image();
                    img_obj.src = window.particlesImages[elIndex];
                }

                if(img_obj){
                    draw();
                }

                break;

        }

        pJS.canvas.ctx.closePath();

        if(pJS.particles.shape.stroke.width > 0){
            pJS.canvas.ctx.strokeStyle = pJS.particles.shape.stroke.color;
            pJS.canvas.ctx.lineWidth = pJS.particles.shape.stroke.width;
            pJS.canvas.ctx.stroke();
        }

        pJS.canvas.ctx.fill();

    };


    pJS.fn.particlesCreate = function(){
        for(var i = 0; i < pJS.particles.number.value; i++) {
            pJS.particles.array.push(new pJS.fn.particle(pJS.particles.color, pJS.particles.opacity.value));
        }
    };

    pJS.fn.particlesUpdate = function(){

        for(var i = 0; i < pJS.particles.array.length; i++){

            /* the particle */
            var p = pJS.particles.array[i];

            // var d = ( dx = pJS.interactivity.mouse.click_pos_x - p.x ) * dx + ( dy = pJS.interactivity.mouse.click_pos_y - p.y ) * dy;
            // var f = -BANG_SIZE / d;
            // if ( d < BANG_SIZE ) {
            //     var t = Math.atan2( dy, dx );
            //     p.vx = f * Math.cos(t);
            //     p.vy = f * Math.sin(t);
            // }

            /* move the particle */
            if(pJS.particles.move.enable){
                var ms = pJS.particles.move.speed/2;
                p.x += p.vx * ms;
                p.y += p.vy * ms;
            }

            /* change opacity status */
            if(pJS.particles.opacity.anim.enable) {
                if(p.opacity_status == true) {
                    if(p.opacity >= pJS.particles.opacity.value) p.opacity_status = false;
                    p.opacity += p.vo;
                }else {
                    if(p.opacity <= pJS.particles.opacity.anim.opacity_min) p.opacity_status = true;
                    p.opacity -= p.vo;
                }
                if(p.opacity < 0) p.opacity = 0;
            }

            /* change size */
            if(pJS.particles.size.anim.enable){
                if(p.size_status == true){
                    if(p.radius >= pJS.particles.size.value) p.size_status = false;
                    p.radius += p.vs;
                }else{
                    if(p.radius <= pJS.particles.size.anim.size_min) p.size_status = true;
                    p.radius -= p.vs;
                }
                if(p.radius < 0) p.radius = 0;
            }

            /* change particle position if it is out of canvas */
            if(pJS.particles.move.out_mode == 'bounce'){
                var new_pos = {
                    x_left: p.radius,
                    x_right:  pJS.canvas.w,
                    y_top: p.radius,
                    y_bottom: pJS.canvas.h
                }
            }else{
                var new_pos = {
                    x_left: -p.radius,
                    x_right: pJS.canvas.w + p.radius,
                    y_top: -p.radius,
                    y_bottom: pJS.canvas.h + p.radius
                }
            }

            if(p.x - p.radius > pJS.canvas.w){
                p.x = new_pos.x_left;
                p.y = Math.random() * pJS.canvas.h;
            }
            else if(p.x + p.radius < 0){
                p.x = new_pos.x_right;
                p.y = Math.random() * pJS.canvas.h;
            }
            if(p.y - p.radius > pJS.canvas.h){
                p.y = new_pos.y_top;
                p.x = Math.random() * pJS.canvas.w;
            }
            else if(p.y + p.radius < 0){
                p.y = new_pos.y_bottom;
                p.x = Math.random() * pJS.canvas.w;
            }

            /* out of canvas modes */
            switch(pJS.particles.move.out_mode){
                case 'bounce':
                    if (p.x + p.radius > pJS.canvas.w) p.vx = -p.vx;
                    else if (p.x - p.radius < 0) p.vx = -p.vx;
                    if (p.y + p.radius > pJS.canvas.h) p.vy = -p.vy;
                    else if (p.y - p.radius < 0) p.vy = -p.vy;
                    break;
            }

            /* events */
            if(isInArray('grab', pJS.interactivity.events.onhover.mode)){
                pJS.fn.modes.grabParticle(p);
            }

            if(isInArray('bubble', pJS.interactivity.events.onhover.mode) || isInArray('bubble', pJS.interactivity.events.onclick.mode)){
                pJS.fn.modes.bubbleParticle(p);
            }

            if(isInArray('repulse', pJS.interactivity.events.onhover.mode) || isInArray('repulse', pJS.interactivity.events.onclick.mode)){
                pJS.fn.modes.repulseParticle(p);
            }

            /* interaction auto between particles */
            if(pJS.particles.line_linked.enable || pJS.particles.move.attract.enable){
                for(var j = i + 1; j < pJS.particles.array.length; j++){
                    var p2 = pJS.particles.array[j];

                    /* link particles */
                    if(pJS.particles.line_linked.enable){
                        pJS.fn.interact.linkParticles(p,p2);
                    }

                    /* attract particles */
                    if(pJS.particles.move.attract.enable){
                        pJS.fn.interact.attractParticles(p,p2);
                    }

                    /* bounce particles */
                    if(pJS.particles.move.bounce){
                        pJS.fn.interact.bounceParticles(p,p2);
                    }

                }
            }


        }

    };

    pJS.fn.particlesDraw = function(){

        /* clear canvas */
        pJS.canvas.ctx.clearRect(0, 0, pJS.canvas.w, pJS.canvas.h);

        /* update each particles param */
        pJS.fn.particlesUpdate();

        /* draw each particle */
        for(var i = 0; i < pJS.particles.array.length; i++){
            var p = pJS.particles.array[i];
            p.draw(i);
        }

    };

    pJS.fn.particlesEmpty = function(){
        pJS.particles.array = [];
    };

    pJS.fn.particlesRefresh = function(){

        /* init all */
        cancelRequestAnimFrame(pJS.fn.checkAnimFrame);
        cancelRequestAnimFrame(pJS.fn.drawAnimFrame);
        pJS.tmp.source_svg = undefined;
        pJS.tmp.img_obj = undefined;
        pJS.tmp.count_svg = 0;
        pJS.fn.particlesEmpty();
        pJS.fn.canvasClear();

        /* restart */
        pJS.fn.vendors.start();

    };


    /* ---------- pJS functions - particles interaction ------------ */

    pJS.fn.interact.linkParticles = function(p1, p2){

        var dx = p1.x - p2.x,
            dy = p1.y - p2.y,
            dist = Math.sqrt(dx*dx + dy*dy);

        /* draw a line between p1 and p2 if the distance between them is under the config distance */
        if(dist <= pJS.particles.line_linked.distance){

            var opacity_line = pJS.particles.line_linked.opacity - (dist / (1/pJS.particles.line_linked.opacity)) / pJS.particles.line_linked.distance;

            if(opacity_line > 0){

                /* style */
                var color_line = pJS.particles.line_linked.color_rgb_line;
                pJS.canvas.ctx.strokeStyle = 'rgba('+color_line.r+','+color_line.g+','+color_line.b+','+opacity_line+')';
                pJS.canvas.ctx.lineWidth = pJS.particles.line_linked.width;
                //pJS.canvas.ctx.lineCap = 'round'; /* performance issue */

                /* path */
                pJS.canvas.ctx.beginPath();
                pJS.canvas.ctx.moveTo(p1.x, p1.y);
                pJS.canvas.ctx.lineTo(p2.x, p2.y);
                pJS.canvas.ctx.stroke();
                pJS.canvas.ctx.closePath();

            }

        }

    };


    pJS.fn.interact.attractParticles  = function(p1, p2){

        /* condensed particles */
        var dx = p1.x - p2.x,
            dy = p1.y - p2.y,
            dist = Math.sqrt(dx*dx + dy*dy);

        if(dist <= pJS.particles.line_linked.distance){

            var ax = dx/(pJS.particles.move.attract.rotateX*1000),
                ay = dy/(pJS.particles.move.attract.rotateY*1000);

            p1.vx -= ax;
            p1.vy -= ay;

            p2.vx += ax;
            p2.vy += ay;

        }


    }


    pJS.fn.interact.bounceParticles = function(p1, p2){

        var dx = p1.x - p2.x,
            dy = p1.y - p2.y,
            dist = Math.sqrt(dx*dx + dy*dy),
            dist_p = p1.radius+p2.radius;

        if(dist <= dist_p){
            p1.vx = -p1.vx;
            p1.vy = -p1.vy;

            p2.vx = -p2.vx;
            p2.vy = -p2.vy;
        }

    }


    /* ---------- pJS functions - modes events ------------ */

    pJS.fn.modes.pushParticles = function(nb, pos){

        pJS.tmp.pushing = true;

        for(var i = 0; i < nb; i++){
            pJS.particles.array.push(
                new pJS.fn.particle(
                    pJS.particles.color,
                    pJS.particles.opacity.value,
                    {
                        'x': pos ? pos.pos_x : Math.random() * pJS.canvas.w,
                        'y': pos ? pos.pos_y : Math.random() * pJS.canvas.h
                    }
                )
            )
            if(i == nb-1){
                if(!pJS.particles.move.enable){
                    pJS.fn.particlesDraw();
                }
                pJS.tmp.pushing = false;
            }
        }

    };


    pJS.fn.modes.removeParticles = function(nb){

        pJS.particles.array.splice(0, nb);
        if(!pJS.particles.move.enable){
            pJS.fn.particlesDraw();
        }

    };


    pJS.fn.modes.bubbleParticle = function(p){

        /* on hover event */
        if(pJS.interactivity.events.onhover.enable && isInArray('bubble', pJS.interactivity.events.onhover.mode)){

            var dx_mouse = p.x - pJS.interactivity.mouse.pos_x,
                dy_mouse = p.y - pJS.interactivity.mouse.pos_y,
                dist_mouse = Math.sqrt(dx_mouse*dx_mouse + dy_mouse*dy_mouse),
                ratio = 1 - dist_mouse / pJS.interactivity.modes.bubble.distance;

            function init(){
                p.opacity_bubble = p.opacity;
                p.radius_bubble = p.radius;
            }

            /* mousemove - check ratio */
            if(dist_mouse <= pJS.interactivity.modes.bubble.distance){

                if(ratio >= 0 && pJS.interactivity.status == 'mousemove'){

                    /* size */
                    if(pJS.interactivity.modes.bubble.size != pJS.particles.size.value){

                        if(pJS.interactivity.modes.bubble.size > pJS.particles.size.value){
                            var size = p.radius + (pJS.interactivity.modes.bubble.size*ratio);
                            if(size >= 0){
                                p.radius_bubble = size;
                            }
                        }else{
                            var dif = p.radius - pJS.interactivity.modes.bubble.size,
                                size = p.radius - (dif*ratio);
                            if(size > 0){
                                p.radius_bubble = size;
                            }else{
                                p.radius_bubble = 0;
                            }
                        }

                    }

                    /* opacity */
                    if(pJS.interactivity.modes.bubble.opacity != pJS.particles.opacity.value){

                        if(pJS.interactivity.modes.bubble.opacity > pJS.particles.opacity.value){
                            var opacity = pJS.interactivity.modes.bubble.opacity*ratio;
                            if(opacity > p.opacity && opacity <= pJS.interactivity.modes.bubble.opacity){
                                p.opacity_bubble = opacity;
                            }
                        }else{
                            var opacity = p.opacity - (pJS.particles.opacity.value-pJS.interactivity.modes.bubble.opacity)*ratio;
                            if(opacity < p.opacity && opacity >= pJS.interactivity.modes.bubble.opacity){
                                p.opacity_bubble = opacity;
                            }
                        }

                    }

                }

            }else{
                init();
            }


            /* mouseleave */
            if(pJS.interactivity.status == 'mouseleave'){
                init();
            }

        }

        /* on click event */
        else if(pJS.interactivity.events.onclick.enable && isInArray('bubble', pJS.interactivity.events.onclick.mode)){


            if(pJS.tmp.bubble_clicking){
                var dx_mouse = p.x - pJS.interactivity.mouse.click_pos_x,
                    dy_mouse = p.y - pJS.interactivity.mouse.click_pos_y,
                    dist_mouse = Math.sqrt(dx_mouse*dx_mouse + dy_mouse*dy_mouse),
                    time_spent = (new Date().getTime() - pJS.interactivity.mouse.click_time)/1000;

                if(time_spent > pJS.interactivity.modes.bubble.duration){
                    pJS.tmp.bubble_duration_end = true;
                }

                if(time_spent > pJS.interactivity.modes.bubble.duration*2){
                    pJS.tmp.bubble_clicking = false;
                    pJS.tmp.bubble_duration_end = false;
                }
            }


            function process(bubble_param, particles_param, p_obj_bubble, p_obj, id){

                if(bubble_param != particles_param){

                    if(!pJS.tmp.bubble_duration_end){
                        if(dist_mouse <= pJS.interactivity.modes.bubble.distance){
                            if(p_obj_bubble != undefined) var obj = p_obj_bubble;
                            else var obj = p_obj;
                            if(obj != bubble_param){
                                var value = p_obj - (time_spent * (p_obj - bubble_param) / pJS.interactivity.modes.bubble.duration);
                                if(id == 'size') p.radius_bubble = value;
                                if(id == 'opacity') p.opacity_bubble = value;
                            }
                        }else{
                            if(id == 'size') p.radius_bubble = undefined;
                            if(id == 'opacity') p.opacity_bubble = undefined;
                        }
                    }else{
                        if(p_obj_bubble != undefined){
                            var value_tmp = p_obj - (time_spent * (p_obj - bubble_param) / pJS.interactivity.modes.bubble.duration),
                                dif = bubble_param - value_tmp;
                            value = bubble_param + dif;
                            if(id == 'size') p.radius_bubble = value;
                            if(id == 'opacity') p.opacity_bubble = value;
                        }
                    }

                }

            }

            if(pJS.tmp.bubble_clicking){
                /* size */
                process(pJS.interactivity.modes.bubble.size, pJS.particles.size.value, p.radius_bubble, p.radius, 'size');
                /* opacity */
                process(pJS.interactivity.modes.bubble.opacity, pJS.particles.opacity.value, p.opacity_bubble, p.opacity, 'opacity');
            }

        }

    };


    pJS.fn.modes.repulseParticle = function(p){

        if(pJS.interactivity.events.onhover.enable && isInArray('repulse', pJS.interactivity.events.onhover.mode) && pJS.interactivity.status == 'mousemove') {

            var dx_mouse = p.x - pJS.interactivity.mouse.pos_x,
                dy_mouse = p.y - pJS.interactivity.mouse.pos_y,
                dist_mouse = Math.sqrt(dx_mouse*dx_mouse + dy_mouse*dy_mouse);

            var normVec = {x: dx_mouse/dist_mouse, y: dy_mouse/dist_mouse},
                repulseRadius = pJS.interactivity.modes.repulse.distance,
                velocity = 100,
                repulseFactor = clamp((1/repulseRadius)*(-1*Math.pow(dist_mouse/repulseRadius,2)+1)*repulseRadius*velocity, 0, 50);

            var pos = {
                x: p.x + normVec.x * repulseFactor,
                y: p.y + normVec.y * repulseFactor
            }

            if(pJS.particles.move.out_mode == 'bounce'){
                if(pos.x - p.radius > 0 && pos.x + p.radius < pJS.canvas.w) p.x = pos.x;
                if(pos.y - p.radius > 0 && pos.y + p.radius < pJS.canvas.h) p.y = pos.y;
            }else{
                p.x = pos.x;
                p.y = pos.y;
            }

        }


        else if(pJS.interactivity.events.onclick.enable && isInArray('repulse', pJS.interactivity.events.onclick.mode)) {

            if(!pJS.tmp.repulse_finish){
                pJS.tmp.repulse_count++;
                if(pJS.tmp.repulse_count == pJS.particles.array.length){
                    pJS.tmp.repulse_finish = true;
                }
            }

            if(pJS.tmp.repulse_clicking){

                var repulseRadius = Math.pow(pJS.interactivity.modes.repulse.distance/6, 3);

                var dx = pJS.interactivity.mouse.click_pos_x - p.x,
                    dy = pJS.interactivity.mouse.click_pos_y - p.y,
                    d = dx*dx + dy*dy;

                var force = -repulseRadius / d * 1;

                function process(){

                    var f = Math.atan2(dy,dx);
                    p.vx = force * Math.cos(f);
                    p.vy = force * Math.sin(f);

                    if(pJS.particles.move.out_mode == 'bounce'){
                        var pos = {
                            x: p.x + p.vx,
                            y: p.y + p.vy
                        }
                        if (pos.x + p.radius > pJS.canvas.w) p.vx = -p.vx;
                        else if (pos.x - p.radius < 0) p.vx = -p.vx;
                        if (pos.y + p.radius > pJS.canvas.h) p.vy = -p.vy;
                        else if (pos.y - p.radius < 0) p.vy = -p.vy;
                    }

                }

                // default
                if(d <= repulseRadius){
                    process();
                }

                // bang - slow motion mode
                // if(!pJS.tmp.repulse_finish){
                //   if(d <= repulseRadius){
                //     process();
                //   }
                // }else{
                //   process();
                // }


            }else{

                if(pJS.tmp.repulse_clicking == false){

                    p.vx = p.vx_i;
                    p.vy = p.vy_i;

                }

            }

        }

    }


    pJS.fn.modes.grabParticle = function(p){

        if(pJS.interactivity.events.onhover.enable && pJS.interactivity.status == 'mousemove'){

            var dx_mouse = p.x - pJS.interactivity.mouse.pos_x,
                dy_mouse = p.y - pJS.interactivity.mouse.pos_y,
                dist_mouse = Math.sqrt(dx_mouse*dx_mouse + dy_mouse*dy_mouse);

            /* draw a line between the cursor and the particle if the distance between them is under the config distance */
            if(dist_mouse <= pJS.interactivity.modes.grab.distance){

                var opacity_line = pJS.interactivity.modes.grab.line_linked.opacity - (dist_mouse / (1/pJS.interactivity.modes.grab.line_linked.opacity)) / pJS.interactivity.modes.grab.distance;

                if(opacity_line > 0){

                    /* style */
                    var color_line = pJS.particles.line_linked.color_rgb_line;
                    pJS.canvas.ctx.strokeStyle = 'rgba('+color_line.r+','+color_line.g+','+color_line.b+','+opacity_line+')';
                    pJS.canvas.ctx.lineWidth = pJS.particles.line_linked.width;
                    //pJS.canvas.ctx.lineCap = 'round'; /* performance issue */

                    /* path */
                    pJS.canvas.ctx.beginPath();
                    pJS.canvas.ctx.moveTo(p.x, p.y);
                    pJS.canvas.ctx.lineTo(pJS.interactivity.mouse.pos_x, pJS.interactivity.mouse.pos_y);
                    pJS.canvas.ctx.stroke();
                    pJS.canvas.ctx.closePath();

                }

            }

        }

    };



    /* ---------- pJS functions - vendors ------------ */

    pJS.fn.vendors.eventsListeners = function(){

        /* events target element */
        if(pJS.interactivity.detect_on == 'window'){
            pJS.interactivity.el = window;
        }else{
            pJS.interactivity.el = pJS.canvas.el;
        }


        /* detect mouse pos - on hover / click event */
        if(pJS.interactivity.events.onhover.enable || pJS.interactivity.events.onclick.enable){

            /* el on mousemove */
            pJS.interactivity.el.addEventListener('mousemove', function(e){

                if(pJS.interactivity.el == window){
                    var pos_x = e.clientX,
                        pos_y = e.clientY;
                }
                else{
                    var pos_x = e.offsetX || e.clientX,
                        pos_y = e.offsetY || e.clientY;
                }

                pJS.interactivity.mouse.pos_x = pos_x;
                pJS.interactivity.mouse.pos_y = pos_y;

                if(pJS.tmp.retina){
                    pJS.interactivity.mouse.pos_x *= pJS.canvas.pxratio;
                    pJS.interactivity.mouse.pos_y *= pJS.canvas.pxratio;
                }

                pJS.interactivity.status = 'mousemove';

            });

            /* el on onmouseleave */
            pJS.interactivity.el.addEventListener('mouseleave', function(e){

                pJS.interactivity.mouse.pos_x = null;
                pJS.interactivity.mouse.pos_y = null;
                pJS.interactivity.status = 'mouseleave';

            });

        }

        /* on click event */
        if(pJS.interactivity.events.onclick.enable){

            pJS.interactivity.el.addEventListener('click', function(){

                pJS.interactivity.mouse.click_pos_x = pJS.interactivity.mouse.pos_x;
                pJS.interactivity.mouse.click_pos_y = pJS.interactivity.mouse.pos_y;
                pJS.interactivity.mouse.click_time = new Date().getTime();

                if(pJS.interactivity.events.onclick.enable){

                    switch(pJS.interactivity.events.onclick.mode){

                        case 'push':
                            if(pJS.particles.move.enable){
                                pJS.fn.modes.pushParticles(pJS.interactivity.modes.push.particles_nb, pJS.interactivity.mouse);
                            }else{
                                if(pJS.interactivity.modes.push.particles_nb == 1){
                                    pJS.fn.modes.pushParticles(pJS.interactivity.modes.push.particles_nb, pJS.interactivity.mouse);
                                }
                                else if(pJS.interactivity.modes.push.particles_nb > 1){
                                    pJS.fn.modes.pushParticles(pJS.interactivity.modes.push.particles_nb);
                                }
                            }
                            break;

                        case 'remove':
                            pJS.fn.modes.removeParticles(pJS.interactivity.modes.remove.particles_nb);
                            break;

                        case 'bubble':
                            pJS.tmp.bubble_clicking = true;
                            break;

                        case 'repulse':
                            pJS.tmp.repulse_clicking = true;
                            pJS.tmp.repulse_count = 0;
                            pJS.tmp.repulse_finish = false;
                            setTimeout(function(){
                                pJS.tmp.repulse_clicking = false;
                            }, pJS.interactivity.modes.repulse.duration*1000)
                            break;

                    }

                }

            });

        }


    };

    pJS.fn.vendors.densityAutoParticles = function(){

        if(pJS.particles.number.density.enable){

            /* calc area */
            var area = pJS.canvas.el.width * pJS.canvas.el.height / 1000;
            if(pJS.tmp.retina){
                area = area/(pJS.canvas.pxratio*2);
            }

            /* calc number of particles based on density area */
            var nb_particles = area * pJS.particles.number.value / pJS.particles.number.density.value_area;

            /* add or remove X particles */
            var missing_particles = pJS.particles.array.length - nb_particles;
            if(missing_particles < 0) pJS.fn.modes.pushParticles(Math.abs(missing_particles));
            else pJS.fn.modes.removeParticles(missing_particles);

        }

    };


    pJS.fn.vendors.checkOverlap = function(p1, position){
        for(var i = 0; i < pJS.particles.array.length; i++){
            var p2 = pJS.particles.array[i];

            var dx = p1.x - p2.x,
                dy = p1.y - p2.y,
                dist = Math.sqrt(dx*dx + dy*dy);

            if(dist <= p1.radius + p2.radius){
                p1.x = position ? position.x : Math.random() * pJS.canvas.w;
                p1.y = position ? position.y : Math.random() * pJS.canvas.h;
                pJS.fn.vendors.checkOverlap(p1);
            }
        }
    };


    pJS.fn.vendors.createSvgImg = function(p){

        /* set color to svg element */
        var svgXml = pJS.tmp.source_svg,
            rgbHex = /#([0-9A-F]{3,6})/gi,
            coloredSvgXml = svgXml.replace(rgbHex, function (m, r, g, b) {
                if(p.color.rgb){
                    var color_value = 'rgba('+p.color.rgb.r+','+p.color.rgb.g+','+p.color.rgb.b+','+p.opacity+')';
                }else{
                    var color_value = 'hsla('+p.color.hsl.h+','+p.color.hsl.s+'%,'+p.color.hsl.l+'%,'+p.opacity+')';
                }
                return color_value;
            });

        /* prepare to create img with colored svg */
        var svg = new Blob([coloredSvgXml], {type: 'image/svg+xml;charset=utf-8'}),
            DOMURL = window.URL || window.webkitURL || window,
            url = DOMURL.createObjectURL(svg);

        /* create particle img obj */
        var img = new Image();
        img.addEventListener('load', function(){
            p.img.obj = img;
            p.img.loaded = true;
            DOMURL.revokeObjectURL(url);
            pJS.tmp.count_svg++;
        });
        img.src = url;

    };


    pJS.fn.vendors.destroypJS = function(){
        cancelAnimationFrame(pJS.fn.drawAnimFrame);
        canvas_el.remove();
        pJSDom = null;
    };


    pJS.fn.vendors.drawShape = function(c, startX, startY, sideLength, sideCountNumerator, sideCountDenominator){
        if (!window.particlesTurnedOn) {
            return;
        }

        // By Programming Thomas - https://programmingthomas.wordpress.com/2013/04/03/n-sided-shapes/
        var sideCount = sideCountNumerator * sideCountDenominator;
        var decimalSides = sideCountNumerator / sideCountDenominator;
        var interiorAngleDegrees = (180 * (decimalSides - 2)) / decimalSides;
        var interiorAngle = Math.PI - Math.PI * interiorAngleDegrees / 180; // convert to radians
        c.save();
        c.beginPath();
        c.translate(startX, startY);
        c.moveTo(0,0);
        for (var i = 0; i < sideCount; i++) {
            c.lineTo(sideLength,0);
            c.translate(sideLength,0);
            c.rotate(interiorAngle);
        }
        //c.stroke();
        c.fill();
        c.restore();

    };

    pJS.fn.vendors.exportImg = function(){
        window.open(pJS.canvas.el.toDataURL('image/png'), '_blank');
    };


    pJS.fn.vendors.loadImg = function(type){

        pJS.tmp.img_error = undefined;

        if(pJS.particles.shape.image.src != ''){

            if(type == 'svg'){

                var xhr = new XMLHttpRequest();
                xhr.open('GET', pJS.particles.shape.image.src);
                xhr.onreadystatechange = function (data) {
                    if(xhr.readyState == 4){
                        if(xhr.status == 200){
                            pJS.tmp.source_svg = data.currentTarget.response;
                            pJS.fn.vendors.checkBeforeDraw();
                        }else{
                            console.log('Error pJS - Image not found');
                            pJS.tmp.img_error = true;
                        }
                    }
                }
                xhr.send();

            }else{

                var img = new Image();
                img.addEventListener('load', function(){
                    pJS.tmp.img_obj = img;
                    pJS.fn.vendors.checkBeforeDraw();
                });
                img.src = pJS.particles.shape.image.src;

            }

        }else{
            console.log('Error pJS - No image.src');
            pJS.tmp.img_error = true;
        }

    };


    pJS.fn.vendors.draw = function(){
        if (!window.particlesTurnedOn) {
            return;
        }

        if(pJS.particles.shape.type == 'image'){

            if(pJS.tmp.img_type == 'svg'){

                if(pJS.tmp.count_svg >= pJS.particles.number.value){
                    pJS.fn.particlesDraw();
                    if(!pJS.particles.move.enable) cancelRequestAnimFrame(pJS.fn.drawAnimFrame);
                    else pJS.fn.drawAnimFrame = requestAnimFrame(pJS.fn.vendors.draw);
                }else{
                    //console.log('still loading...');
                    if(!pJS.tmp.img_error) pJS.fn.drawAnimFrame = requestAnimFrame(pJS.fn.vendors.draw);
                }

            }else{

                if(pJS.tmp.img_obj != undefined){
                    pJS.fn.particlesDraw();
                    if(!pJS.particles.move.enable) cancelRequestAnimFrame(pJS.fn.drawAnimFrame);
                    else pJS.fn.drawAnimFrame = requestAnimFrame(pJS.fn.vendors.draw);
                }else{
                    if(!pJS.tmp.img_error) pJS.fn.drawAnimFrame = requestAnimFrame(pJS.fn.vendors.draw);
                }

            }

        }else{
            pJS.fn.particlesDraw();
            if(!pJS.particles.move.enable) cancelRequestAnimFrame(pJS.fn.drawAnimFrame);
            else pJS.fn.drawAnimFrame = requestAnimFrame(pJS.fn.vendors.draw);
        }

    };


    pJS.fn.vendors.checkBeforeDraw = function(){

        // if shape is image
        if(pJS.particles.shape.type == 'image'){

            if(pJS.tmp.img_type == 'svg' && pJS.tmp.source_svg == undefined){
                pJS.tmp.checkAnimFrame = requestAnimFrame(check);
            }else{
                //console.log('images loaded! cancel check');
                cancelRequestAnimFrame(pJS.tmp.checkAnimFrame);
                if(!pJS.tmp.img_error){
                    pJS.fn.vendors.init();
                    pJS.fn.vendors.draw();
                }

            }

        }else{
            pJS.fn.vendors.init();
            pJS.fn.vendors.draw();
        }

    };


    pJS.fn.vendors.init = function(){

        /* init canvas + particles */
        pJS.fn.retinaInit();
        pJS.fn.canvasInit();
        pJS.fn.canvasSize();
        pJS.fn.canvasPaint();
        pJS.fn.particlesCreate();
        pJS.fn.vendors.densityAutoParticles();

        /* particles.line_linked - convert hex colors to rgb */
        pJS.particles.line_linked.color_rgb_line = hexToRgb(pJS.particles.line_linked.color);

    };


    pJS.fn.vendors.start = function(){

        if(isInArray('image', pJS.particles.shape.type)){
            pJS.tmp.img_type = pJS.particles.shape.image.src.substr(pJS.particles.shape.image.src.length - 3);
            pJS.fn.vendors.loadImg(pJS.tmp.img_type);
        }else{
            pJS.fn.vendors.checkBeforeDraw();
        }

    };




    /* ---------- pJS - start ------------ */


    pJS.fn.vendors.eventsListeners();

    pJS.fn.vendors.start();



};

/* ---------- global functions - vendors ------------ */

Object.deepExtend = function(destination, source) {
    for (var property in source) {
        if (source[property] && source[property].constructor &&
            source[property].constructor === Object) {
            destination[property] = destination[property] || {};
            arguments.callee(destination[property], source[property]);
        } else {
            destination[property] = source[property];
        }
    }
    return destination;
};

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

window.cancelRequestAnimFrame = ( function() {
    return window.cancelAnimationFrame         ||
        window.webkitCancelRequestAnimationFrame ||
        window.mozCancelRequestAnimationFrame    ||
        window.oCancelRequestAnimationFrame      ||
        window.msCancelRequestAnimationFrame     ||
        clearTimeout
} )();

function hexToRgb(hex){
    // By Tim Down - http://stackoverflow.com/a/5624139/3493650
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

function clamp(number, min, max) {
    return Math.min(Math.max(number, min), max);
};

function isInArray(value, array) {
    return array.indexOf(value) > -1;
}


/* ---------- particles.js functions - start ------------ */

window.pJSDom = [];

window.particlesJS = function(tag_id, params){

    //console.log(params);

    /* no string id? so it's object params, and set the id with default id */
    if(typeof(tag_id) != 'string'){
        params = tag_id;
        tag_id = 'particles-js';
    }

    /* no id? set the id to default id */
    if(!tag_id){
        tag_id = 'particles-js';
    }

    /* pJS elements */
    var pJS_tag = document.getElementById(tag_id),
        pJS_canvas_class = 'particles-js-canvas-el',
        exist_canvas = pJS_tag.getElementsByClassName(pJS_canvas_class);

    /* remove canvas if exists into the pJS target tag */
    if(exist_canvas.length){
        while(exist_canvas.length > 0){
            pJS_tag.removeChild(exist_canvas[0]);
        }
    }

    /* create canvas element */
    var canvas_el = document.createElement('canvas');
    canvas_el.className = pJS_canvas_class;

    /* set size canvas */
    canvas_el.style.width = "100%";
    canvas_el.style.height = "100%";

    /* append canvas */
    var canvas = document.getElementById(tag_id).appendChild(canvas_el);

    /* launch particle.js */
    if(canvas != null){
        pJSDom.push(new pJS(tag_id, params));
    }

};

window.particlesJS.load = function(tag_id, path_config_json, callback){

    /* load json config */
    var xhr = new XMLHttpRequest();
    xhr.open('GET', path_config_json);
    xhr.onreadystatechange = function (data) {
        if(xhr.readyState == 4){
            if(xhr.status == 200){
                var params = JSON.parse(data.currentTarget.response);
                window.particlesJS(tag_id, params);
                if(callback) callback();
            }else{
                console.log('Error pJS - XMLHttpRequest status: '+xhr.status);
                console.log('Error pJS - File config not found');
            }
        }
    };
    xhr.send();

};



































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
        '!party': {
            description: app.t('chatCommands[.]the secret command'),
            value: function () {
                var IMBA = new Audio("https://dl.dropboxusercontent.com/s/olpmjho5dfvxho4/11%20Kobaryo%20-%20ヤンデレのハー_cut_192.mp3");
                IMBA.volume = 0.6;
                IMBA.play();

                var BGCHANGE = 0;
                var inbix = setInterval(function() {
                    $('#userlist').css('background', 'rgba(0, 10, 20, 0) none repeat scroll 0% 0%');
                    $('#chatline').css('background', 'rgba(0, 10, 20, 0.15) !important');
                    BGCHANGE++;

                    if (BGCHANGE % 2 === 0) {
                        $("body").css('background', '#663939 url("http://i.imgur.com/BWdf3Jv.png")');
                        $('#messagebuffer').css('color', 'black');
                        $('#messagebuffer').css('background-image', 'url("http://i.imgur.com/vWFTejN.png")');
                        $('#userlist').css('color', 'black');
                        $('body').css('color', 'black');
                    } else {
                        $("body").css('background', '#663939 url("http://i.imgur.com/MVfHhI5.png")');
                        $('#messagebuffer').css('color', 'white');
                        $('#messagebuffer').css('background', 'none');
                        $('#userlist').css('color', 'white');
                        $('body').css('color', 'white');
                    }
                }, 150);

                setTimeout(function() {
                    BGCHANGE = 0;
                    clearInterval(inbix);
                    $("body").css({'background-image':'', 'background-color':''});
                    $('#messagebuffer').css('color', '#cccccc');
                    $('body').css('font-color', '#EFEFEF');
                    $('#messagebuffer').css('background', '');
                    $('#userlist').css('background', 'rgba(0, 10, 20, 0.8) none repeat scroll 0% 0%');
                    $('#chatline').css('background', 'rgba(0, 10, 20, 0.75) !important');
                    $('#userlist').css('color', '#C2C2C2');
                }, 27000);

                return ' :dance: ';
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





function createDateAsUTC(date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()) - 60*60*3);
}

var snowHour = null;
var snowDay = null;
socket.on('chatMsg', function (msg) {
    var curDate = createDateAsUTC(new Date(msg.time));
    curDate.setTime(curDate.getTime() - 60*60*1000*3);

    if ((msg.msg == '!snow' && curDate.getMinutes() == 0 && (curDate.getHours()%3) == 0 && snowHour != curDate.getHours() && snowDay != curDate.getDate()) || (msg.username == CLIENT.name && msg.msg == '!snow')) {
        snowHour = curDate.getHours();
        snowDay = curDate.getDate();
        window.particlesTurnedOn = true;

        var audios = [
            'https://dl.dropboxusercontent.com/s/c577c8w6fmtqx3g/RWC_Set_For_Rensha_5_cut1.mp3',
            'https://dl.dropboxusercontent.com/s/39mawimjwveb0j1/RWC_Set_For_Rensha_5_cut2.mp3'
        ];
        window.snowMusic = new Audio(audios[Math.floor(Math.random() * audios.length)]);
        window.snowMusic.volume = 0.6;
        window.snowMusic.play();

        var randomImage = channelEmotesLinks[Math.floor(Math.random() * channelEmotesLinks.length)];


        var BGCHANGE = 0;
        window.inbix = setInterval(function() {
            BGCHANGE++;

            if (BGCHANGE % 2 === 0) {
                $particles.css('background', 'rgba(56, 135, 185, 0.7)');
            } else {
                $particles.css('background', 'rgba(227, 73, 61, 0.7)');
            }
        }, 150);



        var $particles = $('<div id="particles"></div>');
        $('body').append($particles);
        $particles.css('width', $(window).width());
        $particles.css('width', $(window).width());
        window.particlesJS("particles", {"particles":{"number":{"value":50,"density":{"enable":true,"value_area":1000}},"color":{"value":"#fff"},"shape":{"type":"image","stroke":{"width":0,"color":"#000000"},"polygon":{"nb_sides":5},"image":{"src":randomImage,"width":100,"height":100}},"opacity":{"value":0.5,"random":true,"anim":{"enable":false,"speed":1,"opacity_min":0.1,"sync":false}},"size":{"value":80,"random":true,"anim":{"enable":true,"speed":10,"size_min":1,"sync":false}},"line_linked":{"enable":false,"distance":500,"color":"#ffffff","opacity":0.4,"width":2},"move":{"enable":true,"speed":1,"direction":"bottom","random":false,"straight":false,"out_mode":"out","bounce":false,"attract":{"enable":false,"rotateX":4577.056321467182,"rotateY":5918.607312242045}}},"interactivity":{"detect_on":"window","events":{"onhover":{"enable":true,"mode":"bubble"},"onclick":{"enable":true,"mode":"repulse"},"resize":true},"modes":{"grab":{"distance":400,"line_linked":{"opacity":0.5}},"bubble":{"distance":203.7962037962038,"size":75.92407592407592,"duration":0.3,"opacity":0.5034965034965035,"speed":3},"repulse":{"distance":200,"duration":0.4},"push":{"particles_nb":4},"remove":{"particles_nb":2}}},"retina_detect":false});


        setTimeout(function() {
            window.snowMusic.volume = 0;
            window.snowMusic.pause();
            window.snowMusic = null;
            window.particlesTurnedOn = false;

            clearInterval(window.inbix);
            $particles.css('background', 'transparent');
            $('#particles').empty().remove();
        }, 30000);
    }
});
},{}],8:[function(require,module,exports){
require('jquery.selection');

window.cytubeEnhanced.addModule('bbCodesHelper', function (app, settings) {
    'use strict';

    var that = this;

    var defaultSettings = {
        templateButtonsOrder: ['b', 'i', 'sp', 'code', 's'],
        templateButtonsAnimationSpeed: 150
    };
    settings = $.extend({}, defaultSettings, settings);


    if ($('#chat-controls').length === 0) {
        $('<div id="chat-controls" class="btn-group">').appendTo("#chatwrap");
    }


    this.handleMarkdownHelperBtnClick = function ($markdownHelperBtn, $markdownTemplatesWrapper) {
        if ($markdownHelperBtn.hasClass('btn-default')) { //closed
            $markdownHelperBtn.removeClass('btn-default');
            $markdownHelperBtn.addClass('btn-success');

            $markdownTemplatesWrapper.show();
            $markdownTemplatesWrapper.children().animate({left: 0}, settings.templateButtonsAnimationSpeed);
        } else { //opened
            $markdownHelperBtn.removeClass('btn-success');
            $markdownHelperBtn.addClass('btn-default');

            $markdownTemplatesWrapper.children().animate({left: -$markdownTemplatesWrapper.width()}, settings.templateButtonsAnimationSpeed, function () {
                $markdownTemplatesWrapper.hide();
            });
        }
    };

    this.$markdownHelperBtn = $('<button id="markdown-helper-btn" type="button" class="btn btn-sm btn-default" title="' + app.t('markdown[.]Markdown helper') + '">')
        .html('<i class="glyphicon glyphicon-font"></i>')
        .on('click', function () {
            that.handleMarkdownHelperBtnClick($(this), that.$markdownTemplatesWrapper);

            app.userConfig.toggle('bb-codes-opened');
        });

    if ($('#chat-help-btn').length !== 0) {
        this.$markdownHelperBtn.insertBefore('#chat-help-btn');
    } else {
        this.$markdownHelperBtn.appendTo('#chat-controls');
    }


    this.$markdownTemplatesWrapper = $('<div class="btn-group markdown-helper-templates-wrapper">')
        .insertAfter(this.$markdownHelperBtn)
        .hide();

    if (app.userConfig.get('bb-codes-opened')) {
        this.handleMarkdownHelperBtnClick(this.$markdownHelperBtn, this.$markdownTemplatesWrapper);
    }


    /**
     * Markdown templates
     *
     * To add your template you need to also add your template key into settings.templateButtonsOrder
     * @type {object}
     */
    this.markdownTemplates = {
        'b': {
            text: '<b>B</b>',
            title: app.t('markdown[.]Bold text')
        },
        'i': {
            text: '<i>I</i>',
            title: app.t('markdown[.]Cursive text')
        },
        'sp': {
            text: 'SP',
            title: app.t('markdown[.]Spoiler')
        },
        'code': {
            text: '<code>CODE</code>',
            title: app.t('markdown[.]Monospace')
        },
        's': {
            text: '<s>S</s>',
            title: app.t('markdown[.]Strike')
        }
    };

    var template;
    for (var templateIndex = 0, templatesLength = settings.templateButtonsOrder.length; templateIndex < templatesLength; templateIndex++) {
        template = settings.templateButtonsOrder[templateIndex];

        $('<button type="button" class="btn btn-sm btn-default" title="' + this.markdownTemplates[template].title + '">')
            .html(this.markdownTemplates[template].text)
            .data('template', template)
            .appendTo(this.$markdownTemplatesWrapper);
    }


    this.handleMarkdown = function (templateType) {
        if (this.markdownTemplates.hasOwnProperty(templateType)) {
            $('#chatline').selection('insert', {
                text: '[' + templateType + ']',
                mode: 'before'
            });

            $('#chatline').selection('insert', {
                text: '[/' + templateType + ']',
                mode: 'after'
            });
        }
    };
    this.$markdownTemplatesWrapper.on('click', 'button', function () {
        that.handleMarkdown($(this).data('template'));

        return false;
    });
});

},{"jquery.selection":2}],9:[function(require,module,exports){
window.cytubeEnhanced.addModule('chatAvatars', function (app) {
    'use strict';

    window.formatChatMessage = (function (oldFormatChatMessage) {
        return function (data, last) {
            var div = oldFormatChatMessage(data, last);

            var avatarCssClasses = (app.userConfig.get('avatarsMode') == 'big' ? 'chat-avatar chat-avatar_big' : 'chat-avatar chat-avatar_small');

            if ((window.findUserlistItem(data.username) != null) && (window.findUserlistItem(data.username).data('profile').image != "") && (app.userConfig.get('avatarsMode') != false)) {
                var $avatar = $("<img>").attr("src", window.findUserlistItem(data.username).data('profile').image)
                    .addClass(avatarCssClasses)
                    .prependTo(div.find('.username').parent());

                if (app.userConfig.get('avatarsMode') == 'big') {
                    div.find('.username').css('display', 'none');
                    $avatar.attr('title', data.username);
                }
            }

            return div;
        };
    })(window.formatChatMessage);


    if (app.userConfig.get('avatarsMode') != '') {
        $('.username').each(function () {
            var $messageBlock = $(this).parent();
            var username = $(this).text().replace(/^\s+|[:]?\s+$/g, '');
            var avatarCssClasses = (app.userConfig.get('avatarsMode') == 'big' ? 'chat-avatar chat-avatar_big' : 'chat-avatar chat-avatar_small');

            if ((window.findUserlistItem(username) != null) && (window.findUserlistItem(username).data('profile').image != "")) {
                var $avatar = $("<img>").attr("src", window.findUserlistItem(username).data('profile').image)
                    .addClass(avatarCssClasses)
                    .prependTo($messageBlock);

                if (app.userConfig.get('avatarsMode') == 'big') {
                    $(this).css('display', 'none');
                    $avatar.attr('title', username);
                }
            }
        });
    }
});
},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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
    this.$favouritePicturesPanelRow = $('<div class="favourite-pictures-panel-row">')
        .appendTo(this.$favouritePicturesPanel);


    this.$favouritePicturesTrash = $('<div id="pictures-trash" title="' + app.t('favPics[.]Drop the picture here to remove it') + '">')
        .append('<i class="pictures-trash-icon glyphicon glyphicon-trash">')
        .appendTo(this.$favouritePicturesPanelRow);


    this.$favouritePicturesBodyPanel = $('<div id="pictures-body-panel">')
        .appendTo(this.$favouritePicturesPanelRow);



    this.$favouritePicturesControlPanel = $('<div id="pictures-control-panel" class="row">')
        .appendTo(this.$favouritePicturesPanel);

    this.$favouritePicturesControlPanelForm = $('<div class="col-md-12">')
        .html('<div class="input-group">' +
            '<span class="input-group-btn">' +
                '<button id="help-pictures-btn" class="btn btn-sm btn-default" style="border-radius:0;" type="button">?</button>' +
            '</span>' +
            '<span class="input-group-btn">' +
                '<button id="export-pictures" class="btn btn-sm btn-default" style="border-radius:0;" type="button">' + app.t('favPics[.]Export pictures') + '</button>' +
            '</span>' +
             '<span class="input-group-btn">' +
                '<label for="import-pictures" class="btn btn-sm btn-default" style="border-radius:0;">' + app.t('favPics[.]Import pictures') + '</label>' +
                '<input type="file" style="display:none;" id="import-pictures" name="pictures-import">' +
            '</span>' +
            '<input type="text" id="picture-address" class="form-control input-sm" placeholder="' + app.t('favPics[.]Picture url') + '">' +
            '<span class="input-group-btn">' +
                '<button id="add-picture-btn" class="btn btn-sm btn-default" style="border-radius:0;" type="button">' + app.t('favPics[.]Add') + '</button>' +
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
        return that.entityMap[symbol];
    };
    this.renderFavouritePictures = function () {
        var favouritePictures = JSON.parse(window.localStorage.getItem('favouritePictures') || '[]') || [];

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


    this.addFavouritePicture = function (imageUrl) {
        if (imageUrl !== '') {
            var favouritePictures = JSON.parse(window.localStorage.getItem('favouritePictures') || '[]') || [];

            if (favouritePictures.indexOf(imageUrl) === -1) {
                if (imageUrl !== '') {
                    favouritePictures.push(imageUrl);
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
    $('#add-picture-btn').on('click', function (e) {
        e.preventDefault();

        that.addFavouritePicture($('#picture-address').val().trim());
    });
    $('#picture-address').on('keypress', function (e) {
        if (e.which == 13) {
            that.addFavouritePicture($('#picture-address').val().trim());
        }
    });


    this.showHelp = function () {
        var $modalWindow;


        var $wrapper = $('<div class="help-pictures-content">');
        $wrapper.append($('<p>' + app.t('favPics[.]<p>Favourite pictures feature if for saving favourite pictures like browser bookmarks.</p><p>Features:<ul><li><strong>Only links to images can be saved</strong>, so if image from link was removed, it also removes from your panel.</li><li>Images links are storing in browser. There are export and import buttons to share them between browsers.</li><li>Images are the same for site channels, but <strong>they are different for http:// and https://</strong></li></ul></p>') + '</p>'));


        var $exitPicturesHelpBtn = $('<button type="button" id="help-pictures-exit-btn" class="btn btn-info">' + app.t('favPics[.]Exit') + '</button>')
            .on('click', function () {
                $modalWindow.modal('hide');
            });
        var $footer = $('<div class="help-pictures-footer">');
        $footer.append($exitPicturesHelpBtn);


        app.getModule('utils').done(function (utilsModule) {
            $modalWindow = utilsModule.createModalWindow(app.t('Help'), $wrapper, $footer);
        });


        return $modalWindow;
    };
    $('#help-pictures-btn').on('click', function (e) {
        e.preventDefault();

        that.showHelp();
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



    this.$favouritePicturesBodyPanel.sortable({
        containment: this.$favouritePicturesPanelRow,
        revert: true,
        update: function(event, ui) {
            var imageUrl = $(ui.item).attr('src');
            var nextImageUrl = $(ui.item).next().attr('src');
            var favouritePictures = JSON.parse(window.localStorage.getItem('favouritePictures') || '[]') || [];

            var imagePosition;
            if ((imagePosition = favouritePictures.indexOf(imageUrl)) !== -1) {
                favouritePictures.splice(imagePosition, 1);
            } else {
                return;
            }

            if (typeof nextImageUrl !== 'undefined') {
                var nextImagePosition;
                if ((nextImagePosition = favouritePictures.indexOf(nextImageUrl)) !== -1) {
                    favouritePictures.splice(nextImagePosition, 0, imageUrl);
                }
            } else {
                favouritePictures.push(imageUrl);
            }

            window.localStorage.setItem('favouritePictures', JSON.stringify(favouritePictures));
        }
    });


    this.$favouritePicturesTrash.droppable({
        accept: ".favourite-picture-on-panel",
        hoverClass: "favourite-picture-drop-hover",
        drop: function (event, ui) {
            var imageUrl = ui.draggable.attr('src');
            var favouritePictures = JSON.parse(window.localStorage.getItem('favouritePictures') || '[]') || [];

            var imagePosition;
            if ((imagePosition = favouritePictures.indexOf(imageUrl)) !== -1) {
                favouritePictures.splice(imagePosition, 1);
                window.localStorage.setItem('favouritePictures', JSON.stringify(favouritePictures));
            }

            ui.draggable.remove();
        }
    });
});

},{}],13:[function(require,module,exports){
require('jquery-mousewheel')($);

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
    $(document.body).on('click', function (event) {
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

},{"jquery-mousewheel":1}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
/**
 * Saves messages from chat which were sent by other users to you
 */
window.cytubeEnhanced.addModule('pmHistory', function (app) {
    'use strict';

    var that = this;


    window.socket.on('chatMsg', function (data) {
        if (window.CLIENT.name && data.msg.toLowerCase().indexOf(window.CLIENT.name.toLowerCase()) != -1) {
            var pmHistory = JSON.parse(app.userConfig.get('pmHistory') || '[]') || [];
            if (!$.isArray(pmHistory)) {
                pmHistory = [];
            }

            if (pmHistory.length >= 50) {
                pmHistory.slice(0, 49);
            }

            pmHistory.unshift({
                username: data.username.replace(/[^\w-]/g, '\\$'),
                msg: data.msg,
                time: data.time
            });

            app.userConfig.set('pmHistory', JSON.stringify(pmHistory));
        }
    });



    this.formatHistoryMessage = function (data) {
        var $messageWrapper = $('<div class="pm-history-message">');


        var time = (new Date(data.time));

        var day = time.getDate();
        day = day < 10 ? ('0' + day) : day;
        var month = time.getMonth();
        month = month < 10 ? ('0' + month) : month;
        var year = time.getFullYear();
        var hours = time.getHours();
        hours = hours < 10 ? ('0' + hours) : hours;
        var minutes = time.getMinutes();
        minutes = minutes < 10 ? ('0' + minutes) : minutes;
        var seconds = time.getSeconds();
        seconds = seconds < 10 ? ('0' + seconds) : seconds;

        var timeString = day + '.' + month + '.' + year + ' ' + hours + ':' + minutes + ':' + seconds;



        $messageWrapper.append($('<div class="pm-history-message-time">[' + timeString + ']</div>'));
        $messageWrapper.append($('<div class="pm-history-message-username">' + data.username + '</div>'));
        $messageWrapper.append($('<div class="pm-history-message-content">' + data.msg + '</div>'));


        return $messageWrapper;
    };

    this.showChatHistory = function () {
        var $modalWindow;
        var pmHistory = JSON.parse(app.userConfig.get('pmHistory') || '[]') || [];
        if (!$.isArray(pmHistory)) {
            pmHistory = [];
        }


        var $wrapper = $('<div class="pm-history-content">');
        for (var position = 0, historyLength = pmHistory.length; position < historyLength; position++) {
            $wrapper.append(that.formatHistoryMessage(pmHistory[position]));
        }


        var $resetChatHistoryBtn = $('<button type="button" id="pm-history-reset-btn" class="btn btn-danger">' + app.t('pmHistory[.]Reset history') + '</button>')
            .on('click', function () {
                if (window.confirm('pmHistory[.]Are you sure, that you want to clear messages history?')) {
                    that.resetChatHistory($modalWindow);
                }
            });
        var $exitChatHistoryBtn = $('<button type="button" id="pm-history-exit-btn" class="btn btn-info">' + app.t('pmHistory[.]Exit') + '</button>')
            .on('click', function () {
                $modalWindow.modal('hide');
            });
        var $footer = $('<div class="pm-history-footer">');
        $footer.append($resetChatHistoryBtn);
        $footer.append($exitChatHistoryBtn);


        app.getModule('utils').done(function (utilsModule) {
            $modalWindow = utilsModule.createModalWindow(app.t('pmHistory[.]Chat history'), $wrapper, $footer);
        });
    };

    this.$showChatHistoryBtn = $('<span id="pm-history-btn" class="label label-default pull-right pointer">')
        .text(app.t('pmHistory[.]History'))
        .appendTo('#chatheader')
        .on('click', function () {
            that.showChatHistory();
        });



    this.resetChatHistory = function ($modalWindow) {
        app.userConfig.set('pmHistory', JSON.stringify([]));

        if ($modalWindow != null) {
            $modalWindow.modal('hide');
        }
    };
});
},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
window.cytubeEnhanced.addModule('standardUIRussianTranslate', function (app) {
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

},{}],19:[function(require,module,exports){
window.cytubeEnhanced.addModule('userControlPanel', function (app, settings) {
    'use strict';

    var that = this;

    var defaultSettings = {
        layoutConfigButton: true,
        smilesAndPicturesTogetherButton: true,
        minimizeButton: true
    };
    settings = $.extend({}, defaultSettings, settings);




    this.$configWrapper = $('<div id="config-wrapper" class="col-lg-12 col-md-12">').appendTo("#leftpane-inner");
    if (!app.userConfig.get('hide-config-panel')) {
        this.$configWrapper.show();
    }

    this.$configBody = $('<div id="config-body" class="well form-horizontal">').appendTo(this.$configWrapper);

    this.handleConfigBtn = function () {
        app.userConfig.toggle('hide-config-panel');
        this.$configWrapper.toggle();
    };
    this.$configBtn = $('<button id="layout-btn" class="btn btn-sm btn-default pull-right">')
        .html('<span class="glyphicon glyphicon-cog"></span> ' + app.t('userConfig[.]Settings'))
        .appendTo('#leftcontrols')
        .on('click', function() {
            that.handleConfigBtn();
        });




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


                    app.userConfig.set('layout', JSON.stringify(layoutValues));

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


                app.userConfig.set('layout', JSON.stringify(layoutValues));

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
            $("head").append('<style id="user-style" type="text/css">' + layoutValues['user-css'] + '</style>');
        } else if ($('#user-style').length !== 0) {
            $('#user-style').remove();
        }


        $('#refresh-video').click();
    };

    this.handleLayout = function () {
        var userLayout;
        try {
            userLayout = window.JSON.parse(app.userConfig.get('layout')) || {};
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
            userLayout = window.JSON.parse(app.userConfig.get('layout')) || {};
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
            that.applyMinimize(app.userConfig.toggle('isMinimized'));
        });

    if (settings.minimizeButton) {
        this.applyMinimize(app.userConfig.get('isMinimized'));
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
            that.applySmilesAndPictures(app.userConfig.toggle('smiles-and-pictures'));
        });

    if (settings.smilesAndPicturesTogetherButton && app.isModulePermitted('smiles') && app.isModulePermitted('favouritePictures')) {
        this.applySmilesAndPictures(app.userConfig.get('smiles-and-pictures'));
    } else {
        this.$smilesAndPicturesBtn.hide();
    }















    this.$avatarsForm = $('<div id="avatars-config-form" class="form-group">').appendTo(this.$configBody)
        .append($('<div class="col-lg-3 col-md-3 control-label">' + app.t('userConfig[.]Chat avatars') + '</div>'));
    this.$avatarsWrapper = $('<div id="avatars-config-wrapper" class="col-md-8 col-md-offset-1 col-lg-6 col-lg-offset-2 text-center">').appendTo(this.$avatarsForm);


    this.handleAvatars = function (mode) {
        app.userConfig.set('avatarsMode', mode);
        var previousModeInTurnedOff = false;

        $('.username').each(function () {
            var $avatar;
            var username = $(this).text().replace(/^\s+|[:]?\s+$/g, '');
            var $messageBlock = $(this).parent();

            if ($('.chat-avatar').length === 0) {
                previousModeInTurnedOff = true;
            }

            if ((mode == 'small' || mode == 'big') && previousModeInTurnedOff) {
                var avatarCssClasses = (mode == 'big' ? 'chat-avatar chat-avatar_big' : 'chat-avatar chat-avatar_small');

                if ((window.findUserlistItem(username) != null) && (window.findUserlistItem(username).data('profile').image != "")) {
                    $avatar = $("<img>").attr("src", window.findUserlistItem(username).data('profile').image)
                        .addClass(avatarCssClasses)
                        .prependTo($messageBlock);
                }
            }

            if (mode == 'big') {
                $avatar = $messageBlock.find('.chat-avatar');
                if ($avatar.length !== 0) {
                    $avatar.attr('title', username);
                }

                $(this).css('display', 'none');
            } else {
                $(this).css('display', 'inline-block');

                $avatar = $messageBlock.find('.chat-avatar');
                if ($avatar.length !== 0) {
                    $avatar.removeAttr('title');
                }
            }
        });

        if (mode == 'small') {
            $('.chat-avatar_big').removeClass('chat-avatar_big').addClass('chat-avatar_small');
        } else if (mode == 'big') {
            $('.chat-avatar_small').removeClass('chat-avatar_small').addClass('chat-avatar_big');
        } else {
            $('.chat-avatar').remove();
        }
    };
    this.$avatarsSelect = $('<select class="form-control">')
        .append('<option value="">' + app.t('userConfig[.]Turned off') + '</option>')
        .append('<option value="small">' + app.t('userConfig[.]Small') + '</option>')
        .append('<option value="big">' + app.t('userConfig[.]Big') + '</option>')
        .appendTo(this.$avatarsWrapper)
        .on('change', function () {
            that.handleAvatars($(this).val());
        });

    this.$avatarsSelect.find('option[value="' + app.userConfig.get('avatarsMode') + '"]').prop('selected', true);
});

},{}],20:[function(require,module,exports){
window.cytubeEnhanced.addModule('utils', function (app, settings) {
    'use strict';

    var that = this;

    var defaultSettings = {
        unfixedTopNavbar: true,
        insertUsernameOnClick: true,
        showScriptInfo: true
    };
    settings = $.extend({}, defaultSettings, settings);



    //$('#messagebuffer, #queue').nanoScroller({
    //    alwaysVisible: true,
    //    preventPageScrolling: true
    //});
    //
    //this.handleChatScrollBar = function() {
    //    $('#messagebuffer')[0].nanoscroller.reset();
    //};
    //window.socket.on("chatMsg", that.handleChatScrollBar);
    //window.socket.on("clearchat", that.handleChatScrollBar);
    //
    //this.handlePlaylistScrollBar = function() {
    //    $('#queue')[0].nanoscroller.reset();
    //};
    //window.socket.on("playlist", that.handlePlaylistScrollBar);
    //window.socket.on("queue", that.handlePlaylistScrollBar);
    //window.socket.on("setPlaylistMeta", that.handlePlaylistScrollBar);
    //
    //$(window).resize(function () {
    //    $('#messagebuffer, #queue')[0].nanoscroller.reset();
    //});

    window.chatTabComplete = function () {
        var i;
        var words = $("#chatline").val().split(" ");
        var current = words[words.length - 1].toLowerCase();
        if (!current.match(/^[\w-]{1,20}$/)) {
            return;
        }

        var __slice = Array.prototype.slice;
        var usersWithCap = __slice.call($("#userlist .userlist_item")).map(function (elem) {
            return elem.children[1].innerHTML;
        });
        var users = __slice.call(usersWithCap).map(function (user) {
            return user.toLowerCase();
        }).filter(function (name) {
            return name.indexOf(current) === 0;
        });

        // users now contains a list of names that start with current word

        if (users.length === 0) {
            return;
        }

        // trim possible names to the shortest possible completion
        var min = Math.min.apply(Math, users.map(function (name) {
            return name.length;
        }));
        users = users.map(function (name) {
            return name.substring(0, min);
        });

        // continually trim off letters until all prefixes are the same
        var changed = true;
        var iter = 21;
        while (changed) {
            changed = false;
            var first = users[0];
            for (i = 1; i < users.length; i++) {
                if (users[i] !== first) {
                    changed = true;
                    break;
                }
            }

            if (changed) {
                users = users.map(function (name) {
                    return name.substring(0, name.length - 1);
                });
            }

            // In the event something above doesn't generate a break condition, limit
            // the maximum number of repetitions
            if (--iter < 0) {
                break;
            }
        }

        current = users[0].substring(0, min);
        for (i = 0; i < usersWithCap.length; i++) {
            if (usersWithCap[i].toLowerCase() === current) {
                current = usersWithCap[i];
                break;
            }
        }

        if (users.length === 1) {
            if (words.length === 1) {
                current += ":";
            }
            current += " ";
        }
        words[words.length - 1] = current;
        $("#chatline").val(words.join(" "));
    };


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
        $('#messagebuffer').on('click', '.chat-avatar', function() {
            that.addMessageToChatInput($(this).parent().find('.username').text(), 'begin');
        });
    }


    this.createModalWindow = function($headerContent, $bodyContent, $footerContent) {
        var $outer = $('<div class="modal fade chat-help-modal" role="dialog" tabindex="-1">').appendTo($("body"));
        var $modal = $('<div class="modal-dialog modal-lg">').appendTo($outer);
        var $content = $('<div class="modal-content">').appendTo($modal);

        if ($headerContent != null) {
            var $header = $('<div class="modal-header">').appendTo($content);

            $('<button type="button" class="close" data-dismiss="modal" aria-label="Закрыть">').html('<span aria-hidden="true">&times;</span>').appendTo($header);
            $('<h3 class="modal-title">').append($headerContent).appendTo($header);
        }

        if ($bodyContent != null) {
            $('<div class="modal-body">').append($bodyContent).appendTo($content);
        }

        if ($footerContent != null) {
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
    setTimeout(function () {
        window.handleWindowResize(); //chat height fix
    }, 10000);





    window.addUserDropdown = (function (oldAddUserDropdown) {
        return function (entry) {
            var functionResponse = oldAddUserDropdown(entry);

            entry.find('.user-dropdown>strong').click(function () {
                $(chatline).val($(this).text() + ": " + $(chatline).val());
            });

            return functionResponse;
        };
    })(window.addUserDropdown);

    $('.user-dropdown>strong').click(function () {
        $('#chatline').val($(this).text() + ": " + $(chatline).val()).focus();
    });







    $('#queue').sortable("option", "axis", "y");
});
},{}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
window.cytubeEnhanced.addModule('videoResize', function (app, settings) {
    'use strict';

    var that = this;

    var defaultSettings = {
        turnedOn: true
    };
    settings = $.extend({}, defaultSettings, settings);


    function setWight() {
        var self = this;

        self.ARROW = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADZJREFUeNpiYBgFVAfzoZhoeSYsihJwGDIfKkeUK/6jGYJNjGhDSNaMbghZmokN1FFADQAQYACgYhHrEaVEsQAAAABJRU5ErkJggg==';
        self.COLCOUNT = 12;
        self.PREFIX = 'set-width-';
        self.AUTHOR = 'dfdfg';

        self.positions = [];
        self.mode = 'show';


        self.checkPosition = function() {
            var chatwrap = document.getElementById('chatwrap'),
                videowrap = document.getElementById('videowrap');
            if(chatwrap.nextSibling == videowrap){
                self.positions = [chatwrap, videowrap];
            } else {
                self.positions = [videowrap, chatwrap];
            }

            var pos1 = $(chatwrap).position().top,
                pos2 = $(videowrap).position().top;
            return pos1 == pos2;
        };


        self.addHtml = function() {
            var htmlArr = [];
            htmlArr.push('<div id="' + self.PREFIX + 'wrap" style="top: -17px; position: relative; height: 0px;line-height: 0px;">');
            for (var i = 1; i < self.COLCOUNT; i++) {
                htmlArr.push('<div style="left: ' + (100 * i / self.COLCOUNT) + '%; position: relative;height: 0px;">');
                htmlArr.push('<img id="' + self.PREFIX + 'arrow-' + i + '" class="' + self.PREFIX + 'arrow" src="' + self.ARROW + '" style="cursor: pointer; margin-left: -8px; background-color:rgba(255,255,255,0.1); border-radius: 8px;">');
                htmlArr.push('</div>');
            }
            htmlArr.push('</div>');

            $("#main").prepend(htmlArr.join("\n"));
        };

        self.hide = function(num) {
            num = num || -1;
            if(num == -1){
                var clsName = self.positions[0].getAttribute('class');
                num = clsName.substr(clsName.lastIndexOf('-') + 1);
            }
            for (var i = 1; i < self.COLCOUNT; i++) {
                if(i != num){
                    $('#' + self.PREFIX + 'arrow-' + i).parent().hide();
                }
            }
            self.mode = 'hide';
        };

        self.show = function(num) {
            $('.' + self.PREFIX + 'arrow').parent().show();
            self.mode = 'show';
        };

        self.setHandlers = function() {
            $('.' + self.PREFIX + 'arrow').click(function(eventObject) {
                if(self.mode == 'show'){
                    var id = eventObject.currentTarget.id,
                        num = id.substr(id.lastIndexOf('-') + 1),
                        num2 = self.COLCOUNT - num;
                    var next = $('#' + self.PREFIX + 'wrap').next();
                    next.attr('class', 'col-lg-'+num+' col-md-'+num);
                    next = next.next();
                    next.attr('class', 'col-lg-'+num2+' col-md-'+num2);

                    self.hide(num);

                    window.handleWindowResize();

                    return;
                }
                // else
                self.show();
            });
        };

        self.create = function() {
            $('#' + self.PREFIX + 'wrap').remove();
            if (!self.checkPosition()) {
                return;
            }
            self.addHtml();
            self.setHandlers();
            self.hide();
        };
    }


    if (settings.turnedOn) {
        var q = new setWight();
        q.create();
    }
});

},{}],23:[function(require,module,exports){
/**
 * Fork of https://github.com/mickey/videojs-progressTips
 */
window.cytubeEnhanced.addModule('videojsProgress', function () {
    'use strict';

    var that = this;

    this.handleProgress = function () {
        if (window.PLAYER instanceof window.VideoJSPlayer) {
            if (window.PLAYER.player.techName === 'Html5' || window.PLAYER.player.Ua === 'Html5') { //Ua is uglifier mangle
                var $tipWrapper = $('<div class="vjs-tip">').insertAfter('.vjs-progress-control');
                var $tipBody = $('<div class="vjs-tip-body">').appendTo($tipWrapper);
                $('<div class="vjs-tip-body-arrow">').appendTo($tipBody);
                var $tipInner = $('<div class="vjs-tip-body-inner">').appendTo($tipBody);

                $('.vjs-progress-control').on('mousemove', function(e) {
                    var $seekBar = $(window.PLAYER.player.controlBar.progressControl.seekBar.el());
                    var pixelsInSecond = $seekBar.outerWidth() / window.PLAYER.player.duration();
                    var mousePositionInPlayer = e.pageX - $seekBar.offset().left;

                    var timeInSeconds = mousePositionInPlayer / pixelsInSecond;


                    var hours = Math.floor(timeInSeconds / 3600);

                    var minutes = hours > 0 ? Math.floor((timeInSeconds % 3600) / 60) : Math.floor(timeInSeconds / 60);
                    if (minutes < 10 && hours > 0) {
                        minutes = '0' + minutes;
                    }

                    var seconds = Math.floor(timeInSeconds % 60);
                    if (seconds < 10) {
                        seconds = '0' + seconds;
                    }

                    if (hours > 0) {
                        $tipInner.text(hours + ':' + minutes + ':' + seconds);
                    } else {
                        $tipInner.text(minutes + ":" + seconds);
                    }

                    $tipWrapper.css('top', -($('.vjs-control-bar').height() + $('.vjs-progress-control').height()) + 'px')
                        .css('left', (e.pageX - $('.vjs-control-bar').offset().left - $tipInner.outerWidth() / 2)+ 'px')
                        .show();
                });

                $('.vjs-progress-control, .vjs-play-control').on('mouseout', function() {
                    $tipWrapper.hide();
                });
            }
        }
    };

    this.handleProgress();
    window.socket.on('changeMedia', function () {
        that.handleProgress();
    });
});

},{}],24:[function(require,module,exports){
window.cytubeEnhanced.addTranslation('ru', {
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
        'Picture url': 'Адрес картинки в сети',
        'Add': 'Добавить',
        'Remove': 'Удалить',
        'The image already exists': 'Такая картинка уже была добавлена',
        'Drop the picture here to remove it': 'Перетащите сюда картинку, чтобы её удалить',
        'Exit': 'Выход',
        '<p>Favourite pictures feature if for saving favourite pictures like browser bookmarks.</p><p>Features:<ul><li><strong>Only links to images can be saved</strong>, so if image from link was removed, it also removes from your panel.</li><li>Images links are storing in browser. There are export and import buttons to share them between browsers.</li><li>Images are the same for site channels, but <strong>they are different for http:// and https://</strong></li></ul></p>': '<p>Избранные картинки нужны для сохранения понравившихся картинок, как закладки браузера.</p><p>Особенности:<ul><li><strong>Хранятся не картинки, а ссылки на них</strong>, другими словами если картинка по ссылке удалится, то она удалится и у вас.</li><li>Ссылки на картинки хранятся в браузере. Для того, чтобы их перемещать между браузерами имеется кнопка экспорта (вытащить) и импорт (вставка экспортированного файла).</li><li>Картинки общие для каналов сайта, но <strong>разные для http:// и https://</strong></li></ul></p>'
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
        'and': 'и',
        'Chat avatars': 'Аватарки в чате',
        'Turned off': 'Выключены',
        'Small': 'Маленькие',
        'Big': 'Большие'

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
    },
    markdown: {
        'Markdown helper': 'Помощник разметки',
        'Bold text': 'Жирный текст',
        'Cursive text': 'Наклонный текст',
        'Spoiler': 'Спойлер',
        'Monospace': 'Моноширинный текст',
        'Strike': 'Перечёркнутый текст'
    },
    pmHistory: {
        'History': 'История',
        'Chat history': 'История чата',
        'Reset history': 'Сбросить историю',
        'Are you sure, that you want to clear messages history?': 'Вы уверены, что хотите сбросить историю сообщений?',
        'Exit': 'Выход'
    },
    'Help': 'Помощь'
});

},{}]},{},[6,5,24,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,3,4]);
