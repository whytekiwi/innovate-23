import {TextObservable} from "./observables/textObservable";

export class AttendeeEntity {

  id?: string;
  teamId: string;

  name: TextObservable;
  jobTitle: TextObservable;
  profilePictureUrl: TextObservable;

  hasSignedInToday?: boolean;

  static fromJson(json: any): AttendeeEntity {
    return new AttendeeEntity(json.teamId, json.id, json.name, json.jobTitle, json.profilePictureUrl, json.hasSignedInToday);
  }

  toJson(): string {
    return JSON.stringify({
      id: this.id,
      teamId: this.teamId,
      name: this.name.value,
      jobTitle: this.jobTitle.value,
      profilePictureUrl: this.profilePictureUrl.value
    });
  }

  constructor(teamId: string,
              id?: string,
              name?: string,
              jobTitle?: string,
              profilePictureUrl?: string,
              hasSignedInToday?: boolean) {
    this.id = id;
    this.teamId = teamId;
    this.name = new TextObservable(name);
    this.jobTitle = new TextObservable(jobTitle);
    this.profilePictureUrl = new TextObservable(profilePictureUrl);
    this.hasSignedInToday = hasSignedInToday;
  }
}