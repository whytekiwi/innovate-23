import * as signalR from "@microsoft/signalr";
import {AttendeeEntity} from "../models/attendeeEntity";

const url = process.env.REACT_APP_API_URL || "http://localhost:7071/api/";

class Connector {
  private connection: signalR.HubConnection;
  public onAttendeeSelected: (onAttendeeSelected?: (attendee: AttendeeEntity) => void) => void;
  public onAttendeeUpdated: (onAttendeeUpdated?: () => void) => void;
  static instance: Connector;

  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(url)
      .withAutomaticReconnect()
      .build();
    this.connection.start().catch(err => document.write(err));
    this.onAttendeeSelected = (onAttendeeSelected) => {
      this.connection.on("attendeeSelected", async (data) => {
        const json = JSON.parse(data);
        onAttendeeSelected?.(AttendeeEntity.fromJson(json));
      });
    };
    this.onAttendeeUpdated = (onAttendeeUpdated) => {
      this.connection.on("attendeeUpdated", async (data) => {
        onAttendeeUpdated?.();
      });
    };
  }

  public static getInstance(): Connector {
    if (!Connector.instance)
      Connector.instance = new Connector();
    return Connector.instance;
  }
}

export default Connector.getInstance;