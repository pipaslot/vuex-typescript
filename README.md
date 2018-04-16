# vuex-typescript

State Manager designed for [Vue](https://github.com/vuejs/vue), inspired by [vuex](https://github.com/vuejs/vuex), developed for typescript, compatible with [vue-devtools](https://github.com/vuejs/vue-devtools)

## 1 Installation

### 1.1 Install package

```bash
$ npm install pipaslot-vuex-typescript --save-dev
```

### 1.2 Create own store

store.ts

```ts
import { Mutations, Store } from "pipaslot-vuex-typescript";
import myModule from "./myModule";

class RootState {
  myStoreData: string = "";
}
class RootMutations extends Mutations<RootState> {
  myMutation(input: string) {
    this.state.myStoreData = input;
  }
}

class MyStore extends Store<RootState, RootMutations> {
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
    return "Getter value: " + this.state.myStoreData + "!!!"
  }
  // Define store module. Every Store or store module can contains another Modules.
  myModule;
}

export default new MyStore(new RootState(), new RootMutations());
```

### 1.2.1 Create Store module (if you need it)

myModule.ts

```ts
class MyModuleState {
  myStoreData: string = "";
}
class MyModuleMutations extends Mutations<MyModuleState> {
  myModuleMutation(input: string) {
    this.state.myStoreData = input;
  }
}

class MyModuleStore extends Store<MyModuleState, MyModuleMutations> {
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
export default new MyModuleStore(new RootState(), new RootMutations());
```

### 1.3 Attach store into Vue

main.ts

```ts
import Vue from "vue";
import * as vuexTypescript from "pipaslot-vuex-typescript";

//Attach store to vue components
import myStore from  "./store"
Vue.use(vuexTypescript.install, myStore);

... initialize your application
```

### 1.4 Say to your TS compiler what type contains $store property in vue object

vue.d.ts

```ts
import Vue from "vue";
import { MyStore } from "@/store";

declare module "vue/types/vue" {
  interface Vue {
    $store: MyStore;
  }
}
```

## Use the Store

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
    let storeState = this.$store.state.myStoreData;

    //Get value from store getters
    let storeComputedValue = this.$store.myGetter; // OR: this.$store.getters.myGetter
  }
  componentActionforStoreModule() {
    //Call store module action
    this.$store.myModule.myModuleAction(this.myData);

    //Call store module mutation
    this.$store.myModule.mutations.myModuleMutation(this.myData);

    //Get Store state
    let storeState = this.$store.state.myModule.myStoreData; // OR: this.$store.myModule.state.myStoreData

    //Get value from store getters
    let storeComputedValue = this.$store.myModule.myModuleGetter; // OR: this.$store.getters.myModule.myModuleGetter
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
    let storeState = store.state.myStoreData;

    //Get value from store getters
    let storeComputedValue = store.myGetter; // OR: store.getters.myGetter
  }
export function actionforStoreModule() {
    //Call store module action
    store.myModule.myModuleAction(...);

    //Call store module mutation
    store.myModule.mutations.myModuleMutation(...);  

    //Get Store state
    let storeState = store.state.myModule.myStoreData; // OR: store.myModule.state.myStoreData

    //Get value from store getters
    let storeComputedValue = store.myModule.myModuleGetter; // OR: store.getters.myModule.myModuleGetter
  }
```
