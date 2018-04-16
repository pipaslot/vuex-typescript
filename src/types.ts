import Vue from "vue";

export class Mutations<State> {
  [key: string]: any;
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
  [key: string]: any;
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