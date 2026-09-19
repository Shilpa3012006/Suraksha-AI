import { useEffect, useRef, useState } from "react";
import axios from "axios";

function CaptureEvidence() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const audioPreviewRef = useRef(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [captureMode, setCaptureMode] = useState(null);
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [capturedFile, setCapturedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleVideoReady = () => {
    setCameraReady(true);
  };

  const openCamera = async (mode) => {
    setMessage("");
    setError("");
    setCameraReady(false);
    setCaptureMode(mode);

    try {
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setError("Media access is not supported by this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia(
        mode === "audio"
          ? { audio: true }
          : {
              video: true,
              audio: mode === "video",
            }
      );

      streamRef.current = stream;
      setCameraOpen(true);

      if (mode !== "audio") {
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }, 100);
      } else {
        setCameraReady(true);
      }
    } catch (err) {
      console.error("Media access error:", err);

      if (err.name === "NotAllowedError") {
        setError(
          "Camera or microphone permission was denied. Please allow access in your browser."
        );
      } else if (err.name === "NotFoundError") {
        setError("Camera or microphone was not found on this device.");
      } else if (err.name === "NotReadableError") {
        setError(
          "The camera or microphone is already being used by another application."
        );
      } else {
        setError(
          "Unable to access the camera or microphone. Please try again."
        );
      }

      setCaptureMode(null);
    }
  };

  const closeCamera = () => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }

      mediaRecorderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    recordedChunksRef.current = [];

    setCameraOpen(false);
    setCameraReady(false);
    setCaptureMode(null);
    setRecording(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) {
      setError("Camera is not available.");
      return;
    }

    const video = videoRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError(
        "Camera is still starting. Please wait a moment and try again."
      );
      return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setError("Unable to prepare the photo.");
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setError("Unable to capture the photo.");
          return;
        }

        const file = new File(
          [blob],
          `captured_photo_${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

        setCapturedFile({
          file,
          captureType: "photo",
        });

        setPreviewUrl(URL.createObjectURL(file));
        setShowPreview(true);
        closeCamera();
      },
      "image/jpeg",
      0.95
    );
  };

  const startVideoRecording = () => {
    if (!streamRef.current) {
      setError("Camera is not available.");
      return;
    }

    if (!cameraReady) {
      setError("Camera is still starting. Please wait.");
      return;
    }

    if (!window.MediaRecorder) {
      setError("Video recording is not supported by this browser.");
      return;
    }

    recordedChunksRef.current = [];

    let options = {};

    if (
      MediaRecorder.isTypeSupported(
        "video/webm;codecs=vp9,opus"
      )
    ) {
      options = {
        mimeType: "video/webm;codecs=vp9,opus",
      };
    } else if (
      MediaRecorder.isTypeSupported(
        "video/webm;codecs=vp8,opus"
      )
    ) {
      options = {
        mimeType: "video/webm;codecs=vp8,opus",
      };
    } else if (MediaRecorder.isTypeSupported("video/webm")) {
      options = {
        mimeType: "video/webm",
      };
    }

    try {
      const recorder = new MediaRecorder(
        streamRef.current,
        options
      );

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(
          recordedChunksRef.current,
          {
            type: recorder.mimeType || "video/webm",
          }
        );

        if (blob.size === 0) {
          setError("No video was recorded.");
          return;
        }

        const file = new File(
          [blob],
          `captured_video_${Date.now()}.webm`,
          {
            type: blob.type || "video/webm",
          }
        );

        setCapturedFile({
          file,
          captureType: "video",
        });

        setPreviewUrl(URL.createObjectURL(file));
        setShowPreview(true);
        closeCamera();
      };

      recorder.start();

      setRecording(true);
      setMessage("");
      setError("");

      console.log("Video recording started.");
    } catch (err) {
      console.error("Recording error:", err);
      setError("Unable to start video recording.");
    }
  };

  const stopVideoRecording = () => {
    if (!mediaRecorderRef.current) {
      return;
    }

    if (mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();

      setRecording(false);

      console.log("Video recording stopped.");
    }
  };

  const startAudioRecording = () => {
    if (!streamRef.current) {
      setError("Microphone is not available.");
      return;
    }

    if (!window.MediaRecorder) {
      setError("Audio recording is not supported by this browser.");
      return;
    }

    recordedChunksRef.current = [];

    let options = {};

    if (
      MediaRecorder.isTypeSupported(
        "audio/webm;codecs=opus"
      )
    ) {
      options = {
        mimeType: "audio/webm;codecs=opus",
      };
    } else if (
      MediaRecorder.isTypeSupported("audio/webm")
    ) {
      options = {
        mimeType: "audio/webm",
      };
    } else if (
      MediaRecorder.isTypeSupported("audio/ogg")
    ) {
      options = {
        mimeType: "audio/ogg",
      };
    }

    try {
      const recorder = new MediaRecorder(
        streamRef.current,
        options
      );

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(
          recordedChunksRef.current,
          {
            type: recorder.mimeType || "audio/webm",
          }
        );

        if (blob.size === 0) {
          setError("No audio was recorded.");
          return;
        }

        const extension = blob.type.includes("ogg")
          ? "ogg"
          : "webm";

        const file = new File(
          [blob],
          `captured_audio_${Date.now()}.${extension}`,
          {
            type: blob.type || "audio/webm",
          }
        );

        setCapturedFile({
          file,
          captureType: "audio",
        });

        setPreviewUrl(URL.createObjectURL(file));
        setShowPreview(true);
        closeCamera();
      };

      recorder.start();

      setRecording(true);
      setMessage("");
      setError("");

      console.log("Audio recording started.");
    } catch (err) {
      console.error("Audio recording error:", err);
      setError("Unable to start audio recording.");
    }
  };

  const stopAudioRecording = () => {
    if (!mediaRecorderRef.current) {
      return;
    }

    if (mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();

      setRecording(false);

      console.log("Audio recording stopped.");
    }
  };

  const cancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setCapturedFile(null);
    setPreviewUrl("");
    setShowPreview(false);
  };

  const uploadEvidence = async (file, captureType) => {
    setUploading(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("capture_type", captureType);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/direct-capture/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(response.data.message);

      console.log(
        "Direct capture result:",
        response.data
      );

      closeCamera();

      return true;
    } catch (err) {
      console.error("Direct capture error:", err);

      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(
          "Unable to preserve the evidence. Please try again."
        );
      }

      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEvidence = async () => {
    if (!capturedFile) {
      return;
    }

    const success = await uploadEvidence(
      capturedFile.file,
      capturedFile.captureType
    );

    if (success) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setCapturedFile(null);
      setPreviewUrl("");
      setShowPreview(false);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="capture-page">
      <div className="capture-card">
        <div className="capture-icon">🛡️</div>

        <h1>Capture Evidence</h1>

        <p>
          Preserve important evidence securely without creating an
          account.
        </p>

        {!cameraOpen && !showPreview && (
          <div className="capture-options">
            <button
              type="button"
              onClick={() => openCamera("photo")}
              disabled={uploading}
            >
              📷 Capture Photo
            </button>

            <button
              type="button"
              onClick={() => openCamera("video")}
              disabled={uploading}
            >
              🎥 Capture Video
            </button>

            <button
              type="button"
              onClick={() => openCamera("audio")}
              disabled={uploading}
            >
              🎙️ Record Audio
            </button>
          </div>
        )}

        {cameraOpen && (
          <div className="camera-section">
            {captureMode !== "audio" && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={handleVideoReady}
                onCanPlay={handleVideoReady}
                className="camera-preview"
              />
            )}

            {captureMode === "audio" && (
              <div className="audio-recording-panel">
                <div className="capture-icon">🎙️</div>

                <p>Microphone is ready.</p>

                <p>
                  Speak clearly after starting the recording.
                </p>
              </div>
            )}

            <div className="camera-controls">
              {captureMode === "photo" && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  disabled={!cameraReady || uploading}
                >
                  {uploading
                    ? "Preserving..."
                    : cameraReady
                    ? "📸 Take Photo"
                    : "Starting Camera..."}
                </button>
              )}

              {captureMode === "video" && !recording && (
                <button
                  type="button"
                  onClick={startVideoRecording}
                  disabled={!cameraReady || uploading}
                >
                  {cameraReady
                    ? "🔴 Start Recording"
                    : "Starting Camera..."}
                </button>
              )}

              {captureMode === "video" && recording && (
                <button
                  type="button"
                  onClick={stopVideoRecording}
                  disabled={uploading}
                >
                  ⏹️ Stop Recording
                </button>
              )}

              {captureMode === "audio" && !recording && (
                <button
                  type="button"
                  onClick={startAudioRecording}
                  disabled={uploading}
                >
                  🎙️ Start Audio Recording
                </button>
              )}

              {captureMode === "audio" && recording && (
                <button
                  type="button"
                  onClick={stopAudioRecording}
                  disabled={uploading}
                >
                  ⏹️ Stop Audio Recording
                </button>
              )}

              <button
                type="button"
                onClick={closeCamera}
                disabled={recording || uploading}
              >
                Cancel
              </button>
            </div>

            {recording && (
              <p className="recording-status">
                🔴 Recording{" "}
                {captureMode === "audio" ? "audio" : "video"}...
              </p>
            )}
          </div>
        )}

        {showPreview && capturedFile && (
          <section className="capture-preview-section">
            <h2>Review Evidence</h2>

            {capturedFile.captureType === "photo" && (
              <img
                src={previewUrl}
                alt="Captured evidence preview"
                className="evidence-preview"
              />
            )}

            {capturedFile.captureType === "video" && (
              <video
                src={previewUrl}
                controls
                className="evidence-preview"
              />
            )}

            {capturedFile.captureType === "audio" && (
              <audio
                src={previewUrl}
                controls
                className="audio-preview"
              />
            )}

            <div className="preview-actions">
              <button
                type="button"
                onClick={handleSaveEvidence}
                disabled={uploading}
              >
                {uploading ? "Saving..." : "Save Evidence"}
              </button>

              <button
                type="button"
                onClick={cancelPreview}
                disabled={uploading}
              >
                Retake
              </button>
            </div>
          </section>
        )}

        {message && (
          <div className="capture-success">
            {message}
          </div>
        )}

        {error && (
          <div className="capture-error">
            {error}
          </div>
        )}

        <p className="capture-note">
          Evidence is securely preserved with integrity protection.
        </p>
      </div>
    </div>
  );
}

export default CaptureEvidence;