window.cytubeEnhanced.addModule('customJs', function (app, settings) {
    'use strict';
    var that = this;

    var defaultSettings = {
        aceUrl: 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.3/ace.js'
    };
    settings = $.extend({}, defaultSettings, settings);

    var tab = app.Settings.getTab('custom-js', 'JS', 300);
    var namespace = 'user-code';
    app.Settings.storage.setDefault(namespace + '.js', '');

    var $editor = $('<textarea class="' + app.prefix + 'custom-editor-textarea"></textarea>').val(app.Settings.storage.get(namespace + '.js')).appendTo(tab.$content);
    var $aceEditor = $('<div class="' + app.prefix + 'custom-editor-ace" id="' + app.prefix + 'js-editor"></div>').text(app.Settings.storage.get(namespace + '.js'));
    var aceEditor;


    tab.onShow(function () {
        if (typeof aceEditor === 'undefined') {
            if (typeof window.ace === 'undefined') {
                if (!app.Settings.aceIsLoading && !app.Settings.aceLoadingFailed) {
                    app.Settings.aceIsLoading = true;

                    $.ajax({
                        url: settings.aceUrl,
                        dataType: "script",
                        timeout: 20000 //20 sec
                    }).done(function () {
                        that.initializeAceEditor();
                    }).always(function () {
                        app.Settings.aceIsLoading = false;
                        app.Settings.aceLoadingFailed = true;
                        tab.$content.toggleLoader('off');
                    });
                }

                if (app.Settings.aceIsLoading && !app.Settings.aceLoadingFailed) {
                    tab.$content.toggleLoader('on');
                }
            } else {
                that.initializeAceEditor();
            }
        }
    });


    this.applyUserJs = function (js) {
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

        that.applyUserJs(settings.get(namespace + '.js'));
    });
    this.applyUserJs(app.Settings.storage.get(namespace + '.js'))
});
