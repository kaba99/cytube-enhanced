require('lodash');
window.CytubeEnhanced = function(channelName, language, modulesSettings) {
    'use strict';
    var that = this;

    this.channelName = channelName;
    this.translations = {};
    this.prefix = 'ce-';

    var modules = {};
    var MODULE_LOAD_TIMEOUT = 60000; //ms (1 minute)
    var MODULE_LOAD_PERIOD = 100; //ms (0.1 sec)


    /**
     * Gets the module
     *
     * Returns $.Deferred() promise object and throws error exception if timeout
     *
     * @param {string} moduleName The name of the module
     * @returns {object}
     */
    this.getModule = function (moduleName) {
        var promise = $.Deferred();
        var time = MODULE_LOAD_TIMEOUT;

        (function getModuleRecursive() {
            if (typeof modules[moduleName] != 'undefined') {
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
     * @param ModuleConstructor The module's constructor
     */
    this.addModule = function (moduleName, ModuleConstructor) {
        if (this.isModulePermitted(moduleName)) {
            var moduleSettings = modulesSettings[moduleName] || {};

            modules[moduleName] = new ModuleConstructor(this, moduleSettings);
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
        return modulesSettings.hasOwnProperty(moduleName) ?
            (modulesSettings[moduleName].hasOwnProperty('enabled') ? modulesSettings[moduleName].enabled : true) :
            true;
    };


    /**
     * Adds the translation object
     * @param language The language identifier
     * @param translationObject The translation object
     */
    this.addTranslation = function (language, translationObject) {
        if (typeof that.translations[language] === 'undefined') {
            that.translations[language] = translationObject;
        } else {
            $.extend(true, that.translations[language], translationObject);
        }
    };


    /**
     * Translates the text
     * @param text The text to translate
     * @returns {string}
     */
    this.t = function (text) {
        var translatedText = text;

        if (that.storage.get('language') !== 'en' && that.translations[that.storage.get('language')]) {
            if (text.indexOf('[.]') !== -1) {
                var textWithNamespaces = text.split('[.]');

                translatedText = that.translations[that.storage.get('language')][textWithNamespaces[0]];
                if (typeof translatedText == 'undefined') {
                    translatedText = text.split('[.]').pop();
                    return translatedText || text;
                }
                for (var namespace = 1, namespacesLen = textWithNamespaces.length; namespace < namespacesLen; namespace++) {
                    translatedText = translatedText[textWithNamespaces[namespace]];
                    if (typeof translatedText == 'undefined') {
                        translatedText = text.split('[.]').pop();
                        return  translatedText || text;
                    }
                }

                translatedText = translatedText || textWithNamespaces[textWithNamespaces.length - 1];
            } else {
                translatedText = that.translations[that.storage.get('language')][text];
            }
        } else if (text.indexOf('[.]') !== -1) { //English text by default
            translatedText = text.split('[.]').pop();
            translatedText = translatedText || text;
        }

        return translatedText;
    };


    /**
     * Parses JSON. Returns defaultValue if it can't be parsed.
     * @param {String} jsonString JSON string
     * @param {*} defaultValue The default value to return if something wrong with jsonString
     * @returns {*} Something extracted from json string or default value if something wrong with jsonString.
     */
    this.parseJSON = function (jsonString, defaultValue) {
        defaultValue = (typeof defaultValue !== 'undefined') ? defaultValue : null;
        var result;

        try {
            result = window.JSON.parse(jsonString);
        } catch (error) {
            result = defaultValue;
        }

        return result;
    };


    /**
     * Converts anything to JSON. Returns defaultValue on error.
     * @param {*} object Something, that will be converted to JSON string
     * @param {*} defaultValue The default value to return if something wrong
     * @returns {String} JSON string
     */
    this.toJSON = function (object, defaultValue) {
        defaultValue = (typeof defaultValue !== 'undefined') ? defaultValue : null;
        var result;

        try {
            result = window.JSON.stringify(object);
        } catch (error) {
            result = defaultValue;
        }

        return result;
    };



    $.ajaxSetup({cache: true});

    if (window.cytubeEnhancedDefaultTranslates) {
        for (var translateLanguage in window.cytubeEnhancedDefaultTranslates) {
            this.addTranslation(translateLanguage, window.cytubeEnhancedDefaultTranslates[translateLanguage]);
        }
    }


    this.storage = new window.CytubeEnhancedStorage('default', true, true);
    this.storage.setDefault('language', language);

    this.UI = new window.CytubeEnhancedUI(this);

    this.Settings = new window.CytubeEnhancedUISettings(this);
};
