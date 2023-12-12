import React from "react";
import {AttendeeDomainStore} from "./attendeeDomainStore";
import {Connector} from "../services/signalr-connection";

class RootStore {

  attendeeDomainStore: AttendeeDomainStore;
  connector: Connector;

  constructor() {
    this.attendeeDomainStore = new AttendeeDomainStore();
    this.connector = new Connector(this.attendeeDomainStore);
  }
}

const StoreContext = React.createContext(new RootStore());
export const useStores = () => React.useContext(StoreContext);