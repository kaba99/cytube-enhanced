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
