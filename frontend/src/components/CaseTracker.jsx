import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, ShieldAlert, ChevronLeft, CalendarClock, ArrowRight } from 'lucide-react';

const CaseTracker = ({ setActiveView }) => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_APP_API_URL || `http://${window.location.hostname}:8000`;
      // Demo user id per spec
      const response = await fetch(`${API_URL}/cases/demo-user-001`);
      if (response.ok) {
        const data = await response.json();
        // sort by newest descending
        if (data && Array.isArray(data)) {
           data.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
        }
        setCases(data);
      }
    } catch (error) {
      console.error("Error fetching cases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  return (
    <motion.div
        key="archives"
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
                         <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-500 to-yellow-800 tracking-[0.2em] uppercase">Archive Log</h2>
                         <p className="text-zinc-500 text-sm tracking-widest mt-1 uppercase font-bold">Past Oracle Strategies & Disputes</p>
                     </div>
                 </div>
                 
                 <button 
                    onClick={fetchCases}
                    className="px-6 py-2.5 bg-zinc-900/60 border border-yellow-900/30 rounded-full flex items-center gap-2 hover:bg-yellow-900/20 hover:border-yellow-500/50 transition-all text-yellow-500/80 text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                 >
                    <History className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
                 </button>
             </div>

             {/* Content */}
             {loading ? (
                <div className="w-full flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(234,179,8,0.5)]" />
                </div>
             ) : cases.length === 0 ? (
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="w-full flex flex-col items-center justify-center p-12 bg-zinc-900/20 border-2 border-dashed border-yellow-900/20 rounded-3xl"
                >
                   <ShieldAlert className="w-16 h-16 text-yellow-900 mb-4" />
                   <p className="text-zinc-500 uppercase tracking-widest font-black text-sm text-center">No Active Defense Protocols Found</p>
                   <p className="text-xs text-zinc-600 font-medium text-center mt-2 max-w-sm">Use the Oracle Chat interface from your dashboard to initiate a defense sequence against a legal dispute.</p>
                </motion.div>
             ) : (
                <div className="grid grid-cols-1 gap-6">
                    {cases.map((caseItem, i) => (
                        <motion.div 
                            key={caseItem._id || i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-zinc-900/60 border border-yellow-900/40 rounded-3xl p-6 md:p-8 hover:border-yellow-500/50 hover:bg-zinc-900/90 transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col gap-6 relative overflow-hidden group"
                        >
                            {/* Glow Effect */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-600/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-yellow-500/20 transition-all" />

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-4 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${caseItem.status === 'analyzed' || caseItem.status === 'active_strategy' ? 'bg-yellow-900/20 border-yellow-500/50' : 'bg-green-900/20 border-green-500/50'}`}>
                                        <ShieldAlert className={`w-5 h-5 ${caseItem.status === 'analyzed' || caseItem.status === 'active_strategy' ? 'text-yellow-500' : 'text-green-500'}`} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg text-zinc-200 uppercase tracking-wider">Protocol {caseItem.reference_id}</div>
                                        <div className="text-xs text-zinc-500 font-mono mt-1 flex items-center gap-2">
                                            <CalendarClock className="w-3 h-3" /> 
                                            {caseItem.created_at ? new Date(caseItem.created_at).toLocaleString() : 'Recently'}
                                        </div>
                                    </div>
                                </div>
                                
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
                                    caseItem.status === 'analyzed' || caseItem.status === 'active_strategy' 
                                        ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                                        : 'bg-green-500/10 border-green-500/30 text-green-400'
                                }`}>
                                   {caseItem.status.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                <div>
                                    <h4 className="text-[11px] font-bold text-yellow-500 uppercase tracking-widest mb-3 border-l-2 border-yellow-500 pl-3">Original Incident</h4>
                                    <p className="text-zinc-300 text-sm leading-relaxed p-4 bg-black/40 rounded-2xl border border-zinc-800/80 line-clamp-4">
                                        "{caseItem.input_story}"
                                    </p>
                                    <div className="mt-3 text-xs text-zinc-500 border border-zinc-800 px-3 py-1 bg-black/50 rounded-lg inline-block font-mono">Lang: {caseItem.language_code || 'Unknown'}</div>
                                </div>
                                <div>
                                    <h4 className="text-[11px] font-bold text-yellow-500 uppercase tracking-widest mb-3 border-l-2 border-yellow-500 pl-3">Oracle Output</h4>
                                    <div className="flex flex-col gap-2 mb-4">
                                        {(caseItem.matched_sections || []).map((sec, idx) => (
                                            <div key={idx} className="bg-yellow-900/10 border border-yellow-900/50 p-3 rounded-xl text-yellow-200/90 text-xs font-bold uppercase tracking-widest">
                                                {sec}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-zinc-400 text-xs leading-relaxed line-clamp-4 whitespace-pre-wrap">
                                        {(caseItem.defence_steps || []).join('\n')}
                                    </div>

                                    <div className="mt-4">
                                        <button 
                                            onClick={() => alert("Re-hydration of this case directly into the active Oracle UI context can be integrated directly! The strategy metadata is securely preserved.")}
                                            className="w-full py-3 bg-zinc-800 hover:bg-yellow-600/20 border border-zinc-700 hover:border-yellow-500/50 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-yellow-400 transition-all flex items-center justify-center gap-2"
                                        >
                                            Inspect Defense Strategy <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
             )}
        </div>
    </motion.div>
  );
};

export default CaseTracker;
