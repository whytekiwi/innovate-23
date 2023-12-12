import React, {FormEvent, useState} from "react";
import AttendeeService from "../../../services/attendeeService";
import {
  Button,
  Form,
  FormGroup, Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader
} from "reactstrap";
import ObservableInput from "../../shared/observableInput/observableInput";
import {AttendeeEntity} from "../../../models/attendeeEntity";
import LoadingSpinner from "../../shared/loadingSpinner/loadingSpinner";
import {useStores} from "../../../stores/rootStore";

export interface IAddAttendeeDialogProps {
  toggle: () => void;
  isOpen: boolean;
  attendee: AttendeeEntity;
}

const AddAttendeeDialog: React.FC<IAddAttendeeDialogProps> = (props) => {

  const {toggle, isOpen, attendee} = props;
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [selectedTeam, setSelectedTeam] = useState<string>();

  const {attendeeDomainStore} = useStores();
  const teams = attendeeDomainStore
    .teams?.filter(t => t.id !== attendee.teamId) || [];

  const title = attendee.id ? "Edit Attendee" : "Add New Attendee";

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.stopPropagation();
    setIsSaving(true);
    await AttendeeService.postAttendee(attendee, selectedTeam);
    setIsSaving(false);
    toggle();
  };


  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsSaving(true);
    await AttendeeService.deleteAttendee(attendee);
    setIsSaving(false);
    toggle();
  }

  const handleTeamSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTeam(e.target.value);
  }


  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <Form method="dialog" onSubmit={handleFormSubmit}>
        <ModalHeader toggle={toggle}>{title}</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>
              Name
            </Label>
            <ObservableInput value={attendee.name} isRequired={true}/>
          </FormGroup>
          <FormGroup>
            <Label>
              Job Title
            </Label>
            <ObservableInput value={attendee.jobTitle} isRequired={true}/>
          </FormGroup>
          <FormGroup>
            <Label>
              Profile Picture URL
            </Label>
            <ObservableInput value={attendee.profilePictureUrl} isRequired={true}/>
          </FormGroup>
          {attendee.id &&
              <FormGroup>
                  <Label>
                      Move to team
                  </Label>
                  <Input
                      name="team"
                      type="select"
                      defaultValue="-1"
                      onChange={handleTeamSelect}
                  >
                      <option value="-1" disabled hidden>Select a team...</option>
                    {teams.map(t => (
                      <option value={t.id} key={t.id}>
                        {t.name.value}
                      </option>))}
                  </Input>
              </FormGroup>
          }
          {isSaving && <LoadingSpinner/>}
        </ModalBody>
        <ModalFooter>
          {attendee.id && (
            <Button onClick={handleDelete} color="danger">Delete</Button>
          )}
          <Button type="submit">Save</Button>
        </ModalFooter>
      </Form>
    </Modal>
  )
    ;
}

export default AddAttendeeDialog;