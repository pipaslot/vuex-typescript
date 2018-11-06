export default class LocalStorage {
  constructor(private _prefix: string = "") {}
  setState(key: string, value: any): void {
    localStorage.setItem(this._prefix + key, JSON.stringify(value));
  }
  getState<T = any>(key: string): T | null {
    let value = localStorage.getItem(this._prefix + key);
    if (value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
  clearState(key: string): void {
    localStorage.removeItem(this._prefix + key);
  }
}
