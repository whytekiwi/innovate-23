import React, {useEffect, useState} from "react";
import {AttendeeCounts} from "../../../models/attendeeCounts";
import "./attendeeCountDisplay.css";
import AttendeeService from "../../../services/attendeeService";
import Connector from "../../../services/signalr-connection";

const AttendeeCountsDisplay = () => {
  const [counts, setAttendeeCounts] = useState<AttendeeCounts>();

  const {onAttendeeUpdated} = Connector();


  useEffect(() => {
    async function loadCounts() {
      const counts = await AttendeeService.getAttendeeCounts();
      setAttendeeCounts(counts);
    }

    loadCounts();
    onAttendeeUpdated(() => loadCounts());
  }, [onAttendeeUpdated]);

  return (
    <div className="attendee-counts">
      <span>{counts?.total}</span>
      <span className="signed-in">{counts?.signedIn}</span>
      <span className="remote">{counts?.remoteSignedIn}</span>
    </div>
  );
}

export default AttendeeCountsDisplay;