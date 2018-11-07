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
                return JSON.parse(value);
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
