export default function devtoolPlugin(store) {
    var devtoolHook = typeof window !== "undefined" && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;
    if (!devtoolHook)
        return;
    devtoolHook.emit("vuex:init", store);
    devtoolHook.on("vuex:travel-to-state", function (targetState) {
        store.replaceState(targetState);
    });
    store.subscribe(function (mutation, state) {
        devtoolHook.emit("vuex:mutation", mutation, state);
    });
}
