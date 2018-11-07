<template>
  <div id="app">
    Delta: <input type="number" v-model.number="number">
    <h3>Root Store</h3>
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

@Component
export default class App extends Vue {
  number: number = 1;
  get asRootGetter() {
    return this.$store.asString;
  }
  get asRootState() {
    return this.$store.state.count;
  }
  incrementRoot() {
    this.$store.increment(this.number);
  }
  decrementRoot() {
    this.$store.increment(-this.number);
  }

  get asSyncGetter() {
    return this.$store.syncedModule.asString;
  }
  get asSyncState() {
    return this.$store.syncedModule.state.count;
  }
  incrementSync() {
    this.$store.syncedModule.increment(this.number);
  }
  decrementSync() {
    this.$store.syncedModule.increment(-this.number);
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
