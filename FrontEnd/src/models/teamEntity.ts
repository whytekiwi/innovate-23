import {TextObservable} from "./observables/textObservable";

export class TeamEntity {
  id?: string;
  name: TextObservable;
  problemStatement: TextObservable;

  constructor(id?: string, name?: string, problemStatement?: string) {
    this.id = id;
    this.name = new TextObservable(name);
    this.problemStatement = new TextObservable(problemStatement)
  }

  static fromJson(json: any): TeamEntity {
    return new TeamEntity(json.id, json.name, json.problemStatement);
  }

  toJson(): string {
    return JSON.stringify({
      id: this.id,
      name: this.name.value,
      problemStatement: this.problemStatement.value
    });
  }
}