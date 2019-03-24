import { Mutations, Store, SyncedStore } from "../../../../src";

class SyncState {
  count: number = 0;
  lastUpdate: Date = new Date();
}

class SyncMutations extends Mutations<SyncState> {
  setCount(input: number) {
    this.state.count = input;
    this.state.lastUpdate = new Date()
  }
}

class SyncedModule extends SyncedStore<SyncState, SyncMutations> {
  onLoadState(){
    if(this.state.count > 5){
      alert("count is more than 5");
    }
  }
  // Define store action
  increment(input: number) {
    this.mutations.setCount(this.state.count + input);
  }
  // Define store getter
  get asString() {
    return "Count: " + this.state.count + "!!!";
  }
}

export default new SyncedModule(new SyncState(), new SyncMutations());