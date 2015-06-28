cytubeEnhanced.setModule('chatCommandsHelp', function (app) {
    var that = this;


    if ($('#chat-controls').length === 0) {
        $('<div id="chat-controls" class="btn-group">').appendTo("#chatwrap");
    }


    that.commands = {};

    that.commands['Стандартные команды'] = {
        '/me':'%username% что-то сделал. Например: <i>/me танцует</i>',
        '/sp':'спойлер',
        '/afk':'устанавливает статус "Отошёл".'
    };

    if (app.isModulePermitted('additionalChatCommands')) {
        app.getModule('additionalChatCommands').done(function (commandsModule) {
            var additionalCommands = {};

            for (var commandName in commandsModule.commandsList) {
                if (commandsModule.commandsList[commandName].isAvailable()) {
                    additionalCommands[commandName] = commandsModule.commandsList[commandName].description;
                }
            }

            that.commands['Дополнительные команды'] = additionalCommands;
        });
    }


    this.handleChatHelpBtn = function (commands) {
        var $bodyWrapper = $('<div>');

        for (var commandsPartName in commands) {
            $('<h3>').html(commandsPartName).appendTo($bodyWrapper);

            var $ul = $('<ul>');
            for (var command in commands[commandsPartName]) {
                $('<li>').html('<code>' + command + '</code> - ' + commands[commandsPartName][command]).appendTo($ul);
            }

            $ul.appendTo($bodyWrapper);
        }

        app.getModule('utils').done(function (utilsModule) {
            utilsModule.createModalWindow('Список команд', $bodyWrapper);
        });
    };
    this.$chatHelpBtn = $('<button id="chat-help-btn" class="btn btn-sm btn-default">')
        .text('Список команд')
        .appendTo('#chat-controls')
        .on('click', function () {
            that.handleChatHelpBtn(that.commands);
        });
});
