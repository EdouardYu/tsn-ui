import { FunctionComponent, useState } from "react";
import Select, { MultiValue, SingleValue, StylesConfig } from "react-select";
import "@/pages/profile/Profile.css";
import VerifiedBadge from "@/components/icons/CertifiedBadge";

interface ProfileProps {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  username: string;
  birthday: string;
  gender: string;
  nationality: string;
  picture: string;
  bio: string;
  visibility: string;
  interests: string[];
  role: string; // 'admin', 'certified', 'user'
}

interface Option {
  value: string;
  label: string;
}

const initialProfile = {
  email: "johndoe@gmail.com",
  password: "Azerty",
  firstname: "John",
  lastname: "Doe",
  username: "johndoe",
  birthday: "1990-01-01",
  gender: "MALE",
  nationality: "American",
  picture: "https://randomuser.me/api/portraits/men/33.jpg",
  bio: "Hello, I am John Doe.",
  visibility: "PUBLIC",
  interests: ["coding", "music", "sports"],
  role: "admin", // Change this value to test different roles
};

const genderOptions: Option[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
];

const visibilityOptions: Option[] = [
  { value: "PUBLIC", label: "Public" },
  { value: "PRIVATE", label: "Private" },
];

const interestsOptions: Option[] = [
  { value: "coding", label: "Coding" },
  { value: "music", label: "Music" },
  { value: "sports", label: "Sports" },
  { value: "reading", label: "Reading" },
  { value: "travel", label: "Travel" },
];

const countryOptions: Option[] = [
  { value: "American", label: "United States" },
  { value: "French", label: "France" },
  { value: "German", label: "Germany" },
  { value: "Indian", label: "India" },
  // Ajoutez d'autres pays ici
];

const Profile: FunctionComponent = () => {
  const [profile, setProfile] = useState<ProfileProps>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [email, setEmail] = useState(profile.email);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleGenderChange = (newValue: SingleValue<Option>) => {
    setProfile({ ...profile, gender: newValue ? newValue.value : "" });
  };

  const handleNationalityChange = (newValue: SingleValue<Option>) => {
    setProfile({ ...profile, nationality: newValue ? newValue.value : "" });
  };

  const handleVisibilityChange = (newValue: SingleValue<Option>) => {
    setProfile({ ...profile, visibility: newValue ? newValue.value : "" });
  };

  const handleInterestsChange = (newValue: MultiValue<Option>) => {
    const selectedInterests = newValue.map((option) => option.value);
    setProfile({ ...profile, interests: selectedInterests });
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    // TODO: Implement the save functionality
    setIsEditing(false);
  };

  const handleEmailPopupClick = () => {
    setShowEmailPopup(true);
  };

  const handlePasswordPopupClick = () => {
    setShowPasswordPopup(true);
  };

  const closePopup = () => {
    setShowEmailPopup(false);
    setShowPasswordPopup(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const customSelectStyles: StylesConfig<Option, boolean> = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#fff",
      textAlign: "left",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#333",
    }),
    multiValue: (provided) => ({
      ...provided,
      paddingRight: isEditing ? 0 : 2,
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#333",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      display: isEditing ? "flex" : "none",
    }),
    menu: (provided) => ({
      ...provided,
      textAlign: "left",
    }),
    option: (provided) => ({
      ...provided,
      textAlign: "left",
    }),
  };

  const displayUsername = () => {
    const fullName = `${profile.firstname} ${profile.lastname}`;
    return profile.username === fullName
      ? profile.username
      : `${profile.username} (${fullName})`;
  };

  const getBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "gold";
      case "certified":
        return "#1d9bf0"; // blue
      default:
        return "transparent";
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-left">
        <div className="profile-picture">
          <img src={profile.picture} alt="Profile" />
        </div>
        <div className="profile-name">
          <h2>{displayUsername()}</h2>
          {profile.role !== "user" && (
            <VerifiedBadge color={getBadgeColor(profile.role)} />
          )}
        </div>
        <p>{profile.email}</p>
        <p>{profile.bio}</p>
      </div>
      <div className="profile-center">
        <label>
          Firstname:
          <input
            type="text"
            name="firstname"
            value={profile.firstname}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </label>
        <label>
          Lastname:
          <input
            type="text"
            name="lastname"
            value={profile.lastname}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </label>
        <label>
          Username:
          <input
            type="text"
            name="username"
            value={profile.username}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </label>
        <label>
          Birthday:
          <input
            type="date"
            name="birthday"
            value={profile.birthday}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </label>
        <label>
          Gender:
          <Select
            className="select"
            styles={customSelectStyles}
            name="gender"
            options={genderOptions}
            value={genderOptions.find(
              (option) => option.value === profile.gender
            )}
            onChange={(value) =>
              handleGenderChange(value as SingleValue<Option>)
            }
            isDisabled={!isEditing}
          />
        </label>
        <label>
          Nationality:
          <Select
            className="select"
            styles={customSelectStyles}
            name="nationality"
            options={countryOptions}
            value={countryOptions.find(
              (option) => option.value === profile.nationality
            )}
            onChange={(value) =>
              handleNationalityChange(value as SingleValue<Option>)
            }
            isDisabled={!isEditing}
          />
        </label>
        <label>
          Bio:
          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </label>
        <label>
          Visibility:
          <Select
            className="select"
            styles={customSelectStyles}
            name="visibility"
            options={visibilityOptions}
            value={visibilityOptions.find(
              (option) => option.value === profile.visibility
            )}
            onChange={(value) =>
              handleVisibilityChange(value as SingleValue<Option>)
            }
            isDisabled={!isEditing}
          />
        </label>
        <label>
          Interests:
          <Select
            className="select"
            styles={customSelectStyles}
            isMulti
            name="interests"
            options={interestsOptions}
            value={interestsOptions.filter((option) =>
              profile.interests.includes(option.value)
            )}
            onChange={(value) =>
              handleInterestsChange(value as MultiValue<Option>)
            }
            isDisabled={!isEditing}
          />
        </label>
        <div className="profile-buttons">
          {!isEditing ? (
            <button onClick={handleEditClick}>Edit</button>
          ) : (
            <button onClick={handleSaveClick}>Save</button>
          )}
        </div>
      </div>
      <div className="profile-right">
        <button onClick={handleEmailPopupClick}>Change Email</button>
        <button onClick={handlePasswordPopupClick}>Change Password</button>
      </div>
      {showEmailPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Change Email</h3>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handlePasswordChange}
            />
            <div className="popup-buttons">
              <button className="close-button" onClick={closePopup}>
                Close
              </button>
              <button
                className="submit-button"
                onClick={() => {
                  /* Implement email change */
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {showPasswordPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Change Password</h3>
            <input
              type="password"
              name="oldPassword"
              value={passwords.oldPassword}
              onChange={handlePasswordChange}
              placeholder="Old Password"
            />
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              placeholder="New Password"
            />
            <input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm Password"
            />
            <div className="popup-buttons">
              <button className="close-button" onClick={closePopup}>
                Close
              </button>
              <button
                className="submit-button"
                onClick={() => {
                  /* Implement password change */
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
