<template>
<div>
  <input type="number" v-model.number="number">
  <button @click="increment">+</button>
  <button @click="decrement">-</button>
  <div> State: {{asState}}</div>
  <div> Getter: {{asGetter}}</div>
</div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class MyComponent extends Vue {
    number: number = 1;
    get asGetter() {
        return this.$store.asString;
    }
    get asState() {
        return this.$store.state.count
    }
    increment() {
        this.$store.increment(this.number)
    }
    decrement() {
        this.$store.increment(-this.number)
    }
}
</script>