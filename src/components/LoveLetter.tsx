import React, { useState, useEffect } from 'react';
import { Feather, Volume2, VolumeX } from 'lucide-react';
import { letterStoryPages } from '../config/ektaStoryConfig';
import { PageTurnBook, BookChapterData } from './PageTurnBook';
import { paperFlipAudio } from '../services/paperSound';

interface LoveLetterProps {
  onContinueStory: () => void;
  onPrevSection?: () => void;
}

export const LoveLetter: React.FC<LoveLetterProps> = ({ onContinueStory, onPrevSection }) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => !paperFlipAudio.getIsMuted());

  useEffect(() => {
    return paperFlipAudio.subscribe((muted) => {
      setIsSoundEnabled(!muted);
    });
  }, []);

  const mappedPages: BookChapterData[] = letterStoryPages.map((page) => ({
    id: page.pageNumber,
    chapterNumber: page.pageNumber,
    totalChapters: page.totalPages,
    title: page.title,
    subtitle: page.subtitle,
    paragraphs: page.paragraphs,
  }));

  const toggleSound = () => {
    paperFlipAudio.toggleMute();
  };

  return (
    <section
      id="letter-section"
      className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative z-20 scroll-mt-20"
      aria-label="My Letter for Ekta"
    >
      {/* Decorative floral ribbon header */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <span className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-[#A64D68]/40" />
        <span className="flex items-center gap-2 font-handwriting text-2xl sm:text-3xl text-[#A64D68]">
          <Feather className="w-5 h-5 text-[#A64D68]" />
          My Letter for Ekta ♡
        </span>
        <span className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-[#A64D68]/40" />
      </div>

      <div className="text-center max-w-xl mx-auto mb-8">
        <h1 className="font-heading text-2xl sm:text-3xl text-[#5A3545] font-semibold">
          Words from the Bottom of My Heart
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#9A817B] font-letter italic">
          Turn through the pages at your own pace with each authentic flip.
        </p>

        {/* Sensory immersion audio badge */}
        <div className="mt-3.5 flex items-center justify-center">
          <button
            onClick={toggleSound}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-[#A64D68] bg-[#F8DCE5]/50 hover:bg-[#F8DCE5] border border-[#F8DCE5] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#A64D68]/40 cursor-pointer"
            title={isSoundEnabled ? 'Paper flip audio effect enabled (click to mute)' : 'Paper flip audio effect muted (click to enable)'}
            aria-label={isSoundEnabled ? 'Paper flip sound effect is on' : 'Paper flip sound effect is muted'}
          >
            {isSoundEnabled ? (
              <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{isSoundEnabled ? 'Paper Flip Sound: On' : 'Paper Flip Sound: Muted'}</span>
          </button>
        </div>
      </div>

      {/* 3D Physical Page Turn Book for My Letter with synced paper flip sound */}
      <PageTurnBook
        chapters={mappedPages}
        initialChapterIndex={0}
        sectionTitle="Page"
        badgeLabel="Personal Letter"
        completeButtonText="Next: Notes to Share ♡"
        onComplete={onContinueStory}
        onReturnHome={onPrevSection}
      />

      {/* Bottom Sub-CTA */}
      <div className="mt-8 text-center">
        <p className="text-xs text-[#9A817B] font-letter italic">
          A personal confession preserved across 5 pages · Take your time reading each one
        </p>
      </div>
    </section>
  );
};
