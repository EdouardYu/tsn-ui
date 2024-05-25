import { FunctionComponent } from "react";
import "@/components/layout/header/Header.css";
import Logo from "/logo.svg";

const AuthenticationHeader: FunctionComponent = () => {
  return (
    <header className="header">
      <div className="header-left">
        <img src={Logo} alt="Logo" className="header-logo" />
        <span className="header-title">Tailored Social Network</span>
      </div>
    </header>
  );
};

export default AuthenticationHeader;
