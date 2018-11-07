import StoreProxy from "./storeProxy"
import { Store } from "./types";
export { Mutations, Store, SyncStore } from "./types";

export function install(_vue: any, options: Store<any, any>) {
  let store = new StoreProxy(options);
  _vue.mixin({
    beforeCreate() {
      this.$store = store;
    }
  });
}
