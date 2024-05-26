import {
  FunctionComponent,
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import Select, { MultiValue, SingleValue, StylesConfig } from "react-select";
import { Link } from "react-router-dom";
import AuthService from "@/services/AuthService";
import UserService from "@/services/UserService";
import { toCapitalizedWords } from "@/helpers/StringHelper";
import "@/pages/authentication/Auth.css";
import axios from "axios";

interface Option {
  value: string;
  label: string;
}

const Signup: FunctionComponent = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstname: "",
    lastname: "",
    birthday: "",
    gender: "UNSPECIFIED",
    nationality: "UNSPECIFIED",
    interests: [] as string[],
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showActivationPopup, setShowActivationPopup] = useState(false);
  const [activationCode, setActivationCode] = useState("");
  const [activationError, setActivationError] = useState<string | null>(null);

  const [interestsOptions, setInterestsOptions] = useState<Option[]>([]);
  const [countryOptions, setCountryOptions] = useState<Option[]>([]);
  const [genderOptions, setGenderOptions] = useState<Option[]>([]);

  const flag = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnumerations = async () => {
      try {
        const data = await UserService.getOptions([
          "interests",
          "nationalities",
          "genders",
        ]);

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
      } catch (error) {
        setGlobalError("Something went wrong, please come back later");
      }
    };

    if (flag.current === false) fetchEnumerations();

    return () => {
      flag.current = true;
    };
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleInterestsChange = (selectedOptions: MultiValue<Option>) => {
    if (selectedOptions.length <= 5) {
      setFormData({
        ...formData,
        interests: selectedOptions.map((option) => option.value),
      });
    }
  };

  const handleNationalityChange = (selectedOption: SingleValue<Option>) => {
    setFormData({
      ...formData,
      nationality: selectedOption ? selectedOption.value : "",
    });
  };

  const handleGenderChange = (selectedOption: SingleValue<Option>) => {
    setFormData({
      ...formData,
      gender: selectedOption ? selectedOption.value : "",
    });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!#$%&*+<=>?@^_-]).{8,128}$/;
    const nameRegex = /^[\p{L} '-]+$/u;

    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email should be valid";
    }
    if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (! # $ % & * + - < = > ? @ ^ _)";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!nameRegex.test(formData.firstname) || formData.firstname.length > 64) {
      newErrors.firstname =
        "Firstname can only contain letters, spaces, hyphens, and apostrophes and must be at most 64 characters long";
    }
    if (!nameRegex.test(formData.lastname) || formData.lastname.length > 64) {
      newErrors.lastname =
        "Lastname can only contain letters, spaces, hyphens, and apostrophes and must be at most 64 characters long";
    }
    if (new Date(formData.birthday) >= new Date()) {
      newErrors.birthday = "Birthday cannot be in the future";
    }
    if (formData.interests.length === 0) {
      newErrors.interests = "You must select at least one interest";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGlobalError(null);
    if (!validateForm()) return;

    try {
      await AuthService.signup(formData);
      setShowActivationPopup(true);
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status !== 500
      )
        setGlobalError(error.response.data.message);
      else setGlobalError("Signup failed, please try again later");
    }
  };

  const handleActivate = async () => {
    try {
      await AuthService.activate(formData.email, activationCode);
      setShowActivationPopup(false);
      navigate("/authentication/login");
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status !== 500
      )
        setActivationError(error.response.data.message);
      else setActivationError("Activation failed, please try again later");
    }
  };

  const handleResendActivationCode = async () => {
    try {
      await AuthService.resendActivationCode(formData.email);
      setActivationError("Activation code resent successfully");
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status !== 500
      )
        setActivationError(error.response.data.message);
      else
        setActivationError(
          "Failed to resend activation code, please try again later"
        );
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

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Signup</h2>
        {globalError && <div className="error global-error">{globalError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </label>
            <label>
              Birthday:
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleInputChange}
                required
              />
              {errors.birthday && (
                <span className="error">{errors.birthday}</span>
              )}
            </label>
          </div>
          <div className="form-group">
            <label>
              Password:
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              {errors.password && (
                <span className="error">{errors.password}</span>
              )}
            </label>
            <label>
              Confirm Password:
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
              {errors.confirmPassword && (
                <span className="error">{errors.confirmPassword}</span>
              )}
            </label>
          </div>
          <div className="form-group">
            <label>
              Firstname:
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleInputChange}
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
                value={formData.lastname}
                onChange={handleInputChange}
                required
              />
              {errors.lastname && (
                <span className="error">{errors.lastname}</span>
              )}
            </label>
          </div>
          <div className="form-group">
            <label>
              Gender:
              <Select
                className="select"
                styles={customSelectStyles}
                name="gender"
                options={genderOptions}
                value={genderOptions.find(
                  (option) => option.value === formData.gender
                )}
                onChange={(value) =>
                  handleGenderChange(value as SingleValue<Option>)
                }
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
                  (option) => option.value === formData.nationality
                )}
                onChange={(value) =>
                  handleNationalityChange(value as SingleValue<Option>)
                }
              />
            </label>
          </div>
          <div className="form-group interests">
            <label>
              Interests:
              <Select
                className="select"
                isMulti
                options={interestsOptions}
                styles={customSelectStyles}
                onChange={handleInterestsChange}
                value={interestsOptions.filter((option) =>
                  formData.interests.includes(option.value)
                )}
                isOptionDisabled={() => formData.interests.length >= 5}
              />
              {errors.interests && (
                <span className="error">{errors.interests}</span>
              )}
            </label>
          </div>
          <button type="submit">Signup</button>
        </form>
        <div className="auth-links">
          <p>
            Already have an account?{" "}
            <Link to="/authentication/login">Login here</Link>
          </p>
          <p>
            <Link to="/authentication/password/reset">
              Forgot your password?
            </Link>
          </p>
        </div>
      </div>
      {showActivationPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Activate Account</h3>
            {activationError && (
              <div className="error global-error">{activationError}</div>
            )}
            <label>
              Activation Code:
              <input
                type="text"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value)}
                required
              />
            </label>
            <div className="popup-buttons">
              <button className="submit-button" onClick={handleActivate}>
                Activate
              </button>
              <button
                className="submit-button"
                onClick={handleResendActivationCode}
              >
                Resend Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
