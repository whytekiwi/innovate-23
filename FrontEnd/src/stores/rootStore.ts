import React from "react";
import {AttendeeDomainStore} from "./attendeeDomainStore";

class RootStore {

  attendeeDomainStore: AttendeeDomainStore;

  constructor() {
    this.attendeeDomainStore = new AttendeeDomainStore();
  }
}

const StoreContext = React.createContext(new RootStore());
export const useStores = () => React.useContext(StoreContext);