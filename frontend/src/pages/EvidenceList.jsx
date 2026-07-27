import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

const getFileUrl = (filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith("http")) return filePath;
  return `${API_BASE}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
};

const getFileName = (item) => {
  if (item.file_name) {
    return item.file_name.split("/").pop();
  }
  if (item.file) {
    return item.file.split("/").pop();
  }
  return "Untitled";
};

const formatFileType = (type) => {
  if (!type) return "Unknown";

  const typeMap = {
    "image/jpeg": "Image",
    "image/png": "Image",
    "image/gif": "Image",
    "image/webp": "Image",
    "video/mp4": "Video",
    "video/quicktime": "Video",
    "audio/mpeg": "Audio",
    "audio/wav": "Audio",
    "application/pdf": "PDF",
    "application/msword": "Document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Document",
  };

  if (typeMap[type]) return typeMap[type];

  const subtype = type.split("/")[1];
  return subtype ? subtype.toUpperCase() : type;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";

  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatus = (item) => {
  if (item.is_tampered) {
    return { label: "Tampered", variant: "tampered" };
  }
  if (item.hash_value) {
    return { label: "Verified", variant: "verified" };
  }
  return { label: "Pending", variant: "pending" };
};

function EvidenceList() {

  const [evidence, setEvidence] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();


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


  const filteredEvidence = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return evidence;

    return evidence.filter((item) => {
      const fileName = getFileName(item).toLowerCase();
      const fileType = formatFileType(item.file_type).toLowerCase();
      const description = (item.description || "").toLowerCase();

      return (
        fileName.includes(query) ||
        fileType.includes(query) ||
        description.includes(query)
      );
    });
  }, [evidence, searchQuery]);

  const handleView = (item) => {
    const url = getFileUrl(item.file);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleDownload = (item) => {
    const url = getFileUrl(item.file);
    if (!url) return;

    const link = document.createElement("a");
    link.href = url;
    link.download = getFileName(item);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVerify = (item) => {
    navigate("/verify", { state: { evidenceId: item.id } });
  };


  return (

    <div className="evidence-page">

      <header className="evidence-header">
        <div className="evidence-header__text">
          <h2 className="evidence-header__title">Evidence Library</h2>
          <p className="evidence-header__desc">
            Browse, search, and manage all your uploaded digital evidence in one place.
          </p>
        </div>
        <div className="evidence-header__stat">
          <span className="evidence-header__stat-value">{evidence.length}</span>
          <span className="evidence-header__stat-label">Total Files</span>
        </div>
      </header>

      <div className="evidence-toolbar">
        <div className="evidence-search">
          <svg className="evidence-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="evidence-search__input"
            placeholder="Search by file name, type, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {evidence.length === 0 ? (
        <div className="evidence-empty">
          <div className="evidence-empty__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <h3 className="evidence-empty__title">No evidence uploaded yet</h3>
          <p className="evidence-empty__text">
            Your uploaded files will appear here. Head to Upload Evidence to add your first file.
          </p>
        </div>
      ) : filteredEvidence.length === 0 ? (
        <div className="evidence-empty evidence-empty--search">
          <div className="evidence-empty__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h3 className="evidence-empty__title">No results found</h3>
          <p className="evidence-empty__text">
            No evidence matches &ldquo;{searchQuery}&rdquo;. Try a different search term.
          </p>
        </div>
      ) : (
        <>
          <div className="evidence-table-wrap">
            <table className="evidence-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>File Type</th>
                  <th>Upload Date</th>
                  <th>Verification Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvidence.map((item) => {
                  const status = getStatus(item);

                  return (
                    <tr key={item.id}>
                      <td data-label="File Name">
                        <div className="evidence-file-cell">
                          <span className="evidence-file-cell__icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                              <polyline points="13 2 13 9 20 9" />
                            </svg>
                          </span>
                          <div className="evidence-file-cell__info">
                            <span className="evidence-file-cell__name">{getFileName(item)}</span>
                            {item.description && (
                              <span className="evidence-file-cell__desc">{item.description}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td data-label="File Type">
                        <span className="evidence-type-tag">{formatFileType(item.file_type)}</span>
                      </td>
                      <td data-label="Upload Date">{formatDate(item.uploaded_at)}</td>
                      <td data-label="Verification Status">
                        <span className={`evidence-status evidence-status--${status.variant}`}>
                          {status.label}
                        </span>
                      </td>
                      <td data-label="Actions">
                        <div className="evidence-actions">
                          <button
                            type="button"
                            className="evidence-action-btn evidence-action-btn--view"
                            onClick={() => handleView(item)}
                            title="View file"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="evidence-action-btn evidence-action-btn--download"
                            onClick={() => handleDownload(item)}
                            title="Download file"
                          >
                            Download
                          </button>
                          <button
                            type="button"
                            className="evidence-action-btn evidence-action-btn--verify"
                            onClick={() => handleVerify(item)}
                            title="Verify evidence"
                          >
                            Verify
                          </button>
                          <button
                            type="button"
                            className="evidence-action-btn evidence-action-btn--report"
                            onClick={() => generateReport(item.id)}
                            title="Generate legal report"
                          >
                            Report
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="evidence-cards">
            {filteredEvidence.map((item) => {
              const status = getStatus(item);

              return (
                <article key={item.id} className="evidence-card">
                  <div className="evidence-card__top">
                    <div className="evidence-file-cell">
                      <span className="evidence-file-cell__icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                          <polyline points="13 2 13 9 20 9" />
                        </svg>
                      </span>
                      <div className="evidence-file-cell__info">
                        <span className="evidence-file-cell__name">{getFileName(item)}</span>
                        {item.description && (
                          <span className="evidence-file-cell__desc">{item.description}</span>
                        )}
                      </div>
                    </div>
                    <span className={`evidence-status evidence-status--${status.variant}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="evidence-card__meta">
                    <div className="evidence-card__meta-item">
                      <span className="evidence-card__meta-label">Type</span>
                      <span className="evidence-type-tag">{formatFileType(item.file_type)}</span>
                    </div>
                    <div className="evidence-card__meta-item">
                      <span className="evidence-card__meta-label">Uploaded</span>
                      <span>{formatDate(item.uploaded_at)}</span>
                    </div>
                  </div>

                  <div className="evidence-actions evidence-actions--card">
                    <button
                      type="button"
                      className="evidence-action-btn evidence-action-btn--view"
                      onClick={() => handleView(item)}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="evidence-action-btn evidence-action-btn--download"
                      onClick={() => handleDownload(item)}
                    >
                      Download
                    </button>
                    <button
                      type="button"
                      className="evidence-action-btn evidence-action-btn--verify"
                      onClick={() => handleVerify(item)}
                    >
                      Verify
                    </button>
                    <button
                      type="button"
                      className="evidence-action-btn evidence-action-btn--report"
                      onClick={() => generateReport(item.id)}
                    >
                      Report
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

    </div>

  );

}


export default EvidenceList;
