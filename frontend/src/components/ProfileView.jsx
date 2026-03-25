import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, User, Shield, Save, Edit3, Copy, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';

const ProfileView = ({ setActiveView }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [showSensitive, setShowSensitive] = useState({});
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    dob: '',
    phone: '',
    email: '',
    aadhaar: '',
    pan: '',
    address: '',
    emergencyContact: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('chakra_userProfile');
    if (saved) {
      try {
        setProfileData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse profile data");
      }
    } else {
      setIsEditing(true);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('chakra_userProfile', JSON.stringify(profileData));
    setIsEditing(false);
  };

  const handleCopy = (field, value) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleVisibility = (field) => {
    setShowSensitive(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const maskData = (data, type) => {
    if (!data) return 'Not Provided';
    if (type === 'aadhaar') {
      return data.replace(/.(?=.{4})/g, 'X');
    }
    if (type === 'pan') {
      if (data.length > 4) {
        return data.substring(0, 2) + 'XXXXX' + data.substring(data.length - 2);
      }
      return 'XXXXX';
    }
    return data;
  };

  const InputField = ({ label, field, type="text", placeholder, isSensitive=false, isUrgent=false }) => {
    const val = profileData[field];
    
    if (isEditing) {
      return (
        <div className="flex flex-col gap-1.5 mb-4">
          <label className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isUrgent ? 'text-red-400' : 'text-zinc-400'}`}>
             {isUrgent && <AlertCircle size={14} className="animate-pulse" />} {label}
          </label>
          <input
            type={type}
            value={val}
            onChange={(e) => setProfileData({...profileData, [field]: e.target.value})}
            placeholder={placeholder}
            className={`w-full border rounded-xl px-4 py-3 outline-none transition-all placeholder:text-zinc-600 ${
               isUrgent 
                  ? 'bg-red-950/20 border-red-700/50 text-red-100 focus:border-red-500 focus:ring-1 focus:ring-red-500/30' 
                  : 'bg-zinc-900/80 border-yellow-700/30 text-zinc-100 focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/30'
            }`}
          />
        </div>
      );
    }

    // View Mode
    const displayVal = isSensitive && !showSensitive[field] ? maskData(val, field) : (val || '—');
    return (
      <div className="flex flex-col gap-1.5 mb-4 group relative">
        <label className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isUrgent ? 'text-red-400' : 'text-zinc-500'}`}>
            {isUrgent && <AlertCircle size={14} />} {label}
        </label>
        <div className={`flex items-center justify-between bg-zinc-900/40 border rounded-xl px-4 py-3 transition-colors ${
            isUrgent ? 'border-red-900/60 hover:border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.05)]' : 'border-zinc-800 hover:border-yellow-900/50'
        }`}>
          <span className={`font-medium ${!val ? 'italic opacity-50 text-zinc-200' : (isUrgent ? 'text-red-300 font-bold tracking-wide' : 'text-zinc-200')}`}>
            {displayVal}
          </span>
          {val && (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {isSensitive && (
                <button 
                  onClick={() => toggleVisibility(field)} 
                  className="p-1.5 text-zinc-400 hover:text-yellow-500 transition-colors"
                  title="Toggle Visibility"
                >
                  {showSensitive[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
              <button 
                onClick={() => handleCopy(field, val)} 
                className="p-1.5 text-zinc-400 hover:text-green-500 transition-colors"
                title="Copy to Clipboard"
              >
                {copiedField === field ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div
        key="profile"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="min-h-screen w-full relative bg-[#030303] text-white font-sans selection:bg-yellow-500/30 p-4 md:p-12 overflow-y-auto"
    >
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5 pointer-events-none"
             style={{ backgroundImage: "url('https://img.freepik.com/premium-photo/illustration-lord-rama-silhouette-sunset_1102-19576.jpg')" }} />
        
        <div className="max-w-4xl mx-auto relative z-10 w-full h-full pb-20">
             
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
                         <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-500 to-yellow-800 tracking-[0.2em] uppercase">Personal Details</h2>
                         <p className="text-zinc-500 text-sm tracking-widest mt-1 uppercase font-bold flex items-center gap-2">
                             <Shield size={14} className="text-green-500" /> Stored Securely Locally
                         </p>
                     </div>
                 </div>
                 <div className="flex gap-3">
                     {isEditing ? (
                         <button 
                             onClick={handleSave}
                             className="flex items-center gap-2 px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                         >
                             <Save size={18} /> Save Profile
                         </button>
                     ) : (
                         <button 
                             onClick={() => setIsEditing(true)}
                             className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 border border-yellow-700/50 hover:bg-yellow-900/30 text-yellow-500 rounded-full font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                         >
                             <Edit3 size={18} /> Edit Details
                         </button>
                     )}
                 </div>
             </div>

             {/* Form Container */}
             <div className="bg-zinc-900/40 border border-yellow-900/30 rounded-3xl p-6 md:p-10 flex flex-col backdrop-blur-md relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                 <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-yellow-600/5 rounded-full blur-[100px] pointer-events-none" />
                 
                 <div className="mb-8 flex items-center gap-4 border-b border-zinc-800 pb-6 relative z-10">
                    <div className="w-16 h-16 rounded-full bg-zinc-950 border-2 border-yellow-700/50 flex items-center justify-center shadow-inner">
                        <User className="w-8 h-8 text-yellow-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-wide">Your Hub</h3>
                        <p className="text-zinc-400 text-sm mt-1 max-w-lg leading-relaxed">
                            Keep your essential details handy here. When watching a tutorial and filling a form, simply click to copy your data securely.
                        </p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 relative z-10">
                     <InputField label="Full Name (As per ID)" field="fullName" placeholder="e.g. John Doe" />
                     <InputField label="Date of Birth" field="dob" type="date" placeholder="" />
                     <InputField label="Mobile Number" field="phone" type="tel" placeholder="+91 XXXXX XXXXX" />
                     <InputField label="Email Address" field="email" type="email" placeholder="john@example.com" />
                     <InputField label="Aadhaar Number" field="aadhaar" placeholder="XXXX XXXX XXXX" isSensitive={true} />
                     <InputField label="PAN Card" field="pan" placeholder="ABCDE1234F" isSensitive={true} />
                     
                     <div className="md:col-span-2 mt-4 space-y-2">
                         <InputField label="Emergency SOS Contact" field="emergencyContact" type="tel" placeholder="+91 99999 99999 (Parents / Partner)" isUrgent={true} />
                         <InputField label="Full Residential Address" field="address" placeholder="House No, Street, City, State, Pincode" />
                     </div>
                 </div>

             </div>
        </div>
    </motion.div>
  );
};

export default ProfileView;
