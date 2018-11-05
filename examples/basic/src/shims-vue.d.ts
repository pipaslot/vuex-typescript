declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

import Vue from "vue";
import { MyStore } from "@/store";

declare module "vue/types/vue" {
  interface Vue {
    $store: MyStore;
  }
}