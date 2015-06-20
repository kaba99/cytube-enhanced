function AnimachEnhancedApp(settings) {
    this.modules = {};
    this.settings = settings;

    this.addModule = function (moduleName, module) {
        this.modules[moduleName] = module;

        this.triggerModule(moduleName);
    };

    this.triggerModule = function (moduleName) {
        if (this.settings[moduleName] === true && this.modules[moduleName] !== undefined) {
            this.modules[moduleName](this);
        }
    };
}

var animachEnhancedApp = new AnimachEnhancedApp({
    utils: true,
    chatHelp: true,
    favouritePictures: true,
    smiles: true,
    videoControls: true,
    progressBar: true,
    chatCommands: true,
    chatControls: true,
    uiTranslate: true,
    navMenuTabs: true
});
