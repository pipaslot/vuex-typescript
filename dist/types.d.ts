import Vue from "vue";
export declare class Mutations<State> {
    [key: string]: any;
    private _state;
    /** Inject state from store  */
    __inject(state: State): void;
    /** Module state */
    protected readonly state: State;
}
export declare class Store<S, M extends Mutations<S>> {
    private _state;
    private _mutations;
    [key: string]: any;
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
