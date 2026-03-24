import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, AlertTriangle, Loader2 } from 'lucide-react';

/**
 * EmergencyCallModal
 * Shown when Gemini flags a crisis escalation of type "call".
 * Collects the user's phone number, confirms, then hits /emergency/call
 * which places a Twilio outbound call that bridges them to the helpline.
 */
export default function EmergencyCallModal({ escalation, onClose }) {
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('idle'); // idle | calling | success | error
  const [errorMsg, setErrorMsg] = useState('');

  if (!escalation || escalation.type !== 'call') return null;

  const handleCall = async () => {
    const raw = phone.trim().replace(/\s/g, '');
    if (!raw) return;

    // Auto-prefix +91 for Indian numbers if not already E.164
    const e164 = raw.startsWith('+') ? raw : `+91${raw}`;

    setStatus('calling');
    setErrorMsg('');

    const API_URL = import.meta.env.VITE_APP_API_URL || `http://${window.location.hostname}:8000`;

    try {
      const res = await fetch(`${API_URL}/emergency/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_phone: e164,
          helpline: escalation.target,
          helpline_name: escalation.label,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Call failed');
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="w-full max-w-md bg-zinc-900 border border-red-700/40 rounded-3xl p-6 shadow-[0_0_60px_rgba(239,68,68,0.2)]"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-900/40 border border-red-700/50 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Crisis Helpline</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Chakravyuha will call you & connect</p>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1">
              <X size={20} />
            </button>
          </div>

          {/* Info */}
          <div className="bg-red-950/30 border border-red-800/30 rounded-2xl p-4 mb-5">
            <p className="text-sm text-red-200 leading-relaxed">
              We'll call <span className="font-bold text-white">your phone</span> and immediately connect you to{' '}
              <span className="font-bold text-red-300">{escalation.label}</span>.
            </p>
          </div>

          {status === 'idle' && (
            <>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Your Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCall()}
                placeholder="e.g. 9876543210"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-base outline-none focus:border-red-500 transition-colors mb-4 placeholder-zinc-500"
              />
              <button
                onClick={handleCall}
                disabled={!phone.trim()}
                className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-95"
              >
                <Phone size={20} />
                Confirm & Call Now
              </button>
            </>
          )}

          {status === 'calling' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <Loader2 className="w-10 h-10 text-red-400 animate-spin" />
              <p className="text-zinc-300 text-sm font-medium">Placing your call...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-14 h-14 rounded-full bg-green-900/40 border border-green-500/40 flex items-center justify-center">
                <Phone className="w-7 h-7 text-green-400 animate-pulse" />
              </div>
              <p className="text-green-300 font-bold text-base">Your phone is ringing!</p>
              <p className="text-zinc-400 text-sm">Answer the call — we'll connect you to {escalation.label}.</p>
              <button onClick={onClose} className="mt-2 text-xs text-zinc-500 hover:text-white transition-colors underline">
                Close
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <p className="text-red-400 font-bold">Call failed</p>
              <p className="text-zinc-400 text-sm">{errorMsg}</p>
              <button
                onClick={() => setStatus('idle')}
                className="px-4 py-2 bg-zinc-800 rounded-xl text-zinc-300 text-sm hover:bg-zinc-700 transition-colors"
              >
                Try again
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
