Установка CyTubeEnhanced
========================

1. Скачайте [cytube-enhanced.min.js](https://github.com/kaba99/cytube-enhanced/tree/master/build/ru/cytube-enhanced.min.js) и установите его как внешний скрипт (javascript) в настройках канала.
2. Скачайте [cytube-enhanced.min.css](https://github.com/kaba99/cytube-enhanced/tree/master/build/ru/cytube-enhanced.min.css) и установите его как внешний стиль (css) в настройках канала.
3. Импортируйте [код фильтров](https://github.com/kaba99/cytube-enhanced/tree/master/src/filters.json) как текст в текстовую область импорта фильтров настройках канала.


## Как собрать CyTubeEnhanced из исходный файлов с нужным функционалом самостоятельно

1. Установите [node.js](https://nodejs.org/en/download/)
2. Скачайте [gulp](http://gulpjs.com/) с помощью команды `npm install --global gulp-cli`.
3. Скачайте необходимые библиотеки с помощью команды `npm install`, запущенной из терминала (например, cmd.exe) в корне проекта.
4. Выполните `gulp --gulpfile ./gulpfile-ru.js` для сборки проекта. С помощью этой команды можно каждый раз пересобирать проект.

**Собранные файлы будут находиться в категории `build/ru/`. Файлы с суффиксом `min` отличаются от обычных тем, что они сжаты и более оптимизированны.**