import Vue from "vue";
import * as helpers from "./helpers";
import devtoolPlugin from "./devtoolPlugin";
export { Mutations, Store } from "./types";
export function install(_vue, options) {
    var store = new StoreProxy(options);
    _vue.mixin({
        beforeCreate: function () {
            this.$store = store;
        }
    });
}
var getterPrefix = "__";
var StoreProxy = /** @class */ (function () {
    function StoreProxy(_root) {
        var _this = this;
        this._root = _root;
        this._computed = Object.create(null);
        this._storeVm = new Vue({
            data: Object.create(null)
        });
        this._getters = Object.create(null);
        this._committing = false;
        this._subscribers = [];
        // Getters
        this._registerGetters(this._root, this._getters, this._computed, "");
        // Copy getters to proxy
        helpers.getGetterNames(this._root).forEach(function (key) {
            var store = _this;
            Object.defineProperty(_this, key, {
                get: function () { return store._storeVm[getterPrefix + key]; },
                enumerable: true
            });
        });
        // Mutations
        this._wrapMutations(this._root.mutations, this._root.state, "");
        // Copy methods
        helpers.getMethodNames(this._root).forEach(function (key) {
            _this[key] = _this._root[key];
        });
        // Register submodules
        this._registerSubModules(this._root, this._getters, this._computed, "");
        // Copy sub-modules into store
        helpers.getPropertyNames(this._root).forEach(function (key) {
            Object.defineProperty(_this, key, {
                get: function () { return _this._root[key]; },
                enumerable: true
            });
        });
        // Initialize store
        this._resetStoreVm();
        devtoolPlugin(this);
    }
    Object.defineProperty(StoreProxy.prototype, "state", {
        /** State tree */
        get: function () {
            return this._storeVm.$data.$$state;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StoreProxy.prototype, "getters", {
        /** Getter tree */
        get: function () {
            return this._getters;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StoreProxy.prototype, "mutations", {
        /** Root module mutations */
        get: function () {
            return this._root.mutations;
        },
        enumerable: true,
        configurable: true
    });
    /** Add Mutation listener */
    StoreProxy.prototype.subscribe = function (handler) {
        var _this = this;
        if (this._subscribers.indexOf(handler) < 0) {
            this._subscribers.push(handler);
        }
        return function () {
            var i = _this._subscribers.indexOf(handler);
            if (i > -1) {
                _this._subscribers.splice(i, 1);
            }
        };
    };
    /** Replace store state */
    StoreProxy.prototype.replaceState = function (state) {
        var _this = this;
        this._commit(function () {
            _this._storeVm._data.$$state = state;
        });
    };
    StoreProxy.prototype._resetStoreVm = function () {
        var _this = this;
        var oldVm = this._storeVm;
        // use a Vue instance to store the state tree
        // suppress warnings just in case the user has added
        // some funky global mixins
        var silent = Vue.config.silent;
        Vue.config.silent = true;
        this._storeVm = new Vue({
            data: {
                $$state: this._root.state
            },
            computed: this._computed
        });
        Vue.config.silent = silent;
        //Watch changes
        var watchOptions = { deep: true, sync: true };
        this._storeVm.$watch(function () {
            return this._data.$$state;
        }, function (newValue, oldValue) {
            if (!_this._committing && process.env.NODE_ENV !== "production") {
                throw "Store: Do not mutate vuest store state outside mutation handlers.";
            }
        }, watchOptions);
        if (oldVm) {
            Vue.nextTick(function () { return oldVm.$destroy(); });
        }
    };
    StoreProxy.prototype._registerSubModules = function (mod, getters, computed, prefix) {
        var _this = this;
        helpers.getPropertyNames(mod).forEach(function (key) {
            getters[key] = {};
            mod.state[key] = mod[key].state;
            _this._registerSubModule(mod[key], getters[key], computed, prefix + key + "/");
        });
    };
    /** Register modules recursively */
    StoreProxy.prototype._registerSubModule = function (mod, getters, computed, prefix) {
        //Getters
        this._registerGetters(mod, getters, computed, prefix);
        //Mutations
        this._wrapMutations(mod.mutations, mod.state, prefix);
        //Recursion
        this._registerSubModules(mod, getters, computed, prefix);
    };
    StoreProxy.prototype._registerGetters = function (mod, getters, computed, prefix) {
        var _this = this;
        helpers.getGetterNames(mod).forEach(function (key) {
            var store = _this;
            computed[getterPrefix + prefix + key] = function () {
                return mod[key];
            };
            Object.defineProperty(getters, key, {
                get: function () { return store._storeVm[getterPrefix + prefix + key]; },
                enumerable: true
            });
        });
    };
    /** Create proxy method for mutations for logging */
    StoreProxy.prototype._wrapMutations = function (mutations, state, prefix) {
        var store = this;
        mutations.__inject(state);
        helpers.getMethodNames(mutations).forEach(function (key) {
            // Define proxy method
            var originalMethod = mutations[key];
            mutations[key] = function () {
                var args = arguments;
                store._commit(function () {
                    originalMethod.apply(mutations, args);
                });
                // Notify watchers
                var mutation = {
                    type: prefix + key,
                    payload: JSON.parse(JSON.stringify(args))
                };
                store._subscribers.forEach(function (sub) {
                    return sub(mutation, JSON.parse(JSON.stringify(store.state)));
                });
            };
        });
    };
    /** Commit mutation */
    StoreProxy.prototype._commit = function (fn) {
        var committing = this._committing;
        // Disable state editing
        this._committing = true;
        // Call mutation
        fn();
        // Enable state editing
        this._committing = committing;
    };
    return StoreProxy;
}());
export { StoreProxy };
