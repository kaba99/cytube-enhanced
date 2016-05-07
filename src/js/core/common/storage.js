window.CytubeEnhancedStorage = function (storageName, isGlobal, autoSave) {
    var that = this;
    isGlobal = (typeof isGlobal !== 'undefined') ? isGlobal : true;
    autoSave = (typeof autoSave !== 'undefined') ? autoSave : false;

    /**
     * Default data (set up by setDefault method)
     * @type {{}}
     */
    var defaultData = {};
    /**
     * Not dirty data
     * @type {{}}
     */
    var initialData = {};
    /**
     * Data
     * @type {{}}
     */
    var data = {};

    try {
        data = JSON.parse(window.localStorage.getItem(storageName + '-' + (isGlobal ? '' : CHANNEL.name) + storageName));
        data = _.isPlainObject(data) ? data : {};
    } catch (error) {
        data = {};
    }
    initialData = _.cloneDeep(data);


    this.getDefault = function (name) {
        return defaultData[name];
    };


    this.setDefault = function (name, value) {
        value = _.cloneDeep(value);

        defaultData[name] = value;
        data[name] = (typeof data[name] !== 'undefined') ? data[name] : value;
        initialData[name] = (typeof initialData[name] !== 'undefined') ? initialData[name] : value;
    };


    this.get = function (name) {
        return data[name];
    };


    this.set = function (name, value) {
        var result = data[name] = _.cloneDeep(value);

        if (autoSave) {
            that.save();
        }

        return result;
    };


    /**
     * Toggles boolean option
     * @param name Boolean option's name
     * @returns {boolean}
     */
    this.toggle = function (name) {
        var result = data[name] = !data[name];

        if (autoSave) {
            that.save();
        }

        return result;
    };


    /**
     * Checks if attribute was changed
     * @param {String|Array} nameData Name of the attribute (you can pass array of names)
     * @returns {boolean}
     */
    this.isDirty = function (nameData) {
        var isDirty = false;

        if (_.isArray(nameData)) {
            for (var name in nameData) {
                if (!isEqual(data[name], initialData[name])) {
                    isDirty = true;
                    break;
                }
            }
        } else {
            isDirty = !isEqual(data[nameData], initialData[nameData]);
        }

        return isDirty;
    };


    this.save = function () {
        try {
            return window.localStorage.setItem(storageName + '-' + (isGlobal ? '' : CHANNEL.name) + storageName, JSON.stringify(data));
        } catch (error) {
            return false;
        }
    };


    this.reset = function () {
        data = _.cloneDeep(defaultData);
    };


    var isEqual = function (value1, value2) {
        if (_.isArray(value1) && _.isArray(value2)) {
            return (_.difference(value1, value2).length === 0 && _.difference(value2, value1).length === 0);
        } else {
            return _.isEqual(value1, value2);
        }
    };
};