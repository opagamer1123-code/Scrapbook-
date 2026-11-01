import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Sparkles,
  Smile,
  MessageCircle,
  Edit3,
  RotateCcw,
  ChevronUp,
  Mail,
  Flower2,
} from 'lucide-react';
import { LittleThingCard } from '../config/proposalConfig';
import { loadLittleThings, saveLittleThings } from '../services/notesStorage';

interface LittleThingsSectionProps {
  isOwnerMode: boolean;
  onContinueToQuestion: () => void;
  onPrevPage?: () => void;
}

// Delicate Washi Masking Tape Accent on Card Top
const WashiTapeAccent: React.FC<{ rotation?: string }> = ({ rotation = '-rotate-1' }) => (
  <div
    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-6 bg-[#F8DCE5]/75 border-y border-[#E2A9B8]/40 shadow-xs backdrop-blur-2xs rounded-xs pointer-events-none z-20 ${rotation}`}
    style={{
      backgroundImage:
        'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(166, 77, 104, 0.05) 4px, rgba(166, 77, 104, 0.05) 8px)',
    }}
  >
    <div className="absolute inset-x-0 top-0 h-px bg-white/40" />
    <div className="absolute inset-x-0 bottom-0 h-px bg-[#A64D68]/15" />
  </div>
);

// Pressed Botanical Sprig Illustration
const PressedBotanicalSprig: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 60 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pointer-events-none select-none opacity-40 ${className}`}
    aria-hidden="true"
  >
    <path
      d="M30 75C30 50 35 30 50 10"
      stroke="#C7A66A"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M35 55C42 50 48 53 46 45C44 38 36 45 35 55Z"
      fill="#D99AA5"
      fillOpacity="0.4"
      stroke="#C7A66A"
      strokeWidth="0.8"
    />
    <path
      d="M28 42C20 40 18 32 24 30C30 28 32 38 28 42Z"
      fill="#F8DCE5"
      fillOpacity="0.6"
      stroke="#C7A66A"
      strokeWidth="0.8"
    />
    <path
      d="M38 32C46 28 48 20 42 19C36 18 36 28 38 32Z"
      fill="#D99AA5"
      fillOpacity="0.5"
      stroke="#C7A66A"
      strokeWidth="0.8"
    />
    <circle cx="50" cy="10" r="2.5" fill="#A64D68" fillOpacity="0.7" />
  </svg>
);

export const LittleThingsSection: React.FC<LittleThingsSectionProps> = ({
  isOwnerMode,
  onContinueToQuestion,
  onPrevPage,
}) => {
  const [cards, setCards] = useState<LittleThingCard[]>([]);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [editingCard, setEditingCard] = useState<LittleThingCard | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // Scroll parallax offset
  const [scrollY, setScrollY] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Intersection Observer Visibility states
  const [headerVisible, setHeaderVisible] = useState(false);
  const [visibleCards, setVisibleCards] = useState<Record<string, boolean>>({});
  const [navVisible, setNavVisible] = useState(false);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const navRef = useRef<HTMLDivElement | null>(null);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Parallax Scroll Tracking (lightweight RAF damped)
  useEffect(() => {
    if (prefersReducedMotion) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReducedMotion]);

  // Load cards from storage
  useEffect(() => {
    const loaded = loadLittleThings();
    setCards(loaded);
    const initialReveals: Record<string, boolean> = {};
    loaded.forEach((c) => {
      initialReveals[c.id] = c.revealedInitially;
    });
    setRevealedIds(initialReveals);
  }, []);

  // Intersection Observer for slow, delicate, scroll-triggered reveals
  useEffect(() => {
    if (prefersReducedMotion) {
      setHeaderVisible(true);
      const allVis: Record<string, boolean> = {};
      cards.forEach((c) => (allVis[c.id] = true));
      setVisibleCards(allVis);
      setNavVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const targetId = target.dataset.observeId;

            if (targetId === 'header') {
              setHeaderVisible(true);
            } else if (targetId === 'nav') {
              setNavVisible(true);
            } else if (targetId && targetId.startsWith('card-')) {
              const cardId = targetId.replace('card-', '');
              setVisibleCards((prev) => ({ ...prev, [cardId]: true }));
            }
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    if (headerRef.current) observer.observe(headerRef.current);
    if (navRef.current) observer.observe(navRef.current);
    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [cards, prefersReducedMotion]);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleStartEdit = (card: LittleThingCard) => {
    setEditingCard(card);
    setEditTitle(card.title);
    setEditContent(card.content);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    const updated = cards.map((c) =>
      c.id === editingCard.id ? { ...c, title: editTitle, content: editContent } : c
    );
    setCards(updated);
    saveLittleThings(updated);
    setEditingCard(null);
  };

  const handleResetCards = () => {
    if (window.confirm('Reset all Little Things cards to default text?')) {
      localStorage.removeItem('for_ekta_little_things_v1');
      const reloaded = loadLittleThings();
      setCards(reloaded);
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'smile':
        return <Smile className="w-5 h-5 text-[#A64D68]" aria-hidden="true" />;
      case 'sparkle':
        return <Sparkles className="w-5 h-5 text-[#A64D68]" aria-hidden="true" />;
      case 'conversation':
        return <MessageCircle className="w-5 h-5 text-[#A64D68]" aria-hidden="true" />;
      case 'heart':
      default:
        return <Heart className="w-5 h-5 text-[#A64D68] fill-[#F8DCE5]" aria-hidden="true" />;
    }
  };

  // Organic rotation angles for authentic scrapbook feel
  const cardRotations = ['-rotate-[0.6deg]', 'rotate-[0.8deg]', '-rotate-[0.7deg]', 'rotate-[0.5deg]'];

  return (
    <section
      id="little-things-section"
      className="py-12 sm:py-20 px-3.5 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-20 w-full overflow-hidden"
      aria-label="Little Things I Admire about Ekta"
    >
      {/* =================================================================== */}
      {/* DELICATE PARALLAX BOTANICAL & PAPER BACKGROUND ELEMENTS */}
      {/* =================================================================== */}
      <div
        className="absolute top-16 left-4 sm:left-8 pointer-events-none transition-transform duration-500 ease-out"
        style={{
          transform: prefersReducedMotion ? 'none' : `translateY(${scrollY * 0.04}px) rotate(-8deg)`,
        }}
      >
        <PressedBotanicalSprig className="w-14 sm:w-20 h-auto" />
      </div>

      <div
        className="absolute top-1/2 -right-6 sm:right-6 pointer-events-none transition-transform duration-500 ease-out"
        style={{
          transform: prefersReducedMotion ? 'none' : `translateY(${-scrollY * 0.03}px) rotate(12deg)`,
        }}
      >
        <PressedBotanicalSprig className="w-16 sm:w-24 h-auto" />
      </div>

      <div
        className="absolute bottom-24 left-6 sm:left-12 pointer-events-none transition-transform duration-500 ease-out"
        style={{
          transform: prefersReducedMotion ? 'none' : `translateY(${scrollY * 0.02}px) rotate(-4deg)`,
        }}
      >
        <div className="w-10 h-10 rounded-full border border-[#C7A66A]/30 bg-[#FFFDF9]/60 flex items-center justify-center text-[#A64D68] text-xs shadow-xs">
          ♡
        </div>
      </div>

      {/* =================================================================== */}
      {/* 1. SECTION HEADER (Slow, Gentle Reveal) */}
      {/* =================================================================== */}
      <div
        ref={headerRef}
        data-observe-id="header"
        className={`text-center max-w-2xl mx-auto mb-12 sm:mb-16 px-2 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          headerVisible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-8 scale-[0.98]'
        }`}
      >
        {/* Decorative Badge with Rose Flourish */}
        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-[#FFFDF9] border border-[#F8DCE5] shadow-xs mb-3.5 text-[#A64D68]">
          <Heart className="w-3.5 h-3.5 fill-[#F8DCE5] text-[#A64D68]" aria-hidden="true" />
          <span className="font-handwriting text-lg sm:text-xl tracking-wide">
            Admiring You
          </span>
          <Heart className="w-3.5 h-3.5 fill-[#F8DCE5] text-[#A64D68]" aria-hidden="true" />
        </div>

        {/* Heading in Elegant Serif */}
        <h2 className="font-heading font-serif text-3xl sm:text-4xl lg:text-5xl text-[#5A3545] font-semibold leading-tight tracking-tight">
          Little Things I Admire
        </h2>

        {/* Description in Italic Letter Typography */}
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-[#9A817B] font-letter italic leading-relaxed max-w-lg mx-auto">
          The quiet, genuine details that make you so uniquely wonderful.
        </p>

        {/* Delicate divider with flower flourish */}
        <div className="mt-4 flex items-center justify-center gap-3 text-[#C7A66A]">
          <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#C7A66A]/50" />
          <Flower2 className="w-3.5 h-3.5 text-[#D99AA5]" />
          <span className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#C7A66A]/50" />
        </div>

        {/* Owner Controls */}
        {isOwnerMode && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs text-[#9A817B]">Owner Mode: you can edit any card below</span>
            <button
              onClick={handleResetCards}
              className="min-h-[40px] px-3 py-1.5 text-xs text-[#A64D68] hover:text-[#5A3545] underline flex items-center gap-1.5 rounded-lg hover:bg-[#F8DCE5]/20 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#A64D68]/40 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset to defaults</span>
            </button>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 2. MEMORY CARDS GRID (Staggered, Organic Scrapbook Placement) */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full">
        {cards.map((card, idx) => {
          const isRevealed = revealedIds[card.id] ?? true;
          const isVisible = visibleCards[card.id] || prefersReducedMotion;
          const rotationClass = cardRotations[idx % cardRotations.length];
          const staggerDelayMs = 120 * idx;

          return (
            <div
              key={card.id}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              data-observe-id={`card-${card.id}`}
              style={{
                transitionDelay: prefersReducedMotion ? '0ms' : `${staggerDelayMs}ms`,
              }}
              className={`group relative bg-[#FFFDF8] rounded-3xl border border-[#F8DCE5] p-5 sm:p-7 shadow-[0_12px_32px_rgba(90,53,69,0.06),0_2px_8px_rgba(199,166,106,0.12)] hover:shadow-[0_20px_45px_rgba(90,53,69,0.11),0_4px_16px_rgba(199,166,106,0.18)] transition-all duration-800 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col justify-between w-full min-w-0 break-words ${rotationClass} hover:rotate-0 hover:-translate-y-1 ${
                isVisible
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-10 scale-[0.97]'
              }`}
            >
              {/* Washi Masking Tape on Card Top */}
              <WashiTapeAccent rotation={idx % 2 === 0 ? '-rotate-1' : 'rotate-1'} />

              {/* Delicate Gold Inner Border Accent */}
              <div className="absolute inset-2 sm:inset-2.5 rounded-[22px] border border-[#C7A66A]/25 pointer-events-none" />

              {/* Card Header & Content */}
              <div className="w-full relative z-10">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#F8DCE5] to-[#FFF5F8] border border-[#E2A9B8]/60 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      {renderIcon(card.iconType)}
                    </div>
                    <div>
                      <span className="text-[11px] font-serif font-bold uppercase tracking-[0.16em] text-[#C7A66A] block">
                        Part {idx + 1} of {cards.length}
                      </span>
                      <span className="text-[10px] text-[#9A817B] font-letter italic">
                        Kept close to heart ♡
                      </span>
                    </div>
                  </div>

                  {isOwnerMode && (
                    <button
                      onClick={() => handleStartEdit(card)}
                      className="min-w-[44px] min-h-[44px] p-2 text-[#5A3545]/60 hover:text-[#A64D68] hover:bg-[#F8DCE5]/30 rounded-xl flex items-center justify-center transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#A64D68]/40 cursor-pointer"
                      title="Edit card copy"
                      aria-label={`Edit ${card.title}`}
                    >
                      <Edit3 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                </div>

                {/* Card Title in Playfair Serif */}
                <h3 className="font-heading font-serif text-xl sm:text-2xl text-[#5A3545] font-semibold leading-snug mb-3">
                  {card.title}
                </h3>

                {/* Card Content or Folded Envelope State */}
                {isRevealed ? (
                  <div className="text-sm sm:text-base text-[#5A3545]/90 font-letter leading-relaxed sm:leading-loose animate-in fade-in zoom-in-98 duration-500 bg-[#FFFDF9]/60 p-3 sm:p-4 rounded-2xl border border-[#F8DCE5]/40 shadow-inner">
                    {card.content}
                  </div>
                ) : (
                  /* =================================================================== */
                  /* UNCOVER INTERACTION: Scrapbook Envelope Look with Subtle Hover Lift */
                  /* =================================================================== */
                  <div
                    onClick={() => toggleReveal(card.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleReveal(card.id);
                      }
                    }}
                    className="w-full py-6 px-4 rounded-2xl bg-gradient-to-b from-[#FFFDF9] to-[#FFF8ED] hover:from-[#FFF8ED] hover:to-[#FFF3E0] active:scale-[0.99] border-2 border-dashed border-[#D99AA5]/80 text-center cursor-pointer transition-all duration-300 shadow-xs hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#A64D68]/40 group/envelope"
                    aria-label={`Uncover thought: ${card.title}`}
                  >
                    <div className="w-11 h-11 rounded-full bg-[#F8DCE5]/70 text-[#A64D68] flex items-center justify-center mx-auto mb-2.5 shadow-2xs group-hover/envelope:scale-110 transition-transform">
                      <Mail className="w-5 h-5 text-[#A64D68]" />
                    </div>
                    <p className="text-xs text-[#9A817B] italic font-letter mb-3">
                      A quiet thought sealed for you. Tap to unfold.
                    </p>
                    <div className="inline-flex items-center justify-center gap-2 min-h-[42px] px-5 py-2.5 rounded-full bg-gradient-to-r from-[#F8DCE5] to-[#FFF5F8] text-[#A64D68] border border-[#E2A9B8] text-xs font-semibold shadow-2xs group-hover/envelope:bg-[#F8DCE5] transition-colors pointer-events-none">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" aria-hidden="true" />
                      <span>Unfold Thought ♡</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Reveal toggle button & handwriting signature if revealed */}
              {isRevealed && (
                <div className="mt-4 sm:mt-5 pt-3.5 border-t border-[#F8DCE5]/70 flex items-center justify-between text-xs text-[#9A817B] relative z-10">
                  <span className="font-handwriting text-[#A64D68] text-base sm:text-lg tracking-wide">
                    Always true in my heart ♡
                  </span>
                  <button
                    onClick={() => toggleReveal(card.id)}
                    className="min-h-[40px] px-3 -mr-2 text-xs text-[#9A817B] hover:text-[#5A3545] active:scale-95 inline-flex items-center gap-1.5 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#A64D68]/40 rounded-lg cursor-pointer"
                    aria-label={`Fold thought: ${card.title}`}
                  >
                    <span>Fold back</span>
                    <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Card Modal (Owner mode) */}
      {editingCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#5A3545]/45 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-card-title"
        >
          <div className="bg-[#FFFDF9] rounded-3xl max-w-lg w-full border border-[#F8DCE5] shadow-2xl p-6 sm:p-8">
            <h3 id="edit-card-title" className="font-heading font-serif text-xl sm:text-2xl text-[#5A3545] font-semibold mb-4">
              Edit Admire Card
            </h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5A3545]/80 uppercase tracking-wider mb-1.5 font-serif">
                  Card Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#F8DCE5] bg-white text-base text-[#5A3545] focus:outline-hidden focus:ring-2 focus:ring-[#A64D68]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5A3545]/80 uppercase tracking-wider mb-1.5 font-serif">
                  Card Message
                </label>
                <textarea
                  rows={5}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#F8DCE5] bg-white text-base text-[#5A3545] focus:outline-hidden focus:ring-2 focus:ring-[#A64D68]"
                  required
                />
              </div>
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="min-h-[44px] px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium text-[#5A3545]/70 hover:bg-[#F8DCE5]/30 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#A64D68]/40 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2.5 rounded-full bg-[#A64D68] hover:bg-[#8E3E56] text-white text-xs sm:text-sm font-medium shadow-sm hover:shadow-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#A64D68]/40 cursor-pointer"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. DEDICATED PAGE NAVIGATION (Smooth Reveal) */}
      {/* =================================================================== */}
      <div
        ref={navRef}
        data-observe-id="nav"
        className={`mt-14 sm:mt-20 pt-8 sm:pt-10 border-t border-[#F8DCE5]/80 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          navVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-6'
        }`}
      >
        {onPrevPage ? (
          <button
            onClick={onPrevPage}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[46px] sm:min-h-[48px] px-6 py-3 rounded-full border border-[#A64D68]/40 hover:border-[#A64D68] text-[#A64D68] hover:bg-[#F8DCE5]/30 text-sm font-medium transition-all active:scale-98 focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-[#A64D68]/40 cursor-pointer"
            aria-label="Return to Notes to Share page"
          >
            <span>← Previous: Notes to Share</span>
          </button>
        ) : (
          <div className="hidden sm:block w-28" aria-hidden="true" />
        )}

        <div className="text-xs text-[#9A817B] font-letter italic order-last sm:order-none py-1">
          Dedicated Page 4 of 5 · Little Things
        </div>

        <button
          onClick={onContinueToQuestion}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[46px] sm:min-h-[48px] px-7 py-3 rounded-full bg-gradient-to-r from-[#A64D68] to-[#8E3E56] hover:from-[#933D56] hover:to-[#5A3545] text-white text-sm sm:text-base font-medium shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 group focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-[#A64D68]/40 cursor-pointer"
          aria-label="Go to Questions page"
        >
          <span>Next: Questions ♡</span>
          <Heart className="w-4 h-4 fill-white/80 group-hover:scale-125 transition-transform" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};
