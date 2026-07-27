import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const INFO_ITEMS = [
  {
    title: "SHA-256 Integrity Check",
    description: "Compares the cryptographic hash of your file against the stored original.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: "Metadata Verification",
    description: "Validates associated evidence metadata stored at the time of upload.",
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
    title: "Tamper Detection",
    description: "Detects any modification to the file since it was originally secured.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    title: "Cryptographic Validation",
    description: "Ensures the evidence chain of custody through secure hash comparison.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
];

const getResultVariant = (result) => {
  if (!result) return "pending";
  if (result.status === "original") return "verified";
  if (result.status === "modified") return "tampered";
  return "tampered";
};

const getResultLabel = (result) => {
  if (!result) return "Pending";
  if (result.status === "original") return "Verified";
  if (result.status === "modified") return "Tampered";
  return "Tampered";
};

function VerifyEvidence() {

    const location = useLocation();
    const initialId = location.state?.evidenceId ?? "";

    const [evidenceId, setEvidenceId] = useState(initialId ? String(initialId) : "");
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [result, setResult] = useState(null);

    const fileInputRef = useRef(null);

    const verifyEvidence = async () => {

        if (!file || !evidenceId) {
            alert("Please enter Evidence ID and choose a file.");
            return;
        }

        const formData = new FormData();

        formData.append("evidence_id", evidenceId);
        formData.append("file", file);

        const token = localStorage.getItem("access");

        try {

            const response = await axios.post(
                "http://127.0.0.1:8000/api/verify-evidence/",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert(response.data.message);

            setResult({
                status: response.data.status,
                message: response.data.message,
            });

        } catch (error) {

            console.log(error);

            alert("Verification failed");

            setResult({
                status: "error",
                message: error.response?.data?.message || "Verification failed",
            });

        }

    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setResult(null);
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
            setResult(null);
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

    const resultVariant = getResultVariant(result);
    const resultLabel = getResultLabel(result);


    return (

        <div className="verify-page">

            <header className="verify-header">
                <div className="verify-header__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                </div>
                <div className="verify-header__text">
                    <h2 className="verify-header__title">Verify Evidence</h2>
                    <p className="verify-header__desc">
                        Check the integrity of your digital evidence using cryptographic hash
                        verification. Upload a file and compare it against the securely stored original.
                    </p>
                </div>
            </header>

            <div className="verify-page__grid">

                <div className="verify-main">

                    <div className="verify-card">
                        <h3 className="verify-card__title">Verification Details</h3>
                        <p className="verify-card__subtitle">
                            Enter the evidence ID and upload the file you wish to verify.
                        </p>

                        <div className="verify-field">
                            <label className="verify-field__label" htmlFor="evidence-id">
                                Evidence ID
                            </label>
                            <input
                                id="evidence-id"
                                type="number"
                                className="verify-input"
                                placeholder="Enter evidence ID"
                                value={evidenceId}
                                onChange={(e) => {
                                    setEvidenceId(e.target.value);
                                    setResult(null);
                                }}
                            />
                        </div>

                        <div className="verify-field">
                            <label className="verify-field__label">Evidence File</label>

                            <input
                                ref={fileInputRef}
                                type="file"
                                className="upload-file-input"
                                onChange={handleFileChange}
                            />

                            <div
                                className={`verify-dropzone ${isDragging ? "verify-dropzone--active" : ""} ${file ? "verify-dropzone--has-file" : ""}`}
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
                                <div className="verify-dropzone__icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                        <path d="M9 11l3 3L22 4" />
                                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                    </svg>
                                </div>

                                {file ? (
                                    <div className="verify-dropzone__file-info">
                                        <span className="verify-dropzone__file-name">{file.name}</span>
                                        <span className="verify-dropzone__file-size">{formatFileSize(file.size)}</span>
                                        <span className="verify-dropzone__change">Click or drop to replace</span>
                                    </div>
                                ) : (
                                    <div className="verify-dropzone__prompt">
                                        <span className="verify-dropzone__primary">Drop evidence file here</span>
                                        <span className="verify-dropzone__secondary">
                                            or <span className="verify-dropzone__browse">browse files</span>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="button"
                            className="verify-btn"
                            onClick={verifyEvidence}
                            disabled={!file || !evidenceId}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <polyline points="9 12 11 14 15 10" />
                            </svg>
                            Verify Evidence
                        </button>
                    </div>

                    <div className={`verify-result verify-result--${resultVariant}`}>
                        <div className="verify-result__header">
                            <h3 className="verify-result__title">Verification Result</h3>
                            <span className={`verify-result__badge verify-result__badge--${resultVariant}`}>
                                {resultLabel}
                            </span>
                        </div>

                        <div className="verify-result__body">
                            {result ? (
                                <>
                                    <div className={`verify-result__status-icon verify-result__status-icon--${resultVariant}`}>
                                        {resultVariant === "verified" ? (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                <polyline points="22 4 12 14.01 9 11.01" />
                                            </svg>
                                        ) : resultVariant === "tampered" ? (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="15" y1="9" x2="9" y2="15" />
                                                <line x1="9" y1="9" x2="15" y2="15" />
                                            </svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                        )}
                                    </div>
                                    <p className="verify-result__message">{result.message}</p>
                                    {result.status === "original" && (
                                        <p className="verify-result__detail">
                                            The uploaded file hash matches the original evidence record.
                                        </p>
                                    )}
                                    {result.status === "modified" && (
                                        <p className="verify-result__detail">
                                            The file hash does not match. The evidence may have been altered.
                                        </p>
                                    )}
                                    {result.status === "error" && (
                                        <p className="verify-result__detail">
                                            Unable to complete verification. Please check the evidence ID and try again.
                                        </p>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="verify-result__status-icon verify-result__status-icon--pending">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                    </div>
                                    <p className="verify-result__message">Awaiting verification</p>
                                    <p className="verify-result__detail">
                                        Submit an evidence ID and file above to run the integrity check.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                </div>

                <aside className="verify-info-card">
                    <h3 className="verify-info-card__title">Security Checks</h3>
                    <p className="verify-info-card__subtitle">
                        Suraksha-AI performs multiple layers of verification to ensure evidence authenticity.
                    </p>
                    <ul className="verify-info-list">
                        {INFO_ITEMS.map((item) => (
                            <li key={item.title} className="verify-info-list__item">
                                <span className="verify-info-list__icon">{item.icon}</span>
                                <div className="verify-info-list__text">
                                    <span className="verify-info-list__label">{item.title}</span>
                                    <span className="verify-info-list__desc">{item.description}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </aside>

            </div>

        </div>

    );

}

export default VerifyEvidence;
