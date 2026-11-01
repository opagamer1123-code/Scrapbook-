import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

export type EnvelopeAnimationPhase =
  | 'closed'
  | 'pulse-seal'
  | 'lift-seal'
  | 'open-flap'
  | 'rise-letter'
  | 'unfold'
  | 'revealed';

interface EnvelopeIllustrationProps {
  phase: EnvelopeAnimationPhase;
  onSealClick: () => void;
  disabled?: boolean;
}

export const EnvelopeIllustration: React.FC<EnvelopeIllustrationProps> = ({
  phase,
  onSealClick,
  disabled = false,
}) => {
  const isFlapOpen =
    phase === 'open-flap' ||
    phase === 'rise-letter' ||
    phase === 'unfold' ||
    phase === 'revealed';

  const isLetterRising =
    phase === 'rise-letter' ||
    phase === 'unfold' ||
    phase === 'revealed';

  const isSealPulsing = phase === 'pulse-seal';
  const isSealLiftingOrGone =
    phase === 'lift-seal' ||
    phase === 'open-flap' ||
    phase === 'rise-letter' ||
    phase === 'unfold' ||
    phase === 'revealed';

  return (
    <div
      className="relative w-full max-w-[340px] sm:max-w-[400px] md:max-w-[420px] h-[230px] sm:h-[260px] md:h-[270px] mx-auto select-none my-3"
      aria-label="Romantic sealed envelope for Ekta"
    >
      {/* 1. Subtle warm ambient glow behind the envelope */}
      <div
        className="absolute inset-0 bg-gradient-to-tr from-[#F8DCE5]/70 via-[#FFF0F4]/50 to-[#FFF8ED]/80 rounded-[30px] blur-2xl -z-10 transform scale-110 pointer-events-none"
        aria-hidden="true"
      />

      {/* Floating Petals dedicated to envelope opening burst */}
      {(phase === 'open-flap' || phase === 'rise-letter' || phase === 'unfold') && (
        <div className="absolute inset-0 pointer-events-none z-40 overflow-visible" aria-hidden="true">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-5 opacity-90 animate-[envelopePetalDrift_1.6s_ease-out_forwards]"
              style={{
                left: `${20 + i * 12}%`,
                top: `${40 - (i % 3) * 10}%`,
                animationDelay: `${i * 120}ms`,
              }}
            >
              <svg viewBox="0 0 24 32" fill="none" className="w-full h-full">
                <path
                  d="M12 0C18 8 24 18 20 28C16 34 8 32 4 28C0 22 6 8 12 0Z"
                  fill="#F8DCE5"
                  stroke="#E2A9B8"
                  strokeWidth="0.8"
                />
              </svg>
            </div>
          ))}
        </div>
      )}

      {/* 2. Main Envelope Body Container */}
      <div className="relative w-full h-full bg-[#FFFBF5] rounded-2xl shadow-[0_16px_36px_rgba(90,53,69,0.14)] border border-[rgba(166,77,104,0.2)] overflow-hidden">
        {/* Interior Pocket Shading & Subtle Lining */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#F9E5EC]/50 via-[#FFF8ED]/40 to-[#FFFBF5]"
          aria-hidden="true"
        />

        {/* Interior floral watermark detail on the back wall */}
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-20 opacity-20 text-[#A64D68] pointer-events-none"
          aria-hidden="true"
        >
          <svg viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M50 5 Q35 30 10 35 Q30 40 50 20 Q70 40 90 35 Q65 30 50 5 Z" fill="#F8DCE5" />
            <circle cx="50" cy="18" r="4" fill="#A64D68" />
          </svg>
        </div>

        {/* 3. Peeking Stationery Letter Sheet */}
        <div
          className={`absolute left-4 sm:left-6 right-4 sm:right-6 h-[195px] sm:h-[215px] bg-[#FFFCF8] rounded-t-xl border border-[rgba(166,77,104,0.22)] shadow-[0_-4px_16px_rgba(90,53,69,0.08)] p-4 sm:p-5 transition-all duration-700 ease-out ${
            isLetterRising
              ? '-translate-y-28 sm:-translate-y-36 opacity-100 scale-[1.03] shadow-[0_-16px_32px_rgba(90,53,69,0.2)] z-30'
              : 'top-8 opacity-90 translate-y-0 z-0'
          }`}
          aria-hidden="true"
        >
          {/* Peeking Stationery Header */}
          <div className="border-b border-dashed border-[rgba(166,77,104,0.24)] pb-2 flex items-center justify-between">
            <span className="font-handwriting text-[#A64D68] text-lg sm:text-xl font-medium tracking-wide">
              For Ekta ♡
            </span>
            <div className="w-5 h-5 rounded-full bg-[#F8DCE5]/70 flex items-center justify-center">
              <Heart className="w-3 h-3 text-[#A64D68] fill-[#A64D68]" />
            </div>
          </div>

          {/* Faint elegant ghost lines representing handwritten thoughts */}
          <div className="mt-3 space-y-2.5 opacity-60">
            <div className="h-1.5 bg-[#A64D68]/20 rounded-full w-4/5" />
            <div className="h-1.5 bg-[#A64D68]/15 rounded-full w-full" />
            <div className="h-1.5 bg-[#A64D68]/15 rounded-full w-5/6" />
            <div className="h-1.5 bg-[#A64D68]/15 rounded-full w-3/4" />
          </div>

          {/* Second sheet peeking tilted slightly behind inside the letter */}
          <div className="absolute -bottom-2 right-3 w-16 h-8 bg-[#FFF8ED] rounded-t-sm border-t border-l border-[rgba(166,77,104,0.15)] opacity-50 rotate-3 pointer-events-none" />
        </div>

        {/* 4. Envelope Front Folds (Crisp geometric styling) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox="0 0 420 270"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="envelopeLeftGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF8ED" />
              <stop offset="100%" stopColor="#FFF2F6" />
            </linearGradient>
            <linearGradient id="envelopeRightGrad" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF8ED" />
              <stop offset="100%" stopColor="#FFF2F6" />
            </linearGradient>
            <linearGradient id="envelopeBottomGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#FFFDF9" />
              <stop offset="100%" stopColor="#FAF0F4" />
            </linearGradient>
            <filter id="envelopeFoldShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="-2" stdDeviation="2.5" floodColor="#5A3545" floodOpacity="0.08" />
            </filter>
          </defs>

          {/* Left triangular front fold */}
          <path
            d="M0,0 L210,140 L0,270 Z"
            fill="url(#envelopeLeftGrad)"
            stroke="rgba(166, 77, 104, 0.18)"
            strokeWidth="1.2"
          />

          {/* Right triangular front fold */}
          <path
            d="M420,0 L210,140 L420,270 Z"
            fill="url(#envelopeRightGrad)"
            stroke="rgba(166, 77, 104, 0.18)"
            strokeWidth="1.2"
          />

          {/* Bottom triangular fold overlapping the sides */}
          <path
            d="M0,270 L210,126 L420,270 Z"
            fill="url(#envelopeBottomGrad)"
            stroke="rgba(166, 77, 104, 0.22)"
            strokeWidth="1.2"
            filter="url(#envelopeFoldShadow)"
          />

          {/* Botanical corner flourish detail */}
          <g stroke="#A64D68" strokeWidth="0.8" fill="none" opacity="0.4">
            <path d="M12,258 Q24,253 30,243" />
            <circle cx="30" cy="243" r="1.5" fill="#A64D68" />
            <path d="M408,258 Q396,253 390,243" />
            <circle cx="390" cy="243" r="1.5" fill="#A64D68" />
          </g>
        </svg>

        {/* 5. Envelope Top Flap (Animated 180° flip via 3D perspective) */}
        <div
          className={`absolute top-0 left-0 right-0 h-[138px] origin-top transition-transform duration-600 ease-in-out z-20 ${
            isFlapOpen
              ? '[transform:rotateX(180deg)] z-0 pointer-events-none'
              : '[transform:rotateX(0deg)]'
          }`}
          style={{ transformStyle: 'preserve-3d' }}
          aria-hidden="true"
        >
          <svg
            className="w-full h-full drop-shadow-[0_4px_8px_rgba(90,53,69,0.08)]"
            viewBox="0 0 420 138"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="envelopeTopFlapGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFDF9" />
                <stop offset="90%" stopColor="#FFF2F6" />
                <stop offset="100%" stopColor="#FAE8EF" />
              </linearGradient>
            </defs>
            <path
              d="M0,0 L210,136 L420,0 Z"
              fill="url(#envelopeTopFlapGrad)"
              stroke="rgba(166, 77, 104, 0.22)"
              strokeWidth="1.2"
            />
            {/* Inner accent line on flap */}
            <path
              d="M20,6 L210,126 L400,6"
              stroke="rgba(166, 77, 104, 0.12)"
              strokeWidth="1"
              fill="none"
            />
          </svg>
        </div>

        {/* 6. Dimensional Rose Pink Wax Seal */}
        {phase !== 'revealed' && (
          <div
            className={`absolute left-1/2 top-[136px] -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-400 ease-out ${
              isSealLiftingOrGone
                ? '-translate-y-12 opacity-0 pointer-events-none scale-110'
                : 'opacity-100'
            }`}
          >
            <button
              onClick={onSealClick}
              disabled={disabled || phase !== 'closed'}
              type="button"
              className="group cursor-pointer focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-[#A64D68]/60 rounded-full disabled:cursor-not-allowed"
              aria-label="Tap wax seal to open letter for Ekta"
              title="Tap heart seal to open"
            >
              {/* Outer Organic Wax Scalloped Ring */}
              <div
                className={`relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#7B2E44] via-[#A64D68] to-[#C96B85] shadow-[0_6px_16px_rgba(90,53,69,0.32)] flex items-center justify-center transition-all duration-300 ${
                  isSealPulsing
                    ? 'scale-125 shadow-[0_0_24px_rgba(166,77,104,0.7)] ring-4 ring-[#F8DCE5]'
                    : 'group-hover:scale-110 group-hover:shadow-[0_8px_20px_rgba(90,53,69,0.4)]'
                }`}
              >
                {/* Outer wax rim detail */}
                <div className="absolute inset-1 rounded-full border border-[rgba(255,255,255,0.25)] pointer-events-none" />

                {/* Inner debossed seal bed */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#8E3E56] shadow-inner flex items-center justify-center border border-[#6B283A]/40">
                  <Heart
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-white/95 fill-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] transition-transform duration-200 ${
                      isSealPulsing ? 'scale-125' : 'group-hover:scale-115'
                    }`}
                  />
                </div>

                {/* Floating Micro Seal Hint */}
                {phase === 'closed' && (
                  <span className="absolute -bottom-6 font-handwriting text-xs text-[#A64D68] font-semibold whitespace-nowrap opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-2xs">
                    Tap seal ♡
                  </span>
                )}
              </div>
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes envelopePetalDrift {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translate(60px, -110px) rotate(220deg) scale(1.1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
