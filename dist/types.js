var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
/** Basic store implementation */
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
/** Store synchronized throug local storage. This kind of store can not have sub-modules */
var SyncedStore = /** @class */ (function (_super) {
    __extends(SyncedStore, _super);
    function SyncedStore() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /** Method called when state is loaded from local storage during store initialization */
    SyncedStore.prototype.onLoadState = function () {
    };
    return SyncedStore;
}(Store));
export { SyncedStore };
