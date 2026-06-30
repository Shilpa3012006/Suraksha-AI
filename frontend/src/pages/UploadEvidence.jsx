import { useState } from "react";
import axios from "axios";

const getCurrentLocation = () => {

  return new Promise((resolve, reject) => {

      navigator.geolocation.getCurrentPosition(

          (position) => {

              resolve({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
              });

          },

          (error) => {

              reject(error);

          }

      );

  });

};


function UploadEvidence() {

  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);


  const uploadFile = async () => {

    try {
  
      const location = await getCurrentLocation();
  
      setLatitude(location.latitude);
      setLongitude(location.longitude);
  
      const formData = new FormData();
  
      formData.append("file", file);
      formData.append("description", description);
      formData.append("file_type", file.type);
      formData.append("latitude", location.latitude);
      formData.append("longitude", location.longitude);
  
      const token = localStorage.getItem("access");
  
      console.log(token);
  
      await axios.post(
        "http://127.0.0.1:8000/api/upload-evidence/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      alert("Evidence uploaded successfully");
  
    } catch (error) {
  
      alert("Upload failed");
  
    }
  
  };


  return (

    <div>

      <h1>Upload Evidence</h1>


      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />


      <br />


      <textarea
        placeholder="Description"
        onChange={(e) => setDescription(e.target.value)}
      />


      <br />


      <button onClick={uploadFile}>
        Upload
      </button>


    </div>

  );

}


export default UploadEvidence;