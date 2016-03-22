window.cytubeEnhanced.addModule('chatCommandsHelp', function (app, settings) {
    'use strict';
    var that = this;

    var defaultSettings = {
        commands: {
            '/me': app.t('chatCommands[.]%username% action (e.g: <i>/me is dancing</i>)'),
            '/sp': app.t('chatCommands[.]spoiler'),
            '/afk': app.t('chatCommands[.]sets the "AFK" status')
        }
    };
    settings = $.extend({}, defaultSettings, settings);


    if ($('#chat-controls').length === 0) {
        $('<div id="chat-controls" class="btn-group">').appendTo("#chatwrap");
    }

    this.commands = {};
    this.commands[app.t('Standard commands')] = settings.commands;

    if (app.isModulePermitted('additionalChatCommands')) {
        app.getModule('additionalChatCommands').done(function (commandsModule) {
            var additionalCommands = {};

            for (var command in commandsModule.commandsList) {
                if (commandsModule.commandsList.hasOwnProperty(command) && commandsModule.isCommandPermitted(command) && (commandsModule.commandsList[command].isAvailable ? commandsModule.commandsList[command].isAvailable() : true)) {
                    additionalCommands[command] = commandsModule.commandsList[command].description || '';
                }
            }

            that.commands[app.t('Extra commands')] = additionalCommands;
        });
    }


    this.handleChatHelpBtn = function (commands) {
        var $header = $('<h3 class="modal-title">').text(app.t('The list of chat commands'));

        var $bodyWrapper = $('<div>');

        for (var commandsPart in commands) {
            if (commands.hasOwnProperty(commandsPart)) {
                $('<h3>').html(commandsPart).appendTo($bodyWrapper);

                var $ul = $('<ul>');
                for (var command in commands[commandsPart]) {
                    if (commands[commandsPart].hasOwnProperty(command)) {
                        $('<li>').html('<code>' + command + '</code> - ' + commands[commandsPart][command] + '.').appendTo($ul);
                    }
                }

                $ul.appendTo($bodyWrapper);
            }
        }

        app.UI.createModalWindow('chat-commands-help', $header, $bodyWrapper);
    };
    this.$chatHelpBtn = $('<button id="chat-help-btn" class="btn btn-sm btn-default">')
        .text(app.t('Commands list'))
        .appendTo('#chat-controls')
        .on('click', function () {
            that.handleChatHelpBtn(that.commands);
        });
});
