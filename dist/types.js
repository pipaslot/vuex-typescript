var Mutations = /** @class */ (function () {
    function Mutations() {
        this._state = Object.create(null);
    }
    /** Inject state from store  */
    Mutations.prototype.__inject = function (state) {
        this._state = state;
    };
    Object.defineProperty(Mutations.prototype, "state", {
        /** Module state */
        get: function () {
            return this._state;
        },
        enumerable: true,
        configurable: true
    });
    return Mutations;
}());
export { Mutations };
var Store = /** @class */ (function () {
    function Store(_state, _mutations) {
        this._state = _state;
        this._mutations = _mutations;
    }
    Object.defineProperty(Store.prototype, "state", {
        /** Module state */
        get: function () {
            return this._state;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Store.prototype, "mutations", {
        /** State mutations */
        get: function () {
            return this._mutations;
        },
        enumerable: true,
        configurable: true
    });
    return Store;
}());
export { Store };
