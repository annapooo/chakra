import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import LegalStrategyCard from './LegalStrategyCard';

const Archives = ({ setActiveView, chatHistory = [], strategyData = null }) => {
  return (
    <motion.div
      key="archives"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="min-h-screen w-full relative bg-[#030303] text-white font-sans selection:bg-yellow-500/30 p-4 md:p-12 overflow-y-auto"
    >
      <div className="max-w-5xl mx-auto relative z-10 w-full h-full pb-20">
        <div className="mb-10 flex items-start justify-between gap-6 pb-6 border-b border-yellow-900/30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="p-3 bg-zinc-900/60 border border-yellow-900/30 rounded-full hover:bg-yellow-900/20 hover:border-yellow-500/50 transition-all text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-500 to-yellow-800 tracking-[0.2em] uppercase">Archives</h2>
              <p className="text-zinc-500 text-sm tracking-widest mt-1 uppercase font-bold">Past chats & strategies</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <div className="bg-zinc-900/60 border border-yellow-900/40 rounded-3xl p-6 mb-6">
              <h3 className="text-xl font-black text-zinc-100 mb-4">Conversation History</h3>
              {(!chatHistory || chatHistory.length === 0) && (
                <p className="text-zinc-400">No past chats available yet.</p>
              )}
              <div className="flex flex-col gap-3">
                {chatHistory.map((m, i) => (
                  <div key={i} className={`p-3 rounded-xl ${m.role === 'user' ? 'bg-yellow-50 text-yellow-800 self-end' : 'bg-zinc-800 text-zinc-100 self-start'}`}>
                    <div className="text-[11px] font-semibold mb-1 uppercase tracking-wider">{m.role === 'user' ? 'You' : 'Oracle'}</div>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside>
            <div className="sticky top-6">
              <h3 className="text-xl font-black text-zinc-100 mb-4">Active Strategy</h3>
              <LegalStrategyCard strategy={strategyData} chatHistory={chatHistory} />
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  );
};

export default Archives;
