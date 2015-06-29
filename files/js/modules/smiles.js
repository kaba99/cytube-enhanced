cytubeEnhanced.setModule('smiles', function (app) {
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
        var smiles = CHANNEL.emotes;

        for (var smileIndex = 0, smilesLen = smiles.length; smileIndex < smilesLen; smileIndex++) {
            $('<img class="smile-on-panel">')
                .attr({src: smiles[smileIndex].image})
                .data('name', smiles[smileIndex].name)
                .appendTo(that.$smilesPanel);
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


    this.$smilesBtn.on('click', function() {
        var smilesAndPicturesTogether = that.smilesAndPicturesTogether || false; //setted up by userConfig module

        if ($('#favourite-pictures-panel').length !== 0 && !smilesAndPicturesTogether) {
            $('#favourite-pictures-panel').hide();
        }

        that.$smilesPanel.toggle();

        if (!smilesAndPicturesTogether) {
            if ($(this).hasClass('btn-default')) {
                if ($('#favourite-pictures-btn').length !== 0 && $('#favourite-pictures-btn').hasClass('btn-success')) {
                    $('#favourite-pictures-btn').removeClass('btn-success');
                    $('#favourite-pictures-btn').addClass('btn-default');
                }

                $(this).removeClass('btn-default');
                $(this).addClass('btn-success');
            } else {
                $(this).removeClass('btn-success');
                $(this).addClass('btn-default');
            }
        }
    });


    this.run = function () {
        that.renderSmiles();
    };
});
