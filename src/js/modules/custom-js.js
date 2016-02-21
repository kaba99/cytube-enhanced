window.cytubeEnhanced.addModule('customJs', function (app, settings) {
    'use strict';
    var that = this;

    var defaultSettings = {
        aceUrl: 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.3/ace.js'
    };
    settings = $.extend({}, defaultSettings, settings);

    var tab = app.Settings.getTab('custom-js', 'JS', 400);
    var namespace = 'user-code';
    app.Settings.data.setDefault(namespace + '.js', '');

    var $editor = $('<textarea class="' + app.prefix + 'custom-editor-textarea"></textarea>').val(app.Settings.data.get(namespace + '.js')).appendTo(tab.$content);
    var $aceEditor = $('<div class="' + app.prefix + 'custom-editor-ace" id="' + app.prefix + 'js-editor"></div>').text(app.Settings.data.get(namespace + '.js'));
    var aceEditor;


    tab.onShow(function () {
        if (typeof aceEditor === 'undefined') {
            if (typeof window.ace === 'undefined') {
                $.getScript(settings.aceUrl, function () {
                    that.initializeAceEditor();
                })
            } else {
                that.initializeAceEditor();
            }
        }
    });


    this.applyUserCss = function (js) {
        $('#' + app.prefix + 'user-js').remove();
        $('body').append('<script id="' + app.prefix + 'user-js" type="text/javascript">' + js + '</script>');
    };


    this.initializeAceEditor = function () {
        $aceEditor.text($editor.val());
        $editor.replaceWith($aceEditor);

        aceEditor = window.ace.edit(app.prefix + 'js-editor');
        aceEditor.setTheme("ace/theme/tomorrow_night");
        aceEditor.getSession().setMode("ace/mode/javascript");
        aceEditor.getSession().setTabSize(4);
        aceEditor.getSession().setUseSoftTabs(true);
        aceEditor.getSession().setUseWrapMode(true);
        aceEditor.getSession().setWrapLimitRange();
        aceEditor.setOptions({
            minLines: 30,
            maxLines: 30,
            autoScrollEditorIntoView: true,
            highlightActiveLine: true
        });
    };


    /**
     * Saving and applying settings
     */
    app.Settings.onSave(function (settings) {
        if (aceEditor) {
            settings.set(namespace + '.js', aceEditor.getValue());
        } else {
            settings.set(namespace + '.js', $editor.val());
        }

        that.applyUserCss(settings.get(namespace + '.js'));
    });
    this.applyUserCss(app.Settings.data.get(namespace + '.js'))
});
