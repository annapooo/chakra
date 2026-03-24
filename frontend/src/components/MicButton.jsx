import React, { useRef, useState } from "react";
import { Mic, Square } from "lucide-react";

export default function MicButton({ onTranscript, languageCode }) {
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("Ready");

  const toggleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    setRecording(true);
    setTranscript("Listening...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      const audioChunks = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");
      // Only add language_code if provided; otherwise let backend auto-detect
      if (languageCode && languageCode !== "auto") {
        formData.append("language_code", languageCode);
      }

      try {
        const API_URL = import.meta.env.VITE_APP_API_URL || `http://${window.location.hostname}:8000`;
        const response = await fetch(`${API_URL}/stt`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        const finalTranscript = data.transcript || data.text || "";
        // Strictly preserve the user's manual dropdown selection if it wasn't "auto"
        const finalLanguage = (languageCode && languageCode !== "auto") ? languageCode : (data.language_code || languageCode || "hi-IN");
        const dialect = data.dialect || "";
        
        console.log("STT Result:", { finalTranscript, finalLanguage, dialect });
        
        setTranscript(finalTranscript); // Show transcript locally
        
        // Call the callback with transcript, detected language, and dialect
        if (onTranscript) {
          onTranscript(finalTranscript, finalLanguage, dialect);
        }
      } catch (err) {
        console.error("STT failed", err);
        setTranscript("STT failed. Please try again.");
      }
    };

    mediaRecorderRef.current.start();
    } catch (err) {
      console.error("Mic access failed", err);
      setTranscript("Mic access failed. Check permissions.");
      setRecording(false);
    }
  };

  const stopRecording = () => {
    setRecording(false);
    setTranscript("Processing audio...");
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      // Free the microphone lock immediately
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center relative">
      <button
        onClick={toggleRecording}
        className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all bg-[#080808] shadow-[0_0_20px_rgba(0,0,0,0.4)] border-2 z-10 ${
          recording 
            ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse hover:bg-red-500/30' 
            : 'border-yellow-600/50 text-yellow-500 hover:bg-yellow-500/10 hover:border-yellow-400'
        }`}
      >
        {recording ? <Square fill="currentColor" size={20} /> : <Mic size={24} />}
      </button>
      <div className="absolute -top-6 whitespace-nowrap text-[10px] md:text-[11px] text-yellow-500/80 uppercase tracking-widest font-black drop-shadow-md z-0 pointer-events-none">
        {transcript !== "Ready" ? transcript : ""}
      </div>
    </div>
  );
}