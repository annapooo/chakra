import React, { useRef, useEffect } from 'react';
import { Phone, ExternalLink, Scale } from 'lucide-react';

const LegalStrategyCard = ({ strategy }) => {
  const audioRef = useRef(null);

  // Auto-read the explanation once via TTS in App.jsx — this component just renders
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  if (!strategy) return null;

  const { explanation, matched_section, escalation } = strategy;

  const handleEscalation = () => {
    if (!escalation) return;
    if (escalation.type === 'call') {
      window.location.href = `tel:${escalation.target}`;
    } else if (escalation.type === 'portal') {
      window.open(escalation.target, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="flex flex-col gap-4 p-2">

      {/* Law tag */}
      {matched_section && matched_section !== "Unknown Section" && (
        <div className="flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1.5 w-fit">
          <Scale size={12} />
          <span className="font-semibold tracking-wide uppercase">{matched_section}</span>
        </div>
      )}

      {/* Oracle's humanized message — plain flowing text */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl rounded-tl-sm p-5 shadow-sm">
        <p className="text-zinc-800 text-base leading-relaxed whitespace-pre-wrap font-normal">
          {explanation}
        </p>
      </div>

      {/* Escalation action button — only if Oracle flagged it */}
      {escalation && (
        <button
          onClick={handleEscalation}
          className={`flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl font-bold text-white transition-all active:scale-95 shadow-lg ${
            escalation.type === 'call'
              ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
              : 'bg-indigo-700 hover:bg-indigo-800 shadow-indigo-700/30'
          }`}
        >
          {escalation.type === 'call' ? (
            <Phone size={18} className="shrink-0" />
          ) : (
            <ExternalLink size={18} className="shrink-0" />
          )}
          <span>{escalation.label}</span>
        </button>
      )}

    </div>
  );
};

export default LegalStrategyCard;
