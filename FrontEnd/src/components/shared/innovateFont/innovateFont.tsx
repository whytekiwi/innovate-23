import React, {PropsWithChildren} from "react";
import "./innovateFont.css"

export interface IInnovateFontProps {
  className?: string;
  id?: string;
}

const InnovateFont = ({className, id, children}: PropsWithChildren<IInnovateFontProps>) => {
  const renderClass = className ? `innovate-font ${className}` : "innovate-font";

  return <span id={id} className={renderClass}>{children}</span>
}

export default InnovateFont;