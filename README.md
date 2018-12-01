# vuex-typescript

State Manager designed for [Vue](https://github.com/vuejs/vue), inspired by [vuex](https://github.com/vuejs/vuex), developed for typescript, compatible with [vue-devtools](https://github.com/vuejs/vue-devtools)

## 1 Installation

### 1.1 Install package

```bash
$ npm install pipaslot-vuex-typescript --save
```

### 1.2 Create own store

store.ts

```ts
import { Mutations, Store } from "pipaslot-vuex-typescript";
import myModule from "./myModule";

class RootState {
  data: string = "";
}
class RootMutations extends Mutations<RootState> {
  myMutation(input: string) {
    this.state.data = input;
  }
}

export class RootStore extends Store<RootState, RootMutations> {
// Define store action
  myAction(input: string) {
    this.mutations.myMutation(input);
    // call sub-module action
    this.security.myModuleAction(input);
    // call sub-mutation action
    this.security.mutations.myModuleMutation(input);
  }
  // Define store getter
  get myGetter(){
    return "Getter value: " + this.state.data + "!!!"
  }
  // Define store module. Every Store or store module can contains another Modules.
  myModule = myModule;
}

export default new RootStore(new RootState(), new RootMutations());
```

### 1.2.1 Create Store module (if you need it)

myModule.ts

```ts
import { Mutations, Store } from "pipaslot-vuex-typescript"

class MyModuleState {
  myStoreData: string = "";
}
class MyModuleMutations extends Mutations<MyModuleState> {
  myModuleMutation(input: string) {
    this.state.myStoreData = input;
  }
}

class MyModuleStore extends Store<MyModuleState, MyModuleMutations> {
  // Define/Enable indexing
  [key: string]: any;
  // Define module Action
  myModuleAction(input: string) {
    this.mutations.myModuleMutation(input);
  }
  // Define module getter
  get myModuleGetter(){
    return "Getter value: " + this.state.myStoreData + "!!!"
  }
  //We also can define another sub-modules as properties
}
export default new MyModuleStore(new MyModuleState(), new MyModuleMutations());
```

You can also use `SyncedStore` instead of Store base class. SyncedStore will be automatically synchronized across all browser tabs and its state will be shared through local storage. `SyncedStore` contains method `onLoadState` which is invoked during store initialization in case, when state is loaded from local storage.

### 1.3 Attach store into Vue

main.ts

```ts
import Vue from "vue";
import * as vuexTypescript from "pipaslot-vuex-typescript";

//Attach store to vue components
import rootStore from  "./store"
Vue.use(vuexTypescript.install, rootStore);

... initialize your application
```

### 1.4 Say to your TS compiler what type contains $store property in vue object

vue.d.ts or shims-vue.d.ts

```ts

declare module "vue/types/vue" {
  import Vue from "vue";
  import { RootStore } from "@/store";
  interface Vue {
    $store: RootStore;
  }
}
```

## 2 Use the Store

### 2.1 Use Store in component

my-component.ts

```ts
import { Vue, Component } from "vue-property-decorator";

@Component
export default class MyComponent extends Vue {
  myData: string = "";
  componentActionforStoreRoot() {
    //Call store action
    this.$store.myAction(this.myData);

    //Call store mutation
    this.$store.mutations.myMutation(this.myData);

    //Get Store state
    let storeState = this.$store.state.data;

    //Get value from store getters
    let storeComputedValue = this.$store.myGetter; // OR: this.$store.getters.myGetter (if indexing is defined)
  }
  componentActionforStoreModule() {
    //Call store module action
    this.$store.myModule.myModuleAction(this.myData);

    //Call store module mutation
    this.$store.myModule.mutations.myModuleMutation(this.myData);

    //Get Store state
    let storeState = this.$store.myModule.state.myStoreData; // OR: this.$store.state.myModule.myStoreData (if indexing is defined)

    //Get value from store getters
    let storeComputedValue = this.$store.myModule.myModuleGetter; // OR: this.$store.getters.myModule.myModuleGetter (if indexing is defined)
  }
}
```

### 2.2 Use Store in your scripts

my-service.ts

```ts
import store from "@/store";

export function actionforStoreRoot() {
    //Call store action
    store.myAction(...);

    //Call store mutation
    store.mutations.myMutation(...);  

    //Get Store state
    let storeState = store.state.data;

    //Get value from store getters
    let storeComputedValue = store.myGetter; // OR: store.getters.myGetter (if indexing is defined)
  }
export function actionforStoreModule() {
    //Call store module action
    store.myModule.myModuleAction(...);

    //Call store module mutation
    store.myModule.mutations.myModuleMutation(...);  

    //Get Store state
    let storeState = store.myModule.state.myStoreData; // OR: store.state.myModule.myStoreData (if indexing is defined)

    //Get value from store getters
    let storeComputedValue = store.myModule.myModuleGetter; // OR: store.getters.myModule.myModuleGetter (if indexing is defined)
  }
```

## 3 Bad Practices

We are used to have rather best practices, but every software has its disadvantages and it is better to know them.

### 3.1 Do not invoke mutations from another mutations
It is similar like in original vuex implementation, that we should use mutation synchronously. All asynchronous operations should be implemented into actions. The same it is also with callign multiple mutations. In this library every mutations can touch another mutations, but keep in mind that dev-tools logs all mutations whent the mutation is finished. If you would call one mutation from another mutation, then dev-tool will log them in opposite order. It can cause a pain to your debugging in future.

### 3.2 Do not mutate store state out of mutations
In development mode all state changes called out of mutations will cause exceptions. In production exception won't be thrown, to be sure that store will be working in any case.
