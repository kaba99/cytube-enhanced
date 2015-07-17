function CytubeEnhanced(channelName, language, modulesSettings) {
    'use strict';

    this.channelName = channelName;

    var translations = {};

    var modules = {};
    var MODULE_LOAD_TIMEOUT = 10000; //ms
    var MODULE_LOAD_PERIOD = 100; //ms


    /**
     * Gets the module
     *
     * Returns $.Deferred() object and throws error exception if timeout
     *
     * @param {string} moduleName The name of the module
     * @returns {object}
     */
    this.getModule = function (moduleName) {
        var promise = $.Deferred();
        var time = MODULE_LOAD_TIMEOUT;

        (function getModuleRecursive() {
            if (modules[moduleName] !== undefined) {
                promise.resolve(modules[moduleName]);
            } else if (time <= 0) {
                throw new Error("Load timeout for module " + moduleName + '.');
            } else {
                time -= MODULE_LOAD_PERIOD;

                setTimeout(getModuleRecursive, MODULE_LOAD_PERIOD);
            }
        })();

        return promise;
    };


    /**
     * Adds the module
     *
     * @param {string} moduleName The name of the module
     * @param moduleConstructor The module's constructor
     */
    this.addModule = function (moduleName, ModuleConstructor) {
        if (this.isModulePermitted(moduleName)) {
            var moduleSettings = modulesSettings[moduleName] || {};

            modules[moduleName] = new ModuleConstructor(this, moduleSettings);
            modules[moduleName].settings = moduleSettings;
        }
    };


    /**
     * Configures the module
     *
     * Previous options don't reset.
     *
     * @param {string} moduleName  The name of the module
     * @param moduleOptions The module's options
     */
    this.configureModule = function (moduleName, moduleOptions) {
        $.extend(true, modulesSettings[moduleName], moduleOptions);
    };


    /**
     * Checks if module is permitted
     *
     * @param moduleName The name of the module to check
     * @returns {boolean}
     */
    this.isModulePermitted = function (moduleName) {
        return modulesSettings.hasOwnProperty('moduleName') ?
            (modulesSettings[moduleName].hasOwnProperty('enabled') ? modulesSettings[moduleName].enabled : true) :
            true;
    };


    /**
     * Adds the translation object
     * @param language The language identifier
     * @param translationObject The translation object
     */
    this.addTranslation = function (language, translationObject) {
        translations[language] = translationObject;
    };


    /**
     * Translates the text
     * @param text The text to translate
     * @returns {string}
     */
    this.t = function (text) {
        var translatedText = text;

        if (language !== 'en' && translations[language] !== undefined) {
            if (text.indexOf('[.]') !== -1) {
                var textWithNamespaces = text.split('[.]');

                translatedText = translations[language][textWithNamespaces[0]];
                for (var namespace = 1, namespacesLen = textWithNamespaces.length; namespace < namespacesLen; namespace++) {
                    translatedText = translatedText[textWithNamespaces[namespace]];
                }
            } else {
                translatedText = translations[language][text];
            }
        } else if (text.indexOf('[.]') !== -1) { //English text by default
            translatedText = text.split('[.]').pop();
        }

        return translatedText;
    };
}
