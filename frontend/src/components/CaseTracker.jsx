import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, FileText, ArrowLeft, PlayCircle } from 'lucide-react';

const CaseTracker = ({ setActiveView }) => {
  const [activeVideoId, setActiveVideoId] = useState(null);

  const demoVideos = [
    {
      id: 'rx7qTiyofx8',
      title: 'Driving License Form',
      description: 'Learn how to fill out driving license application forms step by step.'
    },
    {
      id: 'krsXXLcvoZE',
      title: 'Passport Application Form',
      description: 'Complete guide to passport application and renewal process.'
    },
    {
      id: 'AgqMeUS5SHA',
      title: 'Voter ID Form',
      description: 'Step-by-step tutorial for voter ID card application and updates.'
    },
    {
      id: 'NJNUw1KCg9Q',
      title: 'CPGRAMS Form',
      description: 'How to file complaints and track status on CPGRAMS portal.'
    },
    {
      id: 'ictSkyDl6zY',
      title: 'LLR Form',
      description: 'Learning license registration form filling guide.'
    }
  ];

  const selectedVideo = demoVideos.find((video) => video.id === activeVideoId);

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
                         <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-500 to-yellow-800 tracking-[0.2em] uppercase">Demo Videos</h2>
                         <p className="text-zinc-500 text-sm tracking-widest mt-1 uppercase font-bold">Form Filling Tutorials & Guides</p>
                     </div>
                 </div>
             </div>

             <AnimatePresence mode="wait">
                 {!activeVideoId ? (
                     <motion.div
                         key="list"
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -20 }}
                         transition={{ duration: 0.4 }}
                         className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                     >
                         {demoVideos.map((video, i) => (
                             <motion.div
                                 key={video.id}
                                 initial={{ opacity: 0, scale: 0.9 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 transition={{ delay: i * 0.1 }}
                                 onClick={() => setActiveVideoId(video.id)}
                                 className="bg-zinc-900/40 border border-yellow-900/30 rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:bg-zinc-800/60 hover:border-yellow-500/50 transition-all cursor-pointer group shadow-[0_5px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_30px_rgba(234,179,8,0.15)] relative overflow-hidden"
                             >
                                 <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-yellow-600/5 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all" />
                                 <div>
                                     <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-yellow-700/30 flex items-center justify-center mb-6 shadow-inner group-hover:border-yellow-400 group-hover:bg-yellow-900/40 transition-all">
                                         <FileText className="w-6 h-6 text-yellow-600 group-hover:text-yellow-400" />
                                     </div>
                                     <h3 className="text-xl font-black text-zinc-100 mb-3 tracking-wide uppercase">{video.title}</h3>
                                     <p className="text-zinc-400 text-sm leading-relaxed font-light">
                                         {video.description}
                                     </p>
                                 </div>
                                 <div className="mt-8 flex items-center text-xs text-yellow-500 uppercase tracking-widest font-bold group-hover:text-yellow-400 transition-colors">
                                     <PlayCircle className="w-4 h-4 mr-2" /> Watch Demo
                                 </div>
                             </motion.div>
                         ))}
                     </motion.div>
                 ) : (
                     <motion.div
                         key="detail"
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -20 }}
                         transition={{ duration: 0.4 }}
                         className="flex flex-col gap-6"
                     >
                         <button 
                             onClick={() => setActiveVideoId(null)}
                             className="flex items-center gap-2 text-zinc-400 hover:text-yellow-400 font-bold uppercase tracking-widest text-sm transition-colors w-fit"
                         >
                             <ArrowLeft className="w-4 h-4" /> Back to Forms
                         </button>
                         
                         <div className="bg-zinc-900/60 border border-yellow-900/40 rounded-3xl p-6 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative overflow-hidden">
                             <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-yellow-600/10 rounded-full blur-[100px] pointer-events-none" />
                             
                             <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest mb-4">{selectedVideo.title}</h3>
                             <p className="text-zinc-300 text-base md:text-lg mb-8 font-light max-w-2xl">{selectedVideo.description}</p>
                             
                             <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-yellow-700/50 shadow-[0_0_30px_rgba(234,179,8,0.2)] bg-black">
                                 <iframe
                                     className="w-full h-full"
                                     src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                                     title={selectedVideo.title}
                                     frameBorder="0"
                                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                     allowFullScreen
                                 ></iframe>
                             </div>
                         </div>
                     </motion.div>
                 )}
             </AnimatePresence>
        </div>
    </motion.div>
  );
};

export default CaseTracker;
