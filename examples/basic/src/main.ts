import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

import * as vuexTypescript from "pipaslot-vuex-typescript";

//Attach store to vue components
import myStore from "./store"
Vue.use(vuexTypescript.install, myStore);

new Vue({
  render: h => h(App),
}).$mount('#app')
