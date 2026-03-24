import React, { useRef, useState } from "react";

export default function MicButton({ onTranscript, languageCode }) {
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");

  const startRecording = async () => {
    setRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    const audioChunks = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.wav");
      // Only add language_code if provided; otherwise let backend auto-detect
      if (languageCode && languageCode !== "auto") {
        formData.append("language_code", languageCode);
      }

      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/stt`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        const finalTranscript = data.transcript || data.text || "";
        const detectedLanguage = data.language_code || languageCode;
        const dialect = data.dialect || "";
        
        console.log("STT Result:", { finalTranscript, detectedLanguage, dialect });
        
        setTranscript(finalTranscript); // Show transcript locally
        
        // Call the callback with transcript, detected language, and dialect
        if (onTranscript) {
          onTranscript(finalTranscript, detectedLanguage, dialect);
        }
      } catch (err) {
        console.error("STT failed", err);
        setTranscript("STT failed. Please try again.");
      }
    };

    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current.stop();
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onMouseLeave={stopRecording}
        style={{
          padding: "20px",
          borderRadius: "50%",
          backgroundColor: recording ? "red" : "blue",
          color: "white",
          fontSize: "16px",
          border: "none",
          cursor: "pointer",
        }}
      >
        {recording ? "Recording..." : "Hold to Speak"}
      </button>
      <div style={{ marginTop: "20px", fontSize: "18px", minHeight: "30px", color: "gray" }}>
        {transcript}
      </div>
    </div>
  );
}