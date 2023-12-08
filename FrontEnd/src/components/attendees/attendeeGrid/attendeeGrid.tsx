import React, {useEffect, useState} from "react";
import {AttendeeEntity} from "../../../models/attendeeEntity";
import AttendeeListItem from "../attendeeListItem/attendeeListItem";
import {Button} from "reactstrap";
import AttendeeService from "../../../services/attendeeService";
import AddAttendeeDialog from "../addAttendeeDialog/addAttendeeDialog";
import LoadingSpinner from "../../shared/loadingSpinner/loadingSpinner";
import Connector from "../../../services/signalr-connection";
import "./attendeeGrid.css";

export interface IAttendeeGridProps {
  teamId: string;
  isEdit?: boolean;
  searchText?: string;
}

const AttendeeGrid: React.FC<IAttendeeGridProps> = (props) => {
  const {teamId, isEdit, searchText} = props;

  const {onAttendeeUpdated} = Connector();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [attendees, setAttendees] = useState<AttendeeEntity[]>([]);
  const [selectedAttendee, setSelectedAttendee] = useState<AttendeeEntity>(new AttendeeEntity(teamId));
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);


  useEffect(() => {
    const loadAttendees = async () => {
      const attendees = await AttendeeService.getAttendeesForTeam(teamId);
      setAttendees(attendees);
      setIsLoading(false);
    }

    loadAttendees();
    onAttendeeUpdated(() => loadAttendees());

  }, [teamId, onAttendeeUpdated]);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedAttendee(new AttendeeEntity(teamId));
  }

  const handleEditAttendee = (attendee: AttendeeEntity) => {
    setSelectedAttendee(attendee);
    setIsDialogOpen(true);
  }

  const searchTextLower = searchText?.toLowerCase() ?? "";
  const matchAttendee = (attendee?: AttendeeEntity): boolean => {
    const attendeeName = attendee?.name.value?.toLowerCase();
    if (attendeeName)
      return attendeeName.includes(searchTextLower);
    return false;
  }

  const filteredAttendees = (attendees && searchText) ? attendees.filter(matchAttendee) : attendees;

  return (
    <div className="attendee-grid">
      {isLoading && <LoadingSpinner/>}
      {filteredAttendees && filteredAttendees.map((attendee) => (
        <AttendeeListItem
          attendee={attendee}
          key={attendee.id}
          isEdit={isEdit}
          onAttendeeEdit={handleEditAttendee}/>
      ))}
      {isEdit && (
        <>
          <Button onClick={handleOpenDialog}>Add</Button>
          <AddAttendeeDialog
            toggle={handleCloseDialog}
            isOpen={isDialogOpen}
            attendee={selectedAttendee}
          />
        </>
      )}
    </div>
  );
};

export default AttendeeGrid;