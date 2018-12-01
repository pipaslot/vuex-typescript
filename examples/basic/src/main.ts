import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

import * as vuexTypescript from "../../../src";

//Attach store to vue components
import rootStore from "./store"
Vue.use(vuexTypescript.install, rootStore);

new Vue({
  render: h => h(App),
}).$mount('#app')
