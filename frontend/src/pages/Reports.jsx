import { useEffect, useState } from "react";
import axios from "axios";

function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("access");
      console.log("Access token:", token);

      const response = await axios.get(
        "http://127.0.0.1:8000/api/reports/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReports(response.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Unable to load reports.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (report) => {
    if (report.pdf_file) {
      window.open(report.pdf_file, "_blank");
    }
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1>Reports</h1>
        <p>
          View and manage your generated document summaries and evidence
          records.
        </p>
      </div>

      <div className="reports-summary">
        <div className="report-stat-card">
          <h2>{reports.length}</h2>
          <span>Total Reports</span>
        </div>

        <div className="report-stat-card">
          <h2>PDF</h2>
          <span>Export Format</span>
        </div>

        <div className="report-stat-card">
          <h2>Secure</h2>
          <span>Evidence Protected</span>
        </div>
      </div>

      {loading ? (
        <div className="reports-empty">
          <h2>Loading Reports...</h2>
          <p>Please wait while your reports are being loaded.</p>
        </div>
      ) : error ? (
        <div className="reports-empty">
          <h2>Unable to Load Reports</h2>
          <p>{error}</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="reports-empty">
          <div className="reports-empty-icon">📄</div>

          <h2>No Reports Available</h2>

          <p>
            Generate a document summary from the Evidence Library.
            Your generated reports will appear here.
          </p>
        </div>
      ) : (
        <div className="reports-list">
          {reports.map((report) => (
            <div key={report.id} className="report-card">
              <div>
                <h3>
                  {report.evidence_name || "Evidence Document Summary"}
                </h3>

                <p>
                  Generated:{" "}
                  {new Date(report.created_at).toLocaleString()}
                </p>

                <p>
                  Evidence ID: {report.evidence}
                </p>
              </div>

              <button
                className="download-report-btn"
                onClick={() => handleDownload(report)}
              >
                View PDF
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Reports;