import { Mutations, Store, IStoreProxy } from "./types";
export { Mutations, Store } from "./types";
export declare function install(_vue: any, options: Store<any, any>): void;
export declare class StoreProxy<S, M extends Mutations<S>> implements IStoreProxy<S> {
    private _root;
    [key: string]: any;
    private _computed;
    private _storeVm;
    private _getters;
    private _committing;
    private _subscribers;
    constructor(_root: Store<S, M>);
    /** State tree */
    readonly state: any;
    /** Getter tree */
    readonly getters: any;
    /** Root module mutations */
    readonly mutations: M;
    /** Add Mutation listener */
    subscribe(handler: (mutation: string, state: any) => void): () => void;
    /** Replace store state */
    replaceState(state: S): void;
    /** Call mutation */
    commit(mutation: string, ...payload: any[]): void;
    private _resetStoreVm;
    private _registerSubModules;
    /** Register modules recursively */
    private _registerSubModule;
    private _registerGetters;
    /** Create proxy method for mutations for logging */
    private _wrapMutations;
    /** Commit mutation */
    private _commit;
}
