import { Mutations, Store } from "../../../../src";
import syncedModule from "./syncedModule";
export class RootState {
  count: number = 0;
}

export class RootMutations extends Mutations<RootState> {
  setCount(input: number) {
    this.state.count = input;
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
