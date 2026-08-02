import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";

function Signup() {

  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {

    if (
      !fullName.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      alert("Please fill all fields.");
      return;
    }
  
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
  
    setLoading(true);
  
    try {
  
      const response = await axios.post(
        "http://127.0.0.1:8000/api/signup/",
        {
          full_name: fullName,
          username,
          email,
          password,
        }
      );
  
      alert(response.data.message);
  
      navigate("/login");
  
    } catch (error) {
  
      alert("Signup failed.");
  
    } finally {
  
      setLoading(false);
  
    }
  
  };


  return (

    <div className="auth-page">
  
      <div className="auth-card">
  
        <div className="auth-logo">
  
          <Shield size={48} />
  
          <h1>Suraksha-AI</h1>
  
          <p>Create Your Secure Account</p>
  
        </div>
  
        <div className="auth-form">
  
          <label>Full Name</label>
  
          <div className="auth-input">
  
            <User size={18} />
  
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
  
          </div>
  
          <label>Username</label>
  
          <div className="auth-input">
  
            <User size={18} />
  
            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
  
          </div>
  
          <label>Email</label>
  
          <div className="auth-input">
  
            <Mail size={18} />
  
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
  
          </div>
  
          <label>Password</label>
  
          <div className="auth-input">
  
            <Lock size={18} />
  
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
  
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
  
          </div>
  
          <label>Confirm Password</label>
  
          <div className="auth-input">
  
            <Lock size={18} />
  
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
  
          </div>
  
          <button
            className="login-btn"
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
  
          <p className="auth-footer">
  
            Already have an account?
  
            <Link to="/login">
  
              Login
  
            </Link>
  
          </p>
  
        </div>
  
      </div>
  
    </div>
  
  );
}


export default Signup;