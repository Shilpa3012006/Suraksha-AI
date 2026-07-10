import { useState } from "react";
import axios from "axios";

function VerifyEvidence() {

    const [evidenceId, setEvidenceId] = useState("");
    const [file, setFile] = useState(null);

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

        } catch (error) {

            console.log(error);

            alert("Verification failed");

        }

    };

    return (

        <div>

            <h1>Verify Evidence</h1>

            <input
                type="number"
                placeholder="Evidence ID"
                value={evidenceId}
                onChange={(e) => setEvidenceId(e.target.value)}
            />

            <br /><br />

            <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
            />

            <br /><br />

            <button onClick={verifyEvidence}>
                Verify
            </button>

        </div>

    );

}

export default VerifyEvidence;