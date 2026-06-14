import { useEffect, useState } from "react";
import axios from "axios";

function App() {

  const [message, setMessage] = useState("");

  useEffect(() => {

    axios.get("http://127.0.0.1:8000/api/test/")
      .then(response => {
        setMessage(response.data.message);
      })
      .catch(error => {
        console.log(error);
      });

  }, []);

  return (
    <div>
      <h1>Suraksha AI</h1>

      <h2>
        Backend Status:
      </h2>

      <p>{message}</p>
    </div>
  );
}

export default App;