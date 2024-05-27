import { FunctionComponent, useState, useEffect, ChangeEvent } from "react";
import { useParams, useLocation } from "react-router-dom";
import Select, { MultiValue, SingleValue, StylesConfig } from "react-select";
import "@/pages/profile/Profile.css";
import VerifiedBadge from "@/components/icons/CertifiedBadge";
import UserService from "@/services/UserService";
import { toCapitalizedWords } from "@/helpers/StringHelper";
import Loader from "@/components/loader/Loader";
import axios from "axios";

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
  role: string;
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
  gender: "",
  nationality: "",
  picture: "",
  bio: "",
  visibility: "",
  interests: [],
  role: "",
};

const Profile: FunctionComponent = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [profile, setProfile] = useState<ProfileProps>(initialProfile);
  const [editableProfile, setEditableProfile] =
    useState<ProfileProps>(initialProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<{
    [key: string]: string;
  }>({});
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

  const token = localStorage.getItem("authToken");
  let currentUserId: string | null = null;
  if (token) {
    const payload = JSON.parse(atob(token.split(".")[1]));
    currentUserId = payload.id;
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await UserService.getProfile(id);
        setProfile(profileData);
        setEditableProfile(profileData);
        setIsLoading(false);
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.response &&
          error.response.status !== 500
        )
          setGlobalError("User not found");
        else setGlobalError("Failed to fetch profile, please try again later");

        setIsLoading(false);
      }
    };

    const fetchEnumerations = async () => {
      try {
        const data = await UserService.getOptions();

        setInterestsOptions(
          data.interests.map((item: string) => ({
            value: item,
            label: toCapitalizedWords(item),
          }))
        );
        setCountryOptions(
          data.nationalities.map((item: string) => ({
            value: item,
            label: toCapitalizedWords(item),
          }))
        );
        setGenderOptions(
          data.genders.map((item: string) => ({
            value: item,
            label: toCapitalizedWords(item),
          }))
        );
        setVisibilityOptions(
          data.visibilities.map((item: string) => ({
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
  }, [id, location.pathname]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditableProfile({ ...editableProfile, [name]: value });
  };

  const handleGenderChange = (newValue: SingleValue<Option>) => {
    setEditableProfile({
      ...editableProfile,
      gender: newValue ? newValue.value : "",
    });
  };

  const handleNationalityChange = (newValue: SingleValue<Option>) => {
    setEditableProfile({
      ...editableProfile,
      nationality: newValue ? newValue.value : "",
    });
  };

  const handleVisibilityChange = (newValue: SingleValue<Option>) => {
    setEditableProfile({
      ...editableProfile,
      visibility: newValue ? newValue.value : "",
    });
  };

  const handleInterestsChange = (newValue: MultiValue<Option>) => {
    const selectedInterests = newValue.map((option) => option.value);
    setEditableProfile({ ...editableProfile, interests: selectedInterests });
  };

  const validateProfile = () => {
    const newErrors: { [key: string]: string } = {};
    const nameRegex = /^[\p{L} '-]+$/u;
    const usernameRegex = /^[\p{L} '-]+$/u;

    if (!editableProfile.firstname) {
      newErrors.firstname = "Firstname is required";
    } else if (
      !nameRegex.test(editableProfile.firstname) ||
      editableProfile.firstname.length > 64
    ) {
      newErrors.firstname =
        "Firstname can only contain letters, spaces, hyphens, and apostrophes and must be at most 64 characters long";
    }

    if (!editableProfile.lastname) {
      newErrors.lastname = "Lastname is required";
    } else if (
      !nameRegex.test(editableProfile.lastname) ||
      editableProfile.lastname.length > 64
    ) {
      newErrors.lastname =
        "Lastname can only contain letters, spaces, hyphens, et apostrophes and must be at most 64 characters long";
    }

    if (!editableProfile.username) {
      newErrors.username = "Username is required";
    } else if (
      !usernameRegex.test(editableProfile.username) ||
      editableProfile.username.length < 3 ||
      editableProfile.username.length > 128
    ) {
      newErrors.username =
        "Username can only contain letters, spaces, hyphens, and apostrophes and must be between 3 and 128 characters long";
    }

    if (!editableProfile.birthday) {
      newErrors.birthday = "Birthday is required";
    } else if (new Date(editableProfile.birthday) >= new Date()) {
      newErrors.birthday = "Birthday cannot be in the future";
    }

    if (!editableProfile.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!editableProfile.nationality) {
      newErrors.nationality = "Nationality is required";
    }

    if (!editableProfile.picture) {
      newErrors.picture = "Picture is required";
    }

    if (!editableProfile.visibility) {
      newErrors.visibility = "Visibility is required";
    }

    if (editableProfile.interests.length === 0) {
      newErrors.interests = "You must select at least one interest";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    setGlobalError(null);
    if (!validateProfile()) return;

    try {
      const updatedProfile = await UserService.updateProfile(
        id,
        editableProfile
      );
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status !== 500
      )
        setGlobalError(error.response.data.message);
      else setGlobalError("Failed to update profile, please try again later");
    }
  };

  const handlePasswordPopupClick = () => {
    setShowPasswordPopup(true);
  };

  const closePopup = () => {
    setPasswordError(null);
    setPasswordErrors({});
    setPasswords({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
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

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async () => {
    setPasswordError(null);
    if (!validatePasswordChange()) return;

    try {
      await UserService.changePassword(id, {
        old_password: passwords.oldPassword,
        new_password: passwords.newPassword,
      });
      setPasswords({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      closePopup();
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status !== 500
      )
        setPasswordError(error.response.data.message);
      else
        setPasswordError("Failed to change password, please try again later");
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
      backgroundColor: "#ddd",
      borderRadius: "5px",
      padding: "5px",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#333",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      display: isEditing ? "flex" : "none",
      color: "#999",
      cursor: "pointer",
      ":hover": {
        backgroundColor: "#ccc",
        color: "#333",
      },
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
      case "ADMINISTRATOR":
        return "#ffd700";
      case "CERTIFIED_USER":
        return "#1d9bf0";
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

  const canEdit = currentUserId === id;

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
        {canEdit && (
          <button
            className="change-password-button"
            onClick={handlePasswordPopupClick}
          >
            Change Password
          </button>
        )}
      </div>
      <div className="profile-right">
        {globalError && <div className="error global-error">{globalError}</div>}
        {!canEdit &&
        (profile.visibility === "FRIENDS_ONLY" ||
          profile.visibility === "PRIVATE") ? (
          <p>User's information is not visible to you.</p>
        ) : (
          <>
            <label>
              Firstname:
              <input
                type="text"
                name="firstname"
                value={editableProfile.firstname}
                onChange={handleInputChange}
                disabled={!isEditing || !canEdit}
                required
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
                value={editableProfile.lastname}
                onChange={handleInputChange}
                disabled={!isEditing || !canEdit}
                required
              />
              {errors.lastname && (
                <span className="error">{errors.lastname}</span>
              )}
            </label>
            <label>
              Username:
              <input
                type="text"
                name="username"
                value={editableProfile.username}
                onChange={handleInputChange}
                disabled={!isEditing || !canEdit}
                required
              />
              {errors.username && (
                <span className="error">{errors.username}</span>
              )}
            </label>
            <label>
              Birthday:
              <input
                type="date"
                name="birthday"
                value={editableProfile.birthday}
                onChange={handleInputChange}
                disabled={!isEditing || !canEdit}
                required
              />
              {errors.birthday && (
                <span className="error">{errors.birthday}</span>
              )}
            </label>
            <label>
              Gender:
              <Select
                className="select"
                styles={customSelectStyles}
                name="gender"
                options={genderOptions}
                value={genderOptions.find(
                  (option) => option.value === editableProfile.gender
                )}
                onChange={(value) =>
                  handleGenderChange(value as SingleValue<Option>)
                }
                isDisabled={!isEditing || !canEdit}
                required
              />
              {errors.gender && <span className="error">{errors.gender}</span>}
            </label>
            <label>
              Nationality:
              <Select
                className="select"
                styles={customSelectStyles}
                name="nationality"
                options={countryOptions}
                value={countryOptions.find(
                  (option) => option.value === editableProfile.nationality
                )}
                onChange={(value) =>
                  handleNationalityChange(value as SingleValue<Option>)
                }
                isDisabled={!isEditing || !canEdit}
                required
              />
              {errors.nationality && (
                <span className="error">{errors.nationality}</span>
              )}
            </label>
            <label>
              Bio:
              <textarea
                name="bio"
                value={editableProfile.bio}
                onChange={handleInputChange}
                disabled={!isEditing || !canEdit}
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
                  (option) => option.value === editableProfile.visibility
                )}
                onChange={(value) =>
                  handleVisibilityChange(value as SingleValue<Option>)
                }
                isDisabled={!isEditing || !canEdit}
                required
              />
              {errors.visibility && (
                <span className="error">{errors.visibility}</span>
              )}
            </label>
            <label>
              Interests:
              <Select
                className="select"
                isMulti
                options={interestsOptions}
                styles={customSelectStyles}
                onChange={handleInterestsChange}
                value={
                  editableProfile.interests
                    ? interestsOptions.filter((option) =>
                        editableProfile.interests.includes(option.value)
                      )
                    : []
                }
                isOptionDisabled={() => editableProfile.interests.length >= 5}
                isDisabled={!isEditing || !canEdit}
                required
              />
              {errors.interests && (
                <span className="error">{errors.interests}</span>
              )}
            </label>
            {canEdit && (
              <div className="profile-buttons">
                {!isEditing ? (
                  <button onClick={handleEditClick}>Edit</button>
                ) : (
                  <button onClick={handleSaveClick}>Save</button>
                )}
              </div>
            )}
          </>
        )}
      </div>
      {showPasswordPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Change Password</h3>
            {passwordError && (
              <div className="error password-error">{passwordError}</div>
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
              {passwordErrors.oldPassword && (
                <span className="error">{passwordErrors.oldPassword}</span>
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
              {passwordErrors.newPassword && (
                <span className="error">{passwordErrors.newPassword}</span>
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
              {passwordErrors.confirmPassword && (
                <span className="error">{passwordErrors.confirmPassword}</span>
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
