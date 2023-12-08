import React, {useMemo, useState} from 'react';
import TeamsGrid from "../../components/teams/teamsGrid/teamsGrid";
import {Input, InputGroup, InputGroupText, Navbar, NavbarBrand} from "reactstrap";
import InnovateFont from "../../components/shared/innovateFont/innovateFont";
import './attendeesPage.css';

function AttendeesPage() {

  const [searchText, setSearchText] = useState("");

  const onSearchTextChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  }

  return (
    <div className="attendees-page">
      <Navbar fixed="top" dark={true}>
        <NavbarBrand><InnovateFont>Innovate</InnovateFont></NavbarBrand>
        <div className="col-sm-5">
          <InputGroup>
            <Input value={searchText} onChange={onSearchTextChanged}/>
            <InputGroupText>Search</InputGroupText>
          </InputGroup>
        </div>
      </Navbar>
      <TeamsGrid searchText={searchText}/>
    </div>
  );
}

export default AttendeesPage;
