animachEnhancedApp.addModule('chatHelp', function (app) {
    if ($('#chat-controls').length === 0) {
        $('<div id="chat-controls" class="btn-group">').appendTo("#chatwrap");
    }

    $('<button id="chat-help-btn" class="btn btn-sm btn-default">Список команд</button>').appendTo($('#chat-controls'))
        .on('click', function () {
            var $bodyWrapper = $('<div>');
            var $ul;
            var commands;
            var command;

            if (app.permittedModules.chatCommands === true) {
                commands = {
                    'r': 'показать расписание',
                    'pick':'выбор случайной опции из указанного списка слов, разделенных запятыми (Например: <i>!pick japan,korea,china</i>)',
                    'ask':'задать вопрос с вариантами ответа да/нет (Например: <i>!ask Сегодня пойдет дождь?</i>)',
                    'q':'показать случайную цитату',
                    'sm': 'показать случайный смайлик',
                    'dice':'кинуть кубики',
                    'roll':'случайное трехзначное число',
                    'time':'показать текущее время',
                    'now':'displaying current playing title (<i>!now</i>)',
                    'skip':'проголосовать за пропуск текущего видео (<i>!skip</i>)',
                    'add':'добавляет видео в конец плейлиста (Например: <i>!add https://www.youtube.com/watch?v=29FFHC2D12Q</i>)',
                    'stat': 'показать статистику за данную сессию (<i>!stat</i>)',
                    'yoba': 'секретная команда'
                };

                $bodyWrapper.append('<p><strong>Новые команды чата</strong><p>');
                $ul = $('<ul>').appendTo($bodyWrapper);
                for (command in commands) {
                    $ul.append('<li><code>!'+command+'</code> - '+commands[command]+'</li>');
                }
            }


            commands = {
                'me':'%username% что-то сделал. Например: <i>/me танцует</i>',
                'sp':'Спойлер',
                'afk':'Устанавливает статус "Отошёл".',
            };

            $bodyWrapper.append('<p><strong>Стандартные команды</strong><p>');
            $ul = $('<ul>').appendTo($bodyWrapper);
            for (command in commands) {
                $ul.append('<li><code>/'+command+'</code> - '+commands[command]+'</li>');
            }

            var $modalWindow = createModalWindow('Список команд', $bodyWrapper);
        });
});
