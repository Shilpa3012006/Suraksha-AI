import { useEffect, useState } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Calendar,
  Shield,
  FileText,
  Users,
  FolderOpen,
  Pencil,
  Key,
} from "lucide-react";

function Profile() {
  const [profile, setProfile] = useState({
    first_name: "",
    username: "",
    email: "",
    date_joined: "",
  });
  
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [contactCount, setContactCount] = useState(0);
  
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);

  const [editData, setEditData] = useState({
    first_name: "",
    email: "",
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access");
  
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
  
        const profileResponse = await axios.get(
          "http://127.0.0.1:8000/api/profile/",
          config
        );
  
        const evidenceResponse = await axios.get(
          "http://127.0.0.1:8000/api/my-evidence/",
          config
        );
  
        const contactResponse = await axios.get(
          "http://127.0.0.1:8000/api/trusted-contacts/list/",
          config
        );
  
        setProfile(profileResponse.data);
        setEditData({
          first_name: profileResponse.data.first_name || "",
          email: profileResponse.data.email || "",
        });
        setEvidenceCount(evidenceResponse.data.length);
        setContactCount(contactResponse.data.length);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  const initials =
  profile.first_name
    ?.split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase() || "U";

const joinedDate = profile.date_joined
  ? new Date(profile.date_joined).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    })
  : "";

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("access");
  
      const response = await axios.put(
        "http://127.0.0.1:8000/api/profile/",
        {
          first_name: editData.first_name,
          email: editData.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setProfile(response.data.user);
      setEditMode(false);
  
      alert("Profile updated successfully!");
  
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    }
  };

  const handlePasswordChange = async () => {

    if (passwordData.new_password !== passwordData.confirm_password) {
      alert("New passwords do not match.");
      return;
    }
  
    try {
  
      const token = localStorage.getItem("access");
  
      const response = await axios.put(
        "http://127.0.0.1:8000/api/change-password/",
        {
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      alert(response.data.message);
  
      setShowPasswordForm(false);
  
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
  
    } catch (error) {
  
      alert(
        error.response?.data?.error ||
        "Password update failed."
      );
  
    }
  
  };
  return (
    <div className="profile-page">
  
      {loading ? (
        <h2>Loading...</h2>
      ) : (
        <>
  
          <h1 className="profile-title">My Profile</h1>
  
          {/* Profile Header */}
  
          <div className="profile-summary">

          <div className="profile-avatar">
              {initials}
          </div>
      
          <div className="profile-info">
              <h2>{profile.first_name || profile.username}</h2>
              <p>Secure Evidence Owner</p>
          </div>
      
      </div>
          <div className="profile-grid">
            {/* Account Information */}

            {/* Account Information */}

            <div className="profile-card">

              <h3>Account Information</h3>

              {/* Full Name */}

              <div className="profile-row">

                <div className="profile-label">
                  <User size={18} />
                  <span>Full Name</span>
                </div>

                {editMode ? (
                  <input
                    className="profile-input"
                    value={editData.first_name}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        first_name: e.target.value,
                      })
                    }
                  />
                ) : (
                  <strong>{profile.first_name || "-"}</strong>
                )}

              </div>

              {/* Username */}

              <div className="profile-row">

                <div className="profile-label">
                  <User size={18} />
                  <span>Username</span>
                </div>

                <strong>{profile.username}</strong>

              </div>

              {/* Email */}

              <div className="profile-row">

                <div className="profile-label">
                  <Mail size={18} />
                  <span>Email</span>
                </div>

                {editMode ? (
                  <input
                    className="profile-input"
                    type="email"
                    value={editData.email}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        email: e.target.value,
                      })
                    }
                  />
                ) : (
                  <strong>{profile.email || "Not Available"}</strong>
                )}

              </div>

              {/* Member Since */}

              <div className="profile-row">

                <div className="profile-label">
                  <Calendar size={18} />
                  <span>Member Since</span>
                </div>

                <strong>{joinedDate}</strong>

              </div>

            </div>
    
            {/* Security */}
    
            <div className="profile-card">
    
              <h3>Security</h3>
    
              <div className="profile-row">
                <Shield size={20} />
                <span>JWT Authentication</span>
                <strong>Enabled</strong>
              </div>
    
              <div className="profile-row">
                <User size={20} />
                <span>Full Name</span>

                {editMode ? (
                  <input
                    className="profile-input"
                    value={editData.first_name}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        first_name: e.target.value,
                      })
                    }
                  />
                ) : (
                  <strong>{profile.first_name || "-"}</strong>
                )}
              </div>
    
              <div className="profile-row">
                <Shield size={20} />
                <span>Trusted Backup</span>
                <strong>Enabled</strong>
              </div>
    
            </div>
          </div>
  
          {/* Quick Information */}
  
          <div className="profile-card">
  
            <h3>Quick Information</h3>
  
            <div className="stats-grid">
  
              <div className="stat-card">
                <FolderOpen size={26} />
                <h2>{evidenceCount}</h2>
                <p>Evidence Uploaded</p>
              </div>
  
              <div className="stat-card">
                <Users size={26} />
                <h2>{contactCount}</h2>
                <p>Trusted Contacts</p>
              </div>
  
              <div className="stat-card">
                <FileText size={26} />
                <h2>--</h2>
                <p>Reports Generated</p>
              </div>
  
            </div>
  
          </div>
  
          {/* Buttons */}
  
          <div className="profile-actions">

            {editMode ? (
              <>
                <button
                  className="edit-btn"
                  onClick={handleSave}
                >
                  Save Changes
                </button>

                <button
                  className="password-btn"
                  onClick={() => {
                    setEditData({
                      first_name: profile.first_name,
                      email: profile.email,
                    });
                    setEditMode(false);
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  className="edit-btn"
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </button>

                <button
                  className="password-btn"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                >
                  Change Password
                </button>
              </>
            )}

          </div>

          {showPasswordForm && (

          <div className="profile-card">

              <h3>Change Password</h3>

              <input
                  className="profile-input"
                  type="password"
                  placeholder="Current Password"
                  value={passwordData.current_password}
                  onChange={(e)=>
                      setPasswordData({
                          ...passwordData,
                          current_password:e.target.value
                      })
                  }
              />

              <br /><br />

              <input
                  className="profile-input"
                  type="password"
                  placeholder="New Password"
                  value={passwordData.new_password}
                  onChange={(e)=>
                      setPasswordData({
                          ...passwordData,
                          new_password:e.target.value
                      })
                  }
              />

              <br /><br />

              <input
                  className="profile-input"
                  type="password"
                  placeholder="Confirm New Password"
                  value={passwordData.confirm_password}
                  onChange={(e)=>
                      setPasswordData({
                          ...passwordData,
                          confirm_password:e.target.value
                      })
                  }
              />

              <br /><br />

              <button
                  className="edit-btn"
                  onClick={handlePasswordChange}
              >
                  Update Password
              </button>

          </div>

          )}
  
        </>
      )}
  
    </div>
  );
}

export default Profile;