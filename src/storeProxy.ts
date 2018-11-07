import Vue from "vue";
import * as helpers from "./helpers";
import devtoolPlugin from "./devtoolPlugin";
import {
  Mutations,
  Store,
  SyncedStore,
  IVueState,
  IIndexable,
  IStoreProxy,
  Mutation
} from "./types";
import LocalStorage from "./localStorage";

const getterPrefix: string = "__";
const SYNC_MUTATION_KEY = "STORE_SYNC_MUTATION";
const SYNC_SNAPSHOT_KEY = "STORE_SYNC_SNAPSHOT_";

var storage = new LocalStorage();

export default class StoreProxy<S, M extends Mutations<S>>
  implements IStoreProxy<S> {
  [key: string]: any;
  private _computedTree: any = Object.create(null);
  private _storeVm: IVueState<S> = new Vue({
    data: Object.create(null)
  });
  private _getterTree: any = Object.create(null);
  private _syncMutationTree: any = Object.create(null);
  private _committing: boolean = false;
  private _subscribers: ((mutation: Mutation, state: S) => void)[] = [];

  constructor(private _root: Store<S, M>) {
    this._syncSetup();
    this._registerModule(this._root, this._getterTree, "");

    // Copy getters to proxy
    helpers.getGetterNames(this._root).forEach(key => {
      let store = this;
      Object.defineProperty(this, key, {
        get: () => store._storeVm[getterPrefix + key],
        enumerable: true
      });
    });

    // Copy methods
    helpers.getMethodNames(this._root).forEach(key => {
      this[key] = (this._root as IIndexable)[key];
    });

    // Copy sub-modules into store
    helpers.getPropertyNames(this._root).forEach(key => {
      Object.defineProperty(this, key, {
        get: () => (this._root as IIndexable)[key],
        enumerable: true
      });
    });

    // Initialize store
    this._resetStoreVm();

    if (Vue.config.devtools) {
      devtoolPlugin(this);
    }
  }
  /** State tree */
  get state() {
    return this._storeVm.$data.$$state;
  }
  /** Getter tree */
  get getters() {
    return this._getterTree;
  }
  /** Root module mutations */
  get mutations() {
    return this._root.mutations;
  }
  /** Add Mutation listener */
  subscribe(handler: (mutation: Mutation, state: any) => void) {
    if (this._subscribers.indexOf(handler) < 0) {
      this._subscribers.push(handler);
    }
    return () => {
      const i = this._subscribers.indexOf(handler);
      if (i > -1) {
        this._subscribers.splice(i, 1);
      }
    };
  }
  /** Replace store state */
  replaceState(state: S) {
    this._commit(() => {
      this._storeVm._data.$$state = state;
    });
  }

  private _resetStoreVm() {
    const oldVm = this._storeVm;
    // use a Vue instance to store the state tree
    // suppress warnings just in case the user has added
    // some funky global mixins
    const silent = Vue.config.silent;
    Vue.config.silent = true;
    this._storeVm = new Vue({
      data: {
        $$state: this._root.state
      },
      computed: this._computedTree
    });

    Vue.config.silent = silent;
    //Watch changes
    let watchOptions = { deep: true, sync: true };
    this._storeVm.$watch(
      function() {
        return this._data.$$state;
      },
      (newValue, oldValue) => {
        if (!this._committing && process.env.NODE_ENV !== "production") {
          throw "Store: Do not mutate vuest store state outside mutation handlers.";
        }
      },
      watchOptions
    );
    if (oldVm) {
      Vue.nextTick(() => oldVm.$destroy());
    }
  }

  private _registerSubModules(
    store: Store<any, any>,
    getters: any,
    path: string
  ) {
    const submodules = helpers.getPropertyNames(store);
    if (store instanceof SyncedStore && submodules.length > 0){
      throw new Error("SyncStore with path '" + path+"' can no have sub-modules");
    }
    submodules.forEach(key => {
      getters[key] = {};
      store.state[key] = (store as IIndexable)[key].state;
      this._registerModule((store as IIndexable)[key], getters[key], path + key + "/");
    });
  }

  /** Register modules recursively */
  private _registerModule(
    store: Store<any, any>,
    getters: any,
    path: string
  ) {
    //Getters
    this._registerGetters(store, getters, path);

    //Mutations
    this._wrapMutations(store, path);

    //Recursion
    this._registerSubModules(store, getters, path);

    //Load state for synchronized stores
    this._syncTryLoadState(store, path);
  }

  private _registerGetters(
    store: Store<any, any>,
    getters: any,
    path: string
  ) {
    let proxy = this;
    helpers.getGetterNames(store).forEach(key => {
      proxy._computedTree[getterPrefix + path + key] = () => {
        return (store as IIndexable)[key];
      };
      Object.defineProperty(getters, key, {
        get: () => proxy._storeVm[getterPrefix + path + key],
        enumerable: true
      });
    });
  }

  /** Create proxy method for mutations for logging */
  private _wrapMutations(store: Store<any, any>, path: string) {
    const proxy = this;
    store.mutations.__inject(store.state);
    helpers.getMethodNames(store.mutations).forEach(key => {
      // Define proxy method
      let originalMethod = (store.mutations as IIndexable)[key];
      (store.mutations as IIndexable)[key] = function() {
        const args = arguments as any;
        const payload = Object.keys(args).map(k => args[k]);
        console.log(payload);
        proxy._commit(function() {
          originalMethod.apply(store.mutations, payload);
        });

        proxy._notifySubscribers(path + key, payload);
        if (store instanceof SyncedStore) {
          proxy._syncPropagate(store, path, path + key, payload);
        }
      };
      // Setup synchronized mutations
      if (store instanceof SyncedStore) {
        this._syncMutationTree[path + key] = function() {
          const args = arguments as any;
          const payload = Object.keys(args).map(k => args[k]);
          proxy._commit(function() {
            originalMethod.apply(store.mutations, payload);
          });
          proxy._notifySubscribers(path + key, payload);
        };
      }
    });
  }

  /** Commit mutation */
  private _commit(fn: () => void) {
    const committing = this._committing;
    // Disable state editing
    this._committing = true;
    // Call mutation
    fn();
    // Enable state editing
    this._committing = committing;
  }

  private _notifySubscribers(type: string, payload: any) {
    // Notify watchers
    const mutation: Mutation = {
      type: type,
      payload: JSON.parse(JSON.stringify(payload))
    };
    this._subscribers.forEach(sub =>
      sub(mutation, JSON.parse(JSON.stringify(this.state)))
    );
  }

  private _syncSetup() {
    // Storage synchronization
    window.addEventListener("storage", event => {
      if (event.key !== SYNC_MUTATION_KEY) {
        return;
      }
      if (event.newValue === null) {
        return;
      }

      try {
        const mutation = JSON.parse(event.newValue);
        var mutationFunc = this._syncMutationTree[mutation.type];
        if (typeof mutationFunc === "function") {
          mutationFunc.apply(this, mutation.payload);
        }
      } catch (error) {
        throw new Error(error);
      }
    });
  }

  private _syncPropagate(
    store: Store<any, any>,
    path: string,
    type: string,
    payload: any
  ) {
    try {
      const mutation: Mutation = {
        type: type,
        payload: JSON.parse(JSON.stringify(payload))
      };
      // Propagate mutation
      storage.setState(SYNC_MUTATION_KEY, mutation);
      storage.clearState(SYNC_MUTATION_KEY);

      // Store changed state
      storage.setState(SYNC_SNAPSHOT_KEY + path, store.state);
    } catch (error) {
      throw new Error(error);
    }
  }

  private _syncTryLoadState(store: Store<any, any>, path: string) {
    // Replace state from last snapshot
    const snapshot = storage.getState(SYNC_SNAPSHOT_KEY + path);
    if (snapshot !== null) {
      helpers.getPropertyNames(snapshot).forEach(key => {
        Vue.set(store.state, key, snapshot[key]);
      });
    }
  }
}
