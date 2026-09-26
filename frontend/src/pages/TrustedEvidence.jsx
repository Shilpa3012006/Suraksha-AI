import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function getFileIcon(fileType = "") {
  if (fileType.startsWith("image/")) return "🖼️";
  if (fileType.startsWith("video/")) return "🎥";
  if (fileType.startsWith("audio/")) return "🎵";
  if (
    fileType.includes("pdf") ||
    fileType.includes("document") ||
    fileType.includes("text")
  ) {
    return "📄";
  }

  return "📁";
}

function getFileCategory(fileType = "") {
  if (fileType.startsWith("image/")) return "Image";
  if (fileType.startsWith("video/")) return "Video";
  if (fileType.startsWith("audio/")) return "Audio";
  if (fileType.includes("pdf")) return "PDF";
  if (fileType.includes("document")) return "Document";

  return "File";
}

function TrustedEvidence() {
  const { accessToken } = useParams();

  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/trusted-access/${accessToken}/`
        );

        setEvidence(response.data);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.error ||
            "Unable to access trusted evidence."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvidence();
  }, [accessToken]);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingScreen}>
          <div style={styles.loadingLogo}>S</div>
          <div style={styles.spinner}></div>

          <h2 style={styles.loadingTitle}>
            Securing Your Access
          </h2>

          <p style={styles.loadingText}>
            Loading the shared evidence library...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.errorScreen}>
          <div style={styles.errorIcon}>!</div>

          <h2 style={styles.errorTitle}>
            Access Unavailable
          </h2>

          <p style={styles.errorText}>
            {error}
          </p>

          <div style={styles.errorHint}>
            Please make sure you are using the secure access link
            provided by Suraksha.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* Top security header */}
      <header style={styles.topHeader}>
        <div style={styles.brand}>
          <div style={styles.brandLogo}>S</div>

          <div>
            <div style={styles.brandName}>
              Suraksha
            </div>

            <div style={styles.brandSubtitle}>
              Secure Evidence Platform
            </div>
          </div>
        </div>

        <div style={styles.secureBadge}>
          <span style={styles.secureCheck}>✓</span>
          Secure Access
        </div>
      </header>

      <main style={styles.container}>

        {/* Hero section */}
        <section style={styles.hero}>
          <div style={styles.heroGlow}></div>

          <div style={styles.heroContent}>
            <div style={styles.shieldIcon}>
              🛡️
            </div>

            <div>
              <div style={styles.heroEyebrow}>
                TRUSTED CONTACT ACCESS
              </div>

              <h1 style={styles.heroTitle}>
                Shared Evidence Library
              </h1>

              <p style={styles.heroDescription}>
                You have been granted secure access to evidence
                preserved through Suraksha.
              </p>
            </div>
          </div>

          <div style={styles.heroSecurity}>
            <span style={styles.greenDot}></span>
            Your access is protected by a secure private link
          </div>
        </section>

        {/* Summary cards */}
        <section style={styles.summaryGrid}>

          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>
              📂
            </div>

            <div>
              <div style={styles.summaryNumber}>
                {evidence.length}
              </div>

              <div style={styles.summaryLabel}>
                Total Evidence
              </div>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>
              🔐
            </div>

            <div>
              <div style={styles.summaryNumber}>
                Secure
              </div>

              <div style={styles.summaryLabel}>
                Protected Access
              </div>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>
              ☁️
            </div>

            <div>
              <div style={styles.summaryNumber}>
                Preserved
              </div>

              <div style={styles.summaryLabel}>
                Evidence Storage
              </div>
            </div>
          </div>

        </section>

        {/* Evidence section */}
        <section style={styles.evidenceSection}>

          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                Evidence
              </h2>

              <p style={styles.sectionSubtitle}>
                All evidence currently available through this
                trusted access link.
              </p>
            </div>

            <div style={styles.evidenceCount}>
              {evidence.length}{" "}
              {evidence.length === 1
                ? "Item"
                : "Items"}
            </div>
          </div>

          {evidence.length === 0 ? (
            <div style={styles.emptyCard}>
              <div style={styles.emptyIcon}>
                📂
              </div>

              <h3 style={styles.emptyTitle}>
                No Evidence Available
              </h3>

              <p style={styles.emptyText}>
                There is currently no evidence available in the
                shared evidence library.
              </p>
            </div>
          ) : (
            <div style={styles.evidenceCard}>

              <div style={styles.tableHeader}>
                <div>Evidence</div>
                <div>File Type</div>
                <div>Action</div>
              </div>

              {evidence.map((item) => (
                <div
                  key={`${item.record_type}-${item.id}`}
                  style={styles.evidenceRow}
                >

                  {/* Evidence information */}
                  <div style={styles.evidenceInfo}>
                    <div style={styles.fileIcon}>
                      {getFileIcon(item.file_type)}
                    </div>

                    <div style={styles.fileDetails}>

                      <div style={styles.fileName}>
                        {item.file_name}
                      </div>

                      <div style={styles.evidenceId}>
                        Evidence ID:{" "}
                        <strong>{item.id}</strong>
                      </div>

                    </div>
                  </div>

                  {/* File type */}
                  <div>
                    <span style={styles.typeBadge}>
                      {getFileCategory(item.file_type)}
                    </span>

                    <div style={styles.mimeType}>
                      {item.file_type}
                    </div>
                  </div>

                  {/* Action */}
                  <div style={styles.actionCell}>
                    {item.file ? (
                      <a
                        href={`http://127.0.0.1:8000${item.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.openButton}
                      >
                        Open Evidence
                        <span style={styles.arrow}>
                          →
                        </span>
                      </a>
                    ) : (
                      <span style={styles.unavailable}>
                        Unavailable
                      </span>
                    )}
                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

        {/* Security information */}
        <section style={styles.securityCard}>
          <div style={styles.securityIcon}>
            🔒
          </div>

          <div>
            <h3 style={styles.securityTitle}>
              Secure Evidence Access
            </h3>

            <p style={styles.securityText}>
              This page provides access through your trusted
              contact link. Evidence is preserved by Suraksha
              and can be opened directly from this secure portal.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <div style={styles.footerBrand}>
            <div style={styles.footerLogo}>S</div>

            <span>Suraksha</span>
          </div>

          <span style={styles.footerText}>
            Secure Evidence Preservation Platform
          </span>
        </footer>

      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f7f9fc 0%, #eef3f8 100%)",
    color: "#172033",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  topHeader: {
    height: "74px",
    background: "#ffffff",
    borderBottom: "1px solid #e5eaf0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 6%",
    boxSizing: "border-box",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  brandLogo: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    background:
      "linear-gradient(135deg, #172554, #2563eb)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: 800,
    boxShadow: "0 5px 15px rgba(37, 99, 235, 0.25)",
  },

  brandName: {
    fontSize: "17px",
    fontWeight: 750,
    color: "#172033",
  },

  brandSubtitle: {
    fontSize: "11px",
    color: "#8a94a6",
    marginTop: "2px",
  },

  secureBadge: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "8px 13px",
    borderRadius: "30px",
    background: "#ecfdf5",
    border: "1px solid #bbf7d0",
    color: "#047857",
    fontSize: "12px",
    fontWeight: 700,
  },

  secureCheck: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "#10b981",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
  },

  container: {
    width: "90%",
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "35px 0 30px",
  },

  hero: {
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #111c3a 0%, #172554 55%, #1d4ed8 100%)",
    borderRadius: "22px",
    padding: "38px 42px",
    color: "#ffffff",
    boxShadow:
      "0 18px 45px rgba(23, 37, 84, 0.20)",
    marginBottom: "22px",
  },

  heroGlow: {
    position: "absolute",
    width: "280px",
    height: "280px",
    right: "-90px",
    top: "-130px",
    borderRadius: "50%",
    background: "rgba(96, 165, 250, 0.18)",
  },

  heroContent: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },

  shieldIcon: {
    width: "64px",
    height: "64px",
    flexShrink: 0,
    borderRadius: "18px",
    background: "rgba(255, 255, 255, 0.12)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
  },

  heroEyebrow: {
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.14em",
    color: "#93c5fd",
    marginBottom: "7px",
  },

  heroTitle: {
    margin: 0,
    fontSize: "30px",
    lineHeight: 1.2,
    fontWeight: 750,
  },

  heroDescription: {
    margin: "9px 0 0",
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: 1.6,
    maxWidth: "650px",
  },

  heroSecurity: {
    position: "relative",
    marginTop: "25px",
    paddingTop: "17px",
    borderTop: "1px solid rgba(255, 255, 255, 0.12)",
    color: "#bfdbfe",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  greenDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#34d399",
    boxShadow: "0 0 8px rgba(52, 211, 153, 0.7)",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "28px",
  },

  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e5eaf0",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.04)",
  },

  summaryIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
  },

  summaryNumber: {
    fontSize: "20px",
    fontWeight: 750,
    color: "#172033",
  },

  summaryLabel: {
    fontSize: "12px",
    color: "#8a94a6",
    marginTop: "3px",
  },

  evidenceSection: {
    marginTop: "5px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "end",
    marginBottom: "14px",
    gap: "15px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 750,
    color: "#172033",
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    color: "#8a94a6",
    fontSize: "13px",
  },

  evidenceCount: {
    padding: "7px 12px",
    borderRadius: "20px",
    background: "#ffffff",
    border: "1px solid #e1e7ef",
    color: "#526071",
    fontSize: "12px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  evidenceCard: {
    background: "#ffffff",
    border: "1px solid #e5eaf0",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.055)",
  },

  tableHeader: {
    display: "grid",
    gridTemplateColumns: "1.6fr 0.8fr 0.7fr",
    gap: "20px",
    padding: "13px 22px",
    background: "#f8fafc",
    borderBottom: "1px solid #e9edf2",
    color: "#8993a3",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },

  evidenceRow: {
    display: "grid",
    gridTemplateColumns: "1.6fr 0.8fr 0.7fr",
    gap: "20px",
    alignItems: "center",
    padding: "17px 22px",
    borderBottom: "1px solid #edf0f4",
  },

  evidenceInfo: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    minWidth: 0,
  },

  fileIcon: {
    width: "45px",
    height: "45px",
    flexShrink: 0,
    borderRadius: "12px",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  fileDetails: {
    minWidth: 0,
  },

  fileName: {
    fontSize: "14px",
    fontWeight: 650,
    color: "#273449",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  evidenceId: {
    marginTop: "5px",
    fontSize: "11px",
    color: "#98a2b1",
  },

  typeBadge: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "7px",
    background: "#f1f5f9",
    color: "#526071",
    fontSize: "11px",
    fontWeight: 700,
  },

  mimeType: {
    marginTop: "5px",
    color: "#a0a8b5",
    fontSize: "10px",
    maxWidth: "160px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  actionCell: {
    display: "flex",
    justifyContent: "flex-end",
  },

  openButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 13px",
    borderRadius: "9px",
    background:
      "linear-gradient(135deg, #1d4ed8, #2563eb)",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "11px",
    fontWeight: 700,
    boxShadow:
      "0 5px 12px rgba(37, 99, 235, 0.20)",
  },

  arrow: {
    fontSize: "15px",
    lineHeight: 1,
  },

  unavailable: {
    color: "#9ca3af",
    fontSize: "12px",
  },

  securityCard: {
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "18px 20px",
    borderRadius: "14px",
    background: "#f0fdf4",
    border: "1px solid #d1fae5",
  },

  securityIcon: {
    width: "42px",
    height: "42px",
    flexShrink: 0,
    borderRadius: "11px",
    background: "#dcfce7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  securityTitle: {
    margin: 0,
    color: "#166534",
    fontSize: "14px",
    fontWeight: 750,
  },

  securityText: {
    margin: "4px 0 0",
    color: "#4b6354",
    fontSize: "12px",
    lineHeight: 1.5,
  },

  emptyCard: {
    background: "#ffffff",
    border: "1px solid #e5eaf0",
    borderRadius: "18px",
    padding: "65px 25px",
    textAlign: "center",
    boxShadow:
      "0 8px 25px rgba(15, 23, 42, 0.04)",
  },

  emptyIcon: {
    fontSize: "38px",
    marginBottom: "12px",
  },

  emptyTitle: {
    margin: 0,
    fontSize: "19px",
    color: "#273449",
  },

  emptyText: {
    margin: "7px auto 0",
    maxWidth: "430px",
    color: "#8a94a6",
    fontSize: "13px",
  },

  loadingScreen: {
    width: "90%",
    maxWidth: "430px",
    margin: "130px auto",
    padding: "45px 30px",
    background: "#ffffff",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow:
      "0 15px 45px rgba(15, 23, 42, 0.08)",
    border: "1px solid #e5eaf0",
  },

  loadingLogo: {
    width: "52px",
    height: "52px",
    margin: "0 auto 20px",
    borderRadius: "15px",
    background:
      "linear-gradient(135deg, #172554, #2563eb)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: 800,
  },

  spinner: {
    width: "28px",
    height: "28px",
    margin: "0 auto 18px",
    borderRadius: "50%",
    border: "3px solid #dbeafe",
    borderTop: "3px solid #2563eb",
    animation: "spin 1s linear infinite",
  },

  loadingTitle: {
    margin: 0,
    fontSize: "19px",
    color: "#273449",
  },

  loadingText: {
    margin: "7px 0 0",
    color: "#8a94a6",
    fontSize: "13px",
  },

  errorScreen: {
    width: "90%",
    maxWidth: "500px",
    margin: "120px auto",
    padding: "45px 30px",
    background: "#ffffff",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow:
      "0 15px 45px rgba(15, 23, 42, 0.08)",
    border: "1px solid #e5eaf0",
  },

  errorIcon: {
    width: "48px",
    height: "48px",
    margin: "0 auto 16px",
    borderRadius: "50%",
    background: "#fef2f2",
    color: "#dc2626",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
    fontWeight: 800,
  },

  errorTitle: {
    margin: 0,
    color: "#273449",
    fontSize: "21px",
  },

  errorText: {
    margin: "8px 0 0",
    color: "#6b7280",
    fontSize: "13px",
  },

  errorHint: {
    marginTop: "18px",
    padding: "11px 14px",
    borderRadius: "9px",
    background: "#f8fafc",
    color: "#8a94a6",
    fontSize: "11px",
    lineHeight: 1.5,
  },

  footer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
    marginTop: "27px",
    paddingTop: "20px",
    borderTop: "1px solid #e1e7ef",
  },

  footerBrand: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#526071",
    fontSize: "12px",
    fontWeight: 700,
  },

  footerLogo: {
    width: "21px",
    height: "21px",
    borderRadius: "6px",
    background: "#172554",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: 800,
  },

  footerText: {
    color: "#a0a8b5",
    fontSize: "11px",
  },
};

export default TrustedEvidence;