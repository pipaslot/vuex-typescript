import Vue from "vue";

export class Mutations<State> {
  private _state: State = Object.create(null);
  /** Inject state from store  */
  __inject(state: State) {
    this._state = state;
  }
  /** Module state */
  protected get state(): State {
    return this._state;
  }
}

export class Store<S, M extends Mutations<S>> {
  constructor(private _state: S, private _mutations: M) {}
  /** Module state */
  public get state(): S {
    return this._state;
  }
  /** State mutations */
  public get mutations(): M {
    return this._mutations;
  }
}

export interface IVueState<T> extends Vue {
  [key: string]: any;
  $$state: T;
}

export interface IIndexable {
  [key: string]: any;
}

export interface IStoreProxy<S> {
  /** Add Mutation listener */
  subscribe(handler: (mutation: string, state: any) => void): void;
  /** Replace store state */
  replaceState(state: S): void;
}
