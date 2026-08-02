import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, Eye, EyeOff, Shield } from "lucide-react";

function Login() {

  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {

    if (!username.trim() || !password.trim()) {
      alert("Please enter username and password.");
      return;
    }
  
    setLoading(true);
  
    try {
  
      const response = await axios.post(
        "http://127.0.0.1:8000/api/login/",
        {
          username,
          password,
        }
      );
  
      localStorage.setItem("access", response.data.access);
  
      alert("Login successful");
  
      navigate("/dashboard");
  
    } catch (error) {
  
      alert("Invalid username or password.");
  
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
  
          <p>Secure Digital Evidence Platform</p>
  
        </div>
  
        <div className="auth-form">
  
          <label>Username</label>
  
          <div className="auth-input">
  
            <User size={18} />
  
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
  
          </div>
  
          <label>Password</label>
  
          <div className="auth-input">
  
            <Lock size={18} />
  
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
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
  
          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login Securely"}
          </button>
  
          <p className="auth-footer">
  
            Don't have an account?
  
            <Link to="/signup">
  
              Create Account
  
            </Link>
  
          </p>
  
        </div>
  
      </div>
  
    </div>
  
  );

}


export default Login;