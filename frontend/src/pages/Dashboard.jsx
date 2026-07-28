import { useEffect, useState } from "react";
import axios from "axios";

import {
  Shield,
  Upload,
  CheckCircle,
  Users,
  FileText,
  Lock,
  Database,
  Activity,
} from "lucide-react";

function Dashboard() {
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [contactCount, setContactCount] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("access");
  
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
  
        const evidenceResponse = await axios.get(
          "http://127.0.0.1:8000/api/my-evidence/",
          config
        );
  
        const contactsResponse = await axios.get(
          "http://127.0.0.1:8000/api/trusted-contacts/list/",
          config
        );
  
        setEvidenceCount(evidenceResponse.data.length);
        setContactCount(contactsResponse.data.length);
      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchDashboardData();
  }, []);
  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Welcome to Suraksha-AI</h1>
        <p>
          Your secure AI-powered platform for preserving, verifying, and managing
          digital evidence.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="dashboard-overview">
        <div className="overview-card">
          <Upload size={32} />
          <h3>Evidence</h3>
          <span>{loading ? "..." : evidenceCount}</span>
          <p>Upload and preserve evidence securely.</p>
        </div>

        <div className="overview-card">
          <FileText size={32} />
          <h3>Reports</h3>
          <span>--</span>
          <p>Legal reports generated.</p>
        </div>

        <div className="overview-card">
          <Users size={32} />
          <h3>Trusted Contacts</h3>
          <span>{loading ? "..." : contactCount}</span>
          <p>Emergency contacts available.</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>

        <div className="action-grid">
          <div className="action-card">
            <Upload size={28} />
            <h4>Upload Evidence</h4>
            <p>Capture and securely store digital evidence.</p>
          </div>

          <div className="action-card">
            <CheckCircle size={28} />
            <h4>Verify Evidence</h4>
            <p>Validate integrity using cryptographic hashing.</p>
          </div>

          <div className="action-card">
            <Users size={28} />
            <h4>Trusted Contacts</h4>
            <p>Manage emergency contacts securely.</p>
          </div>

          <div className="action-card">
            <FileText size={28} />
            <h4>Legal Reports</h4>
            <p>Generate reports for legal documentation.</p>
          </div>
        </div>
      </div>

      {/* Security Status */}
      <div className="dashboard-section">
        <h2>Security Features</h2>

        <div className="security-grid">
          <div className="security-card">
            <Shield size={26} />
            <span>Evidence Protection</span>
          </div>

          <div className="security-card">
            <Lock size={26} />
            <span>Encryption Enabled</span>
          </div>

          <div className="security-card">
            <Database size={26} />
            <span>Secure Backup</span>
          </div>

          <div className="security-card">
            <Activity size={26} />
            <span>Tamper Detection</span>
          </div>
        </div>
      </div>

      {/* Safety Tips */}
      <div className="dashboard-section">
        <h2>Safety Tips</h2>

        <ul className="tips-list">
          <li>Upload evidence immediately after an incident.</li>
          <li>Keep your trusted contacts updated.</li>
          <li>Verify evidence before sharing it.</li>
          <li>Generate legal reports whenever required.</li>
        </ul>
      </div>

      {/* Activity */}
      <div className="dashboard-section">
        <h2>Recent Activity</h2>

        <div className="empty-state">
          <Activity size={45} />
          <p>No recent activity available.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;