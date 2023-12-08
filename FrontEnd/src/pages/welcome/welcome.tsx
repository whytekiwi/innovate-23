import React, {useEffect, useState} from 'react';
import Connector from '../../services/signalr-connection';
import {AttendeeEntity} from "../../models/attendeeEntity";
import "./welcome.css";

function Welcome() {
  const {onAttendeeSelected} = Connector();

  const [attendee, setAttendee] = useState<AttendeeEntity>();

  function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeoutId: NodeJS.Timeout | null = null;

    return (...args: Parameters<F>): void => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => func(...args), waitFor);
    };
  }

  const handleAttendeeSelected = (attendee?: AttendeeEntity) => {
    setAttendee(attendee);

    // debounce(() => {
    //   setAttendee(undefined);
    // }, 30000)();
  }

  useEffect(() => {
    onAttendeeSelected((attendee) => handleAttendeeSelected(attendee))
  }, []);

  return (
    <div className="welcome">
      {attendee && (
        <>
          <div className="attendee">
            {attendee.profilePictureUrl?.value &&
                <img className="profile" src={attendee.profilePictureUrl.value} alt="Profile"/>}
            <div>
              <div className="name">{attendee.name?.value}</div>
              <div className="title">{attendee.jobTitle?.value}</div>
            </div>
          </div>
          <div id="confettis">
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
          </div>
        </>
      )}
    </div>
  );
}

export default Welcome;