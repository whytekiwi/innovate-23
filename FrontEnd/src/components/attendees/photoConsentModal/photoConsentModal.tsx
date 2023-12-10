import React, {useState} from "react";
import {
  Alert,
  Button,
  Fade,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader
} from "reactstrap";
import QRCode from "qrcode.react";
import {ConsentState} from "../../../models/consentState";
import "./photoConsentModal.css";

export interface IPhotoConsentModalProps {
  onConsent?: (consentState: ConsentState) => void;
  toggle: () => void;
  isOpen: boolean;
}

const PhotoConsentModal: React.FC<IPhotoConsentModalProps> = (props) => {
  const {isOpen, toggle, onConsent} = props;

  const [hasConsent, setHasConsent] = useState<ConsentState | null>();

  const handleConsentState = (hasConsent: ConsentState) => {
    setHasConsent(hasConsent);
  }

  return (
    <Modal isOpen={isOpen} toggle={toggle} className={"photo-consent-modal"}>
      <ModalHeader>Photo Consent Form</ModalHeader>
      <ModalBody>
        <p>Thanks for coming along to Innovate 2023!</p>
        <p>Innovate is one of our favourite events for the year, and we love to celebrate the people and the innovation.
          This means you'll occasionally see photographers floating around taking photos.</p>
        <p>Can you confirm if you're happy for your photo to be included in any outgoing media related to innovate?</p>

        <div className="qr-card">
          See more details here:
          <QRCode
            value="https://ryman.sharepoint.com/sites/library/LibraryItems/Forms/AllItems.aspx?id=%2Fsites%2Flibrary%2FLibraryItems%2FActivities%20Photo%20Consent%20Form%2Epdf&parent=%2Fsites%2Flibrary%2FLibraryItems"/>
        </div>

        <Form className="form-body">
          <FormGroup>
            <Input type={"radio"} id="yes" name="consent" checked={hasConsent === "yes"}
                   onChange={() => handleConsentState("yes")}/>
            <Label for="yes">
              Yes, I consent to my photo being used.
            </Label>
          </FormGroup>
          <FormGroup>
            <Input type={"radio"} id="no" name="consent" checked={hasConsent === "no"}
                   onChange={() => handleConsentState("no")}/>
            <Label for="no">
              No, please avoid taking my photo.
            </Label>
          </FormGroup>
          <FormGroup>
            <Input type={"radio"} name="consent" id="remote" checked={hasConsent === "remote"}
                   onChange={() => handleConsentState("remote")}/>
            <Label for="remote">
              I will be remote for Innovate.
            </Label>
          </FormGroup>
        </Form>

        {hasConsent === "no" && (
          <Fade in={true}>
            <Alert color="danger">
              Please take a red lanyard from the registration desk, to let the photographers know to avoid taking your
              photo.<br/><br/>

              You must keep this lanyard visible at all times.
            </Alert>
          </Fade>
        )}
      </ModalBody>
      <ModalFooter>
        <Button onClick={() => onConsent?.(hasConsent!)} disabled={hasConsent === undefined}
                color="primary">Submit</Button>
      </ModalFooter>
    </Modal>
  )
};

export default PhotoConsentModal;