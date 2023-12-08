import {AttendeeEntity} from "../models/attendeeEntity";
import {TeamEntity} from "../models/teamEntity";

const url = "http://localhost:7071/api/";
const attendeesPath = "attendees";
const teamsPath = "teams";

export default class AttendeeService {
  public static async selectAttendee(teamId?: string, attendeeId?: string, givesPhotoConsent?: boolean) {
    await this.post(url + teamsPath + "/" + teamId + "/" + attendeesPath + "/" + attendeeId, JSON.stringify({
      photoConsent: givesPhotoConsent
    }));
  }

  public static async deleteAttendee(attendee: AttendeeEntity) {
    await fetch(url + teamsPath + "/" + attendee.teamId + "/" + attendeesPath + "/" + attendee.id, {
      method: "DELETE"
    });
  }

  public static async getTeams(): Promise<TeamEntity[]> {
    let data = await this.get(url + teamsPath);
    return data.map(TeamEntity.fromJson);
  }

  public static async postTeam(team: TeamEntity): Promise<void> {
    await this.post(url + teamsPath, team.toJson())
  }

  public static async postAttendee(attendee: AttendeeEntity): Promise<void> {
    await this.post(url + teamsPath + "/" + attendee.teamId + "/" + attendeesPath, attendee.toJson());
  }

  public static async getAttendeesForTeam(teamId: string): Promise<AttendeeEntity[]> {
    let data = await this.get(url + teamsPath + "/" + teamId + "/" + attendeesPath);
    return data.map(AttendeeEntity.fromJson);
  }

  static post = async (url: string, body: any) => {
    try {
      await fetch(url, {
        method: "POST",
        body: body,
        headers: {
          "Content-Type": "application/json"
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  static get = async (url: string) => {
    let data = await fetch(url);
    return await data.json();
  }
}