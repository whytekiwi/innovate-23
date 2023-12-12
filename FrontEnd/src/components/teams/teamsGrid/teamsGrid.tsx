import React, {useEffect, useState} from "react";
import {TeamEntity} from "../../../models/teamEntity";
import TeamListItem from "../teamListItem/teamListItem";
import AddTeamDialog from "../addTeamDialog/addTeamDialog";
import {Button} from "reactstrap";
import {useStores} from "../../../stores/rootStore";
import {observer} from "mobx-react";
import "./teamsGrid.css"
import LoadingSpinner from "../../shared/loadingSpinner/loadingSpinner";

export interface ITeamsGridProps {
  isEdit?: boolean;
  searchText?: string;
}

const TeamsGrid: React.FC<ITeamsGridProps> = (props) => {
  const {isEdit, searchText} = props;

  const {attendeeDomainStore} = useStores();
  const isLoading = attendeeDomainStore.isLoadingTeams;
  const teams = attendeeDomainStore.teams;

  useEffect(() => {
    if (!teams && !attendeeDomainStore.isLoadingTeams)
      attendeeDomainStore.loadTeams();
  }, [attendeeDomainStore, teams]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamEntity>(new TeamEntity());

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
      {isLoading && <LoadingSpinner/>}
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
            selectedTeam={selectedTeam}/>
        </>
      )}
    </div>
  );
}

export default observer(TeamsGrid);