import React, {useEffect} from 'react';
import TeamsGrid from "../../components/teams/teamsGrid/teamsGrid";
import {Input, InputGroup, InputGroupText, Navbar, NavbarBrand} from "reactstrap";
import AttendeeCountDisplay from "../../components/attendees/attendeeCountDisplay/attendeeCountDisplay";
import {useStores} from "../../stores/rootStore";
import {observer} from "mobx-react";
import './attendeesPage.css';

function AttendeesPage() {

  const {attendeeDomainStore} = useStores();
  const searchText = attendeeDomainStore.searchText;

  useEffect(() => {
    return (() => {
      attendeeDomainStore.setSearchText("");
    })
  }, [attendeeDomainStore]);

  const onSearchTextChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    attendeeDomainStore.setSearchText(event.target.value);
  }

  return (
    <div className="attendees-page">
      <Navbar fixed="top" dark={true}>
        <NavbarBrand>
          <span className="innovate">
            Innovate
          </span>
          <span className="year">
            23
          </span>
        </NavbarBrand>
        <div className="col-sm-5 right">
          <AttendeeCountDisplay/>
          <InputGroup>
            <Input value={searchText} onChange={onSearchTextChanged} type="text"/>
            <InputGroupText>Search</InputGroupText>
          </InputGroup>
        </div>
      </Navbar>
      <TeamsGrid/>
    </div>
  );
}

export default observer(AttendeesPage);
