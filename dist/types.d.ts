import Vue from "vue";
export declare class Mutations<State> {
    private _state;
    /** Inject state from store  */
    __inject(state: State): void;
    /** Module state */
    protected readonly state: State;
}
export declare class Store<S, M extends Mutations<S>> {
    private _state;
    private _mutations;
    constructor(_state: S, _mutations: M);
    /** Module state */
    readonly state: S;
    /** State mutations */
    readonly mutations: M;
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
    /** Call mutation */
    commit(mutation: string, payload: any): void;
}
