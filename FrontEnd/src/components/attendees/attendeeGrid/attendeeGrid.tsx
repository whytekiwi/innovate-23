import React, {useEffect, useState} from "react";
import {AttendeeEntity} from "../../../models/attendeeEntity";
import AttendeeListItem from "../attendeeListItem/attendeeListItem";
import {Button} from "reactstrap";
import AddAttendeeDialog from "../addAttendeeDialog/addAttendeeDialog";
import LoadingSpinner from "../../shared/loadingSpinner/loadingSpinner";
import PhotoConsentModal from "../photoConsentModal/photoConsentModal";
import {useStores} from "../../../stores/rootStore";
import {observer} from "mobx-react";
import "./attendeeGrid.css";

export interface IAttendeeGridProps {
  teamId: string;
  isEdit?: boolean;
  searchText?: string;
}

const AttendeeGrid: React.FC<IAttendeeGridProps> = (props) => {
  const {teamId, isEdit, searchText} = props;

  const {attendeeDomainStore} = useStores();
  const isLoading = attendeeDomainStore.isLoadingAttendeesForTeam(teamId);
  const attendees = attendeeDomainStore.attendeesForTeam(teamId);

  useEffect(() => {
    if (!attendees && !isLoading) {
      attendeeDomainStore.loadAttendeesForTeam(teamId);
    }
  }, [attendeeDomainStore, isLoading, attendees, teamId]);

  const [selectedAttendee, setSelectedAttendee] = useState<AttendeeEntity>();
  const [selectedEditAttendee, setSelectedEditAttendee] = useState<AttendeeEntity>(new AttendeeEntity(teamId));
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isConsentDialogOpen, setIsConsentDialogOpen] = useState<boolean>(false);

  const handleOpenEditDialog = () => {
    setIsEditDialogOpen(true);
  }

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedEditAttendee(new AttendeeEntity(teamId));
  }

  const handleEditAttendee = (attendee: AttendeeEntity) => {
    if (isEdit) {
      setSelectedEditAttendee(attendee);
      setIsEditDialogOpen(true);
    }
  }

  const handleAttendeeSelected = (attendee: AttendeeEntity) => {
    if (!isEdit) {
      setSelectedAttendee(attendee);
      setIsConsentDialogOpen(true);
    }
  }

  const handleCloseConsentModal = () => {
    setSelectedAttendee(undefined);
    setIsConsentDialogOpen(false);
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
          onAttendeeEdit={handleEditAttendee}
          onAttendeeSelected={handleAttendeeSelected}/>
      ))}
      {isEdit && (
        <>
          <Button onClick={handleOpenEditDialog}>Add</Button>
          <AddAttendeeDialog
            toggle={handleCloseEditDialog}
            isOpen={isEditDialogOpen}
            attendee={selectedEditAttendee}
          />
        </>
      )}
      {
        selectedAttendee &&
          <PhotoConsentModal attendee={selectedAttendee} toggle={handleCloseConsentModal} isOpen={isConsentDialogOpen}/>
      }
    </div>
  );
};

export default observer(AttendeeGrid);