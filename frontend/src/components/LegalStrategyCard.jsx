import React, { useRef, useEffect } from 'react';
import { Phone, ExternalLink, Scale } from 'lucide-react';

const LegalStrategyCard = ({ strategy, chatHistory = [] }) => {
  const audioRef = useRef(null);

  // Auto-read the explanation once via TTS in App.jsx — this component just renders
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  if (!strategy) return null;

  const { explanation, matched_section, escalation } = strategy;

  const recentChat = Array.isArray(chatHistory) ? chatHistory.slice(-6) : [];

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
      {recentChat.length > 0 && (
        <div className="bg-zinc-100/60 border border-zinc-200 rounded-2xl p-3 mb-2">
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-2">Chat Context</p>
          <div className="flex flex-col gap-2">
            {recentChat.map((m, i) => (
              <div key={i} className={`text-sm rounded px-3 py-2 ${m.role === 'user' ? 'bg-yellow-50 text-yellow-800 self-end' : 'bg-white text-zinc-800 self-start'}`}>
                <div className="text-[11px] font-semibold mb-1 uppercase tracking-wider">
                  {m.role === 'user' ? 'You' : 'Oracle'}
                </div>
                <div className="whitespace-pre-wrap leading-relaxed text-[13px]">{m.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}
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
