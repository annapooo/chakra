// e:\chakra\chakra\frontend\src\components\MicButton.jsx
import React, { useRef, useState } from "react";

export default function MicButton() {
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

      try {
        const response = await fetch("http://localhost:8000/stt", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        console.log("STT Result:", data.text);
        setTranscript(data.text); // Show transcript
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
      <div style={{ marginTop: "20px", fontSize: "18px", minHeight: "30px" }}>
        {transcript}
      </div>
    </div>
  );
}