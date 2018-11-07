export default class LocalStorage {
    private _prefix;
    constructor(_prefix?: string);
    setState(key: string, value: any): void;
    getState<T = any>(key: string): T | null;
    clearState(key: string): void;
}
