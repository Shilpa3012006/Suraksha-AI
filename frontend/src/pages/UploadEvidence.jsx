import { useRef, useState } from "react";
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

const SUPPORTED_TYPES = [
  {
    label: "Images",
    extensions: "JPG, PNG, GIF, WEBP",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    label: "Videos",
    extensions: "MP4, MOV, AVI, MKV",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    ),
  },
  {
    label: "Audio",
    extensions: "MP3, WAV, AAC, OGG",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    label: "PDF",
    extensions: "PDF documents",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    label: "Documents",
    extensions: "DOC, DOCX, TXT, XLS",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <polyline points="13 2 13 9 20 9" />
      </svg>
    ),
  },
];

function UploadEvidence() {

  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);


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
  
    } 
    catch (error) {

      console.log(error);
    
      console.log(error.response);
    
      alert("Upload failed");
    
    }
  
  };


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };


  return (

    <div className="upload-page">

      <div className="upload-page__grid">

        <div className="upload-card upload-card--main">

          <div className="upload-card__header">
            <h2 className="upload-card__title">Upload File</h2>
            <p className="upload-card__subtitle">
              Drag and drop your evidence file or click to browse from your device.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="upload-file-input"
            onChange={handleFileChange}
          />

          <div
            className={`upload-dropzone ${isDragging ? "upload-dropzone--active" : ""} ${file ? "upload-dropzone--has-file" : ""}`}
            onClick={openFilePicker}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openFilePicker();
              }
            }}
          >
            <div className="upload-dropzone__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>

            {file ? (
              <div className="upload-dropzone__file-info">
                <span className="upload-dropzone__file-name">{file.name}</span>
                <span className="upload-dropzone__file-size">{formatFileSize(file.size)}</span>
                <span className="upload-dropzone__change">Click or drop to replace</span>
              </div>
            ) : (
              <div className="upload-dropzone__prompt">
                <span className="upload-dropzone__primary">Drop your file here</span>
                <span className="upload-dropzone__secondary">
                  or <span className="upload-dropzone__browse">browse files</span>
                </span>
              </div>
            )}
          </div>

          <div className="upload-field">
            <label className="upload-field__label" htmlFor="evidence-description">
              Description
            </label>
            <textarea
              id="evidence-description"
              className="upload-textarea"
              placeholder="Describe the evidence — include context such as date, location, or incident details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>

          <button
            type="button"
            className="upload-btn"
            onClick={uploadFile}
            disabled={!file}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload Evidence
          </button>

        </div>

        <aside className="upload-card upload-card--info">

          <div className="upload-info-section">
            <h3 className="upload-info-section__title">Supported File Types</h3>
            <ul className="upload-types-list">
              {SUPPORTED_TYPES.map((type) => (
                <li key={type.label} className="upload-types-list__item">
                  <span className="upload-types-list__icon">{type.icon}</span>
                  <div className="upload-types-list__text">
                    <span className="upload-types-list__label">{type.label}</span>
                    <span className="upload-types-list__ext">{type.extensions}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="upload-info-section upload-info-section--size">
            <div className="upload-size-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <span className="upload-size-badge__label">Maximum File Size</span>
                <span className="upload-size-badge__value">50 MB per file</span>
              </div>
            </div>
            <p className="upload-info-note">
              Your location will be captured automatically when you upload to verify evidence authenticity.
            </p>
          </div>

        </aside>

      </div>

    </div>

  );

}


export default UploadEvidence;
