/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import { useCallback, useEffect, useReducer, useState } from "react";
import emailjs from "@emailjs/browser";
import "./register.css";
import { actions, initials, reducer } from "../functions/formrequest";
import axios from "axios";
import cleanData from "../functions/cleandata";
import { useUserContext } from "../context/usercontextprovider";

const KronosSignup = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    email: "",
    userRole: "",
    dprtID: "",
    orgID: "",
    password: "",
    password_confirmation: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [pendingUser, setPendingUser] = useState(null);
  const [emailError, setEmailError] = useState("");
  const [codeTimer, setCodeTimer] = useState(60);
  const [codeSent, setCodeSent] = useState(false);
  const { usertoken } = useUserContext();
  const [departments, setDepartments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [state, dispatch] = useReducer(reducer, initials);
  const [passwordError, setPasswordError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // If role is changed, clear department and organization for GSO roles
    if (
      name === "role" &&
      (value === "GSO Director" || value === "GSO Officer")
    ) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        dprtID: "",
        orgID: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  //fetch departments
  const fetchdepartments = useCallback(() => {
    dispatch({ type: actions.fetch_request });
    axios.get("/api/department").then((res) => {
      const clean = cleanData(res, "noError");
      setDepartments(clean); // store sa local state
      dispatch({
        type: actions.fetch_success,
        payload: { departments: clean },
      });
    });
  }, []);
  useEffect(() => {
    fetchdepartments();
  }, [usertoken, formData]);

  useEffect(() => {
    const selected = departments.find(
      (dep) => dep.dprtID === Number(formData.dprtID)
    );
    if (selected) {
      setOrganizations(selected.organizations);
    } else {
      setOrganizations([]);
    }
    // reset org and position when changing department
    setFormData((prev) => ({
      ...prev,
      orgID: "",
      officerpostID: "",
    }));
  }, [formData.dprtID]);

  // const selected = departments.find(
  //   (dep) => dep.dprtID === Number(formData.dprtID)
  // );
  // console.log(
  //   "department:  ",
  //   departments.map((dep) => dep.organizations)
  // );
  useEffect(() => {
    const departments = state.items.departments || [];
  }, [state.items.departments, state.loading]);
  const handleEmailBlur = () => {
    const email = formData.email;
    if (email && !email.endsWith("@dyci.edu.ph")) {
      setEmailError("Email must be from @dyci.edu.ph domain");
    } else {
      setEmailError("");
    }
  };
  console.log(formData.dprtID);
  setTimeout(() => {
    setError("");
  }, 5000);

  const handlePasswordBlur = () => {
    const password = formData.password;
    const confirmPassword = formData.confirm_password;

    if (confirmPassword && password !== confirmPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  };

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    setPasswordError("");

    if (!formData.email.endsWith("@dyci.edu.ph")) {
      setError("Email must be from @dyci.edu.ph domain");
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    const code = generateVerificationCode();

    const userData = {
      ...formData,
      verification_code: code,
    };

    setPendingUser(userData);
    setShowModal(true);
    setCodeSent(true);
    setCodeTimer(60);

    // ✉️ Send email via EmailJS
    const templateParams = {
      from_name: "KRONOS Admin",
      to: formData.email,
      message: "Verification code is " + code,
    };
    if (!formData.email) {
      setError("Email address is required.");
      return;
    }

    emailjs
      .send(
        "service_fggapwa",
        "template_cetju8j",
        templateParams,
        "o24-npbfdcaqTdIsQ"
      )
      .then(() => {
        console.log("Verification code sent to email:", code);
      })
      .catch((err) => {
        console.error("Email sending error:", err);
        setError("Failed to send verification email.");
        setShowModal(false);
        setCodeSent(false);
      });
  };
  useEffect(() => {
    if (showModal && codeTimer > 0) {
      const interval = setInterval(() => {
        setCodeTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else if (codeTimer <= 0 && showModal) {
      setShowModal(false);
      setVerificationError("Verification code expired.");
    }
  }, [showModal, codeTimer]);

  const handleVerification = async (e) => {
    e.preventDefault();

    if (verifying) return; // Prevent if already verifying
    setVerifying(true);
    setVerificationError("");

    if (codeTimer <= 0) {
      setVerificationError("Verification code expired.");
      setShowModal(false);
      setVerifying(false);
      return;
    }

    if (
      pendingUser &&
      verificationCode === pendingUser.verification_code &&
      pendingUser.email.endsWith("@dyci.edu.ph")
    ) {
      try {
        const res = await axios.post("/api/register", pendingUser);
        setSuccess("Account created successfully!");
        setShowModal(false);
      } catch (err) {
        console.error(cleanData(err, "Error"));
        setError("Registration failed. Try again later.");
      } finally {
        setVerifying(false);
      }
    } else {
      setVerificationError("Invalid verification code. Please try again.");
      setVerifying(false);
    }
  };

  const handleVerificationInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setVerificationCode(value);
  };

  // Check if department and organization fields should be disabled
  const isDepartmentDisabled =
    formData.userRole === "GSO Director" || formData.userRole === "GSO Officer";

  return (
    <div className="signup-container">
      <div className="forms-card">
        <div className="header">
          <div className="logo-container">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 6L10 13L14 9L21 16"
                  stroke="#FF6B6B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 13L5 18L14 9L19 4"
                  stroke="#FF6B6B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="logo-text">KRONOS</div>
          </div>
          <div className="subtitle">GSO Management System</div>
        </div>

        <h2 className="forms-title">Create your Kronos Account</h2>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="forms-columns">
          <div className="forms-left">
            {/* Name */}
            <div className="forms-group">
              <label>Name</label>
              <div className="forms-row">
                <input
                  type="text"
                  name="firstname"
                  placeholder="First"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  required
                  className="forms-input-flex"
                />
                <input
                  type="text"
                  name="middlename"
                  placeholder="Middle"
                  value={formData.middlename}
                  onChange={handleInputChange}
                  className="forms-input-flex"
                />
                <input
                  type="text"
                  name="lastname"
                  placeholder="Last"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  required
                  className="forms-input-flex"
                />
              </div>
            </div>

            {/* Email */}
            <div className="forms-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="username@dyci.edu.ph"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleEmailBlur}
                required
                className={`forms-input ${emailError ? "error" : ""}`}
              />
              {emailError && <div className="field-error">{emailError}</div>}
            </div>
            <div className="forms-group">
              <label>Role</label>
              <select
                name="userRole"
                value={formData.userRole}
                onChange={handleInputChange}
                required
                className="forms-select"
              >
                <option value="">Select Role</option>
                <option value="Student">Student</option>
                <option value="Faculty Adviser">Faculty Adviser</option>
                <option value="Dean/Head">Dean/Head</option>
                <option value="GSO Officer">GSO Officer</option>
                <option value="GSO Director">GSO Director</option>
              </select>
            </div>
            {/* Password */}
          </div>

          <div className="forms-right">
            {/* Role */}

            {/* Department & Org */}

            <div className="forms-group">
              <label>Department & Position</label>
              <div className="forms-row-2">
                <select
                  name="dprtID"
                  value={formData.dprtID}
                  onChange={handleInputChange}
                  required={!isDepartmentDisabled}
                  disabled={isDepartmentDisabled}
                  className={`forms-select ${
                    isDepartmentDisabled ? "disabled" : ""
                  }`}
                >
                  <option value="">Select Department</option>

                  {departments.map((dep) => (
                    <option key={dep.dprtID} value={dep.dprtID}>
                      {dep.dprtName}
                    </option>
                  ))}
                </select>
                <select
                  name="orgID"
                  value={formData.orgID}
                  required={!isDepartmentDisabled}
                  onChange={handleInputChange}
                  disabled={isDepartmentDisabled || !organizations.length}
                  id=""
                  className={`forms-select ${
                    isDepartmentDisabled ? "disabled" : ""
                  }`}
                >
                  <option value="">Select Organization</option>
                  {organizations.map((org) => (
                    <option key={org.orgID} value={org.orgID}>
                      {org.orgName}
                    </option>
                  ))}
                </select>
                {/* <input
                  type="text"
                  name="organization"
                  placeholder="Organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  required={!isDepartmentDisabled}
                  disabled={isDepartmentDisabled}
                  className={`forms-input-flex ${
                    isDepartmentDisabled ? "disabled" : ""
                  }`}
                /> */}
              </div>
              {isDepartmentDisabled && (
                <div className="field-info">
                  Department and Organization fields are not required for GSO
                  roles.
                </div>
              )}
            </div>
            <div className="forms-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="forms-input"
              />
            </div>
            {/* Confirm Password */}
            <div className="forms-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleInputChange}
                onBlur={handlePasswordBlur}
                required
                className={`forms-input ${passwordError ? "error" : ""}`}
              />
              {passwordError && (
                <div className="field-error">{passwordError}</div>
              )}
            </div>
          </div>
        </div>

        <div className="forms-group full-width">
          <button type="submit" onClick={handleSignup} className="submit-btn">
            Create Account
          </button>
        </div>
        <p className="text-center text-muted">
          Alread have Account?{" "}
          <a href="/login" className="text-decoration-none text-primary">
            Sign in
          </a>
        </p>
      </div>

      {/* Verification Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Verify Your Account</h3>
            {codeTimer > 0 ? (
              <p className="modal-text">
                Code expires in <strong>{codeTimer}s</strong>.
              </p>
            ) : (
              <p className="modal-text text-red">
                Verification code expired. Please refresh.
              </p>
            )}

            {verificationError && (
              <div className="error">{verificationError}</div>
            )}

            <input
              type="text"
              value={verificationCode}
              onChange={handleVerificationInputChange}
              placeholder="000000"
              maxLength="6"
              required
              className="verification-input"
            />
            <button
              type="button"
              onClick={handleVerification}
              className="verify-btn"
              disabled={verifying}
            >
              {verifying ? "Verifying..." : "Verify Account"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KronosSignup;
