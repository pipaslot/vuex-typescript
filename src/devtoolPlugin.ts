import { IStoreProxy } from "./types";

export default function devtoolPlugin(store: IStoreProxy<any>) {
  const devtoolHook: any =
    typeof window !== "undefined" && (<any>window).__VUE_DEVTOOLS_GLOBAL_HOOK__;
  if (!devtoolHook) return;

  devtoolHook.emit("vuex:init", store);

  devtoolHook.on("vuex:travel-to-state", (targetState: any) => {
    store.replaceState(targetState);
  });

  store.subscribe((mutation: any, state: any) => {
    devtoolHook.emit("vuex:mutation", mutation, state);
  });
}
