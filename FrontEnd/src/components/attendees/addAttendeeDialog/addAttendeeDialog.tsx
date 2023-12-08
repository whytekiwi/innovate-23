import React, {FormEvent, useState} from "react";
import AttendeeService from "../../../services/attendeeService";
import {Button, Form, FormGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import ObservableInput from "../../shared/observableInput/observableInput";
import {AttendeeEntity} from "../../../models/attendeeEntity";
import LoadingSpinner from "../../shared/loadingSpinner/loadingSpinner";

export interface IAddAttendeeDialogProps {
  toggle: () => void;
  isOpen: boolean;
  attendee: AttendeeEntity;
}

const AddAttendeeDialog: React.FC<IAddAttendeeDialogProps> = (props) => {

  const {toggle, isOpen, attendee} = props;
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const title = attendee.id ? "Edit Attendee" : "Add New Attendee";

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.stopPropagation();
    setIsSaving(true);
    await AttendeeService.postAttendee(attendee);
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
          {isSaving && <LoadingSpinner/>}
        </ModalBody>
        <ModalFooter>
          <Button type="submit">Save</Button>
          {attendee.id && (
            <Button onClick={handleDelete} color="danger">Delete</Button>
          )}
        </ModalFooter>
      </Form>
    </Modal>
  )
    ;
}

export default AddAttendeeDialog;