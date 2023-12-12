import * as signalR from "@microsoft/signalr";
import {AttendeeEntity} from "../models/attendeeEntity";
import {AttendeeDomainStore} from "../stores/attendeeDomainStore";
import {TeamEntity} from "../models/teamEntity";

const url = process.env.REACT_APP_API_URL || "http://localhost:7071/api/";

export class Connector {
  private connection: signalR.HubConnection;
  static instance: Connector;

  constructor(domainStore: AttendeeDomainStore) {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(url)
      .withAutomaticReconnect()
      .build();
    this.connection.start().catch(err => document.write(err));

    this.connection.on("teamUpdated", async (data) => {
      const json = JSON.parse(data);
      domainStore.onTeamUpdated(TeamEntity.fromJson(json));
    });

    this.connection.on("attendeeAdded", async (data) => {
      const json = JSON.parse(data);
      domainStore.onAttendeeAdded(AttendeeEntity.fromJson(json));
    });

    this.connection.on("attendeeUpdated", async (data) => {
      const json = JSON.parse(data);
      domainStore.onAttendeeUpdated(AttendeeEntity.fromJson(json));
    });

    this.connection.on("attendeeRemoved", async (data) => {
      const {attendeeId, teamId} = JSON.parse(data);
      domainStore.onAttendeeRemoved(attendeeId, teamId);
    });

    this.connection.on("resetAll", async () => {
      domainStore.resetAll();
    });

    this.connection.on("attendeeSelected", async (data) => {
      const json = JSON.parse(data);
      domainStore.selectAttendee(AttendeeEntity.fromJson(json));
    });
  }
}