<template>
  <div id="app">
    Delta: <input type="number" v-model.number="number">
    <h3>Root Store</h3>
    <h5>Last update: {{rootLastUpdate}}</h5>
    <dl>
      <dt>Action:</dt>
      <dd>
        <button @click="incrementRoot">+</button>
        <button @click="decrementRoot">-</button>
      </dd>
      <dt>State: </dt>
      <dd>{{asRootState}}</dd>
      <dt>Getter: </dt>
      <dd>{{asRootGetter}}</dd>
    </dl>
    <h3>Sync Module</h3>
    <h5>Last update: {{syncLastUpdate}}</h5>
    <dl>
      <dt>Action:</dt>
      <dd>
        <button @click="incrementSync">+</button>
        <button @click="decrementSync">-</button>
      </dd>
      <dt>State: </dt>
      <dd>{{asSyncState}}</dd>
      <dt>Getter: </dt>
      <dd>{{asSyncGetter}}</dd>
    </dl>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import rootStore from "./store"
import syncModule from "./store/syncedModule"

@Component
export default class App extends Vue {
  number: number = 1;
  get rootLastUpdate() {
    return rootStore.state.lastUpdate.getTime();
  }
  get asRootGetter() {
    return rootStore.asString;
  }
  get asRootState() {
    return rootStore.state.count;
  }
  incrementRoot() {
    rootStore.increment(this.number);
  }
  decrementRoot() {
    rootStore.increment(-this.number);
  }
  get syncLastUpdate() {
    return rootStore.syncedModule.state.lastUpdate.getTime();
  }
  get asSyncGetter() {
    return rootStore.syncedModule.asString;
  }
  get asSyncState() {
    return rootStore.syncedModule.state.count;
  }
  incrementSync() {
    rootStore.syncedModule.increment(this.number);
  }
  decrementSync() {
    syncModule.increment(-this.number); 
    // This call is equal to 
    //rootStore.syncedModule.increment(-this.number);
  }
}
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width:300px;
  color: #2c3e50;
  margin: 60px auto 0 auto;
}
dl {
  text-align: left;
}
</style>
