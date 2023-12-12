import React from 'react';
import InnovateFont from "../../components/shared/innovateFont/innovateFont";
import {useStores} from "../../stores/rootStore";
import {observer} from "mobx-react";
import {Fade} from "reactstrap";
import "./welcome.css";

function Welcome() {

  const {attendeeDomainStore} = useStores();

  const attendee = attendeeDomainStore.selectedAttendee;

  const formatClass = () => {
    const classNames = ["attendee"];
    if (attendeeDomainStore.attendeeIsVisible)
      classNames.push("show");
    return classNames.join(" ");
  }

  return (
    <div className="welcome">
      <div className={formatClass()}>
        {attendee && (
          <>
            {attendee.profilePictureUrl?.value &&
                <img className="profile" src={attendee.profilePictureUrl.value} alt="Profile"/>}
            <div className="details">
              <InnovateFont className="name">{attendee.name?.value}</InnovateFont>
              <div className="title">{attendee.jobTitle?.value}</div>
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

      <Fade in={!attendee} id="placeholder">
        <InnovateFont className="title">Welcome to Innovate</InnovateFont>
        <span id="loading">Loading attendee...</span>
      </Fade>
      <div id="decorations">
        <img src="/box.webp" alt="Box" id="box"/>
        <img src="/halo.png" alt="Halo" id="halo"/>
        <div id="innovate-brand">
          <span>Technology’s biggest event</span>
          <InnovateFont id="brand">Innovate</InnovateFont>
        </div>
      </div>
    </div>
  );
}

export default observer(Welcome);