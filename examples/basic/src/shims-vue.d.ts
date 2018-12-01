declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module "vue/types/vue" {
  import Vue from "vue";
  import { RootStore } from "@/store";
  interface Vue {
    $store: RootStore;
  }
}