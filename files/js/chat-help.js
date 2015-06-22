animachEnhancedApp.addModule('chatHelp', function (app) {
    if ($('#chat-controls').length === 0) {
        $('<div id="chat-controls" class="btn-group">').appendTo("#chatwrap");
    }

    $('<button id="chat-help-btn" class="btn btn-sm btn-default">Список команд</button>').appendTo($('#chat-controls'))
        .on('click', function () {
            var $outer = $('<div class="modal fade chat-help-modal" role="dialog">').appendTo($("body"));
            var $modal = $('<div class="modal-dialog modal-lg">').appendTo($outer);
            var $content = $('<div class="modal-content">').appendTo($modal);

            var $header = $('<div class="modal-header">').appendTo($content);
            $('<button class="close" data-dismiss="modal" aria-hidden="true">').html('x').appendTo($header);
            $('<h3 class="modal-title">').text('Список команд').appendTo($header);

            var $body = $('<div class="modal-body">').appendTo($content);

            $outer.on("hidden", function() {
                $outer.remove();
            });
            $outer.modal();

            var $ul;

            if (app.permittedModules.chatCommands === true) {
                var commands = {
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

                $body.append('<strong>Новые команды чата</strong><br><br>');
                $ul = $('<ul>').appendTo($body);
                for (var command in commands) {
                    $ul.append('<li><code>!'+command+'</code> - '+commands[command]+'</li>');
                }
            }


            commands = {
                'me':'%username% что-то сделал. Например: <i>/me танцует</i>',
                'sp':'Спойлер',
                'afk':'Устанавливает статус "Отошёл".',
            };

            $body.append('<br /><strong>Стандартные команды</strong><br /><br />');
            $ul = $('<ul>').appendTo($body);
            for (command in commands) {
                $ul.append('<li><code>/'+command+'</code> - '+commands[command]+'</li>');
            }
        });
});
