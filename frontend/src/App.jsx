import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, Scale, History, Globe, 
  Bot, LineChart, ArrowUp, ChevronRight 
} from 'lucide-react';

export default function App() {
  const [currentPhase, setCurrentPhase] = useState('landing'); // 'landing', 'transition', 'dashboard'

  // Manage the transition phase timing
  useEffect(() => {
    if (currentPhase === 'transition') {
      const timer = setTimeout(() => {
        setCurrentPhase('dashboard');
      }, 4000); // 4 seconds total transition duration for a slower, dramatic effect
      return () => clearTimeout(timer);
    }
  }, [currentPhase]);

  return (
    <div className="min-h-screen w-full bg-[#030303] text-white font-sans overflow-hidden selection:bg-yellow-500/30">
      <AnimatePresence mode="wait">
        
        {/* PHASE 1: LANDING PAGE */}
        {currentPhase === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 bg-black"
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
              style={{ backgroundImage: "url('https://img.freepik.com/premium-photo/illustration-lord-rama-silhouette-sunset_1102-19576.jpg')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]" />
            </div>

            {/* Chakravyuha Image over Background */}
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
              {/* Glowing Arrow in Center */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute z-0 text-yellow-400 drop-shadow-[0_0_20px_rgba(234,179,8,1)]"
              >
                <ArrowUp size={80} strokeWidth={1.5} />
              </motion.div>
            </div>

            {/* Content OVER the rings */}
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
                onClick={() => setCurrentPhase('transition')}
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
        {currentPhase === 'transition' && (
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
        {currentPhase === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="min-h-screen w-full relative bg-[#030303] p-4 sm:p-6 md:p-8 lg:p-12"
          >
            {/* Ambient Background Glow for Dashboard */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-yellow-900/15 blur-[150px] rounded-full pointer-events-none" />

            {/* Header */}
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
                onClick={() => setCurrentPhase('landing')}
                className="px-6 py-2.5 border border-zinc-800 rounded-full text-xs md:text-sm tracking-widest text-zinc-400 hover:text-yellow-400 hover:border-yellow-600/50 hover:bg-yellow-900/20 transition-all uppercase cursor-pointer"
              >
                Retreat
              </button>
            </header>

            {/* Main Grid */}
            <main className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 relative z-10">
              
              {/* 1. Voice Input */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
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
                    Initiate voice protocol. The AI oracle will transcribe and analyze your legal query instantly against known precedents.
                  </p>
                </div>
                <div className="mt-8 md:mt-10 flex items-center text-xs text-yellow-500/80 uppercase tracking-widest font-bold">
                  Tap to Record <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>

              {/* 2. Legal Strategy */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
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
                    Formulate defense vectors. Generate step-by-step actionable legal strategies based on IPC/BNS structures.
                  </p>
                </div>
                <div className="mt-8 md:mt-10 flex items-center text-xs text-yellow-500/80 uppercase tracking-widest font-bold">
                  View Tactics <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>

              {/* 3. Case History */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -5, boxShadow: "0 15px 40px -15px rgba(234,179,8,0.3)" }}
                className="bg-zinc-900/40 border border-yellow-900/30 hover:border-yellow-500/50 rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all cursor-pointer group backdrop-blur-md relative overflow-hidden"
              >
                <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-yellow-600/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-colors" />
                <div>
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#080808] border border-yellow-700/30 flex items-center justify-center mb-6 shadow-inner group-hover:border-yellow-400/50 transition-all">
                    <History className="w-6 h-6 md:w-7 md:h-7 text-yellow-600 group-hover:text-yellow-400" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-zinc-100 mb-3 tracking-wide">Case Archives</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed font-light">
                    Access precedents and past battlefronts. Review previously analyzed cases, outcomes, and identified attack vectors.
                  </p>
                </div>
                <div className="mt-8 md:mt-10 flex items-center text-xs text-yellow-500/80 uppercase tracking-widest font-bold">
                  Open Vault <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>

              {/* 4. Language Selector */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ y: -5, boxShadow: "0 15px 40px -15px rgba(234,179,8,0.3)" }}
                className="bg-zinc-900/40 border border-yellow-900/30 hover:border-yellow-500/50 rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all cursor-pointer group backdrop-blur-md relative overflow-hidden"
              >
                <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-yellow-600/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-colors" />
                <div>
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#080808] border border-yellow-700/30 flex items-center justify-center mb-6 shadow-inner group-hover:border-yellow-400/50 transition-all">
                    <Globe className="w-6 h-6 md:w-7 md:h-7 text-yellow-600 group-hover:text-yellow-400" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-zinc-100 mb-3 tracking-wide">Linguistics</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed font-light mb-6">
                    Set communication protocol. Multi-lingual support allows regional syntax overrides.
                  </p>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    <span className="px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded-lg text-[10px] md:text-[11px] text-yellow-300 font-bold tracking-widest">ENGLISH</span>
                    <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] md:text-[11px] text-zinc-400 hover:text-white font-bold tracking-widest transition-colors">HINDI</span>
                    <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] md:text-[11px] text-zinc-400 hover:text-white font-bold tracking-widest transition-colors">TAMIL</span>
                  </div>
                </div>
              </motion.div>

              {/* 5. AI Assistant Status */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ y: -5, boxShadow: "0 15px 40px -15px rgba(234,179,8,0.3)" }}
                className="bg-zinc-900/40 border border-yellow-900/30 hover:border-yellow-500/50 rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all cursor-pointer group backdrop-blur-md relative overflow-hidden lg:col-span-2"
              >
                <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-yellow-600/5 rounded-full blur-3xl group-hover:bg-yellow-500/10 transition-colors pointer-events-none" />
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start h-full pb-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl bg-[#080808] border border-yellow-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                    <Bot className="w-8 h-8 md:w-10 md:h-10 text-yellow-500 animate-pulse" />
                  </div>
                  <div className="text-center md:text-left flex-1 w-full">
                    <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 mb-3">
                      <h3 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-wide">Warrior Core AI</h3>
                      <span className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] text-green-400 font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-[pulse_1.5s_ease-in-out_infinite]" /> Online & Listening
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-light mb-6 max-w-xl mx-auto md:mx-0">
                      Tactical systems fully operational. The AI is standing by to process penal codes, draft notices, or analyze dispute parameters in real-time.
                    </p>
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                        className="w-1/2 h-full bg-gradient-to-r from-transparent via-yellow-500 to-transparent"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 6. Insights Panel */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ y: -5, boxShadow: "0 15px 40px -15px rgba(234,179,8,0.3)" }}
                className="bg-zinc-900/40 border border-yellow-900/30 hover:border-yellow-500/50 rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all cursor-pointer group backdrop-blur-md relative overflow-hidden"
              >
                <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-yellow-600/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-colors" />
                <div>
                  <div className="flex justify-between items-start mb-6 md:mb-8">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#080808] border border-yellow-700/30 flex items-center justify-center shadow-inner group-hover:border-yellow-400/50 transition-all">
                      <LineChart className="w-6 h-6 md:w-7 md:h-7 text-yellow-600 group-hover:text-yellow-400" />
                    </div>
                    <span className="text-[9px] md:text-[10px] text-yellow-500/70 uppercase tracking-widest font-bold border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 md:px-3 md:py-1.5 rounded-lg">Live Telemetry</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-zinc-100 mb-5 md:mb-6 tracking-wide">Insights Grid</h3>
                  
                  <div className="space-y-4 md:space-y-5">
                    <div>
                      <div className="flex justify-between text-[10px] md:text-xs mb-2 font-bold tracking-wider">
                        <span className="text-zinc-400 uppercase">Success Rate</span>
                        <span className="text-yellow-500">94.2%</span>
                      </div>
                      <div className="w-full h-1 md:h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
                        <div className="w-[94%] h-full bg-gradient-to-r from-yellow-700 to-yellow-400 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] md:text-xs mb-2 font-bold tracking-wider">
                        <span className="text-zinc-400 uppercase">Cases Analyzed</span>
                        <span className="text-yellow-500">1,204</span>
                      </div>
                      <div className="w-full h-1 md:h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
                        <div className="w-[75%] h-full bg-gradient-to-r from-yellow-800 to-yellow-600 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
