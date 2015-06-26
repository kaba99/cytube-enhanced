function CytubeEnhanced(permittedModules) {
    var modules = {};
    var MODULE_LOAD_TIMEOUT = 10000; //ms
    var MODULE_LOAD_PERIOD = 100; //ms

    /**
     * Sets the module and run it if it is permitted
     *
     * Module should have method run() to run its main features. You can bind events before and after run in global cytubeEnhancedBinds object
     * Example of cytubeEnhancedBinds: {'myModuleName1': {beforeRun: function(module), afterRun: function(module)}, 'myModuleName2': {beforeRun: function(module), afterRun: function(module)}}
     *
     * @param moduleName The name of the module
     * @param moduleConstructor The name of the module's constructor
     */
    this.setModule = function (moduleName, moduleConstructor) {
        if (this.isModulePermitted(moduleName)) {
            modules[moduleName] = new moduleConstructor(this);

            if (typeof cytubeEnhancedBinds !== 'undefined' && cytubeEnhancedBinds[moduleName] !== undefined && cytubeEnhancedBinds[moduleName].beforeRun !== undefined) {
                cytubeEnhancedBinds[moduleName].beforeRun(modules[moduleName]);
            }

            if (modules[moduleName].run !== undefined) {
                modules[moduleName].run();
            }

            if (typeof cytubeEnhancedBinds !== 'undefined' && cytubeEnhancedBinds[moduleName] !== undefined && cytubeEnhancedBinds[moduleName].afterRun !== undefined) {
                cytubeEnhancedBinds[moduleName].afterRun(modules[moduleName]);
            }
        }
    };

    /**
     * Loads the module
     *
     * Returns the $.Deferred() object or exception if timeout
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
     * Checks if module is permitted
     *
     * @param moduleName The name of the module to check
     * @returns {boolean}
     */
    this.isModulePermitted = function (moduleName) {
        return permittedModules[moduleName] || false;
    };
}


var cytubeEnhanced = new CytubeEnhanced({
    utils: true,
    chatHelp: true,
    favouritePictures: true,
    smiles: true,
    videoControls: true,
    progressBar: true,
    chatCommands: true,
    chatControls: true,
    uiTranslate: true,
    navMenuTabs: true,
    userConfig: true
});
