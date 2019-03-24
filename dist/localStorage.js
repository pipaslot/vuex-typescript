var reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
var dateParser = function (key, value) {
    if (typeof value === "string") {
        var a = reISO.exec(value);
        if (a) {
            return new Date(value);
        }
    }
    return value;
};
var LocalStorage = /** @class */ (function () {
    function LocalStorage(_prefix) {
        if (_prefix === void 0) { _prefix = ""; }
        this._prefix = _prefix;
    }
    LocalStorage.prototype.setState = function (key, value) {
        localStorage.setItem(this._prefix + key, JSON.stringify(value));
    };
    LocalStorage.prototype.getState = function (key) {
        var value = localStorage.getItem(this._prefix + key);
        if (value) {
            try {
                return JSON.parse(value, dateParser);
            }
            catch (e) {
                return null;
            }
        }
        return null;
    };
    LocalStorage.prototype.clearState = function (key) {
        localStorage.removeItem(this._prefix + key);
    };
    return LocalStorage;
}());
export default LocalStorage;
