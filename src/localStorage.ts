var reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;

var dateParser = function(key: string, value: string) {
  if (typeof value === "string") {
    var a = reISO.exec(value);
    if (a) {
      return new Date(value);
    }    
  }
  return value;
};

export default class LocalStorage {
  constructor(private _prefix: string = "") {}
  setState(key: string, value: any): void {
    localStorage.setItem(this._prefix + key, JSON.stringify(value));
  }
  getState<T = any>(key: string): T | null {
    let value = localStorage.getItem(this._prefix + key);
    if (value) {
      try {
        return JSON.parse(value, dateParser);
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
