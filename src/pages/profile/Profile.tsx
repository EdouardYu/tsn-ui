import { FunctionComponent, useState, useEffect, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import Select, { MultiValue, SingleValue, StylesConfig } from "react-select";
import "@/pages/profile/Profile.css";
import VerifiedBadge from "@/components/icons/CertifiedBadge";
import UserService from "@/services/UserService";
import { toCapitalizedWords } from "@/helpers/StringHelper";
import Loader from "@/components/loader/Loader";

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

const initialProfile: ProfileProps = {
  email: "",
  password: "",
  firstname: "",
  lastname: "",
  username: "",
  birthday: "",
  gender: "UNSPECIFIED",
  nationality: "UNSPECIFIED",
  picture: "",
  bio: "",
  visibility: "PUBLIC",
  interests: [],
  role: "user",
};

const Profile: FunctionComponent = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<ProfileProps>(initialProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [interestsOptions, setInterestsOptions] = useState<Option[]>([]);
  const [countryOptions, setCountryOptions] = useState<Option[]>([]);
  const [genderOptions, setGenderOptions] = useState<Option[]>([]);
  const [visibilityOptions, setVisibilityOptions] = useState<Option[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await UserService.getProfile(id);
        setProfile(profileData);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch profile", error);
        if (error.response?.data?.message === "User not found") {
          setGlobalError("User not found");
        } else {
          setGlobalError("Failed to fetch profile, please try again later");
        }
        setIsLoading(false);
      }
    };

    const fetchEnumerations = async () => {
      try {
        const response = await UserService.getOptions();

        setInterestsOptions(
          response.data.interests.map((item: string) => ({
            value: item,
            label: toCapitalizedWords(item),
          }))
        );
        setCountryOptions(
          response.data.nationalities.map((item: string) => ({
            value: item,
            label: toCapitalizedWords(item),
          }))
        );
        setGenderOptions(
          response.data.genders.map((item: string) => ({
            value: item,
            label: toCapitalizedWords(item),
          }))
        );
        setVisibilityOptions(
          response.data.visibilities.map((item: string) => ({
            value: item,
            label: toCapitalizedWords(item),
          }))
        );
      } catch (error) {
        setGlobalError("Something went wrong, please come back later");
      }
    };

    fetchProfile();
    fetchEnumerations();
  }, [id]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  const validateProfile = () => {
    const newErrors: { [key: string]: string } = {};
    const nameRegex = /^[\p{L} '-]+$/u;

    if (!nameRegex.test(profile.firstname) || profile.firstname.length > 64) {
      newErrors.firstname =
        "Firstname can only contain letters, spaces, hyphens, and apostrophes and must be at most 64 characters long";
    }
    if (!nameRegex.test(profile.lastname) || profile.lastname.length > 64) {
      newErrors.lastname =
        "Lastname can only contain letters, spaces, hyphens, and apostrophes and must be at most 64 characters long";
    }
    if (!profile.birthday) {
      newErrors.birthday = "Birthday cannot be null";
    } else if (new Date(profile.birthday) >= new Date()) {
      newErrors.birthday = "Birthday cannot be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    if (!validateProfile()) return;

    try {
      await UserService.updateProfile(id, profile);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
      setGlobalError("Failed to update profile, please try again later.");
    }
  };

  const handlePasswordPopupClick = () => {
    setShowPasswordPopup(true);
  };

  const closePopup = () => {
    setShowPasswordPopup(false);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
  };

  const validatePasswordChange = () => {
    const newErrors: { [key: string]: string } = {};
    const passwordRegex =
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!#$%&*+<=>?@^_-]).{8,128}$/;

    if (!passwordRegex.test(passwords.newPassword)) {
      newErrors.newPassword =
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (! # $ % & * + - < = > ? @ ^ _)";
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async () => {
    if (!validatePasswordChange()) return;

    try {
      await UserService.changePassword(id, {
        old_password: passwords.oldPassword,
        new_password: passwords.newPassword,
      });
      closePopup();
    } catch (error) {
      console.error("Failed to change password", error);
      setGlobalError("Failed to change password, please try again later.");
    }
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

  if (isLoading) {
    return <Loader />;
  }

  if (globalError === "User not found") {
    return <p>User not found</p>;
  }

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
        <button
          className="change-password-button"
          onClick={handlePasswordPopupClick}
        >
          Change Password
        </button>
      </div>
      <div className="profile-center">
        {globalError && <div className="error global-error">{globalError}</div>}
        <label>
          Firstname:
          <input
            type="text"
            name="firstname"
            value={profile.firstname}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
          {errors.firstname && (
            <span className="error">{errors.firstname}</span>
          )}
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
          {errors.lastname && <span className="error">{errors.lastname}</span>}
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
          {errors.birthday && <span className="error">{errors.birthday}</span>}
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
      {showPasswordPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Change Password</h3>
            {globalError && (
              <div className="error global-error">{globalError}</div>
            )}
            <label>
              Old Password:
              <input
                type="password"
                name="oldPassword"
                value={passwords.oldPassword}
                onChange={handlePasswordChange}
                placeholder="Old Password"
                required
              />
              {errors.oldPassword && (
                <span className="error">{errors.oldPassword}</span>
              )}
            </label>
            <label>
              New Password:
              <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                placeholder="New Password"
                required
              />
              {errors.newPassword && (
                <span className="error">{errors.newPassword}</span>
              )}
            </label>
            <label>
              Confirm Password:
              <input
                type="password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm Password"
                required
              />
              {errors.confirmPassword && (
                <span className="error">{errors.confirmPassword}</span>
              )}
            </label>
            <div className="popup-buttons">
              <button className="close-button" onClick={closePopup}>
                Close
              </button>
              <button className="submit-button" onClick={handlePasswordSubmit}>
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
