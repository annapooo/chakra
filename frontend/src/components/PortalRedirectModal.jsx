import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, X, Globe } from 'lucide-react';

// Maps portal URLs to a short human-readable description shown in the modal
const PORTAL_DESCRIPTIONS = {
  'vcourts.gov.in': 'Contest or dispute a traffic challan through India\'s Virtual Court system.',
  'echallan.parivahan.gov.in': 'Pay your pending traffic challan online via the official Parivahan portal.',
  'sarathi.parivahan.gov.in': 'Apply for, renew, or get a duplicate Driving Licence through Sarathi.',
  'vahan.parivahan.gov.in': 'Handle vehicle registration, RC transfer, and ownership-related services.',
  'parivahan.gov.in': 'Access all Ministry of Road Transport services — DL, RC, permits, and more.',
  'consumerhelpline.gov.in': 'File a complaint against a business for defective products or poor service.',
  'edaakhil.nic.in': 'File your case with the National Consumer Disputes Redressal Commission online.',
  'ncrp.in': 'File an online FIR or report a cybercrime to the National Crime Reporting Portal.',
  'rtionline.gov.in': 'Submit a Right to Information (RTI) request to any central government body.',
  'services.ecourts.gov.in': 'Check your case status, hearing dates, and court orders online.',
  'nalsa.gov.in': 'Apply for free legal aid services from the National Legal Services Authority.',
  'grievance.epfindia.gov.in': 'Raise a complaint about PF, ESI, or labour-related issues.',
  'incometax.gov.in': 'File returns, check refund status, or raise a tax-related grievance.',
  'bhulekh.mahabhumi.gov.in': 'View and verify land records, property ownership, and mutation status.',
  'passportindia.gov.in': 'Apply for, renew, or track your Indian passport.',
};

function getDescription(url) {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return PORTAL_DESCRIPTIONS[hostname] || 'This government portal can help you take the next step in your case.';
  } catch {
    return 'This government portal can help you take the next step in your case.';
  }
}

/**
 * PortalRedirectModal
 * Shown when Gemini flags a portal-type escalation.
 * Displays the destination, a description, and asks for confirmation before opening.
 */
export default function PortalRedirectModal({ escalation, onClose }) {
  if (!escalation || escalation.type !== 'portal') return null;

  const description = getDescription(escalation.target);

  const handleOpen = () => {
    window.open(escalation.target, '_blank', 'noopener,noreferrer');
    onClose();
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
          className="w-full max-w-md bg-zinc-900 border border-indigo-700/40 rounded-3xl p-6 shadow-[0_0_60px_rgba(99,102,241,0.2)]"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-900/40 border border-indigo-700/50 flex items-center justify-center">
                <Globe className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Government Portal</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Redirecting to official site</p>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1">
              <X size={20} />
            </button>
          </div>

          {/* Portal card */}
          <div className="bg-indigo-950/30 border border-indigo-800/30 rounded-2xl p-4 mb-5 space-y-2">
            <p className="text-sm font-bold text-white">{escalation.label}</p>
            <p className="text-sm text-zinc-300 leading-relaxed">{description}</p>
            <p className="text-xs text-indigo-400 break-all mt-2">{escalation.target}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-zinc-700 text-zinc-400 text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleOpen}
              className="flex-1 py-3 rounded-2xl bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] active:scale-95"
            >
              <ExternalLink size={16} />
              Open Portal
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
