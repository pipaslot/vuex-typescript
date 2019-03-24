import { Mutations, Store } from "../../../../src";
import syncedModule from "./syncedModule";
export class RootState {
  count: number = 0;
  lastUpdate: Date = new Date()
}

export class RootMutations extends Mutations<RootState> {
  setCount(input: number) {
    this.state.count = input;
    this.state.lastUpdate = new Date()
  }
}

export class RootStore extends Store<RootState, RootMutations> {
  // Define store action
  increment(input: number) {
    this.mutations.setCount(this.state.count + input);
  }
  // Define store getter
  get asString() {
    return "Count: " + this.state.count + "!!!";
  }

  syncedModule = syncedModule;
}
export default new RootStore(new RootState(), new RootMutations());
