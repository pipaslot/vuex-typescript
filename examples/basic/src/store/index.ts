import { Mutations, Store } from "../../../../src";
import syncModule from "./syncModule";
export class RootState {
  count: number = 0;
}

export class RootMutations extends Mutations<RootState> {
  setCount(input: number) {
    this.state.count = input;
  }
}

export class MyStore extends Store<RootState, RootMutations> {
  // Define store action
  increment(input: number) {
    this.mutations.setCount(this.state.count + input);
  }
  // Define store getter
  get asString() {
    return "Count: " + this.state.count + "!!!";
  }

  syncModule = syncModule;
}
export default new MyStore(new RootState(), new RootMutations());
