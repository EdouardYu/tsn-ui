import { FunctionComponent, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "@/components/layout/header/Header.css";
import Logo from "/logo.svg";
import SearchIcon from "@/assets/search.svg";
import HomeIcon from "@/components/icons/Home";
import FriendsIcon from "@/components/icons/Friends";
import CertifiedBadge from "@/components/icons/CertifiedBadge";
import UserService from "@/services/UserService";
import AuthService from "@/services/AuthService";

interface JwtPayload {
  id: string;
  picture: string;
}

interface User {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  picture: string;
  role: string;
}

const LogedHeader: FunctionComponent = () => {
  const [active, setActive] = useState<string>("home");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<JwtPayload | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileIconRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const path = location.pathname.split("/")[1];
    setActive(path || "home");

    const token = localStorage.getItem("authToken");
    if (token) {
      const payload: JwtPayload = JSON.parse(atob(token.split(".")[1]));
      setUserInfo(payload);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        !dropdownRef.current?.contains(event.target as Node) &&
        !searchRef.current?.contains(event.target as Node) &&
        !profileIconRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [location]);

  const handleLogout = async () => {
    await AuthService.signout();
    localStorage.removeItem("authToken");
    setShowDropdown(false);
    navigate("/authentication/login");
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown((prevState) => !prevState);
    if (!showDropdown) {
      setShowSearchResults(false);
    }
  };

  const handleProfileClick = () => {
    if (userInfo) {
      navigate(`/profile/${userInfo.id}`);
      setShowDropdown(false);
    }
  };

  const handleNavigation = (path: string) => {
    setActive(path);
    navigate(path);
  };

  const handleSearchChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value.length >= 2) {
      try {
        let usersData = await UserService.searchUsers(value);

        if (userInfo) {
          usersData = usersData.sort((a: User, b: User) =>
            a.id === parseInt(userInfo.id)
              ? -1
              : b.id === parseInt(userInfo.id)
              ? 1
              : 0
          );
        }

        setSearchResults(usersData);
        setShowSearchResults(true);
      } catch (error) {
        console.error("Error fetching search results", error);
        setShowSearchResults(false);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSearchClick = () => {
    if (searchTerm.length >= 2) {
      setShowSearchResults(true);
    }
    setShowDropdown(false);
  };

  const handleUserClick = (userId: number) => {
    navigate(`/profile/${userId}`);
    setShowSearchResults(false);
  };

  const getBadgeColor = (role: string) => {
    switch (role) {
      case "ADMINISTRATOR":
        return "#ffd700";
      case "CERTIFIED_USER":
        return "#1d9bf0";
      default:
        return "transparent";
    }
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
        <div className="header-search-container" ref={searchRef}>
          <img
            src={SearchIcon}
            alt="Search Icon"
            className="header-search-icon"
          />
          <input
            type="text"
            placeholder="Search on Tailored Social Network"
            className="header-search"
            value={searchTerm}
            onChange={handleSearchChange}
            onClick={handleSearchClick}
          />
          {showSearchResults && (
            <div className="search-results">
              {searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="search-result-item"
                    onClick={() => handleUserClick(user.id)}
                  >
                    <img
                      src={user.picture}
                      alt={user.username}
                      className="search-result-image"
                    />
                    <div className="search-result-info">
                      <div className="search-result-username">
                        {user.id === parseInt(userInfo?.id || "")
                          ? "You"
                          : user.username}
                        {user.role !== "USER" && (
                          <CertifiedBadge
                            color={getBadgeColor(user.role)}
                            className="certified-badge"
                          />
                        )}
                      </div>
                      {user.id !== parseInt(userInfo?.id || "") && (
                        <div className="search-result-fullname">
                          {user.firstname} {user.lastname}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="search-result-item">No matching users</div>
              )}
            </div>
          )}
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
              ref={profileIconRef}
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown(e);
              }}
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
