import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, Scale, History, Globe, 
  Bot, LineChart, ArrowUp, ChevronRight, ArrowLeft
} from 'lucide-react';
import MicButton from './components/MicButton';
import TranscriptBox from './components/TranscriptBox';
import LegalStrategyCard from './components/LegalStrategyCard';
import CaseTracker from './components/CaseTracker';
import Archives from './components/Archives';
import EmergencyCallModal from './components/EmergencyCallModal';
import PortalRedirectModal from './components/PortalRedirectModal';

// ─── Recent Topics Widget ───────────────────────────────────────────────────
function timeAgo(isoString) {
  if (!isoString) return '';
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function RecentTopicsCard({ activeView }) {
  const [cases, setCases] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (activeView !== 'dashboard') return;
    setLoading(true);
    const API_URL = import.meta.env.VITE_APP_API_URL || `http://${window.location.hostname}:8000`;
    fetch(`${API_URL}/cases/recent?limit=6`)
      .then(r => r.json())
      .then(d => { setCases(d.cases || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeView]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-zinc-900/40 border border-yellow-900/30 rounded-3xl p-6 md:p-8 flex flex-col backdrop-blur-md relative overflow-hidden lg:col-span-2"
    >
      <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-yellow-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-wide">Recent Topics</h3>
          <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">Your last {cases.length || '—'} queries</p>
        </div>
        <span className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-[10px] text-yellow-400 font-bold tracking-widest uppercase">
          <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" /> Live
        </span>
      </div>

      <div className="relative z-10 flex flex-col gap-2">
        {loading && (
          <div className="flex items-center gap-3 py-4">
            <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-500 text-sm">Loading case history...</p>
          </div>
        )}
        {!loading && cases.length === 0 && (
          <p className="text-zinc-600 text-sm italic py-4">No cases yet. Start a conversation to see your history here.</p>
        )}
        {!loading && cases.map((c, i) => (
          <div key={i} className="flex items-start gap-3 bg-zinc-800/40 border border-zinc-700/30 rounded-2xl px-4 py-3 hover:border-yellow-700/30 transition-colors">
            <span className="mt-0.5 w-6 h-6 shrink-0 rounded-full bg-yellow-900/40 border border-yellow-700/30 flex items-center justify-center text-[10px] text-yellow-500 font-bold">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-zinc-200 text-sm font-medium truncate">{c.topic}</p>
              {c.section && c.section !== '—' && (
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-900/40 border border-indigo-700/30 text-indigo-300 font-semibold tracking-wide">
                  {c.section}
                </span>
              )}
            </div>
            <span className="text-zinc-600 text-[10px] shrink-0 mt-0.5">{timeAgo(c.created_at)}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
// ────────────────────────────────────────────────────────────────────────────


export default function App() {
  const [activeView, setActiveView] = useState("landing");
  const [transcriptData, setTranscriptData] = useState(null);
  const [strategyData, setStrategyData] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [languageCode, setLanguageCode] = useState("auto");
  const [dialect, setDialect] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [emergencyEscalation, setEmergencyEscalation] = useState(null);
  const [portalEscalation, setPortalEscalation] = useState(null);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);
  const isFetchingRef = useRef(false);

  // Manage the transition phase timing
  useEffect(() => {
    if (activeView === 'transition') {
      const timer = setTimeout(() => {
        setActiveView('dashboard');
      }, 4000); // 4 seconds total transition duration for a slower, dramatic effect
      return () => clearTimeout(timer);
    }
  }, [activeView]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [transcriptData, isAnalyzing, strategyData, chatHistory]);

  const playAudio = async (text, langCode) => {
    // 🔒 If a TTS fetch is already in flight, drop this call — prevents overlap
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    const API_URL = import.meta.env.VITE_APP_API_URL || `http://${window.location.hostname}:8000`;
    try {
      // Stop any currently playing audio immediately
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }

      const res = await fetch(`${API_URL}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language_code: langCode })
      });
      const data = await res.json();

      if (!data.audio_base64) return;

      const audio = new Audio(`data:audio/wav;base64,${data.audio_base64}`);
      audioRef.current = audio;
      audio.onended = () => { isFetchingRef.current = false; };
      audio.onerror = () => { isFetchingRef.current = false; };

      try {
        await audio.play();
      } catch (err) {
        isFetchingRef.current = false;
        console.warn("Audio play prevented:", err);
      }
    } catch (err) {
      isFetchingRef.current = false;
      console.error("TTS playback error:", err);
    }
  };

  const handleTranscript = async (transcript, langCode, detectedDialect = "") => {
    const API_URL = import.meta.env.VITE_APP_API_URL || `http://${window.location.hostname}:8000`;
    
    // 🔹 Route 1: Initial RAG Query
    if (!strategyData) {
      setTranscriptData({ 
        transcript, 
        language_code: langCode,
        dialect: detectedDialect
      });
      setLanguageCode(langCode);
      setDialect(detectedDialect);
      
      setIsAnalyzing(true);
      
      try {
        const response = await fetch(`${API_URL}/rag/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: transcript,
            language_code: langCode,
            dialect: detectedDialect || ""
          }),
        });
        const data = await response.json();
        setStrategyData(data);
        
        // Oracle speaks its tactical defense logic!
        if (data.explanation) {
            playAudio(data.explanation, langCode);
        }
        
        // Seed chat history so Oracle context knows the origin strategy
        setChatHistory([
           { role: "user", content: transcript, langCode },
           { role: "assistant", content: `[SYSTEM LOG]: Oracle generated initial strategy based on user context.` }
        ]);
      } catch (err) {
        console.error("Strategy Fetch Error:", err);
      } finally {
        setIsAnalyzing(false);
      }

    // 🔹 Route 2: Ongoing Chat Flow
    } else {
      setChatHistory(prev => [...prev, { role: "user", content: transcript, langCode }]);
      setIsAnalyzing(true);
      
      try {
         // Limit history to last 6 messages to avoid context explosion
         const limitedHistory = chatHistory.slice(-6).map(m => ({
            role: m.role,
            content: m.content
         }));
         limitedHistory.push({ role: "user", content: transcript });

         const response = await fetch(`${API_URL}/chat/followup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               language_code: langCode,
               messages: limitedHistory
            }),
         });
         const data = await response.json();
         setChatHistory(prev => [...prev, { role: "assistant", content: data.reply }]);
         
         if (data.reply) {
             playAudio(data.reply, langCode);
         }
      } catch (err) {
         console.error("Chat Error:", err);
      } finally {
         setIsAnalyzing(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030303] text-white font-sans overflow-hidden selection:bg-yellow-500/30">
      <AnimatePresence mode="wait">
        
        {/* PHASE 1: LANDING PAGE */}
        {activeView === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 bg-black"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
              style={{ backgroundImage: "url('https://img.freepik.com/premium-photo/illustration-lord-rama-silhouette-sunset_1102-19576.jpg')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]" />
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50 overflow-hidden mix-blend-screen">
              <motion.img 
                src="https://miro.medium.com/v2/resize:fit:1358/1*AJEnuy3jL0hdFj5Wwc0gGQ.png" 
                alt="Chakravyuha"
                animate={{ rotate: 360, scale: [0.95, 1.05, 0.95] }}
                transition={{ 
                  rotate: { duration: 60, repeat: Infinity, ease: "linear" },
                  scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="w-[120vw] md:w-[80vw] lg:w-[50vw] max-w-[800px] object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]"
              />
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute z-0 text-yellow-400 drop-shadow-[0_0_20px_rgba(234,179,8,1)]"
              >
                <ArrowUp size={80} strokeWidth={1.5} />
              </motion.div>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center mt-20 p-6 md:p-12 w-full max-w-7xl mx-auto backdrop-blur-[2px] rounded-3xl">
              <motion.h1 
                initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
                className="text-[12vw] sm:text-[10vw] md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-widest md:tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-400 to-yellow-800 drop-shadow-[0_0_25px_rgba(234,179,8,0.3)] uppercase mb-2 md:mb-6 w-full text-center"
              >
                Chakravyuha
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, letterSpacing: "0em" }}
                animate={{ opacity: 1, letterSpacing: "0.2em" }}
                transition={{ delay: 1.2, duration: 1.5, ease: "easeOut" }}
                className="text-sm sm:text-lg md:text-2xl text-yellow-300/80 uppercase mb-20 md:mb-28 font-semibold drop-shadow-[0_0_10px_rgba(0,0,0,1)]"
              >
                AI Legal Warrior
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.8 }}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 0 40px rgba(234,179,8,0.5)",
                  borderColor: "rgba(234,179,8,1)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveView("transition")}
                className="relative overflow-hidden px-10 md:px-16 py-4 md:py-6 border border-yellow-600/50 rounded-full bg-black/80 backdrop-blur-xl text-yellow-500 font-bold tracking-[0.2em] transition-all flex items-center gap-4 group uppercase text-xs md:text-base cursor-pointer shadow-[0_0_20px_rgba(234,179,8,0.15)]"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Pierce The Formation
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-3 transition-transform duration-500" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/0 via-yellow-600/20 to-yellow-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* PHASE 2: ARROW FLYING TRANSITION */}
        {activeView === 'transition' && (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden pointer-events-none"
          >
            {/* Ambient transition glow */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.5, scale: 1.5 }}
              transition={{ duration: 3, ease: "easeOut" }}
              className="absolute w-[80vw] h-[80vw] bg-yellow-600/10 rounded-full blur-[100px]"
            />
            
            {/* The Specific Arrow Image flying left to right (Slower) */}
            <motion.div
              initial={{ x: "-120vw", scale: 0.8 }}
              animate={{ x: "120vw", scale: 1.2 }}
              transition={{ duration: 3.5, ease: "easeInOut", delay: 0.2 }}
              className="relative z-10 flex items-center drop-shadow-[0_0_30px_rgba(234,179,8,0.8)]"
            >
              <img 
                src="https://wallpapers.com/images/hd/gold-arrow-for-logo-design-png-fnd42-h87vyyuhgwmi4u30.png" 
                alt="Golden Arrow Transition"
                className="w-full max-w-[500px] md:max-w-[700px] object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.6)] mix-blend-screen"
                style={{
                  // Removing pure white pixels and black backgrounds if they exist utilizing mix-blend mode and drop shadows
                  filter: "contrast(1.2) brightness(1.2)"
                }}
              />
            </motion.div>
          </motion.div>
        )}

        {/* PHASE 3: DASHBOARD */}
        {activeView === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="min-h-screen w-full relative bg-[#030303] p-4 sm:p-6 md:p-8 lg:p-12"
          >
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-yellow-900/15 blur-[150px] rounded-full pointer-events-none" />

            <header className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center mb-10 md:mb-12 relative z-10 border-b border-yellow-900/30 pb-6 gap-4 sm:gap-0">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-yellow-500/40 flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(234,179,8,0.2)] bg-black/50 backdrop-blur-sm">
                  <ArrowUp className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
                </div>
                <h2 className="text-lg md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-500 to-yellow-700 tracking-[0.2em] uppercase drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                  Chakravyuha
                </h2>
              </div>
              <button 
                onClick={() => setActiveView("landing")}
                className="px-6 py-2.5 border border-zinc-800 rounded-full text-xs md:text-sm tracking-widest text-zinc-400 hover:text-yellow-400 hover:border-yellow-600/50 hover:bg-yellow-900/20 transition-all uppercase cursor-pointer"
              >
                Retreat
              </button>
            </header>

            <main className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 relative z-10">
              
              {/* 1. Voice Input -> Routes to CHAT */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => setActiveView("chat")}
                whileHover={{ y: -5, boxShadow: "0 15px 40px -15px rgba(234,179,8,0.3)" }}
                className="bg-zinc-900/40 border border-yellow-900/30 hover:border-yellow-500/50 rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all cursor-pointer group backdrop-blur-md relative overflow-hidden"
              >
                <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-yellow-600/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-colors" />
                <div>
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#080808] border border-yellow-700/30 flex items-center justify-center mb-6 shadow-inner group-hover:border-yellow-400/50 transition-all">
                    <Mic className="w-6 h-6 md:w-7 md:h-7 text-yellow-600 group-hover:text-yellow-400" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-zinc-100 mb-3 tracking-wide">Speak Your Issue</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed font-light">
                    Initiate voice protocol. Enter the interactive Oracle Chat to transcribe your dispute.
                  </p>
                </div>
                <div className="mt-8 md:mt-10 flex items-center text-xs text-yellow-500/80 uppercase tracking-widest font-bold">
                  Open Chat Interface <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>

              {/* 2. Legal Strategy */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => setActiveView("archives")}
                whileHover={{ y: -5, boxShadow: "0 15px 40px -15px rgba(234,179,8,0.3)" }}
                className="bg-zinc-900/40 border border-yellow-900/30 hover:border-yellow-500/50 rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all cursor-pointer group backdrop-blur-md relative overflow-hidden"
              >
                <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-yellow-600/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-colors" />
                <div>
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#080808] border border-yellow-700/30 flex items-center justify-center mb-6 shadow-inner group-hover:border-yellow-400/50 transition-all">
                    <Scale className="w-6 h-6 md:w-7 md:h-7 text-yellow-600 group-hover:text-yellow-400" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-zinc-100 mb-3 tracking-wide">Legal Strategy</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed font-light">
                    View active defense vectors logic. Re-examine the most recent strategy generated from your chats.
                  </p>
                    <LegalStrategyCard 
                      strategy={strategyData} 
                      languageCode={transcriptData?.language_code || languageCode}
                      chatHistory={chatHistory}
                    />
                </div>
                <div className="mt-8 md:mt-10 flex items-center text-xs text-yellow-500/80 uppercase tracking-widest font-bold">
                  View Tactics <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>

              {/* 3. Demo Videos */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => setActiveView("demos")}
                whileHover={{ y: -5, boxShadow: "0 15px 40px -15px rgba(234,179,8,0.3)" }}
                className="bg-zinc-900/40 border border-yellow-900/30 hover:border-yellow-500/50 rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all cursor-pointer group backdrop-blur-md relative overflow-hidden"
              >
                <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-yellow-600/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-colors" />
                <div>
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#080808] border border-yellow-700/30 flex items-center justify-center mb-6 shadow-inner group-hover:border-yellow-400/50 transition-all">
                    <History className="w-6 h-6 md:w-7 md:h-7 text-yellow-600 group-hover:text-yellow-400" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-zinc-100 mb-3 tracking-wide">Demo Videos</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed font-light">
                    Watch form-filling demonstrations. Learn how to complete various government forms with guided video tutorials.
                  </p>
                </div>
                <div className="mt-8 md:mt-10 flex items-center text-xs text-yellow-500/80 uppercase tracking-widest font-bold">
                  View Demos <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>

              {/* 4. Language Selector */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-zinc-900/40 border border-yellow-900/30 rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all group backdrop-blur-md relative overflow-hidden"
              >
                <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-yellow-600/10 rounded-full blur-3xl transition-colors" />
                <div>
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#080808] border border-yellow-700/30 flex items-center justify-center mb-6 shadow-inner">
                    <Globe className="w-6 h-6 md:w-7 md:h-7 text-yellow-600" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-zinc-100 mb-3 tracking-wide">Voice Settings</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed font-light mb-5">
                    Choose the language Oracle will respond in. Set to Auto to detect from your input.
                  </p>
                  <select
                    value={languageCode}
                    onChange={e => setLanguageCode(e.target.value)}
                    className="w-full bg-zinc-800/80 border border-yellow-700/30 text-zinc-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/30 transition-all cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
                  >
                    <option value="auto">🌐 Auto Detect (recommended)</option>
                    <option value="en-IN">🇮🇳 English (India)</option>
                    <option value="hi-IN">🇮🇳 Hindi — हिंदी</option>
                    <option value="ta-IN">🇮🇳 Tamil — தமிழ்</option>
                    <option value="te-IN">🇮🇳 Telugu — తెలుగు</option>
                    <option value="kn-IN">🇮🇳 Kannada — ಕನ್ನಡ</option>
                    <option value="ml-IN">🇮🇳 Malayalam — മലയാളം</option>
                    <option value="mr-IN">🇮🇳 Marathi — मराठी</option>
                    <option value="bn-IN">🇮🇳 Bengali — বাংলা</option>
                    <option value="gu-IN">🇮🇳 Gujarati — ગુજરાતી</option>
                    <option value="pa-IN">🇮🇳 Punjabi — ਪੰਜਾਬੀ</option>
                  </select>
                </div>
              </motion.div>

              {/* 5. Recent Topics */}
              <RecentTopicsCard activeView={activeView} />

            </main>
          </motion.div>
        )}

        {/* CHAT VIEW */}
        {activeView === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6 }}
            className="h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden"
          >
            {/* Chat Header */}
            <header className="p-4 md:p-6 border-b border-yellow-900/30 flex justify-between items-center bg-black/60 backdrop-blur-lg sticky top-0 z-50">
              <button 
                onClick={() => setActiveView("dashboard")}
                className="flex items-center gap-2 text-zinc-400 hover:text-yellow-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" /> <span className="font-bold tracking-wider text-sm uppercase">Dashboard</span>
              </button>
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 tracking-[0.2em] uppercase">
                Oracle Chat
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] text-green-400 font-bold tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live
              </div>
            </header>

            {/* Chat History Area */}
            <main className="flex-1 min-h-0 w-full max-w-4xl mx-auto px-4 md:px-8 pt-4 md:pt-6 flex flex-col gap-6 overflow-y-auto pb-36">
              
              {!strategyData && chatHistory.length === 0 && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-zinc-900 border border-yellow-900/30 rounded-2xl p-5 shadow-lg">
                    <p className="text-zinc-300 font-light leading-relaxed">
                      Greetings. I am Chakravyuha's Legal Oracle. Tap the microphone button below and narrate your specific grievance, incident, or traffic challan issue in your regional dialect.
                    </p>
                  </div>
                </div>
              )}

              {/* Stage 1: Initial RAG Execution Results */}
              {transcriptData && (
                 <div className="flex justify-end animate-fade-in-up mt-4">
                   <div className="max-w-[80%] bg-yellow-900/20 border border-yellow-700/50 rounded-2xl p-5 shadow-[0_0_15px_rgba(234,179,8,0.1)] text-right">
                     <p className="text-sm font-bold text-yellow-500 mb-2 uppercase tracking-wider">Original Context</p>
                     <p className="text-zinc-200 font-medium whitespace-pre-wrap">"{transcriptData.transcript}"</p>
                   </div>
                 </div>
              )}

              {strategyData && (
                 <div className="flex justify-start animate-fade-in-up mt-4">
                    <div className="max-w-[80%] rounded-2xl p-5 shadow-lg bg-zinc-900 border border-yellow-900/30 text-left">
                       <p className="text-sm font-bold mb-2 uppercase tracking-wider text-yellow-600">Oracle</p>
                       <p className="text-zinc-200 font-medium whitespace-pre-wrap leading-relaxed">{strategyData.explanation}</p>
                       {strategyData.escalation && (
                         <button
                           onClick={() => {
                             const e = strategyData.escalation;
                             if (e.type === 'call') {
                               setEmergencyEscalation(e);
                             } else {
                               setPortalEscalation(e);
                             }
                           }}
                           className={`mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm transition-all active:scale-95 ${
                             strategyData.escalation.type === 'call'
                               ? 'bg-red-600 hover:bg-red-700 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                               : 'bg-indigo-700 hover:bg-indigo-800 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                           }`}
                         >
                           {strategyData.escalation.type === 'call' ? '🚨 ' : '🔗 '}
                           {strategyData.escalation.label}
                         </button>
                       )}
                    </div>
                 </div>
              )}

              {/* Stage 2: Dynamic Follow-up Messages */}
              {chatHistory.slice(2).map((msg, idx) => (
                 <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up mt-4`}>
                    <div className={`max-w-[80%] rounded-2xl p-5 shadow-lg ${
                       msg.role === 'user' 
                          ? 'bg-yellow-900/20 border border-yellow-700/50 text-right' 
                          : 'bg-zinc-900 border border-yellow-900/30 text-left'
                    }`}>
                       <p className={`text-sm font-bold mb-2 uppercase tracking-wider ${msg.role === 'user' ? 'text-yellow-500' : 'text-yellow-600'}`}>
                          {msg.role === 'user' ? "You" : "Oracle"}
                       </p>
                       <p className="text-zinc-200 font-medium whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                 </div>
              ))}

              {isAnalyzing && (
                <div className="flex justify-start animate-fade-in-up mt-4">
                  <div className="max-w-[80%] bg-zinc-900 border border-yellow-900/30 rounded-2xl p-5 shadow-lg flex items-center gap-4">
                    <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-zinc-300 text-sm font-light italic">Oracle is streaming...</p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </main>

            {/* Chat Input Dock */}
            <footer className="fixed bottom-0 w-full p-6 bg-gradient-to-t from-[#030303] via-[#030303]/80 to-transparent flex justify-center z-50 pointer-events-none">
              <div className="w-full max-w-3xl bg-zinc-900/90 backdrop-blur-2xl border border-yellow-800/40 rounded-full p-2 flex items-center justify-between shadow-[0_0_40px_rgba(0,0,0,0.8)] relative pointer-events-auto min-h-[60px] md:min-h-[70px]">
                
                {/* Text Prompt Input */}
                <input 
                  type="text" 
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  onKeyDown={e => {
                     if (e.key === 'Enter' && textInput.trim()) {
                         handleTranscript(textInput.trim(), languageCode);
                         setTextInput("");
                     }
                  }}
                  placeholder="Type your dispute or follow-up question..."
                  className="flex-1 bg-transparent border-none text-zinc-100 px-6 py-2 min-w-0 outline-none text-sm md:text-base placeholder-zinc-500 rounded-full"
                />

                {/* Conditional Send/Mic Actions */}
                <div className="flex items-center gap-2 pr-1 md:pr-2">
                  <AnimatePresence mode="popLayout">
                    {textInput.trim() ? (
                      <motion.button 
                         key="send"
                         initial={{ scale: 0, opacity: 0 }}
                         animate={{ scale: 1, opacity: 1 }}
                         exit={{ scale: 0, opacity: 0 }}
                         whileHover={{ scale: 1.05 }}
                         whileTap={{ scale: 0.95 }}
                         onClick={() => {
                            handleTranscript(textInput.trim(), languageCode);
                            setTextInput("");
                         }}
                         className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-yellow-500/20 border-2 border-yellow-500 text-yellow-500 flex items-center justify-center hover:bg-yellow-500/30 transition-shadow shadow-[0_0_15px_rgba(234,179,8,0.3)] z-10 cursor-pointer"
                      >
                        <ChevronRight size={24} />
                      </motion.button>
                    ) : (
                      <motion.div 
                        key="mic"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="transform origin-right z-10"
                      >
                         <MicButton onTranscript={handleTranscript} languageCode={languageCode} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </footer>
          </motion.div>
        )}

        {/* ARCHIVES / DEMOS VIEWS */}
        {activeView === "archives" && (
          <Archives
            setActiveView={setActiveView}
            chatHistory={chatHistory}
            strategyData={strategyData}
          />
        )}
        {activeView === "demos" && <CaseTracker setActiveView={setActiveView} />}

      </AnimatePresence>

      {/* Emergency Call Modal */}
      <EmergencyCallModal
        escalation={emergencyEscalation}
        onClose={() => setEmergencyEscalation(null)}
      />

      {/* Portal Redirect Modal */}
      <PortalRedirectModal
        escalation={portalEscalation}
        onClose={() => setPortalEscalation(null)}
      />
    </div>
  );
}
