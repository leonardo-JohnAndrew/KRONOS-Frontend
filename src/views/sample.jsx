import { useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./login.css";
import axios from "axios";
import cleanData from "../functions/cleandata";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/usercontextprovider";
import dashboardImg from "../assets/dashboards.png";
import KronosSignup from "./register";

export default function LoginForms() {
  const { setToken, login } = useUserContext();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const inputRef = useRef(null);
  const passwordRef = useRef(null);

  const isEmail = (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);

  const validation = () => {
    if (!input.trim()) {
      setError("UserID or Email is required!");
      inputRef.current.focus();
      return false;
    }
    if (!password.trim()) {
      setError("Password is required!");
      passwordRef.current.focus();
      return false;
    }
    setError("");
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validation()) return;
    const requestData = {
      [isEmail(input) ? "email" : "userid"]: input,
      password: password,
    };
    try {
      const response = await axios.post("/api/login", requestData);
      const jsonData = cleanData(response, "noError");
      if (!jsonData.access_token) {
        setError(jsonData.message);
      } else {
        localStorage.setItem("accessToken", jsonData.access_token);
        setToken(jsonData.access_token);
        login(jsonData.user, jsonData.login);
        navigate("/main/content/dashboard");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="row shadow-lg rounded overflow-hidden">
        <div className="col-md-6 p-5 bg-white fade-slide">
          <h2 className="text-center mb-4">
            Welcome to <span className="text-primary">Kronos!</span>
          </h2>
          <p className="text-center text-muted mb-4">
            {isLogin
              ? "Enter your credentials to access"
              : "Create your account below"}
          </p>

          {isLogin ? (
            <>
              <form onSubmit={handleLogin}>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="mb-3">
                  <label htmlFor="input" className="form-label">
                    Userid or Email
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    ref={inputRef}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      ref={passwordRef}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i
                        className={`bi ${
                          showPassword ? "bi-eye-slash" : "bi-eye"
                        }`}
                      ></i>
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100 mb-3">
                  Login
                </button>
                <p className="text-center text-muted">
                  No Account?{" "}
                  <button
                    type="button"
                    className="btn btn-link text-primary p-0"
                    onClick={() => setIsLogin(false)}
                  >
                    Sign up
                  </button>
                </p>
              </form>
            </>
          ) : (
            <>
              <KronosSignup />
              <p className="text-center text-muted mt-3">
                Already have an account?{" "}
                <button
                  type="button"
                  className="btn btn-link text-primary p-0"
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </button>
              </p>
            </>
          )}
        </div>

        <div className="col-md-6 p-5 bg-primary text-white">
          <h2 className="mb-4">
            Efficiency Meets Simplicity in GSO Operations
          </h2>
          <p className="mb-4">Enter your credentials to access</p>
          <div className="bg-white p-1 rounded text-center">
            <img
              src={dashboardImg}
              alt="Dashboard Preview"
              className="img-fluid"
              style={{ width: "300px", height: "300px", objectFit: "cover" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
