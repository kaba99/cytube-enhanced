window.CytubeEnhancedHelpers = function (app) {
    var that = this;

    this.getViewportSize = function () {
        var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        return {
            width: width,
            height: height
        };
    }
};