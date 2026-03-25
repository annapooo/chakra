import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ExternalLink, Smartphone, Download, CheckCircle2, ArrowLeft } from 'lucide-react';

const EssentialAppsView = ({ setActiveView }) => {
  const [activeAppId, setActiveAppId] = useState(null);

  const appsList = [
    {
      id: 'digilocker',
      name: 'DigiLocker',
      description: 'A flagship initiative of Digital India for secure document access.',
      link: 'https://www.digilocker.gov.in/',
      icon: '🔐',
      steps: [
        'Download the app from Play Store/App Store or visit the website.',
        'Register using your mobile number linked to Aadhaar.',
        'Enter the OTP received on your mobile.',
        'Set a 6-digit security PIN to protect your account.',
        'Link your Aadhaar card to fetch Pan, Driving License, and RC digitally.',
        'Present digital documents to authorities directly from the app—they are legally valid!'
      ]
    },
    {
      id: 'mparivahan',
      name: 'NextGen mParivahan',
      description: 'Access Driving License & RC details instantly. Create virtual IDs to avoid carrying physical documents.',
      link: 'https://parivahan.gov.in/parivahan/',
      icon: '🚗',
      steps: [
        'Install the NextGen mParivahan app.',
        'Sign up using your mobile number and verify via OTP.',
        'Go to the Dashboard and select "Virtual DL" or "Virtual RC".',
        'Enter your Driving License or Vehicle Registration number.',
        'The app will verify the details with the database and generate a virtual card with a QR code.',
        'You can show this virtual DL/RC to traffic police across India as a valid original document.'
      ]
    },
    {
      id: 'maadhaar',
      name: 'mAadhaar',
      description: 'Carry your Aadhaar everywhere digitally. Lock/unlock biometrics easily.',
      link: 'https://uidai.gov.in/en/ecosystem/authentication-devices-documents/maadhaar-app.html',
      icon: '🆔',
      steps: [
        'Install the mAadhaar app from the official store.',
        'Allow necessary permissions and skip the introductory slides.',
        'Register your mobile number (must be linked to your Aadhaar).',
        'Once verified, enter your Aadhaar number to add your profile.',
        'You can now view your digital Aadhaar, share your eKYC via QR code, and update your address online.',
        'Use the app to easily lock or unlock your biometrics for security.'
      ]
    },
    {
      id: 'umang',
      name: 'UMANG',
      description: 'Unified Mobile Application for New-age Governance. Access single point for pan-India e-Gov services.',
      link: 'https://web.umang.gov.in/landing/',
      icon: '🏛️',
      steps: [
        'Download the UMANG app or access it via the web portal.',
        'Register using mobile number and Aadhaar.',
        'Set an MPIN to secure your profile for future logins.',
        'Search for specific services: PF services (EPFO), Passport Seva, CoWIN, or local state utilities.',
        'Browse by categories like "Farmers", "Students", "Women and Children" for targeted government schemes.'
      ]
    }
  ];

  const selectedApp = appsList.find(app => app.id === activeAppId);

  return (
    <motion.div
        key="apps"
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
                         <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-500 to-yellow-800 tracking-[0.2em] uppercase">Essential Apps</h2>
                         <p className="text-zinc-500 text-sm tracking-widest mt-1 uppercase font-bold">Government App Setup Guides</p>
                     </div>
                 </div>
             </div>

             <AnimatePresence mode="wait">
                 {!activeAppId ? (
                     <motion.div
                         key="app-list"
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -20 }}
                         transition={{ duration: 0.4 }}
                         className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                     >
                         {appsList.map((app, i) => (
                             <motion.div
                                 key={app.id}
                                 initial={{ opacity: 0, scale: 0.9 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 transition={{ delay: i * 0.1 }}
                                 onClick={() => setActiveAppId(app.id)}
                                 className="bg-zinc-900/40 border border-yellow-900/30 rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:bg-zinc-800/60 hover:border-yellow-500/50 transition-all cursor-pointer group shadow-[0_5px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_30px_rgba(234,179,8,0.15)] relative overflow-hidden"
                             >
                                 <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-yellow-600/5 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all" />
                                 <div>
                                     <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-yellow-700/30 flex items-center justify-center mb-6 shadow-inner group-hover:border-yellow-400 group-hover:bg-yellow-900/40 transition-all text-2xl">
                                         {app.icon}
                                     </div>
                                     <h3 className="text-xl font-black text-zinc-100 mb-3 tracking-wide uppercase">{app.name}</h3>
                                     <p className="text-zinc-400 text-sm leading-relaxed font-light">
                                         {app.description}
                                     </p>
                                 </div>
                                 <div className="mt-8 flex items-center text-xs text-yellow-500 uppercase tracking-widest font-bold group-hover:text-yellow-400 transition-colors">
                                     <Download className="w-4 h-4 mr-2" /> Setup Guide
                                 </div>
                             </motion.div>
                         ))}
                     </motion.div>
                 ) : (
                     <motion.div
                         key="app-detail"
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -20 }}
                         transition={{ duration: 0.4 }}
                         className="flex flex-col gap-6"
                     >
                         <button 
                             onClick={() => setActiveAppId(null)}
                             className="flex items-center gap-2 text-zinc-400 hover:text-yellow-400 font-bold uppercase tracking-widest text-sm transition-colors w-fit"
                         >
                             <ArrowLeft className="w-4 h-4" /> Back to Apps
                         </button>
                         
                         <div className="bg-zinc-900/60 border border-yellow-900/40 rounded-3xl p-6 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col md:flex-row gap-10">
                             <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-yellow-600/10 rounded-full blur-[100px] pointer-events-none" />
                             
                             <div className="flex-1 relative z-10">
                                 <div className="flex items-center gap-4 mb-4">
                                     <span className="text-4xl">{selectedApp.icon}</span>
                                     <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-widest">{selectedApp.name}</h3>
                                 </div>
                                 <p className="text-zinc-300 text-base md:text-lg mb-8 font-light max-w-2xl">{selectedApp.description}</p>
                                 
                                 <div className="mb-10">
                                     <h4 className="text-yellow-500 font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                                         <Smartphone className="w-4 h-4" /> How to Setup & Use
                                     </h4>
                                     <div className="flex flex-col gap-5">
                                         {selectedApp.steps.map((step, idx) => (
                                             <div key={idx} className="flex gap-4 items-start bg-zinc-800/40 p-4 rounded-2xl border border-zinc-700/50">
                                                 <div className="w-6 h-6 rounded-full bg-yellow-900/40 border border-yellow-700/50 flex items-center justify-center text-yellow-500 font-bold text-xs shrink-0 mt-0.5 shadow-inner">
                                                     {idx + 1}
                                                 </div>
                                                 <p className="text-zinc-200 text-sm leading-relaxed">{step}</p>
                                             </div>
                                         ))}
                                     </div>
                                 </div>

                                 <a 
                                     href={selectedApp.link}
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                                 >
                                     <ExternalLink className="w-5 h-5" /> Visit Portal / Download
                                 </a>
                             </div>
                         </div>
                     </motion.div>
                 )}
             </AnimatePresence>
        </div>
    </motion.div>
  );
};

export default EssentialAppsView;
