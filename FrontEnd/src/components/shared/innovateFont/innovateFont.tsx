import React, {PropsWithChildren} from "react";
import "./innovateFont.css"

export interface IInnovateFontProps {
  className?: string;
}

const InnovateFont = ({className, children}: PropsWithChildren<IInnovateFontProps>) => {
  const renderClass = className ? `innovate-font ${className}` : "innovate-font";

  return <span className={renderClass}>{children}</span>
}

export default InnovateFont;