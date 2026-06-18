import { useState } from "react";
import axios from "axios";

function Signup() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {

    try {

      const response = await axios.post(
        "http://127.0.0.1:8000/api/signup/",
        {
          username: username,
          password: password
        }
      );

      alert(response.data.message);

    } catch (error) {

      alert("Signup failed");

    }
  };


  return (

    <div>

      <h1>Signup</h1>

      <input
        type="text"
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />

      <br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />

      <button onClick={handleSignup}>
        Create Account
      </button>

    </div>

  );
}


export default Signup;