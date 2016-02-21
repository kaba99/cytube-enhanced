window.CytubeEnhancedStorage = function (storageName, isGlobal) {
    var that = this;
    var storagePrefix = 'ce';
    isGlobal = (typeof isGlobal !== 'undefined') ? isGlobal : true;

    var defaultData = {};
    var data = {};
    var dirtyData = {};

    try {
        data = JSON.parse(window.localStorage.getItem(storageName + '-' + (isGlobal ? '' : CHANNEL.name) + storageName));
        data = $.isPlainObject(data) ? data : {};
    } catch (error) {
        data = {};
    }


    this.setDefault = function (name, value) {
        defaultData[name] = value;
        data[name] = (typeof data[name] !== 'undefined') ? data[name] : value;
    };


    this.get = function (name) {
        return data[name];
    };


    this.set = function (name, value) {
        if (data[name] != value) {
            dirtyData[name] = true;
        }

        return data[name] = value;
    };


    /**
     * Checks if attribute was changed
     * @param {String|Array} nameData Name of the attribute (you can pass array of names)
     * @returns {boolean}
     */
    this.isDirty = function (nameData) {
        var isDirty = false;

        if ($.isArray()) {
            for (var name in nameData) {
                if (!!dirtyData[nameData[name]]) {
                    isDirty = true;
                    break;
                }
            }
        } else {
            isDirty = !!dirtyData[nameData];
        }

        return isDirty;
    };


    this.save = function () {
        try {
            return window.localStorage.setItem(storageName + '-' + (isGlobal ? '' : CHANNEL.name) + storageName, JSON.stringify(data))
        } catch (error) {
            return false;
        }
    };


    this.reset = function () {
        data = $.extend({}, defaultData);
    }
};