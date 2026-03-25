import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, History, Scale } from 'lucide-react';

function timeAgo(isoString) {
  if (!isoString) return '';
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const LegalStrategyView = ({ setActiveView }) => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const API_URL = import.meta.env.VITE_APP_API_URL || `http://${window.location.hostname}:8000`;
    fetch(`${API_URL}/cases/recent?limit=20`)
      .then(r => r.json())
      .then(d => { setCases(d.cases || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <motion.div
        key="strategy"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="min-h-screen w-full relative bg-[#030303] text-white font-sans selection:bg-yellow-500/30 p-4 md:p-12 overflow-y-auto"
    >
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5 pointer-events-none"
             style={{ backgroundImage: "url('https://img.freepik.com/premium-photo/illustration-lord-rama-silhouette-sunset_1102-19576.jpg')" }} />
        
        <div className="max-w-5xl mx-auto relative z-10 w-full h-full pb-20">
             
             {/* Header */}
             <div className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-yellow-900/30">
                 <div className="flex items-center gap-4">
                     <button 
                         onClick={() => setActiveView("dashboard")}
                         className="p-3 bg-zinc-900/60 border border-yellow-900/30 rounded-full hover:bg-yellow-900/20 hover:border-yellow-500/50 transition-all text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                     >
                         <ChevronLeft className="w-6 h-6" />
                     </button>
                     <div>
                         <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-500 to-yellow-800 tracking-[0.2em] uppercase">Legal Strategy</h2>
                         <p className="text-zinc-500 text-sm tracking-widest mt-1 uppercase font-bold">Your Case Histories & Vector Logs</p>
                     </div>
                 </div>
                 <span className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-[10px] text-yellow-400 font-bold tracking-widest uppercase">
                     <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" /> Live Oracle Sync
                 </span>
             </div>

             {/* Histories List */}
             <div className="bg-zinc-900/40 border border-yellow-900/30 rounded-3xl p-6 md:p-8 flex flex-col backdrop-blur-md relative overflow-hidden">
                 <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-yellow-600/5 rounded-full blur-3xl pointer-events-none" />
                 
                 <div className="relative z-10 flex flex-col gap-4">
                     {loading && (
                         <div className="flex items-center justify-center gap-3 py-10">
                             <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                             <p className="text-yellow-500/70 font-bold tracking-widest uppercase text-sm">Loading Oracle Records...</p>
                         </div>
                     )}
                     
                     {!loading && cases.length === 0 && (
                         <div className="flex flex-col items-center justify-center py-16 text-center">
                             <div className="w-16 h-16 rounded-full bg-zinc-900 border border-yellow-900/30 flex items-center justify-center mb-4">
                               <History className="w-8 h-8 text-yellow-700/50" />
                             </div>
                             <p className="text-zinc-400 font-light text-lg">No cases yet.</p>
                             <p className="text-zinc-600 text-sm mt-2">Pierce the formation and consult the Oracle to begin.</p>
                         </div>
                     )}
                     
                     {!loading && cases.map((c, i) => (
                         <motion.div 
                             initial={{ opacity: 0, y: 20 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: i * 0.05 }}
                             key={i} 
                             className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-zinc-800/40 border border-zinc-700/30 rounded-2xl p-5 hover:border-yellow-700/50 hover:bg-zinc-800/80 transition-all group shadow-[0_5px_15px_rgba(0,0,0,0.2)]"
                         >
                             <div className="flex items-center gap-4 flex-1 w-full">
                                 <div className="w-10 h-10 shrink-0 rounded-full bg-yellow-900/40 border border-yellow-700/50 flex items-center justify-center text-yellow-500 shadow-inner group-hover:bg-yellow-800/40 transition-colors">
                                     <Scale className="w-5 h-5" />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                     <p className="text-zinc-100 text-base md:text-lg font-bold truncate tracking-wide">{c.topic}</p>
                                     <div className="flex flex-wrap items-center gap-2 mt-2">
                                         {c.section && c.section !== '—' && (
                                             <span className="px-2.5 py-1 rounded-md bg-indigo-900/40 border border-indigo-700/50 text-indigo-300 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
                                                 <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                 {c.section}
                                             </span>
                                         )}
                                         <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider bg-zinc-900 border border-zinc-700/50 px-2.5 py-1 rounded-md">
                                             {timeAgo(c.created_at)}
                                         </span>
                                     </div>
                                 </div>
                             </div>
                             <button className="mt-4 md:mt-0 px-5 py-2 w-full md:w-auto rounded-xl bg-zinc-900 border border-yellow-900/50 text-yellow-500/80 text-xs font-bold uppercase tracking-widest hover:bg-yellow-500 hover:text-black hover:border-yellow-400 transition-all">
                                 Review
                             </button>
                         </motion.div>
                     ))}
                 </div>
             </div>
        </div>
    </motion.div>
  );
};

export default LegalStrategyView;
