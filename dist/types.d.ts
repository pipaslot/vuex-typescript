import Vue from "vue";
export declare class Mutations<State> {
    private _state;
    /** Inject state from store  */
    __inject(state: State): void;
    /** Module state */
    protected readonly state: State;
}
/** Basic store implementation */
export declare class Store<S, M extends Mutations<S>> {
    private _state;
    private _mutations;
    constructor(_state: S, _mutations: M);
    /** Module state */
    readonly state: S;
    /** State mutations */
    readonly mutations: M;
}
/** Store synchronized throug local storage. This kind of store can not have sub-modules */
export declare class SyncedStore<S, M extends Mutations<S>> extends Store<S, M> {
}
export interface IVueState<T> extends Vue {
    [key: string]: any;
    $$state: T;
}
export interface IIndexable {
    [key: string]: any;
}
export interface Mutation {
    type: string;
    payload: any;
}
export interface IStoreProxy<S> {
    /** Add Mutation listener */
    subscribe(handler: (mutation: Mutation, state: any) => void): void;
    /** Replace store state */
    replaceState(state: S): void;
}
