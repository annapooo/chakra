import React, { useState } from 'react';
import MicButton from './components/MicButton';
import TranscriptBox from './components/TranscriptBox';
import LegalStrategyCard from './components/LegalStrategyCard';
import CaseTracker from './components/CaseTracker';

function App() {
  const [transcriptData, setTranscriptData] = useState(null);
  const [strategyData, setStrategyData] = useState(null);
  const [languageCode, setLanguageCode] = useState("ta-IN");

  const handleTranscript = (transcript, langCode) => {
    setTranscriptData({ transcript, language_code: langCode });
    setLanguageCode(langCode);
  };

  const handleStrategyReceived = (data) => {
    setStrategyData(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8 font-sans">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-indigo-700 tracking-tight">Chakravyuha</h1>
        <p className="text-gray-600 mt-2 text-lg">Voice-first, multilingual AI legal assistant</p>
      </header>
      
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-10">
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">1. Describe Your Issue (Hold to Speak)</h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <MicButton onTranscript={handleTranscript} languageCode={languageCode} />
              <div className="flex flex-col w-full">
                <label className="text-sm font-medium text-gray-500 mb-2">Language</label>
                <select 
                  className="bg-gray-50 border border-gray-200 text-gray-900 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={languageCode} 
                  onChange={(e) => setLanguageCode(e.target.value)}
                >
                  <option value="ta-IN">Tamil (ta-IN)</option>
                  <option value="hi-IN">Hindi (hi-IN)</option>
                  <option value="en-IN">English (en-IN)</option>
                  <option value="te-IN">Telugu (te-IN)</option>
                </select>
              </div>
            </div>
            
            {transcriptData && (
              <div className="mt-8 animate-fade-in-up">
                <TranscriptBox 
                  transcript={transcriptData.transcript} 
                  languageCode={transcriptData.language_code}
                  onStrategyReceived={handleStrategyReceived}
                />
              </div>
            )}
          </section>

          {strategyData && (
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-fade-in-up">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">2. Legal Strategy</h2>
              <LegalStrategyCard 
                strategy={strategyData} 
                languageCode={transcriptData?.language_code || languageCode}
              />
            </section>
          )}
        </div>

        <div className="space-y-10">
           <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
             <h2 className="text-2xl font-bold mb-6 text-gray-800">Case Tracker</h2>
             <CaseTracker />
           </section>
        </div>
      </main>
    </div>
  );
}

export default App;
