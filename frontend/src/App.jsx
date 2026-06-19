import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadEvidence from "./pages/UploadEvidence";
import EvidenceList from "./pages/EvidenceList";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";


function App() {

  return (

    <BrowserRouter>

      <Routes>
        <Route path="/evidence" element={<EvidenceList />} />
        <Route path="/upload" element={<UploadEvidence />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />

      </Routes>

    </BrowserRouter>

  );
}

export default App;