import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ArrowRight, Play } from 'lucide-react';

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

  const openVideo = (videoId) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
  };

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

             {/* Demo Video Name Buttons */}
             <div className="mb-8 flex flex-wrap gap-3">
               {demoVideos.map((video) => (
                 <button
                   key={video.id}
                   onClick={() => setActiveVideoId(video.id)}
                   className={`px-4 py-2 rounded-full border text-sm font-bold transition-colors ${
                     activeVideoId === video.id
                       ? 'bg-yellow-500 text-black border-yellow-400 shadow-md'
                       : 'bg-zinc-900/80 border-yellow-900/70 text-zinc-200 hover:bg-yellow-400/20 hover:text-yellow-200'
                   }`}
                 >
                   {video.title.replace(' Form', '')}
                 </button>
               ))}
             </div>

             {/* Selected Video Preview */}
             <div className="mb-8">
               {selectedVideo ? (
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="bg-zinc-900/70 border border-yellow-900/40 rounded-3xl p-6"
                 >
                   <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider mb-2">{selectedVideo.title}</h3>
                   <p className="text-zinc-300 text-sm mb-4">{selectedVideo.description}</p>
                   <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-yellow-700">
                     <img
                       src={`https://img.youtube.com/vi/${selectedVideo.id}/0.jpg`}
                       alt={selectedVideo.title}
                       className="w-full h-full object-cover"
                     />
                     <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                       <button
                         onClick={() => openVideo(selectedVideo.id)}
                         className="px-5 py-3 uppercase tracking-widest font-bold text-black bg-yellow-400 rounded-full shadow-lg hover:bg-yellow-300"
                       >
                         Explore Video
                       </button>
                     </div>
                   </div>
                 </motion.div>
               ) : (
                 <div className="p-5 rounded-3xl border border-yellow-900/40 bg-zinc-900/40 text-zinc-200">
                   Select a video name above to preview and explore.
                 </div>
               )}
             </div>

             {/* Demo Video Cards */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {demoVideos.map((video, i) => (
                 <motion.div
                   key={video.id}
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.1 }}
                   onClick={() => setActiveVideoId(video.id)}
                   className={`bg-zinc-900/60 border rounded-3xl p-6 hover:border-yellow-500/50 hover:bg-zinc-900/90 transition-all cursor-pointer group shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col gap-4 relative overflow-hidden ${
                     activeVideoId === video.id ? 'border-yellow-400 bg-yellow-900/20' : 'border-yellow-900/40'
                   }`}
                 >
                   <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-600/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-yellow-500/20 transition-all" />
                   <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4">
                     <img
                       src={`https://img.youtube.com/vi/${video.id}/0.jpg`}
                       alt={`${video.title} Demo`}
                       className="w-full h-full object-cover"
                     />
                     <div className="absolute inset-0 bg-black/20 flex items-center justify-center"> 
                       <Play className="w-10 h-10 text-yellow-300" />
                     </div>
                   </div>

                   <div className="flex-1">
                     <h3 className="text-lg font-bold text-zinc-100 mb-2">{video.title}</h3>
                     <p className="text-zinc-400 text-sm leading-relaxed">{video.description}</p>
                   </div>

                   <button
                     onClick={(e) => {
                       e.stopPropagation();
                       openVideo(video.id);
                     }}
                     className="mt-auto px-4 py-2 rounded-full bg-yellow-500 text-black font-bold uppercase tracking-widest hover:bg-yellow-400 transition"
                   >
                     Explore
                   </button>
                 </motion.div>
               ))}
             </div>

        </div>
    </motion.div>
  );
};

export default CaseTracker;
