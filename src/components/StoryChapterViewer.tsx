import React, { useState } from 'react';
import {
  Heart,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  BookOpen,
  AlignLeft,
  ArrowRight,
} from 'lucide-react';
import {
  authoritativeStoryChapters,
  AuthoritativeChapter,
} from '../config/ektaStoryConfig';

interface StoryChapterViewerProps {
  onExploreOtherSections: () => void;
}

export const StoryChapterViewer: React.FC<StoryChapterViewerProps> = ({
  onExploreOtherSections,
}) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'chapter' | 'continuous'>('chapter');

  const currentChapter: AuthoritativeChapter = authoritativeStoryChapters[currentChapterIndex];
  const isLastChapter = currentChapterIndex === authoritativeStoryChapters.length - 1;

  const handleNext = () => {
    if (currentChapterIndex < authoritativeStoryChapters.length - 1) {
      setCurrentChapterIndex((prev) => prev + 1);
      const elem = document.getElementById('story-reader-card');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handlePrev = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex((prev) => prev - 1);
      const elem = document.getElementById('story-reader-card');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleJumpToChapter = (idx: number) => {
    setCurrentChapterIndex(idx);
    const elem = document.getElementById('story-reader-card');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderParagraph = (para: string, idx: number) => {
    const isHindiPrayer = para.includes('Ki meri prarthana kuch is prakaar hai');
    const isReveal = para.trim() === 'Well, that boy is me, Ekta.';
    const isBabyDoll = para.trim() === "I can't move on, Baby Doll.";
    const isNameEkta = para.trim() === 'And that name is yours, Ekta.';
    const isSilentlyLoving = para.includes('And that boy who has been loving you silently all these years?');

    if (isHindiPrayer) {
      return (
        <div
          key={idx}
          className="my-5 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#FFF5F8] to-[#FFF9F2] border border-[#F8DCE5] shadow-xs relative overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-2 text-[#A64D68]">
            <Sparkles className="w-4 h-4 text-[#A64D68]" />
            <span className="text-xs font-medium uppercase tracking-wider font-sans">
              Words Spoken in Prayer
            </span>
          </div>
          <p className="font-letter italic text-[#5A3545] text-lg sm:text-xl md:text-2xl leading-relaxed sm:leading-loose">
            {para}
          </p>
        </div>
      );
    }

    if (isReveal) {
      return (
        <div
          key={idx}
          className="my-6 py-4 px-6 rounded-2xl bg-[#FFF0F4] border-l-4 border-[#A64D68] shadow-xs"
        >
          <p className="font-heading text-2xl sm:text-3xl font-semibold text-[#A64D68] tracking-wide">
            {para}
          </p>
        </div>
      );
    }

    if (isBabyDoll) {
      return (
        <div key={idx} className="my-4">
          <p className="font-handwriting text-3xl sm:text-4xl text-[#A64D68] tracking-wide">
            {para}
          </p>
        </div>
      );
    }

    if (isNameEkta) {
      return (
        <div key={idx} className="my-4">
          <p className="font-heading text-2xl sm:text-3xl text-[#A64D68] font-semibold italic">
            {para}
          </p>
        </div>
      );
    }

    if (isSilentlyLoving) {
      return (
        <p key={idx} className="text-[#A64D68] font-medium text-lg sm:text-xl">
          {para}
        </p>
      );
    }

    return (
      <p key={idx} className="text-[#5A3545]">
        {para}
      </p>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      {/* View Switcher: Chapters vs Continuous Reading */}
      <div className="flex items-center justify-between w-full mb-6 px-2 flex-wrap gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#FFFDF9] border border-[#F8DCE5] shadow-xs text-xs">
          <button
            onClick={() => setViewMode('chapter')}
            className={`px-4 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${
              viewMode === 'chapter'
                ? 'bg-[#A64D68] text-white shadow-xs'
                : 'text-[#9A817B] hover:text-[#5A3545]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Chapter Mode</span>
          </button>
          <button
            onClick={() => setViewMode('continuous')}
            className={`px-4 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${
              viewMode === 'continuous'
                ? 'bg-[#A64D68] text-white shadow-xs'
                : 'text-[#9A817B] hover:text-[#5A3545]'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span>Continuous Story</span>
          </button>
        </div>

        {viewMode === 'chapter' && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F8DCE5]/70 text-[#A64D68]">
            Chapter {currentChapter.chapterNumber} of {authoritativeStoryChapters.length}
          </span>
        )}
      </div>

      {/* Chapter Pills Carousel for quick chapter jumps */}
      {viewMode === 'chapter' && (
        <div className="w-full flex items-center justify-center gap-1.5 sm:gap-2 mb-6 overflow-x-auto py-1 px-2 no-scrollbar">
          {authoritativeStoryChapters.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => handleJumpToChapter(idx)}
              className={`transition-all duration-200 rounded-full flex items-center justify-center ${
                idx === currentChapterIndex
                  ? 'w-8 h-8 sm:w-9 sm:h-9 bg-[#A64D68] text-white text-xs font-semibold shadow-md scale-105'
                  : 'w-7 h-7 sm:w-8 sm:h-8 bg-[#FFF8ED] border border-[#F8DCE5] text-[#9A817B] text-xs hover:border-[#A64D68] hover:text-[#A64D68]'
              }`}
              title={`Chapter ${ch.chapterNumber}: ${ch.title}`}
              aria-label={`Jump to Chapter ${ch.chapterNumber}: ${ch.title}`}
            >
              {ch.chapterNumber}
            </button>
          ))}
        </div>
      )}

      {/* The Story Card */}
      <div
        id="story-reader-card"
        tabIndex={-1}
        className="w-full bg-[#FFFDF9] rounded-3xl border border-[#F8DCE5] shadow-[0_12px_40px_rgba(166,77,104,0.12)] p-6 sm:p-10 md:p-12 relative overflow-hidden paper-ruled focus:outline-hidden"
      >
        {/* Subtle floral corner decoration */}
        <div
          className="absolute top-4 left-4 w-12 h-12 opacity-30 pointer-events-none text-[#A64D68]"
          aria-hidden="true"
        >
          <svg viewBox="0 0 40 40" fill="currentColor">
            <path d="M5,5 Q20,6 20,20 Q6,20 5,5 Z" />
            <path d="M12,5 Q25,12 20,25 Q10,18 12,5 Z" opacity="0.6" />
          </svg>
        </div>
        <div
          className="absolute top-4 right-4 w-12 h-12 opacity-30 pointer-events-none text-[#A64D68] scale-x-[-1]"
          aria-hidden="true"
        >
          <svg viewBox="0 0 40 40" fill="currentColor">
            <path d="M5,5 Q20,6 20,20 Q6,20 5,5 Z" />
            <path d="M12,5 Q25,12 20,25 Q10,18 12,5 Z" opacity="0.6" />
          </svg>
        </div>

        {viewMode === 'chapter' ? (
          /* Single Chapter View */
          <div>
            {/* Chapter Header */}
            <div className="mb-8 pb-5 border-b border-[#F8DCE5]/80">
              <span className="font-handwriting text-2xl sm:text-3xl text-[#A64D68] tracking-wide block mb-1">
                Chapter {currentChapter.chapterNumber}
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl text-[#5A3545] font-bold">
                {currentChapter.title}
              </h2>
              <p className="font-letter italic text-sm sm:text-base text-[#9A817B] mt-1">
                {currentChapter.subtitle}
              </p>
            </div>

            {/* Chapter Paragraphs */}
            <div className="space-y-6 font-letter text-lg sm:text-xl leading-relaxed sm:leading-loose">
              {currentChapter.paragraphs.map((p, idx) => renderParagraph(p, idx))}
            </div>

            {/* Chapter Navigation Controls */}
            <div className="mt-12 pt-6 border-t border-[#F8DCE5]/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              {currentChapterIndex === 0 ? (
                <div className="invisible sm:block w-24" aria-hidden="true" />
              ) : (
                <button
                  onClick={handlePrev}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#A64D68]/40 hover:border-[#A64D68] text-[#A64D68] hover:bg-[#F8DCE5]/30 text-sm font-medium transition-all"
                  aria-label="Previous chapter"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Chapter</span>
                </button>
              )}

              <span className="text-xs text-[#9A817B] font-medium">
                Chapter {currentChapter.chapterNumber} of {authoritativeStoryChapters.length}
              </span>

              {!isLastChapter ? (
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#A64D68] to-[#8E3E56] hover:from-[#933D56] hover:to-[#5A3545] text-white text-sm font-medium shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                  aria-label="Next chapter"
                >
                  <span>Next Chapter ♡</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onExploreOtherSections}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#A64D68] to-[#8E3E56] hover:from-[#933D56] hover:to-[#5A3545] text-white text-sm font-medium shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                  aria-label="Continue to my letter and notes"
                >
                  <span>Continue Reading Letters & Notes ♡</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Continuous Reading Mode */
          <div className="space-y-12">
            <div className="text-center pb-6 border-b border-[#F8DCE5]">
              <span className="font-handwriting text-2xl text-[#A64D68] block mb-1">
                The Complete Confession
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl text-[#5A3545] font-bold">
                A Decade of Love, Written for Ekta
              </h2>
            </div>

            {authoritativeStoryChapters.map((ch) => (
              <div key={ch.id} className="pt-4 border-t first:border-t-0 border-[#F8DCE5]/50">
                <div className="mb-4">
                  <span className="font-handwriting text-xl text-[#A64D68] block">
                    Chapter {ch.chapterNumber} · {ch.title}
                  </span>
                  <p className="text-xs text-[#9A817B] italic font-letter">{ch.subtitle}</p>
                </div>
                <div className="space-y-5 font-letter text-lg sm:text-xl leading-relaxed sm:leading-loose">
                  {ch.paragraphs.map((p, pIdx) => renderParagraph(p, pIdx))}
                </div>
              </div>
            ))}

            <div className="pt-8 text-center border-t border-[#F8DCE5]">
              <button
                onClick={onExploreOtherSections}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#A64D68] to-[#8E3E56] text-white text-base font-medium shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <span>Continue to Notes to Share ♡</span>
                <Heart className="w-4 h-4 fill-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
