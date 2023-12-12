import {AttendeeEntity} from "../models/attendeeEntity";
import {makeAutoObservable, reaction, runInAction} from "mobx";
import {TeamEntity} from "../models/teamEntity";
import AttendeeService from "../services/attendeeService";
import {AttendeeCounts} from "../models/attendeeCounts";

export class AttendeeDomainStore {

  selectedAttendee?: AttendeeEntity;
  isSwitchingAttendee: boolean = false;

  isLoadingCounts: boolean = false;
  attendeeCounts?: AttendeeCounts;

  isLoadingTeams: boolean = false;
  teams?: TeamEntity[];

  private attendees: Map<string, AttendeeEntity[]>;
  private isLoadingAttendees: Map<string, boolean> = new Map<string, boolean>();

  attendeesForTeam(teamId: string): AttendeeEntity[] | undefined {
    return this.attendees.get(teamId);
  }

  isLoadingAttendeesForTeam(teamId: string): boolean {
    return this.isLoadingAttendees.get(teamId) || false;
  }

  private timeoutId?: NodeJS.Timeout;

  constructor() {
    makeAutoObservable(this);

    this.attendees = new Map<string, AttendeeEntity[]>();

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

  async loadTeams() {
    if (this.isLoadingTeams) return;
    this.isLoadingTeams = true;
    const teams = await AttendeeService.getTeams();
    runInAction(() => {
      this.teams = teams;
      this.isLoadingTeams = false;
    });
  }

  async loadAttendeesForTeam(teamId: string) {
    if (this.isLoadingAttendeesForTeam(teamId)) return;
    this.isLoadingAttendees.set(teamId, true);
    const attendees = await AttendeeService.getAttendeesForTeam(teamId);
    runInAction(() => {
      this.isLoadingAttendees.set(teamId, false);
      this.attendees.set(teamId, attendees);
    });
  }

  async loadCounts() {
    this.isLoadingCounts = true;
    const counts = await AttendeeService.getAttendeeCounts();
    runInAction(() => {
      this.attendeeCounts = counts;
      this.isLoadingCounts = false;
    })
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

  onTeamUpdated(team: TeamEntity) {
    this.teams = this.teams?.map(t => t.id === team.id ? team : t);
  }

  onAttendeeAdded(attendee: AttendeeEntity) {
    const attendees = this.attendees.get(attendee.teamId) ?? [];
    attendees?.push(attendee);
    this.attendees.set(attendee.teamId, attendees);
  }

  onAttendeeUpdated(attendee: AttendeeEntity) {
    let attendees = this.attendees.get(attendee.teamId) ?? [];
    attendees = attendees.map(a => a.id === attendee.id ? attendee : a)
    this.attendees.set(attendee.teamId, attendees);
  }

  onAttendeeRemoved(attendeeId: string, teamId: string) {
    let attendees = this.attendees.get(teamId) ?? [];
    attendees = attendees.filter(at => at.id !== attendeeId);
    this.attendees.set(teamId, attendees);
  }

  resetAll() {
    this.teams = undefined;
    this.attendees = new Map<string, AttendeeEntity[]>();
  }
}