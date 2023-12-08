import React, {FormEvent, useState} from "react";
import {TeamEntity} from "../../../models/teamEntity";
import AttendeeService from "../../../services/attendeeService";
import {Button, Form, FormGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import ObservableInput from "../../shared/observableInput/observableInput";
import LoadingSpinner from "../../shared/loadingSpinner/loadingSpinner";

export interface IAddTeamDialogProps {
  toggle: () => void;
  isOpen: boolean;
  selectedTeam: TeamEntity;
  onTeamAdded: () => void;
}

const AddTeamDialog: React.FC<IAddTeamDialogProps> = (props) => {

  const {toggle, isOpen, selectedTeam, onTeamAdded} = props;
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const title = selectedTeam.id ? "Edit Team" : "Add New Team";

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.stopPropagation();
    setIsSaving(true);
    await AttendeeService.postTeam(selectedTeam);
    setIsSaving(false);
    onTeamAdded();
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <Form method="dialog" onSubmit={handleFormSubmit}>
        <ModalHeader toggle={toggle}>{title}</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>
              Team name
            </Label>
            <ObservableInput value={selectedTeam.name} isRequired={true}/>
          </FormGroup>
          <FormGroup>
            <Label>
              Problem Statement
            </Label>
            <ObservableInput value={selectedTeam.problemStatement} isRequired={true}/>
          </FormGroup>
          {isSaving && <LoadingSpinner/>}
        </ModalBody>
        <ModalFooter>
          <Button type="submit">Save</Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

export default AddTeamDialog;