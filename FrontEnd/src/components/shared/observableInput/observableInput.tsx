import {TextObservable} from "../../../models/observables/textObservable";
import {Input} from "reactstrap";
import {ChangeEvent, useState} from "react";

export interface IObservableInputProps {
  value: TextObservable;
  isRequired?: boolean;
}

const ObservableInput: React.FC<IObservableInputProps> = (props) => {

  const {value, isRequired} = props;
  const [text, setText] = useState<string>(value.value ?? "");

  const handleTextChanged = (event: ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
    value.value = event.target.value;
  }

  return <Input value={text} onChange={handleTextChanged} required={isRequired}/>
};

export default ObservableInput;