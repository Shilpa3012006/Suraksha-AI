import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import UploadEvidence from "./pages/UploadEvidence";
import EvidenceList from "./pages/EvidenceList";
import VerifyEvidence from "./pages/VerifyEvidence";
import TrustedContacts from "./pages/TrustedContacts";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<UploadEvidence />} />
          <Route path="/evidence" element={<EvidenceList />} />
          <Route path="/verify" element={<VerifyEvidence />} />
          <Route path="/trusted-contacts" element={<TrustedContacts />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
