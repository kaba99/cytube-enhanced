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
},{}],4:[function(require,module,exports){
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

},{"jquery.selection":2}],5:[function(require,module,exports){
window.cytubeEnhanced.addModule('chatAvatars', function (app) {
    'use strict';

    if (app.userConfig.get('avatarsMode')) {
        window.formatChatMessage = (function (oldFormatChatMessage) {
            return function (data, last) {
                var div = oldFormatChatMessage(data, last);

                var avatarCssClasses = (app.userConfig.get('avatarsMode') == 'big' ? 'chat-avatar chat-avatar_big' : 'chat-avatar chat-avatar_small');

                if ((window.findUserlistItem(data.username) != null) && (window.findUserlistItem(data.username).data('profile').image != "")) {
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
},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
window.cytubeEnhanced.addModule('extras', function (app, settings) {
    'use strict';

    var that = this;

    var defaultSettings = {
        enabledModules: ['translate', 'anime-quotes', 'pirate-quotes']
    };
    settings = $.extend({}, defaultSettings, settings);

    this.extraModules = {};
    this.enabledModules = JSON.parse(app.userConfig.get('enabledExtraModules') || 'null') || settings.enabledModules;


    this.add = function (config) {
        this.extraModules[config.name] = config;

        if (this.enabledModules.indexOf(config.name) != -1) {
            $.getScript(this.extraModules[config.name].url);
        }
    };
});

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{"jquery-mousewheel":1}],11:[function(require,module,exports){
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
                } else if (tabsConfig[tabIndex][TAB_TITLE].indexOf('!link!') === 0) {
                    $('<a href="' + tabsConfig[tabIndex][TAB_CONTENT] + '" target="_blank" class="btn btn-default btn-link">')
                        .html(tabsConfig[tabIndex][TAB_TITLE].replace('!link!', ''))
                        .appendTo($tabs);
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
            if ($(this).hasClass('btn-group')) { //dropdown
                var parsedDropdownItems = '';
                var $dropdownItems = $(this).children('ul').children();

                $dropdownItems.each(function () {
                    var link = $(this).children('a');

                    parsedDropdownItems += '[n]' + link.text() + '[/n][a]' + link.attr('href') + '[/a], ';
                });
                parsedDropdownItems = parsedDropdownItems.slice(0, -2);

                that.addTabInput(that.$tabsArea, '!dropdown!' + $(this).children('button').html().replace(' <span class="caret"></span>', ''), parsedDropdownItems);
            } else if ($(this).hasClass('btn-link')) { //link
                that.addTabInput(that.$tabsArea, '!link!' + $(this).html(), $(this).attr('href'));
            } else { //tab
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


    this.$tabsSettings = $('<div id="tabs-settings">')
        .html('<hr>' +
            '<h3>' + app.t('tabs[.]Tabs settings') + '</h3>' +
            '<ul>' +
                '<li>' + app.t('tabs[.]By default tab behaves like simple tab.') + '</li>' +
                '<li>' + app.t('tabs[.]Use !dropdown! prefix to create dropdown list. Example: !dropdown!My dropdown. Value must look like "[n]Link title 1[/n][a]URL 1[/a], [n]Link title 2[/n][a]URL 2[/a], [n]Link title 3[/n][a]URL 3[/a]"') + '</li>' +
                '<li>' + app.t('tabs[.]Use !link! prefix to create link. Example: !link!My link. Value must contain URL.') + '</li>' +
            '</ul>')
        .insertBefore('#cs-motdtext')
        .hide();


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
                $(this).removeClass('btn-success');

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
                    } else if (tabName.indexOf('!link!') === 0) {

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
            if (window.confirm(app.t('tabs[.]Tabs settings will be replaced with the code from the editor, continue?'))) {
                $(this).removeClass('btn-success');
                that.tabsHtmlToCondig($('#cs-motdtext').val());
            }
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


    $(document).on('change keypress', '#tabs-settings-area input, #tabs-settings-area textarea', function () {
        that.$tabsToHtml.addClass('btn-success');
    });

    $(document).on('change keypress', '#cs-motdtext', function () {
        that.$htmlToTabs.addClass('btn-success');
    });
});

},{}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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
},{}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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

                    app.userConfig.set('videoResizeColumnNumber', num);

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

        self.loadPosition = function () {
            var columnNumber = app.userConfig.get('videoResizeColumnNumber');
            if (columnNumber) {
                $('#' + q.PREFIX + 'arrow-' + columnNumber).trigger('click').load(function () {
                    $(this).trigger('click');
                });
            }
        };

        self.create = function() {
            $('#' + self.PREFIX + 'wrap').remove();
            if (!self.checkPosition()) {
                return;
            }
            self.addHtml();
            self.setHandlers();
            self.hide();
            self.loadPosition();
        };
    }


    if (settings.turnedOn) {
        var width = app.userConfig.get('chatCol') || 0;

        var q = new setWight();
        q.create();
    }
});

},{}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
cytubeEnhanced.getModule('extras').done(function (extraModules) {
    extraModules.add({
        title: 'Аниме-цитаты',
        name: 'anime-quotes',
        description: 'Нескучные аниме-цитаты.',
        url: 'https://rawgit.com/kaba99/cytube-enhanced/master/src/js/extras/anime-quotes/anime-quotes.js',
        languages: ['ru']
    });
});
},{}],21:[function(require,module,exports){
cytubeEnhanced.getModule('extras').done(function (extraModules) {
    extraModules.add({
        title: 'Цитаты пирата',
        name: 'pirate-quotes',
        description: 'Нескучные цитаты Пирата.',
        url: 'https://rawgit.com/kaba99/cytube-enhanced/master/src/js/extras/pirate-quotes/pirate-quotes.js',
        languages: ['ru']
    });
});
},{}],22:[function(require,module,exports){
cytubeEnhanced.getModule('extras').done(function (extraModules) {
    extraModules.add({
        title: 'Перевод интерфейса',
        name: 'translate',
        description: 'Русский перевод интерфейса.',
        url: 'https://rawgit.com/kaba99/cytube-enhanced/master/src/js/extras/translate/translate.js',
        languages: ['ru']
    });
});
},{}],23:[function(require,module,exports){
window.cytubeEnhanced = new window.CytubeEnhanced(
    $('title').text(),
    (window.cytubeEnhancedSettings ? (window.cytubeEnhancedSettings.language || 'ru') : 'ru'),
    (window.cytubeEnhancedSettings ? (window.cytubeEnhancedSettings.modulesSettings || {}) : {})
);

},{}],24:[function(require,module,exports){
window.CytubeEnhanced = function(channelName, language, modulesSettings) {
    'use strict';

    var that = this;

    this.channelName = channelName;
    this.language = language;

    this.translations = {};

    var modules = {};
    var MODULE_LOAD_TIMEOUT = 60000; //ms (1 minute)
    var MODULE_LOAD_PERIOD = 100; //ms (0.1 sec)


    /**
     * Gets the module
     *
     * Returns $.Deferred() promise object and throws error exception if timeout
     *
     * @param {string} moduleName The name of the module
     * @returns {object}
     */
    this.getModule = function (moduleName, namespace) {
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
        if (typeof that.translations[language] == 'undefined') {
            that.translations[language] = translationObject;
        } else {
            $.extend(true, that.translations[language], translationObject);
        }
    };


    /**
     * Translates the text
     * @param text The text to translate
     * @returns {string}
     */
    this.t = function (text) {
        var translatedText = text;

        if (that.language !== 'en' && that.translations[that.language]) {
            if (text.indexOf('[.]') !== -1) {
                var textWithNamespaces = text.split('[.]');

                translatedText = that.translations[that.language][textWithNamespaces[0]];
                for (var namespace = 1, namespacesLen = textWithNamespaces.length; namespace < namespacesLen; namespace++) {
                    translatedText = translatedText[textWithNamespaces[namespace]];
                }

                translatedText = translatedText || textWithNamespaces[textWithNamespaces.length - 1];
            } else {
                translatedText = that.translations[that.language][text];
            }
        } else if (text.indexOf('[.]') !== -1) { //English text by default
            translatedText = text.split('[.]').pop();
            translatedText = translatedText || text;
        }

        return translatedText;
    };



    this.userConfig = new window.CytubeEnhancedUserConfig(this);

    this.UI = new window.CytubeEnhancedUI(this);
    this.UI.initialize();
};

},{}],25:[function(require,module,exports){
window.CytubeEnhancedUI = function (app) {
    var that = this;
    var $navbar = $('#nav-collapsible').find('.navbar-nav');

    this.$tabsContainerOpenButton = $('<a href="javascript:void(0)" id="cytube-enhanced-ui">' + app.t('settings[.]Extended options') + '</a>');
    this.$tabsContainerHeader = $('<div class="cytube-enhanced-ui__header"></div>');
    this.$tabsContainerBody = $('<div class="cytube-enhanced-ui__body"></div>');
    this.$tabsContainerTabs = $('<ul class="nav nav-tabs">');
    this.$tabsContainerFooter = $('<div class="cytube-enhanced-ui__footer"></div>');


    /**
     * Creates settings
     */
    this.initialize = function () {


        that.$tabsContainerOpenButton
            .appendTo($navbar)
            .wrap('<li>')
            .on('click', function () {
                that.openSettings();
            });

        $('<h4>' + app.t('settings[.]Extended options') + '</h4>').appendTo(that.$tabsContainerHeader);
        that.$tabsContainerTabs.appendTo(that.$tabsContainerHeader);
    };


    /**
     * Adds new tab
     * @param name The name of the tab
     * @param title The title of the tab
     */
    this.addTab = function (name, title) {
        if (that.$tabsContainerTabs.children().length == 0) {
            that.initialize();
        }

        var $newTabButton = $('<li class="active"><a href="#' + name + '__content" class="' + name + '__button" data-toggle="tab">' + title + '</a></li>')
            .appendTo(that.$tabsContainerTabs);

        var $newTab = $('<div id="' + name + '__content" class="tab-pane">')
            .appendTo(that.$tabsContainerBody);
    };


    /**
     * Gets tab's content by its name
     * @param name The name of the tab
     */
    this.getTab = function (name) {
        return $('#' + name + '__content');
    };


    /**
     * Opens tab by its name
     * @param name The name of the tab
     */
    this.openTab = function (name) {
        $('#' + name + '__button').trigger('click');
    };


    /**
     * Creates modal window
     * @param $headerContent Modal header (optional)
     * @param $bodyContent Modal body (optional)
     * @param $footerContent Modal footer (optional)
     * @returns {jQuery} Modal window
     */
    this.createModalWindow = function($headerContent, $bodyContent, $footerContent) {
        var $outer = $('<div class="modal fade chat-help-modal" role="dialog" tabindex="-1">').appendTo($("body"));
        var $modal = $('<div class="modal-dialog modal-lg">').appendTo($outer);
        var $content = $('<div class="modal-content">').appendTo($modal);

        if ($headerContent != null) {
            var $header = $('<div class="modal-header">').append($headerContent).appendTo($content);

            $('<button type="button" class="close" data-dismiss="modal" aria-label="Закрыть">').html('<span aria-hidden="true">&times;</span>').prependTo($header);
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


    /**
     * Opens settings modal
     */
    this.openSettings = function () {
        that.createModalWindow(that.$tabsContainerHeader, that.$tabsContainerBody, that.$tabsContainerFooter);
    }
};
},{}],26:[function(require,module,exports){
window.CytubeEnhancedUserConfig = function (app) {
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
},{}],27:[function(require,module,exports){
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
        'there aren\'t any quotes.': 'цитаты отсутствуют.',
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
        'the secret command': 'секретная команда',
        'memes snow': 'мемный снег'
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
        'Tabs settings will be replaced with the code from the editor, continue?': 'Настройки вкладок будут заменены кодом из редактора, продолжить?',
        'Wrong content for the dropdown': 'Неправильное содержимое для выпадающего списка: ',
        'Convert from the editor\'s code': 'Преобразовать из кода редактора',
        'By default tab behaves like simple tab.': 'По умолчанию вкладка ведёт себя как обычная вкладка.',
        'Use !dropdown! prefix to create dropdown list. Example: !dropdown!My dropdown. Value must look like "[n]Link title 1[/n][a]URL 1[/a], [n]Link title 2[/n][a]URL 2[/a], [n]Link title 3[/n][a]URL 3[/a]"': 'Чтобы создать выпадающий список, используйте префикс !dropdown! перед названием, например "!dropdown!Мой выпадающий список". Значение должно выглядеть так "[n]Заголовок 1[/n][a]Адрес ссылки 1[/a], [n]Заголовок 2[/n][a]Адрес ссылки 2[/a], [n]Заголовок 3[/n][a]Адрес ссылки 3[/a]"',
        'Use !link! prefix to create link. Example: !link!My link. Value must contain URL.': 'Чтобы создать ссылку, используйте префикс !link! перед названием, например "!link!Моя ссылка". Значение должно содержать адрес ссылки.'
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
    'Help': 'Помощь',
    settings: {
        'Extended options': 'Расширенные опции'
    }
});

},{}]},{},[24,26,25,23,27,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22]);
