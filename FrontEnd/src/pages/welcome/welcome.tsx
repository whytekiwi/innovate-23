import React, {useEffect, useState} from 'react';
import Connector from '../../services/signalr-connection';
import {AttendeeEntity} from "../../models/attendeeEntity";
import "./welcome.css";
import InnovateFont from "../../components/shared/innovateFont/innovateFont";

function Welcome() {
  const {onAttendeeSelected} = Connector();

  const [attendee, setAttendee] = useState<AttendeeEntity>();
  const [showAttendee, setShowAttendee] = useState<boolean>(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();

  useEffect(() => {

      const delay = (task: () => void, ms: number) => {

        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        return new Promise<void>((resolve) => {
          const id = setTimeout(() => {
            task();
            resolve();
          }, ms);
          setTimeoutId(id);
        });
      }

      const clearAttendee = () => {

        setShowAttendee(false);

        return delay(() => {
          setAttendee(undefined);
        }, 1200);
      }

      const setAttendeeAndShow = (attendee?: AttendeeEntity) => {
        setAttendee(attendee);
        setShowAttendee(true);


        delay(() => {
          clearAttendee();
        }, 6000);
      }

      const handleAttendeeSelected = async (newAttendee?: AttendeeEntity) => {
        if (attendee) {

          setShowAttendee(false);

          return delay(() => {
            setAttendeeAndShow(newAttendee);
          }, 1200);
        } else {
          setAttendeeAndShow(newAttendee);
        }
      }

      onAttendeeSelected((attendee) => handleAttendeeSelected(attendee))
    }, [onAttendeeSelected, attendee, timeoutId]
  )

  return (
    <div className="welcome">
      <div className={`attendee ${showAttendee && "show"}`}>
        {attendee && (
          <>
            {attendee.profilePictureUrl?.value &&
                <img className="profile" src={attendee.profilePictureUrl.value} alt="Profile"/>}
            <div className="details">
              <InnovateFont className="name">{attendee.name?.value}</InnovateFont>
              <div className="title">{attendee.jobTitle?.value}</div>
            </div>
            {/*<div id="confettis">*/}
            {/*  <div className="confetti"></div>*/}
            {/*  <div className="confetti"></div>*/}
            {/*  <div className="confetti"></div>*/}
            {/*  <div className="confetti"></div>*/}
            {/*  <div className="confetti"></div>*/}
            {/*  <div className="confetti"></div>*/}
            {/*  <div className="confetti"></div>*/}
            {/*  <div className="confetti"></div>*/}
            {/*  <div className="confetti"></div>*/}
            {/*  <div className="confetti"></div>*/}
            {/*</div>*/}
          </>
        )}
      </div>
      {/*<div id="decorations">*/}
      {/*  <img src="/box.webp" alt="Box"/>*/}
      {/*</div>*/}
    </div>
  );
}

export default Welcome;