cytubeEnhanced.setModule('chatHelp', function (app) {
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

    if (app.isModulePermitted('chatCommands')) {
        that.commands['Дополнительные команды'] = {
            '!r': 'показать расписание',
            '!pick':'выбор случайной опции из указанного списка слов, разделенных запятыми (Например: <i>!pick japan,korea,china</i>)',
            '!ask':'задать вопрос с вариантами ответа да/нет (Например: <i>!ask Сегодня пойдет дождь?</i>)',
            '!q':'показать случайную цитату',
            '!sm': 'показать случайный смайлик',
            '!dice':'кинуть кубики',
            '!roll':'случайное трехзначное число',
            '!time':'показать текущее время',
            '!now':'displaying current playing title (<i>!now</i>)',
            '!skip':'проголосовать за пропуск текущего видео (<i>!skip</i>)',
            '!add':'добавляет видео в конец плейлиста (Например: <i>!add https://www.youtube.com/watch?v=29FFHC2D12Q</i>)',
            '!stat': 'показать статистику за данную сессию (<i>!stat</i>)',
            '!yoba': 'секретная команда'
        };
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
