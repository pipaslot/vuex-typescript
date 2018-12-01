import Vue from "vue";
import * as helpers from "./helpers";
import devtoolPlugin from "./devtoolPlugin";
import { SyncedStore } from "./types";
import LocalStorage from "./localStorage";
var getterPrefix = "__";
var SYNC_MUTATION_KEY = "STORE_SYNC_MUTATION";
var SYNC_SNAPSHOT_KEY = "STORE_SYNC_SNAPSHOT_";
var storage = new LocalStorage();
var StoreProxy = /** @class */ (function () {
    function StoreProxy(_root) {
        var _this = this;
        this._root = _root;
        this._computedTree = Object.create(null);
        this._storeVm = new Vue({
            data: Object.create(null)
        });
        this._getterTree = Object.create(null);
        this._syncMutationTree = Object.create(null);
        this._committing = false;
        this._subscribers = [];
        this._syncSetup();
        this._registerModule(this._root, this._getterTree, "");
        // Copy getters to proxy
        helpers.getGetterNames(this._root).forEach(function (key) {
            var store = _this;
            Object.defineProperty(_this, key, {
                get: function () { return store._storeVm[getterPrefix + key]; },
                enumerable: true
            });
        });
        // Copy methods
        helpers.getMethodNames(this._root).forEach(function (key) {
            _this[key] = _this._root[key];
        });
        // Copy sub-modules into store
        helpers.getPropertyNames(this._root).forEach(function (key) {
            Object.defineProperty(_this, key, {
                get: function () { return _this._root[key]; },
                enumerable: true
            });
        });
        // Initialize store
        this._resetStoreVm();
        if (Vue.config.devtools) {
            devtoolPlugin(this);
        }
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
            return this._getterTree;
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
            computed: this._computedTree
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
    StoreProxy.prototype._registerSubModules = function (store, getters, path) {
        var _this = this;
        var submodules = helpers.getPropertyNames(store);
        if (store instanceof SyncedStore && submodules.length > 0) {
            throw new Error("SyncStore with path '" + path + "' can no have sub-modules");
        }
        submodules.forEach(function (key) {
            getters[key] = {};
            store.state[key] = store[key].state;
            _this._registerModule(store[key], getters[key], path + key + "/");
        });
    };
    /** Register modules recursively */
    StoreProxy.prototype._registerModule = function (store, getters, path) {
        //Getters
        this._registerGetters(store, getters, path);
        //Mutations
        this._wrapMutations(store, path);
        //Recursion
        this._registerSubModules(store, getters, path);
        //Load state for synchronized stores
        this._syncTryLoadState(store, path);
    };
    StoreProxy.prototype._registerGetters = function (store, getters, path) {
        var proxy = this;
        helpers.getGetterNames(store).forEach(function (key) {
            proxy._computedTree[getterPrefix + path + key] = function () {
                return store[key];
            };
            Object.defineProperty(getters, key, {
                get: function () { return proxy._storeVm[getterPrefix + path + key]; },
                enumerable: true
            });
        });
    };
    /** Create proxy method for mutations for logging */
    StoreProxy.prototype._wrapMutations = function (store, path) {
        var _this = this;
        var proxy = this;
        store.mutations.__inject(store.state);
        helpers.getMethodNames(store.mutations).forEach(function (key) {
            // Define proxy method
            var originalMethod = store.mutations[key];
            store.mutations[key] = function () {
                var args = arguments;
                var payload = Object.keys(args).map(function (k) { return args[k]; });
                proxy._commit(function () {
                    originalMethod.apply(store.mutations, payload);
                });
                proxy._notifySubscribers(path + key, payload);
                if (store instanceof SyncedStore) {
                    proxy._syncPropagate(store, path, path + key, payload);
                }
            };
            // Setup synchronized mutations
            if (store instanceof SyncedStore) {
                _this._syncMutationTree[path + key] = function () {
                    var args = arguments;
                    var payload = Object.keys(args).map(function (k) { return args[k]; });
                    proxy._commit(function () {
                        originalMethod.apply(store.mutations, payload);
                    });
                    proxy._notifySubscribers(path + key, payload);
                };
            }
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
    StoreProxy.prototype._notifySubscribers = function (type, payload) {
        var _this = this;
        // Notify watchers
        var mutation = {
            type: type,
            payload: JSON.parse(JSON.stringify(payload))
        };
        this._subscribers.forEach(function (sub) {
            return sub(mutation, JSON.parse(JSON.stringify(_this.state)));
        });
    };
    StoreProxy.prototype._syncSetup = function () {
        var _this = this;
        // Storage synchronization
        window.addEventListener("storage", function (event) {
            if (event.key !== SYNC_MUTATION_KEY) {
                return;
            }
            if (event.newValue === null) {
                return;
            }
            try {
                var mutation = JSON.parse(event.newValue);
                var mutationFunc = _this._syncMutationTree[mutation.type];
                if (typeof mutationFunc === "function") {
                    mutationFunc.apply(_this, mutation.payload);
                }
            }
            catch (error) {
                throw new Error(error);
            }
        });
    };
    StoreProxy.prototype._syncPropagate = function (store, path, type, payload) {
        try {
            var mutation = {
                type: type,
                payload: JSON.parse(JSON.stringify(payload))
            };
            // Propagate mutation
            storage.setState(SYNC_MUTATION_KEY, mutation);
            storage.clearState(SYNC_MUTATION_KEY);
            // Store changed state
            storage.setState(SYNC_SNAPSHOT_KEY + path, store.state);
        }
        catch (error) {
            throw new Error(error);
        }
    };
    StoreProxy.prototype._syncTryLoadState = function (store, path) {
        if (store instanceof SyncedStore) {
            // Replace state from last snapshot
            var snapshot_1 = storage.getState(SYNC_SNAPSHOT_KEY + path);
            if (snapshot_1 !== null) {
                helpers.getPropertyNames(snapshot_1).forEach(function (key) {
                    Vue.set(store.state, key, snapshot_1[key]);
                });
                store.onLoadState();
            }
        }
    };
    return StoreProxy;
}());
export default StoreProxy;
