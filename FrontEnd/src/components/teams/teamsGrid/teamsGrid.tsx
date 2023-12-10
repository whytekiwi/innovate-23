import React, {useEffect, useState} from "react";
import {TeamEntity} from "../../../models/teamEntity";
import AttendeeService from "../../../services/attendeeService";
import TeamListItem from "../teamListItem/teamListItem";
import AddTeamDialog from "../addTeamDialog/addTeamDialog";
import {Button} from "reactstrap";
import Connector from "../../../services/signalr-connection";
import "./teamsGrid.css"

export interface ITeamsGridProps {
  isEdit?: boolean;
  searchText?: string;
}

const TeamsGrid: React.FC<ITeamsGridProps> = (props) => {
  const {isEdit, searchText} = props;
  const {onAttendeeUpdated} = Connector();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [teams, setTeams] = useState<TeamEntity[]>();
  const [selectedTeam, setSelectedTeam] = useState<TeamEntity>(new TeamEntity());

  async function loadTeams() {
    const teams = await AttendeeService.getTeams();
    setTeams(teams);
    setIsLoading(false);
  }

  useEffect(() => {
    loadTeams();
    onAttendeeUpdated(() => loadTeams());
  }, [onAttendeeUpdated]);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  }
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedTeam(new TeamEntity());
  }

  const handleEditTeam = (team: TeamEntity) => {
    setSelectedTeam(team);
    setIsDialogOpen(true);
  }

  return (
    <div className="team-grid">
      {isLoading && <div>Loading...</div>}
      {teams && teams
        .map((team) => (
          <TeamListItem team={team} isEdit={isEdit} key={team.id} onEditTeam={handleEditTeam} searchText={searchText}/>
        ))}
      {isEdit && (
        <>
          <Button onClick={handleOpenDialog}>Add new team</Button>
          <AddTeamDialog
            isOpen={isDialogOpen}
            toggle={handleCloseDialog}
            selectedTeam={selectedTeam}
            onTeamAdded={loadTeams}/>
        </>
      )}
    </div>
  );
}

export default TeamsGrid;