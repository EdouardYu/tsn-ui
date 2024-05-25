import { FunctionComponent, useState } from "react";
import { useNavigate } from "react-router-dom";
import "@/components/layout/header/Header.css";
import Logo from "/logo.svg";
import SearchIcon from "@/assets/search.svg";
import HomeIcon from "@/components/icons/Home";
import FriendsIcon from "@/components/icons/Friends";

const LogedHeader: FunctionComponent = () => {
  const [active, setActive] = useState<string>("home");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/authentication/login");
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <header className="header">
      <div className="header-left">
        <img src={Logo} alt="Logo" className="header-logo" />
        <div className="header-search-container">
          <img
            src={SearchIcon}
            alt="Search Icon"
            className="header-search-icon"
          />
          <input
            type="text"
            placeholder="Search on Tailored Social Network"
            className="header-search"
          />
        </div>
      </div>
      <div className="header-center">
        <div
          className={`header-item ${active === "home" ? "active" : ""}`}
          onClick={() => setActive("home")}
        >
          <HomeIcon />
          <div className="tooltip">Home</div>
        </div>
        <div
          className={`header-item ${active === "friends" ? "active" : ""}`}
          onClick={() => setActive("friends")}
        >
          <FriendsIcon />
          <div className="tooltip">Friends</div>
        </div>
      </div>
      <div className="header-right">
        <div className="header-item profile-container" style={{ padding: 0 }}>
          <img
            src="https://randomuser.me/api/portraits/men/33.jpg"
            alt="Profile"
            className="header-profile-icon"
            onClick={toggleDropdown}
          />
          <div className="tooltip">Profile</div>
          {showDropdown && (
            <div className="dropdown-menu">
              <div onClick={handleProfileClick} className="dropdown-item">
                Profile
              </div>
              <div onClick={handleLogout} className="dropdown-item">
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default LogedHeader;
