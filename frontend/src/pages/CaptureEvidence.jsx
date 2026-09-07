function CaptureEvidence() {
    return (
      <div className="capture-page">
        <div className="capture-card">
          <div className="capture-icon">🛡️</div>
  
          <h1>Capture Evidence</h1>
  
          <p>
            Preserve important evidence securely without creating an account.
          </p>
  
          <div className="capture-options">
            <button type="button">
              📷 Capture Photo
            </button>
  
            <button type="button">
              🎥 Capture Video
            </button>
  
            <button type="button">
              🎙️ Record Audio
            </button>
          </div>
  
          <p className="capture-note">
            Your evidence will be securely preserved with integrity protection.
          </p>
        </div>
      </div>
    );
  }
  
  export default CaptureEvidence;