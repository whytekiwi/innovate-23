import React from "react";
import {AttendeeEntity} from "../../../models/attendeeEntity";
import "./attendeeListItem.css";
import {Button} from "reactstrap";
import Tick from "../../shared/icons/tick";
import Remote from "../../shared/icons/remote";

export interface IAttendeeListItemProps {
  attendee: AttendeeEntity;
  isEdit?: boolean;
  onAttendeeEdit: (attendee: AttendeeEntity) => void;
  onAttendeeSelected: (attendee: AttendeeEntity) => void;
}

const AttendeeListItem: React.FC<IAttendeeListItemProps> = (props) => {
  const {attendee, isEdit, onAttendeeEdit, onAttendeeSelected} = props;

  const handleAttendeeClicked = async () => {
    onAttendeeSelected(attendee);
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

  const renderState = () => {
    switch (attendee.photoConsent) {
      case "yes":
      case "no":
        return <Tick/>;
      case "remote":
        return <Remote/>;
    }
  }

  return (
    <div className={className()} onClick={handleAttendeeClicked}>
      {attendee.profilePictureUrl.value &&
          <img className="profile" src={attendee.profilePictureUrl.value} alt="Profile"/>}
      <div className="attendee-details">
        <div>
          <div className="name">{attendee.name.value}</div>
          <div className="job-title">{attendee.jobTitle.value}</div>
        </div>
        <div className="status">
          {attendee.hasSignedInToday && renderState()}
        </div>
      </div>
      {isEdit && <Button onClick={handleAttendeeEdit}>Edit</Button>}
    </div>
  );
};

export default AttendeeListItem;