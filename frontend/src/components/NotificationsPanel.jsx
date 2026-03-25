import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Plus, Calendar, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';

const NotificationsPanel = ({ isOpen, onClose, reminders, setReminders }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');

  const handleAdd = () => {
    if (!newTitle.trim() || !newDate) return;
    
    const newReminder = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      date: newDate,
      createdAt: new Date().toISOString()
    };
    
    // Sort reminders so the closest date is first
    const updated = [...reminders, newReminder].sort((a, b) => new Date(a.date) - new Date(b.date));
    setReminders(updated);
    
    setNewTitle('');
    setNewDate('');
    setIsAdding(false);
  };

  const removeReminder = (id) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  // Determine if a date is past, today, or future
  const getStatus = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Overdue', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' };
    if (diffDays === 0) return { label: 'Today', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
    if (diffDays <= 7) return { label: `In ${diffDays} days`, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    return { label: `In ${diffDays} days`, color: 'text-zinc-400', bg: 'bg-zinc-800', border: 'border-zinc-700' };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Side Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950 border-l border-yellow-900/40 shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-500">
                  <Bell size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-widest text-white">Reminders</h2>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{reminders.length} Active Deadlines</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-zinc-800"
              >
                <X size={24} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {reminders.length === 0 && !isAdding && (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                  <Bell size={48} className="text-zinc-700 mb-4" />
                  <p className="text-zinc-400 text-sm">No upcoming dates to remember.</p>
                </div>
              )}

              <AnimatePresence>
                {reminders.map((reminder) => {
                  const status = getStatus(reminder.date);
                  return (
                    <motion.div
                      key={reminder.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, height: 0 }}
                      className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 group relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="text-zinc-100 font-bold tracking-wide pr-8">{reminder.title}</h3>
                        <button 
                          onClick={() => removeReminder(reminder.id)}
                          className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Mark as done / Remove"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-2 text-zinc-400 text-sm">
                          <Calendar size={14} /> 
                          {new Date(reminder.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${status.bg} ${status.color} ${status.border}`}>
                          {status.label}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Footer / Add Action */}
            <div className="p-6 border-t border-zinc-900 bg-zinc-950">
              {isAdding ? (
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="flex flex-col gap-3"
                 >
                   <input
                     type="text"
                     value={newTitle}
                     onChange={e => setNewTitle(e.target.value)}
                     placeholder="What's the reminder? (e.g. Passport Appointment)"
                     className="w-full bg-zinc-900 border border-yellow-700/30 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-yellow-500 placeholder:text-zinc-600"
                     autoFocus
                   />
                   <input
                     type="date"
                     value={newDate}
                     onChange={e => setNewDate(e.target.value)}
                     className="w-full bg-zinc-900 border border-yellow-700/30 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
                   />
                   <div className="flex gap-2 mt-2">
                     <button 
                       onClick={handleAdd}
                       disabled={!newTitle.trim() || !newDate}
                       className="flex-1 bg-yellow-500 text-black font-bold uppercase tracking-widest text-xs py-3 rounded-xl disabled:opacity-50 transition-all hover:bg-yellow-400"
                     >
                       Save Date
                     </button>
                     <button 
                       onClick={() => { setIsAdding(false); setNewTitle(''); setNewDate(''); }}
                       className="px-4 py-3 bg-zinc-800 text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-zinc-700 transition-colors"
                     >
                       Cancel
                     </button>
                   </div>
                 </motion.div>
              ) : (
                 <button 
                   onClick={() => setIsAdding(true)}
                   className="w-full flex items-center justify-center gap-2 py-4 bg-zinc-900 hover:bg-yellow-900/20 text-yellow-500 border border-yellow-900/50 rounded-2xl font-bold uppercase tracking-widest transition-all"
                 >
                   <Plus size={18} /> Add Important Date
                 </button>
              )}
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationsPanel;
