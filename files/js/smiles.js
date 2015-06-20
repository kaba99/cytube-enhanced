animachEnhancedApp.addModule('smiles', function () {
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
        .appendTo($('#chat-panel'))
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
        if ($('#favourite-pictures-panel').length !== 0) {
            $('#favourite-pictures-panel').hide();
        }

		$smilesPanel.toggle();
	});
});
