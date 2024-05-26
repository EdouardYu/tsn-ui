import { FunctionComponent, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "@/components/layout/header/Header.css";
import Logo from "/logo.svg";
import SearchIcon from "@/assets/search.svg";
import HomeIcon from "@/components/icons/Home";
import FriendsIcon from "@/components/icons/Friends";

interface JwtPayload {
  id: string;
  picture: string;
}

const LogedHeader: FunctionComponent = () => {
  const [active, setActive] = useState<string>("home");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<JwtPayload | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set active state based on the current path
    const path = location.pathname.split("/")[1];
    setActive(path || "home");

    // Decode JWT token and set user info
    const token = localStorage.getItem("authToken");
    if (token) {
      const payload: JwtPayload = JSON.parse(atob(token.split(".")[1]));
      setUserInfo(payload);
      console.log(payload);
    }

    // Close dropdown if clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setShowDropdown(false);
    navigate("/authentication/login");
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleProfileClick = () => {
    if (userInfo) {
      setShowDropdown(false);
      navigate(`/profile/${userInfo.id}`);
    }
  };

  const handleNavigation = (path: string) => {
    setActive(path);
    navigate(path);
  };

  return (
    <header className="header">
      <div className="header-left">
        <img
          src={Logo}
          alt="Logo"
          className="header-logo"
          onClick={() => handleNavigation("/")}
        />
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
          onClick={() => handleNavigation("/")}
        >
          <HomeIcon />
          <div className="tooltip">Home</div>
        </div>
        <div
          className={`header-item ${active === "friends" ? "active" : ""}`}
          onClick={() => handleNavigation("/friends")}
        >
          <FriendsIcon />
          <div className="tooltip">Friends</div>
        </div>
      </div>
      <div className="header-right">
        <div className="header-item profile-container" style={{ padding: 0 }}>
          {userInfo && (
            <img
              src={userInfo.picture}
              alt="Profile"
              className="header-profile-icon"
              onClick={toggleDropdown}
            />
          )}
          <div className="tooltip">Profile</div>
          {showDropdown && (
            <div className="dropdown-menu" ref={dropdownRef}>
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
