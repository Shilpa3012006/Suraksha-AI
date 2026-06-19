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

          <hr />

        </div>

      ))}


    </div>

  );

}


export default EvidenceList;