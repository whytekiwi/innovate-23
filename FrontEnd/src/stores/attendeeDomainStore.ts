import {AttendeeEntity} from "../models/attendeeEntity";
import {makeAutoObservable, reaction, runInAction} from "mobx";

export class AttendeeDomainStore {

  selectedAttendee?: AttendeeEntity;
  isSwitchingAttendee: boolean = false;

  private timeoutId?: NodeJS.Timeout;

  constructor() {
    makeAutoObservable(this);

    // Clear the selected attendee after delay
    reaction(
      () => this.selectedAttendee,
      () => {
        this.clearAttendee();
      }, {
        delay: 10000
      });
  }

  async selectAttendee(attendee: AttendeeEntity) {
    if (this.selectedAttendee) {
      await this.clearAttendee();
    }
    this.switchAttendee(attendee);
  }

  get attendeeIsVisible(): boolean {
    return !!this.selectedAttendee && !this.isSwitchingAttendee;
  }

  private switchAttendee(attendee: AttendeeEntity) {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.selectedAttendee = attendee;
    this.isSwitchingAttendee = false;
    this.timeoutId = undefined;
  }

  private async clearAttendee() {
    this.isSwitchingAttendee = true;
    return new Promise<void>((resolve) => {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }

      const timeoutId = setTimeout(() => {
        runInAction(() => {
          this.timeoutId = undefined;
          this.selectedAttendee = undefined;
          this.isSwitchingAttendee = false;
        });
        resolve();
      }, 1000);

      runInAction(() => this.timeoutId = timeoutId);
    });
  }
}