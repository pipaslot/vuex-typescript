import StoreProxy from "./storeProxy";
export { Mutations, Store, SyncedStore } from "./types";
export function install(_vue, options) {
    var store = new StoreProxy(options);
    _vue.mixin({
        beforeCreate: function () {
            this.$store = store;
        }
    });
}
