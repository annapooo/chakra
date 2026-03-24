import React, { useState, useRef } from 'react';

const MicButton = ({ onTranscript, languageCode }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        
        const timestamp = new Date().getTime();
        const file = new File([audioBlob], `recording_${timestamp}.webm`, { type: 'audio/webm' });
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('language_code', languageCode);

        try {
          const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
          const response = await fetch(`${API_URL}/stt`, {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            onTranscript(data.transcript, data.language_code);
          } else {
            console.error('STT failed');
          }
        } catch (error) {
          console.error('Error during STT request:', error);
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onMouseLeave={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        disabled={isProcessing}
        className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
          isRecording 
            ? 'bg-red-500 scale-110 shadow-red-200 animate-pulse' 
            : isProcessing 
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 shadow-indigo-200'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 text-white ${isProcessing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isProcessing ? (
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          ) : (
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          )}
        </svg>
      </button>
      <span className="mt-4 text-sm font-medium text-gray-500">
        {isRecording ? 'Listening...' : isProcessing ? 'Processing...' : 'Hold to Speak'}
      </span>
    </div>
  );
};

export default MicButton;
