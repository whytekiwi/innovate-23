import React, {useEffect} from "react";
import {useStores} from "../../../stores/rootStore";
import "./attendeeCountDisplay.css";
import {observer} from "mobx-react";

const AttendeeCountsDisplay = () => {

  const {attendeeDomainStore} = useStores();
  const counts = attendeeDomainStore.attendeeCounts;


  useEffect(() => {
    if (!counts && !attendeeDomainStore.isLoadingCounts)
      attendeeDomainStore.loadCounts();
  }, [attendeeDomainStore, counts]);

  return (
    <div className="attendee-counts">
      {counts &&
          <>
              <span>{counts?.total}</span>
              <span className="signed-in">{counts?.signedIn}</span>
              <span className="remote">{counts?.remoteSignedIn}</span>
          </>
      }
    </div>
  );
}

export default observer(AttendeeCountsDisplay);