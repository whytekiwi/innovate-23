import React from "react";
import {TeamEntity} from "../../../models/teamEntity";
import AttendeeGrid from "../../attendees/attendeeGrid/attendeeGrid";
import {Button} from "reactstrap";
import "./teamListItem.css"
import InnovateFont from "../../shared/innovateFont/innovateFont";

export interface ITeamListItemProps {
  team: TeamEntity;
  isEdit?: boolean;
  onEditTeam: (team: TeamEntity) => void;
  searchText?: string;
}

const TeamListItem: React.FC<ITeamListItemProps> = (props) => {
  const {team, isEdit, onEditTeam, searchText} = props;

  const handleEditTeam = () => {
    onEditTeam(team);
  }

  return (
    <div className="team-list">
      <div>
        <InnovateFont className="name">{team.name.value}</InnovateFont>
        <div className="problem">
          {team.problemStatement.value}
        </div>
        {isEdit && <Button onClick={handleEditTeam}>Edit</Button>}
      </div>
      {team.id && <AttendeeGrid isEdit={isEdit} teamId={team.id} searchText={searchText}/>}
    </div>
  )
    ;
}

export default TeamListItem;