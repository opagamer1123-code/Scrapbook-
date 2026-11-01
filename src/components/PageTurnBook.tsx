import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, BookOpen, Heart, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { CurvedPaperSheet } from './CurvedPaperSheet';
import { paperFlipAudio } from '../services/paperSound';

export interface BookChapterData {
  id: number | string;
  chapterNumber: number;
  totalChapters: number;
  title: string;
  subtitle: string;
  paragraphs: string[];
}

interface PageTurnBookProps {
  chapters: BookChapterData[];
  initialChapterIndex?: number;
  onComplete?: () => void;
  completeButtonText?: string;
  onReturnHome?: () => void;
  sectionTitle?: string;
  badgeLabel?: string;
  onPageTurnStart?: (direction: 'next' | 'prev', fromIdx: number, toIdx: number) => void;
}

export const PageTurnBook: React.FC<PageTurnBookProps> = ({
  chapters,
  initialChapterIndex = 0,
  onComplete,
  completeButtonText = 'Continue to Next Section ♡',
  onReturnHome,
  sectionTitle = 'Chapter',
  badgeLabel,
  onPageTurnStart,
}) => {
  const [currentIdx, setCurrentIdx] = useState(initialChapterIndex);
  const [targetIdx, setTargetIdx] = useState(initialChapterIndex);
  const [turnDirection, setTurnDirection] = useState<'next' | 'prev' | null>(null);
  const [isTurning, setIsTurning] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(() => paperFlipAudio.getIsMuted());
  const bookContainerRef = useRef<HTMLDivElement>(null);

  // Sync if initialChapterIndex prop changes externally
  useEffect(() => {
    setCurrentIdx(initialChapterIndex);
    setTargetIdx(initialChapterIndex);
  }, [initialChapterIndex]);

  // Sync sound mute state across session
  useEffect(() => {
    return paperFlipAudio.subscribe((muted) => {
      setIsSoundMuted(muted);
    });
  }, []);

  const currentChapter = chapters[currentIdx] || chapters[0];
  const targetChapter = chapters[targetIdx] || currentChapter;
  const total = chapters.length;
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === total - 1;

  const scrollToBookTop = () => {
    if (bookContainerRef.current) {
      bookContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const turnToPage = (newIdx: number, direction: 'next' | 'prev') => {
    if (isTurning || newIdx === currentIdx || newIdx < 0 || newIdx >= total) return;

    // Accessibility check: prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCurrentIdx(newIdx);
      setTargetIdx(newIdx);
      scrollToBookTop();
      return;
    }

    setTargetIdx(newIdx);
    setTurnDirection(direction);
    setIsTurning(true);

    // Play synchronized multi-stage physical paper turn sound
    paperFlipAudio.play(direction);
    onPageTurnStart?.(direction, currentIdx, newIdx);
  };

  const handleNext = () => {
    if (isTurning) return;
    if (!isLast) {
      turnToPage(currentIdx + 1, 'next');
    } else if (onComplete) {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (isTurning) return;
    if (!isFirst) {
      turnToPage(currentIdx - 1, 'prev');
    } else if (onReturnHome) {
      onReturnHome();
    }
  };

  const handleJumpTo = (idx: number) => {
    if (isTurning || idx === currentIdx) return;
    const dir = idx > currentIdx ? 'next' : 'prev';
    turnToPage(idx, dir);
  };

  const renderParagraph = (para: string, pIdx: number) => {
    const isHindiPrayer = para.includes('Ki meri prarthana kuch is prakaar hai');
    const isReveal = para.trim() === 'Well, that boy is me, Ekta.';
    const isBabyDoll = para.trim() === "I can't move on, Baby Doll.";
    const isNameEkta = para.trim() === 'And that name is yours, Ekta.';
    const isSilentlyLoving = para.includes('And that boy who has been loving you silently all these years?');

    const revealStyle: React.CSSProperties = {
      animationDelay: `${Math.min(pIdx * 0.14, 0.6)}s`,
      marginBottom: 'var(--letter-line-height)',
      lineHeight: 'var(--letter-line-height)',
    };

    if (isHindiPrayer) {
      return (
        <div
          key={pIdx}
          style={revealStyle}
          className="animate-pen-write relative"
        >
          <div className="flex items-center gap-1.5 text-xs text-[#A64D68] font-sans font-medium uppercase tracking-wider mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-[#A64D68]" />
            <span>Words Spoken in Prayer</span>
          </div>
          <p className="font-handwritten-hindi italic text-[1.18rem] sm:text-[1.32rem] text-[#2B1D24] leading-[var(--letter-line-height)]">
            {para}
          </p>
        </div>
      );
    }

    if (isReveal) {
      return (
        <div
          key={pIdx}
          style={revealStyle}
          className="animate-pen-write relative"
        >
          <p className="font-handwriting text-2xl sm:text-3xl font-bold text-[#8E3E56] leading-[var(--letter-line-height)] tracking-wide flex items-center gap-2">
            <span className="text-[#A64D68]" aria-hidden="true">♡</span>
            <span>{para}</span>
          </p>
        </div>
      );
    }

    if (isBabyDoll) {
      return (
        <div
          key={pIdx}
          style={revealStyle}
          className="animate-pen-write relative"
        >
          <p className="font-handwriting text-2xl sm:text-3xl font-bold text-[#8E3E56] leading-[var(--letter-line-height)] tracking-wide">
            {para}
          </p>
        </div>
      );
    }

    if (isNameEkta) {
      return (
        <div
          key={pIdx}
          style={revealStyle}
          className="animate-pen-write relative"
        >
          <p className="font-handwriting text-2xl sm:text-3xl font-semibold italic text-[#8E3E56] leading-[var(--letter-line-height)]">
            {para}
          </p>
        </div>
      );
    }

    if (isSilentlyLoving) {
      return (
        <p
          key={pIdx}
          style={revealStyle}
          className="animate-pen-write font-handwritten-letter font-semibold text-[#8E3E56] leading-[var(--letter-line-height)] indent-7 sm:indent-9"
        >
          {para}
        </p>
      );
    }

    return (
      <p
        key={pIdx}
        style={revealStyle}
        className="animate-pen-write font-handwritten-letter text-[#2B1D24] leading-[var(--letter-line-height)] indent-7 sm:indent-9"
      >
        {para}
      </p>
    );
  };

  const renderPageContent = (ch: BookChapterData) => (
    <div className="flex flex-col h-full justify-between relative">
      <div>
        {/* Elegant Stationery Header */}
        <div className="mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-[#F0D5DE]/90 flex flex-col gap-1 relative z-10">
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="font-handwriting text-2xl sm:text-3xl text-[#A64D68] tracking-wide inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A64D68]/50" aria-hidden="true" />
              {sectionTitle} {ch.chapterNumber}
            </span>
            <span className="text-xs font-serif italic text-[#9A817B]">
              {ch.chapterNumber} of {total}
            </span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl text-[#5A3545] font-semibold tracking-tight">
            {ch.title}
          </h2>
          {ch.subtitle && (
            <p className="font-serif italic text-xs sm:text-sm text-[#9A817B]">
              {ch.subtitle}
            </p>
          )}
        </div>

        {/* Physical Ruled Paper Writing Area with Vertical Guide Line */}
        <div className="relative paper-ruled pl-5 sm:pl-7 pr-1 sm:pr-2">
          {/* Subtle vertical red/rose guide rule down the left */}
          <div
            className="absolute top-0 bottom-0 left-1 sm:left-1.5 w-px bg-[#A64D68]/20 pointer-events-none"
            aria-hidden="true"
          />

          {/* Letter Body Paragraphs */}
          <div className="font-handwritten-letter">
            {ch.paragraphs.map((p, pIdx) => renderParagraph(p, pIdx))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={bookContainerRef} className="w-full max-w-3xl mx-auto flex flex-col items-center select-none">
      {/* Chapter Carousel Pills */}
      <div className="w-full flex items-center justify-between gap-2 mb-4 px-2 flex-wrap">
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 px-1 no-scrollbar">
          {chapters.map((ch, idx) => {
            const isCurrent = idx === (isTurning ? targetIdx : currentIdx);
            return (
              <button
                key={ch.id}
                onClick={() => handleJumpTo(idx)}
                disabled={isTurning}
                className={`transition-all duration-300 rounded-full flex items-center justify-center ${
                  isCurrent
                    ? 'w-8 h-8 sm:w-9 sm:h-9 bg-[#A64D68] text-white text-xs font-semibold shadow-md scale-105'
                    : 'w-7 h-7 sm:w-8 sm:h-8 bg-[#FFF8ED] border border-[#F8DCE5] text-[#9A817B] text-xs hover:border-[#A64D68] hover:text-[#A64D68]'
                } disabled:cursor-not-allowed`}
                title={`${sectionTitle} ${ch.chapterNumber}: ${ch.title}`}
                aria-label={`Jump to ${sectionTitle} ${ch.chapterNumber}: ${ch.title}`}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {ch.chapterNumber}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => paperFlipAudio.toggleMute()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-[#A64D68] bg-[#F8DCE5]/40 hover:bg-[#F8DCE5]/80 border border-[#F8DCE5] transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#A64D68]/40"
            title={isSoundMuted ? 'Page-turn sound effect muted (click to enable)' : 'Page-turn sound effect enabled (click to mute)'}
            aria-label={isSoundMuted ? 'Turn on page-turn sound' : 'Mute page-turn sound'}
          >
            {isSoundMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-[#9A817B]" aria-hidden="true" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[#A64D68]" aria-hidden="true" />
            )}
            <span className="text-[11px] font-sans">
              {isSoundMuted ? 'Sound Off' : 'Page Sound'}
            </span>
          </button>

          <div className="text-xs font-medium text-[#9A817B] flex items-center gap-1.5">
            {badgeLabel ? (
              <span className="font-handwriting text-base text-[#A64D68]">{badgeLabel}</span>
            ) : (
              <span>{sectionTitle} {currentChapter.chapterNumber} of {total}</span>
            )}
          </div>
        </div>
      </div>

      {/* 3D Physical Book Container */}
      <div className="w-full relative py-2 [perspective:1400px]">
        {/* Book Outer Spine & Paper Depth Effect (Hardcover illusion) */}
        <div className="absolute -inset-1.5 sm:-inset-2.5 bg-gradient-to-r from-[#D8B4C0]/50 via-[#E8CBD4]/30 to-[#FAF0F4]/40 rounded-[28px] sm:rounded-[34px] shadow-[0_18px_45px_rgba(90,53,69,0.14)] -z-10" />

        {/* Left Book Spine Shadow (Authentic Book Crease) */}
        <div
          className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-[rgba(90,53,69,0.12)] via-[rgba(90,53,69,0.04)] to-transparent rounded-l-3xl z-20 pointer-events-none"
          aria-hidden="true"
        />

        {/* Corner Botanical Flourishes */}
        <div className="absolute top-4 left-5 w-10 h-10 opacity-30 text-[#A64D68] pointer-events-none z-20" aria-hidden="true">
          <svg viewBox="0 0 40 40" fill="currentColor">
            <path d="M5,5 Q20,6 20,20 Q6,20 5,5 Z" />
            <path d="M12,5 Q25,12 20,25 Q10,18 12,5 Z" opacity="0.6" />
          </svg>
        </div>
        <div className="absolute top-4 right-5 w-10 h-10 opacity-30 text-[#A64D68] scale-x-[-1] pointer-events-none z-20" aria-hidden="true">
          <svg viewBox="0 0 40 40" fill="currentColor">
            <path d="M5,5 Q20,6 20,20 Q6,20 5,5 Z" />
            <path d="M12,5 Q25,12 20,25 Q10,18 12,5 Z" opacity="0.6" />
          </svg>
        </div>

        {/* STATIC UNDERLYING PAGE (Destination page when turning, current page when idle) */}
        <div
          className="w-full min-h-[480px] sm:min-h-[520px] vintage-parchment-paper rounded-3xl p-6 sm:p-10 md:p-12 relative overflow-hidden shadow-inner"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Subtle watermark in bottom right */}
          <div
            className="absolute right-6 bottom-16 w-32 h-32 opacity-10 pointer-events-none text-[#A64D68]"
            aria-hidden="true"
          >
            <svg viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 15 C45 25, 30 25, 35 40 C40 55, 60 55, 65 40 C70 25, 55 25, 50 15 Z" />
              <path d="M35 40 C20 45, 20 65, 35 75 C50 85, 65 80, 75 70 C85 60, 80 45, 65 40" opacity="0.7" />
              <path d="M50 75 Q50 95 48 98" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>

          {/* Underneath content: Displays targetChapter when turning, currentChapter when idle */}
          {renderPageContent(isTurning ? targetChapter : currentChapter)}
        </div>

        {/* REALISTIC CURVED PAPER DEFORMATION OVERLAY */}
        {isTurning && turnDirection && (
          <CurvedPaperSheet
            currentChapter={currentChapter}
            targetChapter={targetChapter}
            direction={turnDirection}
            duration={1100}
            onComplete={() => {
              setCurrentIdx(targetIdx);
              setIsTurning(false);
              setTurnDirection(null);
              scrollToBookTop();
            }}
            renderPageContent={renderPageContent}
          />
        )}
      </div>

      {/* Persistent Page-Turn Controls Bar (Disabled during active curl) */}
      <div className="w-full mt-6 pt-4 border-t border-[#F8DCE5]/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Action: Previous Page or Return Home */}
        {isFirst ? (
          onReturnHome ? (
            <button
              onClick={onReturnHome}
              disabled={isTurning}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#A64D68]/30 hover:border-[#A64D68] text-[#A64D68] hover:bg-[#F8DCE5]/30 text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Return to Home opening"
            >
              <span>← Return to Home</span>
            </button>
          ) : (
            <div className="invisible sm:block w-28" aria-hidden="true" />
          )
        ) : (
          <button
            onClick={handlePrev}
            disabled={isTurning}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#A64D68]/40 hover:border-[#A64D68] text-[#A64D68] hover:bg-[#F8DCE5]/30 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Turn to previous page"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>← Previous Page</span>
          </button>
        )}

        {/* Page progress text */}
        <span className="text-xs font-medium text-[#9A817B]">
          {sectionTitle} {currentChapter.chapterNumber} of {total}
        </span>

        {/* Right Action: Next Page or Section Complete */}
        {!isLast ? (
          <button
            onClick={handleNext}
            disabled={isTurning}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-[#A64D68] via-[#9B455F] to-[#8E3E56] hover:from-[#933D56] hover:to-[#5A3545] text-white text-sm sm:text-base font-medium shadow-[0_6px_20px_rgba(166,77,104,0.3)] hover:shadow-[0_8px_24px_rgba(166,77,104,0.4)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label={`Turn to page ${currentChapter.chapterNumber + 1}`}
          >
            <span>Next Page ♡</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onComplete}
            disabled={isTurning}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-[#A64D68] to-[#8E3E56] hover:from-[#933D56] hover:to-[#5A3545] text-white text-sm sm:text-base font-medium shadow-[0_6px_20px_rgba(166,77,104,0.3)] hover:shadow-[0_8px_24px_rgba(166,77,104,0.4)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Continue to next section"
          >
            <span>{completeButtonText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
