import React, { useState } from 'react';
import { Play, Film, Sparkles, Heart, Video } from 'lucide-react';
import { ReelItem, reelsData } from '../content/reels';
import { VintageReelModal } from './VintageReelModal';

export const ReelsGallery: React.FC = () => {
  const [activeReel, setActiveReel] = useState<ReelItem | null>(null);

  const formatReelNumber = (id: number) => {
    return `REEL ${String(id).padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-[#F8DCE5] to-[#FFF5F8] border border-[#E2A9B8] shadow-2xs mb-3 text-[#A64D68]">
          <Film className="w-6 h-6 text-[#A64D68]" />
        </div>

        <h2 className="font-heading text-2xl sm:text-3xl text-[#5A3545] font-semibold mb-2">
          Little Moments, Just for You ♡
        </h2>
        <p className="font-letter text-sm sm:text-base text-[#9A817B] italic">
          Some moments deserve to be watched again and again.
        </p>

        <div className="flex items-center justify-center gap-2 text-xs text-[#A64D68] mt-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-medium">10 Special Memories Prepared for Ekta</span>
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* 10 Numbered Video Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
        {reelsData.map((reel) => {
          const hasVideo = Boolean(reel.videoUrl && reel.videoUrl.trim().length > 0);
          const hasThumbnail = Boolean(reel.thumbnailUrl && reel.thumbnailUrl.trim().length > 0);

          return (
            <div
              key={reel.id}
              onClick={() => setActiveReel(reel)}
              className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#F8DCE5] bg-[#FFFDF9] shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left flex flex-col cursor-pointer aspect-[9/16]"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveReel(reel);
                }
              }}
              aria-label={`Open ${formatReelNumber(reel.id)}: ${reel.title}`}
            >
              {/* Media Background or Romantic Placeholder */}
              {hasThumbnail ? (
                <img
                  src={reel.thumbnailUrl}
                  alt={reel.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-[#FFF5F8] via-[#FFFDF9] to-[#F8DCE5]/70 flex flex-col items-center justify-center p-4 text-center">
                  {/* Subtle decorative heart watermark */}
                  <Heart
                    className="w-24 h-24 text-[#F8DCE5]/60 absolute -bottom-4 -right-4 -rotate-12 pointer-events-none"
                    aria-hidden="true"
                  />
                  <div className="w-10 h-10 rounded-full bg-[#F8DCE5]/70 flex items-center justify-center text-[#A64D68] mb-2 shadow-2xs">
                    <Video className="w-5 h-5 text-[#A64D68]" />
                  </div>
                  <span className="font-handwriting text-base text-[#A64D68] leading-tight">
                    Sweet Memory
                  </span>
                  <span className="text-[10px] text-[#9A817B] font-letter italic mt-1 line-clamp-2">
                    {hasVideo ? 'Video ready to play' : 'Curated with love'}
                  </span>
                </div>
              )}

              {/* Gradient Darkener at Bottom to ensure text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 transition-opacity group-hover:opacity-95" />

              {/* Reel Badge Header */}
              <div className="relative z-10 p-3 sm:p-3.5 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/85 text-[#A64D68] backdrop-blur-xs shadow-2xs border border-[#F8DCE5]/50">
                  {formatReelNumber(reel.id)}
                </span>
                <span className="w-6 h-6 rounded-full bg-black/30 backdrop-blur-xs flex items-center justify-center text-white/80 text-[10px]">
                  ♡
                </span>
              </div>

              {/* Center Play Button */}
              <div className="relative z-10 flex-1 flex items-center justify-center">
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                    hasVideo
                      ? 'bg-white/90 text-[#A64D68] group-hover:scale-115 group-hover:bg-[#A64D68] group-hover:text-white'
                      : 'bg-white/70 text-[#A64D68]/70 group-hover:scale-105 group-hover:bg-white/90'
                  }`}
                >
                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                </div>
              </div>

              {/* Bottom Title & Caption Card Content */}
              <div className="relative z-10 p-3 sm:p-3.5 space-y-1">
                <h3 className="text-xs sm:text-sm font-semibold text-white drop-shadow-xs line-clamp-1 group-hover:text-[#F8DCE5] transition-colors">
                  {reel.title}
                </h3>
                {reel.caption && (
                  <p className="text-[10px] sm:text-[11px] text-white/80 italic font-letter line-clamp-2 leading-tight">
                    “{reel.caption}”
                  </p>
                )}
                {!hasVideo && (
                  <span className="inline-block text-[9px] text-[#F8DCE5]/90 font-medium pt-0.5">
                    Tap to view details ♡
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Vintage Champagne-Gold Love Letter Frame Modal */}
      <VintageReelModal
        initialReel={activeReel}
        allReels={reelsData}
        onClose={() => setActiveReel(null)}
      />
    </div>
  );
};
