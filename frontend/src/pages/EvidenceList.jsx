import { useEffect, useState } from "react";
import axios from "axios";


function EvidenceList() {

  const [evidence, setEvidence] = useState([]);


  useEffect(() => {

    const fetchEvidence = async () => {

      const token = localStorage.getItem("access");


      const response = await axios.get(
        "http://127.0.0.1:8000/api/my-evidence/",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      setEvidence(response.data);

    };


    fetchEvidence();

  }, []);

  const generateReport = async (evidenceId) => {

  const token = localStorage.getItem("access");

  try {

    const response = await axios.get(
      `http://127.0.0.1:8000/api/generate-report/${evidenceId}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    alert(response.data.message);

  } catch (error) {

    console.error(error);

    alert("Failed to generate report.");

  }

};


  

  return (

    <div>

      <h1>My Evidence</h1>


      {evidence.map((item) => (

        <div key={item.id}>

          <p>
            File: {item.file}
          </p>

          <p>
            Description: {item.description}
          </p>

          <p>
            Hash: {item.hash_value}
          </p>
          <button onClick={() => generateReport(item.id)}>
            Generate Legal Report
          </button>
          <hr />

        </div>

      ))}


    </div>

  );

}


export default EvidenceList;