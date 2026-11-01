import React, { useState } from 'react';
import { Heart, Sparkles, Feather, RotateCcw } from 'lucide-react';
import { EnvelopeIllustration, EnvelopeAnimationPhase } from './EnvelopeIllustration';
import { PageTurnBook } from './PageTurnBook';
import { authoritativeStoryChapters, homeStoryOpening } from '../config/ektaStoryConfig';

interface OpeningEnvelopeProps {
  isOpen: boolean;
  onOpen: () => void;
  onLetterRevealed: () => void;
}

export const OpeningEnvelope: React.FC<OpeningEnvelopeProps> = ({
  isOpen,
  onOpen,
  onLetterRevealed,
}) => {
  const [phase, setPhase] = useState<EnvelopeAnimationPhase>(isOpen ? 'revealed' : 'closed');
  const [isAnimating, setIsAnimating] = useState(false);

  // Coordinated staged animation sequence (~1.2 - 1.8 seconds total)
  const runOpeningSequence = () => {
    if (isAnimating || phase === 'revealed') return;

    setIsAnimating(true);
    onOpen();

    // Step 1: Heart seal pulses / glows (0 to 300ms)
    setPhase('pulse-seal');

    // Step 2: Wax seal lifts away and fades elegantly (at 320ms)
    setTimeout(() => {
      setPhase('lift-seal');
    }, 320);

    // Step 3: Upper flap rotates open via rotateX(180deg) (at 650ms)
    setTimeout(() => {
      setPhase('open-flap');
    }, 650);

    // Step 4: Cream letter rises slowly upward from envelope pocket (at 1000ms)
    setTimeout(() => {
      setPhase('rise-letter');
    }, 1000);

    // Step 5: Letter unfolds / expands into readable page (at 1350ms)
    setTimeout(() => {
      setPhase('unfold');
    }, 1350);

    // Step 6-9: Complete unfold, reveal opening title & first story portion + Next Page (at 1650ms)
    setTimeout(() => {
      setPhase('revealed');
      setIsAnimating(false);

      // Smoothly scroll down to the revealed letter reading view
      setTimeout(() => {
        const letterCard = document.getElementById('story-book-section');
        if (letterCard) {
          letterCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }, 1650);
  };

  const handleResetToSealed = () => {
    if (isAnimating) return;
    setPhase('closed');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      id="envelope-section"
      className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-between px-4 sm:px-6 pt-7 sm:pt-10 md:pt-12 pb-10 sm:pb-14 relative overflow-hidden paper-pattern"
      aria-label="A Story for Ekta"
    >
      {/* Decorative Pressed Flowers / Botanical Line Flourishes (aria-hidden) */}
      <div
        className="absolute top-6 left-6 w-24 h-24 opacity-25 pointer-events-none text-[#A64D68]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M10 50 Q25 25 50 10" />
          <circle cx="50" cy="10" r="3" fill="#F8DCE5" />
          <path d="M15 35 Q25 32 30 22" />
          <path d="M28 45 Q36 40 40 30" />
        </svg>
      </div>
      <div
        className="absolute top-6 right-6 w-24 h-24 opacity-25 pointer-events-none text-[#A64D68] scale-x-[-1]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M10 50 Q25 25 50 10" />
          <circle cx="50" cy="10" r="3" fill="#F8DCE5" />
          <path d="M15 35 Q25 32 30 22" />
        </svg>
      </div>

      {/* STATE A: Sealed Envelope & Initial Call To Action */}
      {phase !== 'revealed' ? (
        <div className="flex flex-col items-center justify-between w-full flex-1 max-w-3xl mx-auto">
          {/* Hero Typography Composition */}
          <div className="text-center max-w-[760px] mx-auto relative z-20 flex flex-col items-center animate-[fadeSlideDown_0.8s_ease-out]">
            {/* Small handwritten eyebrow */}
            <div className="inline-flex items-center gap-2 mb-2.5">
              <span className="h-px w-6 sm:w-8 bg-gradient-to-r from-transparent to-[#A64D68]/40" aria-hidden="true" />
              <span className="font-handwriting text-2xl sm:text-3xl text-[#A64D68] tracking-wide inline-flex items-center gap-1.5">
                For Ekta ♡
              </span>
              <span className="h-px w-6 sm:w-8 bg-gradient-to-l from-transparent to-[#A64D68]/40" aria-hidden="true" />
            </div>

            {/* Exact initial message specified in requirements */}
            <h1 className="font-heading text-[clamp(2rem,4.2vw,3.2rem)] text-[#5A3545] font-semibold leading-[1.2] tracking-tight max-w-[760px]">
              Hey Ekta, I have a little story to tell you...
            </h1>

            {/* Supporting subtext */}
            <p className="mt-3 text-base sm:text-lg md:text-xl text-[#9A817B] font-letter italic max-w-[560px] leading-relaxed">
              Some stories stay in the heart for years before they find the courage to be told.
            </p>
          </div>

          {/* Staged Envelope Illustration with Heart Wax Seal */}
          <div className="w-full my-auto py-3 relative z-20 flex items-center justify-center">
            <EnvelopeIllustration
              phase={phase}
              onSealClick={runOpeningSequence}
              disabled={isAnimating}
            />
          </div>

          {/* Primary Action Button: "Open Your Letter ♡" */}
          <div className="relative z-20 text-center flex flex-col items-center justify-center animate-[fadeSlideUp_0.9s_ease-out_0.2s_both]">
            <button
              onClick={runOpeningSequence}
              disabled={isAnimating}
              type="button"
              className="group inline-flex items-center justify-center gap-3 px-8 sm:px-11 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#A64D68] via-[#9B455F] to-[#8E3E56] hover:from-[#933D56] hover:to-[#5A3545] text-white font-medium text-base sm:text-lg shadow-[0_8px_24px_rgba(166,77,104,0.32)] hover:shadow-[0_12px_28px_rgba(166,77,104,0.4)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-3 focus-visible:ring-[#A64D68]/50 focus-visible:outline-hidden disabled:opacity-80 disabled:cursor-not-allowed"
              aria-label="Open Your Letter"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#F8DCE5] animate-pulse" aria-hidden="true" />
              <span>Open Your Letter ♡</span>
              <Heart
                className="w-4 h-4 sm:w-5 sm:h-5 text-[#F8DCE5] fill-[#F8DCE5] transition-transform duration-300 group-hover:scale-125"
                aria-hidden="true"
              />
            </button>
            <p className="mt-2.5 text-xs text-[#9A817B] font-letter italic">
              Click the button or tap the wax seal to unfold the letter
            </p>
          </div>
        </div>
      ) : (
        /* STATE B: Unfolded Letter & Authentic Physical 3D Page-Turn Experience */
        <div id="story-book-section" className="w-full flex-1 flex flex-col items-center animate-[letterUnfold_0.7s_cubic-bezier(0.16,1,0.3,1)]">
          {/* Top Banner Ribbon */}
          <div className="w-full max-w-3xl flex items-center justify-between mb-4 px-2">
            <span className="font-handwriting text-2xl text-[#A64D68] inline-flex items-center gap-1.5">
              <Feather className="w-4 h-4 text-[#A64D68]" />
              A Story Written for Ekta ♡
            </span>

            <button
              onClick={handleResetToSealed}
              className="inline-flex items-center gap-1.5 text-xs text-[#9A817B] hover:text-[#A64D68] transition-colors py-1 px-2 rounded-md hover:bg-[#F8DCE5]/30"
              title="Close back to sealed envelope"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>View Envelope</span>
            </button>
          </div>

          {/* Genuine 3D Hardcover Page-Turn Book with exact story chapters */}
          <PageTurnBook
            chapters={authoritativeStoryChapters}
            initialChapterIndex={0}
            sectionTitle="Chapter"
            badgeLabel="10-Year Confession"
            completeButtonText="Continue to My Letter & Notes ♡"
            onComplete={onLetterRevealed}
            onReturnHome={handleResetToSealed}
          />
        </div>
      )}

      <style>{`
        @keyframes fadeSlideDown {
          from {
            opacity: 0;
            transform: translateY(-14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes letterUnfold {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-[fadeSlideDown_0.8s_ease-out],
          .animate-[fadeSlideUp_0.9s_ease-out_0.2s_both],
          .animate-[letterUnfold_0.7s_cubic-bezier(0.16,1,0.3,1)] {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
};
