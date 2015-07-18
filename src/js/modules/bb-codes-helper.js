require('jquery.selection');

window.cytubeEnhanced.addModule('bbCodesHelper', function (app) {
    'use strict';

    var that = this;


    if ($('#chat-controls').length === 0) {
        $('<div id="chat-controls" class="btn-group">').appendTo("#chatwrap");
    }


    this.$markdownHelperBtn = $('<button id="markdown-helper-btn" type="button" class="btn btn-sm btn-default" title="' + app.t('markdown[.]Markdown helper') + '">')
        .html('<i class="glyphicon glyphicon-font"></i>');

    if ($('#chat-help-btn').length !== 0) {
        this.$markdownHelperBtn.insertBefore('#chat-help-btn');
    } else {
        this.$markdownHelperBtn.appendTo('#chat-controls');
    }

    this.handleMarkdownHelperBtnClick = function ($markdownHelperBtn) {
        if ($markdownHelperBtn.hasClass('btn-default')) {
            $markdownHelperBtn.removeClass('btn-default');
            $markdownHelperBtn.addClass('btn-success');
        } else {
            $markdownHelperBtn.removeClass('btn-success');
            $markdownHelperBtn.addClass('btn-default');
        }

        that.$markdownTemplatesWrapper.toggle('fast');
    };
    this.$markdownHelperBtn.on('click', function () {
       that.handleMarkdownHelperBtnClick($(this));
    });


    this.$markdownTemplatesWrapper = $('<div class="btn-group">').insertAfter(this.$markdownHelperBtn).css('padding', '0 5px').hide();

    this.markdownTemplatesPositions = ['b', 'i', 'sp', 'code', 's'];
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
    for (var templateIndex = 0, templatesLength = this.markdownTemplatesPositions.length; templateIndex < templatesLength; templateIndex++) {
        template = this.markdownTemplatesPositions[templateIndex];

        $('<button type="button" class="btn btn-sm btn-default" title="' + this.markdownTemplates[template].title + '">')
            .html(this.markdownTemplates[template].text)
            .data('template', template)
            .appendTo(this.$markdownTemplatesWrapper);
    }


    this.handleMarkdown = function (templateType) {
        if (this.markdownTemplates.hasOwnProperty(templateType)) {
            $('#chatline').selection('insert', {
                text: '[' + templateType.toLowerCase() + ']',
                mode: 'before'
            });

            $('#chatline').selection('insert', {
                text: '[/' + templateType.toLowerCase() + ']',
                mode: 'after'
            });
        }
    };
    this.$markdownTemplatesWrapper.on('click', 'button', function () {
        that.handleMarkdown($(this).data('template'));

        return false;
    });
});
