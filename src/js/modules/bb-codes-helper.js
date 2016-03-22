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

            app.storage.toggle('bb-codes-opened');
        });

    if ($('#chat-help-btn').length !== 0) {
        this.$markdownHelperBtn.insertBefore('#chat-help-btn');
    } else {
        this.$markdownHelperBtn.appendTo('#chat-controls');
    }


    this.$markdownTemplatesWrapper = $('<div class="btn-group markdown-helper-templates-wrapper">')
        .insertAfter(this.$markdownHelperBtn)
        .hide();

    if (app.storage.get('bb-codes-opened')) {
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
