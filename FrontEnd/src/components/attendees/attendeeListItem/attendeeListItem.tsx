import React, {useState} from "react";
import {AttendeeEntity} from "../../../models/attendeeEntity";
import "./attendeeListItem.css";
import AttendeeService from "../../../services/attendeeService";
import {Button} from "reactstrap";
import PhotoConsentModal from "../photoConsentModal/photoConsentModal";
import {ConsentState} from "../../../models/consentState";

export interface IAttendeeListItemProps {
  attendee: AttendeeEntity;
  isEdit?: boolean;
  onAttendeeEdit: (attendee: AttendeeEntity) => void;
}

const AttendeeListItem: React.FC<IAttendeeListItemProps> = (props) => {
  const {attendee, isEdit, onAttendeeEdit} = props;

  // const handleAttendeeClicked = async () => {
  //   if (!isEdit)
  //     handleOpenModal();
  // }

  const handleAttendeeClicked = async () => {
    await AttendeeService.selectAttendee(attendee.teamId, attendee.id, true);
  }

  const handlePhotoConsent = async (givesConsent?: ConsentState) => {
    await AttendeeService.selectAttendee(attendee.teamId, attendee.id, true);
    handleCloseModal();
  }

  const [isModalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => {
    setModalOpen(true);
  }

  const handleCloseModal = () => {
    setModalOpen(false);
  }

  const handleAttendeeEdit = () => {
    onAttendeeEdit(attendee);
  }

  const className = (): string => {
    let classes = [
      "attendee-list-item"
    ];
    if (attendee.hasSignedInToday)
      classes.push("signed-in");

    return classes.join(" ");
  }

  return (
    <div className={className()} onClick={handleAttendeeClicked}>
      {attendee.profilePictureUrl.value &&
          <img className="profile" src={attendee.profilePictureUrl.value} alt="Profile"/>}
      <div>
        <div>{attendee.name.value}</div>
        <div>{attendee.jobTitle.value}</div>
        {isEdit && <Button onClick={handleAttendeeEdit}>Edit</Button>}
      </div>
      <PhotoConsentModal toggle={handleCloseModal} isOpen={isModalOpen} onConsent={handlePhotoConsent}/>
    </div>
  );
};

export default AttendeeListItem;