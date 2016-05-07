window.cytubeEnhanced.addModule('smiles', function (app) {
    'use strict';
    var that = this;

    $('#emotelistbtn').hide();
    if ($('#chat-panel').length === 0) {
        $('<div id="chat-panel" class="row">').insertAfter("#main");
    }
    if ($('#chat-controls').length === 0) {
        $('<div id="chat-controls" class="btn-group">').appendTo("#chatwrap");
    }

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
        app.Helpers.addMessageToChatInput(' ' + smileName + ' ', 'end');
    };
    $(document.body).on('click', '.smile-on-panel', function () {
        that.insertSmile($(this).data('name'));
    });


    $(window).on('resize', function () {
        if (app.Helpers.getViewportSize().width < 992) {
            that.$smilesPanel.empty();
        }
    });
    this.showSmilesPanel = function () {
        if (app.Helpers.getViewportSize().width < 992) {
            that.$smilesPanel.empty();
            $('#emotelistbtn').click();
        } else {
            if (that.$smilesPanel.html() === '') {
                that.renderSmiles();
            }

            var smilesAndPicturesTogether = this.smilesAndPicturesTogether || false; //setted up by userConfig module

            if ($('#favourite-pictures-panel').length !== 0 && !smilesAndPicturesTogether) {
                $('#favourite-pictures-panel').hide();
            }

            that.$smilesPanel.toggle();

            if (!smilesAndPicturesTogether) {
                if (that.$smilesBtn.hasClass('btn-default')) {
                    if ($('#favourite-pictures-btn').length !== 0 && $('#favourite-pictures-btn').hasClass('btn-success')) {
                        $('#favourite-pictures-btn').removeClass('btn-success').addClass('btn-default');
                    }

                    that.$smilesBtn.removeClass('btn-default');
                    that.$smilesBtn.addClass('btn-success');
                } else {
                    that.$smilesBtn.removeClass('btn-success');
                    that.$smilesBtn.addClass('btn-default');
                }
            }
        }
    };
    this.$smilesBtn.on('click', function() {
        that.showSmilesPanel();
    });


    this.makeSmilesAndPicturesTogether = function () {
        that.smilesAndPicturesTogether = true;
        that.$smilesBtn.hide();
        that.$smilesPanel.hide();
    };
});
