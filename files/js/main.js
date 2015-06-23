function AnimachEnhancedApp(permittedModules) {
    this.modules = {};
    this.permittedModules = permittedModules;

    this.addModule = function (moduleName, moduleCallback) {
        if (this.permittedModules[moduleName] === true) {
            this.modules[moduleName] = moduleCallback(this) || {};
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
    navMenuTabs: true,
    userConfig: true,
    schedule: true
});
