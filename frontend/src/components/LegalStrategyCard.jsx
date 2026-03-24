import React, { useState, useEffect, useRef } from 'react';

const LegalStrategyCard = ({ strategy, languageCode }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState(null);
  const isPlayingRef = useRef(false);
  const currentAudioRef = useRef(null);

  const playAudioFromBase64 = async (base64Audio) => {
    try {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      const audio = new Audio("data:audio/wav;base64," + base64Audio);
      currentAudioRef.current = audio;
      await audio.play();
      return new Promise((resolve) => {
        audio.onended = () => {
          resolve(); 
        };
        audio.onerror = resolve;
      });
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  const steps = strategy?.defence_steps || (strategy?.explanation ? strategy.explanation.split('\n').filter(s => s.trim() !== '') : []);

  const fetchAndPlayTTS = async (text) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language_code: languageCode })
      });
      
      if (response.ok) {
        const data = await response.json();
        await playAudioFromBase64(data.audio_base64);
      }
    } catch (error) {
      console.error("TTS fetch failed", error);
    }
  };

  useEffect(() => {
    // Abort out of existing sequences and explicitly pause old tracks
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    isPlayingRef.current = false;
    
    const timeout = setTimeout(() => {
      if (steps.length > 0) {
        playAllSteps();
      }
    }, 100);

    return () => {
      if (currentAudioRef.current) currentAudioRef.current.pause();
      isPlayingRef.current = false;
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategy]);

  const playAllSteps = async () => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;
    setIsPlaying(true);
    for (let i = 0; i < steps.length; i++) {
      if (!isPlayingRef.current) break; // allows the loop to exit cleanly if interrupted
      setCurrentStepIndex(i);
      await fetchAndPlayTTS(steps[i]);
    }
    
    // Only reset state if we weren't violently interrupted by a user action
    if (isPlayingRef.current) {
      setCurrentStepIndex(-1);
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  };

  const handleDeployAgent = async () => {
    setIsDeploying(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/agent/fill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: "CASE-" + Date.now(),
          user_details: {
            name: "John Doe",
            licence_number: "DL-1420110012345",
            challan_number: "MH0123456789"
          }
        })
      });
      if (response.ok) {
        const data = await response.json();
        setDeploymentStatus(`Success! Reference ID: ${data.reference_id}`);
      }
    } catch (error) {
      console.error("Agent deployment failed", error);
    } finally {
      setIsDeploying(false);
    }
  };

  if (!strategy) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="bg-blue-50 text-blue-800 rounded-lg p-4 mb-6 border border-blue-100">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-500">Matched Section</span>
        <h4 className="text-lg font-bold mt-1">{strategy.matched_section || "General Advice"}</h4>
      </div>

      <div className="flex-grow space-y-4 mb-8">
        {steps.map((step, idx) => (
          <div 
            key={idx} 
            className={`p-4 rounded-xl border transition-all duration-300 ${
              currentStepIndex === idx 
                ? 'bg-indigo-50 border-indigo-300 shadow-md transform scale-100' 
                : 'bg-white border-gray-100 opacity-80 scale-95'
            }`}
          >
            <div className="flex items-start gap-4">
              <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${currentStepIndex === idx ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                {idx + 1}
              </span>
              <p className={`text-lg ${currentStepIndex === idx ? 'text-indigo-900 font-medium' : 'text-gray-600'}`}>
                {step}
              </p>
            </div>
            {currentStepIndex === idx && (
              <div className="mt-4 flex gap-1 items-center justify-end px-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <button
          onClick={handleDeployAgent}
          disabled={isDeploying || deploymentStatus}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
            deploymentStatus
              ? 'bg-gray-800 cursor-not-allowed'
              : isDeploying
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-900 hover:bg-gray-900 shadow-lg shadow-indigo-900/30'
          }`}
        >
          {isDeploying ? 'Deploying Autonomous Agent...' : deploymentStatus ? 'Agent Deployed' : 'Deploy Agent for Dispute'}
        </button>
        {deploymentStatus && (
          <p className="mt-3 text-center text-sm font-semibold text-green-600 animate-pulse">
            {deploymentStatus}
          </p>
        )}
      </div>
    </div>
  );
};

export default LegalStrategyCard;
