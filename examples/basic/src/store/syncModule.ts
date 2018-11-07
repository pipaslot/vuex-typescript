import { Mutations, Store, SyncStore } from "../../../../src";

class SyncState {
  count: number = 0;
}

class SyncMutations extends Mutations<SyncState> {
  setCount(input: number) {
    this.state.count = input;
  }
}

class SyncModule extends SyncStore<SyncState, SyncMutations> {
  // Define store action
  increment(input: number) {
    this.mutations.setCount(this.state.count + input);
  }
  // Define store getter
  get asString() {
    return "Count: " + this.state.count + "!!!";
  }
}

export default new SyncModule(new SyncState(), new SyncMutations());