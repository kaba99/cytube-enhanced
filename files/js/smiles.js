animachEnhancedApp.addModule('smiles', function (app) {
    if ($('#chat-panel').length === 0) {
        $('<div id="chat-panel" class="row">').insertAfter("#main");
    }

    if ($('#chat-controls').length === 0) {
        $('<div id="chat-controls" class="btn-group">').appendTo("#chatwrap");
    }

    $('#emotelistbtn').hide();

    var $smilesBtn = $('<button id="smiles-btn" class="btn btn-sm btn-default" title="Показать смайлики">')
        .html('<i class="glyphicon glyphicon-picture"></i>')
        .prependTo($('#chat-controls'));

    var $smilesPanel = $('<div id="smiles-panel">')
        .prependTo($('#chat-panel'))
        .hide();

    var rendersmiles = function () {
        var smiles = CHANNEL.emotes;

        for (var n = 0, smilesLen = smiles.length; n < smilesLen; n++) {
            $('<img onclick="insertText(\' ' + smiles[n].name + ' \')">')
                 .attr({src: smiles[n].image})
                  .appendTo($smilesPanel);
        }
    };
    rendersmiles();

    $smilesBtn.on('click', function() {
        var isSmilesAndPictures = app.permittedModules.userConfig === true && app.modules.userConfig !== undefined && app.modules.userConfig.options['smiles-and-pictures'] === true;

        if ($('#favourite-pictures-panel').length !== 0 && !isSmilesAndPictures) {
            $('#favourite-pictures-panel').hide();
        }

        $smilesPanel.toggle();

        if (!isSmilesAndPictures) {
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
});
