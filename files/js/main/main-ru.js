function CytubeEnhanced(channelName, language, modulesSettings) {
    var that = this;

    this.channelName = channelName;

    var translations = {};
    this.language = language || 'en';

    this.modulesSettings = modulesSettings || {};
    var modulesConstructors = {};
    var modules = {};
    var MODULE_LOAD_TIMEOUT = 10000; //ms
    var MODULE_LOAD_PERIOD = 100; //ms


    /**
     * Gets the module
     *
     * Returns the $.Deferred() object or throws exception if timeout
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
            } else if (time === 0) {
                throw new Error("Load timeout for module " + moduleName + '.');
            } else {
                time -= MODULE_LOAD_PERIOD;

                setTimeout(getModuleRecursive, MODULE_LOAD_PERIOD);
            }
        })();

        return promise;
    };


    /**
     * Sets the module
     *
     * @param {string} moduleName The name of the module
     * @param moduleConstructor The name of the module's constructor
     */
    this.setModule = function (moduleName, moduleConstructor) {
        modulesConstructors[moduleName] = moduleConstructor;
    };


    /**
     * Runs the module if it is permitted
     *
     * Module may have method run() to run its main features. You can bind events before and after run in global cytubeEnhancedSettings object
     * Example of cytubeEnhancedSettings for binds: cytubeEnhancedSettings = {binds: {'myModuleName1': {beforeRun: function (module) {}, afterRun: function (module) {}}, 'myModuleName2': {beforeRun: function (module) {}, afterRun: function (module) {}}}};
     *
     * @param {string} moduleName The name of the module
     */
    this.runModule = function (moduleName) {
        if (this.isModulePermitted(moduleName)) {
            modules[moduleName] = new modulesConstructors[moduleName](this, this.modulesSettings[moduleName]);
            modules[moduleName].settings = modulesSettings[moduleName];

            if (typeof cytubeEnhancedSettings !== 'undefined' && cytubeEnhancedSettings.binds !== undefined && cytubeEnhancedSettings.binds[moduleName] !== undefined && cytubeEnhancedSettings.binds[moduleName].beforeRun !== undefined) {
                cytubeEnhancedSettings.binds[moduleName].beforeRun(modules[moduleName]);
            }

            if (modules[moduleName].run !== undefined) {
                modules[moduleName].run();
            }

            if (typeof cytubeEnhancedSettings !== 'undefined' && cytubeEnhancedSettings.binds !== undefined && cytubeEnhancedSettings.binds[moduleName] !== undefined && cytubeEnhancedSettings.binds[moduleName].afterRun !== undefined) {
                cytubeEnhancedSettings.binds[moduleName].afterRun(modules[moduleName]);
            }
        }
    };


    /**
     * Checks if module is permitted
     *
     * @param moduleName The name of the module to check
     * @returns {boolean}
     */
    this.isModulePermitted = function (moduleName) {
        return this.modulesSettings[moduleName] !== undefined ?
            (this.modulesSettings[moduleName].enabled || false) :
            false;
    };


    /**
     * Configures the module
     *
     * @param moduleName The name of the module to check
     * @param moduleSettings The settings of the module, settings must contain enabled key with true value to be able to execute.
     */
    this.configureModule = function (moduleName, moduleSettings) {
        this.modulesSettings[moduleName] = moduleSettings;
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

        if (this.language !== 'en' && translations[this.language] !== undefined) {
            if (text.indexOf('[.]') !== -1) {
                var textWithNamespaces = text.split('[.]');

                translatedText = translations[this.language][textWithNamespaces[0]];
                for (var namespace = 1, namespacesLen = textWithNamespaces.length; namespace < namespacesLen; namespace++) {
                    translatedText = translatedText[textWithNamespaces[namespace]];
                }
            } else {
                translatedText = translations[this.language][text];
            }
        } else if (text.indexOf('[.]') !== -1) { //English
            translatedText = text.split('[.]').pop();
        }

        return translatedText;
    };


    /**
     * Runs the application
     */
    this.run = function () {
        for (var moduleName in modulesConstructors) {
            this.runModule(moduleName);
        }
    };
}




var defaultModulesSettings = {
    utils: {
        enabled: true,
        unfixedTopNavbar: true,
        insertUsernameOnClick: true,
        showScriptInfo: true
    },
    favouritePictures: {
        enabled: true
    },
    smiles: {
        enabled: true
    },
    videoControls: {
        enabled: true,
        turnOffVideoOption: true,
        selectQualityOption: true,
        youtubeFlashPlayerForGoogleDocsOption: true,
        expandPlaylistOption: true,
        showVideoContributorsOption: true
    },
    showVideoInfo: {
        enabled: true
    },
    chatCommandsHelp: {
        enabled: true
    },
    additionalChatCommands: {
        enabled: true,
        additionalPermittedCommands: ['*']
    },
    chatControls: {
        enabled: true,
        afkButton: true,
        clearChatButton: true
    },
    standardUITranslate: {
        enabled: true
    },
    navMenuTabs: {
        enabled: true
    },
    userConfig: {
        enabled: true,
        layoutConfigButton: true,
        smilesAndPicturesTogetherButton: true,
        minimizeButton: true
    }
};




cytubeEnhanced = new CytubeEnhanced(
    (typeof cytubeEnhancedSettings !== 'undefined' ? (cytubeEnhancedSettings.channelName || 'Имя канала') : 'Имя канала'),
    (typeof cytubeEnhancedSettings !== 'undefined' ? (cytubeEnhancedSettings.language || 'ru') : 'ru'),
    (typeof cytubeEnhancedSettings !== 'undefined' ? (cytubeEnhancedSettings.modulesSettings || defaultModulesSettings) : defaultModulesSettings)
);
