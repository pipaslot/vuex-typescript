import Vue from "vue";
import * as helpers from "./helpers";
import devtoolPlugin from "./devtoolPlugin";
import {
  Mutations,
  Store,
  IVueState,
  IIndexable,
  IStoreProxy,
  Mutation
} from "./types";

const getterPrefix: string = "__";

export default class StoreProxy<S, M extends Mutations<S>>
  implements IStoreProxy<S> {
  [key: string]: any;
  private _computedTree: any = Object.create(null);
  private _storeVm: IVueState<S> = new Vue({
    data: Object.create(null)
  });
  private _getterTree: any = Object.create(null);
  private _committing: boolean = false;
  private _subscribers: ((mutation: Mutation, state: S) => void)[] = [];

  constructor(private _root: Store<S, M>) {
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
    mod: Store<any, any>,
    getters: any,
    prefix: string
  ) {
    helpers.getPropertyNames(mod).forEach(key => {
      getters[key] = {};
      mod.state[key] = (mod as IIndexable)[key].state;
      this._registerModule(
        (mod as IIndexable)[key],
        getters[key],
        prefix + key + "/"
      );
    });
  }
  /** Register modules recursively */
  private _registerModule(
    mod: Store<any, any>,
    getters: any,
    prefix: string
  ) {
    //Getters
    this._registerGetters(mod, getters, prefix);

    //Mutations
    this._wrapMutations(mod.mutations, mod.state, prefix);

    //Recursion
    this._registerSubModules(mod, getters, prefix);
  }

  private _registerGetters(mod: Store<any, any>, getters: any, prefix: string) {
    let store = this;
    helpers.getGetterNames(mod).forEach(key => {
      store._computedTree[getterPrefix + prefix + key] = () => {
        return (mod as IIndexable)[key];
      };
      Object.defineProperty(getters, key, {
        get: () => store._storeVm[getterPrefix + prefix + key],
        enumerable: true
      });
    });
  }

  /** Create proxy method for mutations for logging */
  private _wrapMutations(
    mutations: Mutations<any>,
    state: any,
    prefix: string
  ) {
    const store = this;
    mutations.__inject(state);
    helpers.getMethodNames(mutations).forEach(key => {
      // Define proxy method
      let originalMethod = (mutations as IIndexable)[key];
      (mutations as IIndexable)[key] = function() {
        const args = arguments;
        store._commit(function() {
          originalMethod.apply(mutations, args);
        });

        store._notifySubscribers(prefix + key, args);
      };
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

  private _replaceStoreState(store: Store<any, any>, state: any) {
    helpers.getPropertyNames(state).forEach(key => {
      Vue.set(store.state[key], key, state[key]);
    });
  }
}
