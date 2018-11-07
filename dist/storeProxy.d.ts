import { Mutations, Store, IStoreProxy, Mutation } from "./types";
export default class StoreProxy<S, M extends Mutations<S>> implements IStoreProxy<S> {
    private _root;
    [key: string]: any;
    private _computedTree;
    private _storeVm;
    private _getterTree;
    private _syncMutationTree;
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
    subscribe(handler: (mutation: Mutation, state: any) => void): () => void;
    /** Replace store state */
    replaceState(state: S): void;
    private _resetStoreVm;
    private _registerSubModules;
    /** Register modules recursively */
    private _registerModule;
    private _registerGetters;
    /** Create proxy method for mutations for logging */
    private _wrapMutations;
    /** Commit mutation */
    private _commit;
    private _notifySubscribers;
    private _syncSetup;
    private _syncPropagate;
    private _syncTryLoadState;
}
