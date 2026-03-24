import React, { useState } from 'react';

const TranscriptBox = ({ transcript, languageCode, dialect, onStrategyReceived }) => {
  const [isFetchingStrategy, setIsFetchingStrategy] = useState(false);

  const handleGetHelp = async () => {
    setIsFetchingStrategy(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/rag/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: transcript,
          language_code: languageCode,
          dialect: dialect || ""
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("RAG Response:", data);
        onStrategyReceived(data);
      } else {
        console.error("Failed to query RAG backend");
      }
    } catch (error) {
      console.error("Error fetching legal strategy:", error);
    } finally {
      setIsFetchingStrategy(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Live Transcript</h3>
      <div className="bg-white p-4 rounded-lg min-h-[100px] text-gray-800 border border-gray-100 mb-4 shadow-inner text-lg">
        {transcript || <span className="text-gray-400 italic">No transcript available...</span>}
      </div>
      
      {/* Show detected language and dialect */}
      {languageCode && (
        <div className="text-xs text-gray-500 mb-4">
          <span>Language: <strong>{languageCode}</strong></span>
          {dialect && <span> | Dialect: <strong>{dialect}</strong></span>}
        </div>
      )}
      
      <button
        onClick={handleGetHelp}
        disabled={isFetchingStrategy || !transcript}
        className={`w-full py-4 rounded-xl font-bold text-white transition-all flex justify-center items-center gap-2 ${
          isFetchingStrategy || !transcript
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 hover:-translate-y-1'
        }`}
      >
        {isFetchingStrategy ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing Legal Options...
          </>
        ) : (
          'Get Legal Help'
        )}
      </button>
    </div>
  );
};

export default TranscriptBox;
