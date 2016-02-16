window.CytubeEnhancedUserConfig = function (app) {
    var that = this;

    /**
     * UserConfig options
     * @type {object}
     */
    this.options = {};

    this.prefix = 'ce-';

    /**
     * Sets the user's option and saves it in the user's cookies
     * @param name The name ot the option
     * @param value The value of the option
     */
    this.set = function (name, value) {
        this.options[name] = value;
        window.setOpt(that.prefix + window.CHANNEL.name + "_config-" + name, value);
    };

    /**
     * Gets the value of the user's option
     *
     * User's values are setted up from user's cookies at the beginning of the script by the method loadDefaults()
     *
     * @param name Option's name
     * @returns {*}
     */
    this.get = function (name) {
        if (!this.options.hasOwnProperty(name)) {
            this.options[name] = window.getOrDefault(that.prefix + window.CHANNEL.name + "_config-" + name, undefined);
        }

        return this.options[name];
    };

    /**
     * Toggles user's boolean option
     * @param name Boolean option's name
     * @returns {boolean}
     */
    this.toggle = function (name) {
        var result = !this.get(name);

        this.set(name, result);

        return result;
    };
};