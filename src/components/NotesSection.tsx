import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Film, Sparkles, Heart, Video } from 'lucide-react';
import { DiaryNote } from '../types/notes';
import { ReelItem, reelsData } from '../content/reels';
import { VintageReelModal } from './VintageReelModal';

interface NotesSectionProps {
  notes?: DiaryNote[];
  isOwnerMode?: boolean;
  onUpdateNotes?: (notes: DiaryNote[]) => void;
  activeTab?: 'shared' | 'private';
  onTabChange?: (tab: 'shared' | 'private') => void;
  onSwitchToOwnerMode?: () => void;
  onNextPage?: () => void;
  onPrevPage?: () => void;
}

// -----------------------------------------------------------------------------
// Progressive Loading Reel Gallery Card with IntersectionObserver & Like Action
// -----------------------------------------------------------------------------
interface ReelGalleryCardProps {
  reel: ReelItem;
  index: number;
  onSelect: (reel: ReelItem) => void;
  formatReelNumber: (id: number) => string;
  isLiked: boolean;
  onToggleLike: (reel: ReelItem) => void;
}

const ReelGalleryCard: React.FC<ReelGalleryCardProps> = ({
  reel,
  index,
  onSelect,
  formatReelNumber,
  isLiked,
  onToggleLike,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const hasVideo = Boolean(reel.videoUrl && reel.videoUrl.trim().length > 0);
  const hasThumbnail = Boolean(reel.thumbnailUrl && reel.thumbnailUrl.trim().length > 0);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    if (!('IntersectionObserver' in window)) {
      setIsNearViewport(true);
      setIsCardVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          // Soft delayed entrance
          setTimeout(() => {
            setIsCardVisible(true);
          }, 40);
          observer.unobserve(el);
        }
      },
      {
        root: null,
        rootMargin: '120px 0px 120px 0px', // Lazy-load images slightly before they hit viewport
        threshold: 0.08,
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={() => onSelect(reel)}
      className={`group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#F8DCE5] bg-[#FFFDF9] shadow-xs hover:shadow-xl transition-all duration-700 ease-out hover:-translate-y-1 text-left flex flex-col cursor-pointer aspect-[9/16] ${
        isCardVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-6 scale-[0.97]'
      }`}
      style={{
        transitionDelay: `${Math.min(index * 60, 480)}ms`,
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(reel);
        }
      }}
      aria-label={`Open ${formatReelNumber(reel.id)}: ${reel.title}`}
    >
      {/* Background: Progressive Skeleton / Soft Shimmer Base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFF5F8] via-[#FFFDF9] to-[#F8DCE5]/60" />

      {/* Media Background or Romantic Placeholder */}
      {hasThumbnail && !imageError ? (
        <>
          {/* Subtle loading shimmer pulse until image loads */}
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FFF5F8] via-[#F8DCE5]/50 to-[#FFF8ED] animate-pulse flex flex-col items-center justify-center p-4">
              <div className="w-9 h-9 rounded-full bg-[#F8DCE5]/70 flex items-center justify-center text-[#A64D68]/60 shadow-2xs">
                <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>
          )}

          {/* Progressive Lazy Loaded Image with Soft Cross-Fade */}
          {isNearViewport && (
            <img
              src={reel.thumbnailUrl}
              alt={reel.title}
              onLoad={() => setIsImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
                isImageLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xs scale-105'
              }`}
            />
          )}
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFF5F8] via-[#FFFDF9] to-[#F8DCE5]/70 flex flex-col items-center justify-center p-4 text-center">
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

      {/* Gradient Darkener to guarantee crisp legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 transition-opacity group-hover:opacity-95" />

      {/* Top Badge Header */}
      <div className="relative z-10 p-2.5 sm:p-3 flex items-center justify-between">
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/90 text-[#A64D68] backdrop-blur-xs shadow-2xs border border-[#F8DCE5]/50">
          {formatReelNumber(reel.id)}
        </span>
        {/* Interactive Like Heart Button directly on card */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike(reel);
          }}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer active:scale-90 ${
            isLiked
              ? 'bg-[#FFF0F4] text-[#E2556E] border border-[#E2A9B8] scale-105 shadow-sm ring-2 ring-[#E2556E]/20'
              : 'bg-black/45 hover:bg-black/65 text-white/90 border border-white/40 hover:scale-110'
          }`}
          title={isLiked ? 'You liked this reel ♡' : 'Tap to like this reel'}
          aria-label={isLiked ? 'Liked reel' : 'Like this reel'}
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 ${
              isLiked ? 'fill-[#E2556E] text-[#E2556E] animate-heart-pop' : 'text-white'
            }`}
            strokeWidth={isLiked ? 2 : 1.75}
          />
        </button>
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

      {/* Bottom Title & Caption */}
      <div className="relative z-10 p-2.5 sm:p-3 space-y-1">
        <div className="flex items-center justify-between gap-1">
          <h3 className="text-xs sm:text-sm font-semibold text-white drop-shadow-xs line-clamp-1 group-hover:text-[#F8DCE5] transition-colors">
            {reel.title}
          </h3>
          {isLiked && (
            <span className="shrink-0 text-[10px] text-[#F8DCE5] font-semibold drop-shadow-xs flex items-center gap-0.5">
              <span>Liked</span> <span className="text-[#E2556E]">❤️</span>
            </span>
          )}
        </div>
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
};

export const NotesSection: React.FC<NotesSectionProps> = ({
  onNextPage,
  onPrevPage,
}) => {
  const [activeReel, setActiveReel] = useState<ReelItem | null>(null);

  // Persistent liked reels state synchronized with server
  const [likedReelIds, setLikedReelIds] = useState<number[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('for_ekta_liked_reels_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let isMounted = true;
    fetch('/api/reels/likes')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        const incomingIds: number[] = Array.isArray(data.likedReelIds)
          ? data.likedReelIds
          : data.likes
          ? Object.keys(data.likes).map(Number)
          : [];

        if (incomingIds.length > 0) {
          setLikedReelIds((prev) => {
            const merged = Array.from(new Set([...prev, ...incomingIds]));
            try {
              localStorage.setItem('for_ekta_liked_reels_v1', JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleLike = useCallback((reel: ReelItem) => {
    const reelId = reel.id;
    setLikedReelIds((prev) => {
      if (prev.includes(reelId)) return prev;
      const updated = [...prev, reelId];
      try {
        localStorage.setItem('for_ekta_liked_reels_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    fetch('/api/reels/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reelId,
        reelTitle: reel.title,
        likedAt: new Date().toISOString(),
      }),
    }).catch((err) => {
      console.warn('Silent reel like sync:', err);
    });
  }, []);

  const formatReelNumber = (id: number) => {
    return `REEL ${String(id).padStart(2, '0')}`;
  };

  return (
    <section
      id="notes-section"
      className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-20 animate-in fade-in duration-300"
      aria-label="Little Moments, Just for You - Reels for Ekta"
    >
      {/* Gallery Section Header */}
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

      {/* Responsive Grid of 10 Numbered Video Cards with Progressive Observer Loading */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
        {reelsData.map((reel, index) => (
          <ReelGalleryCard
            key={reel.id}
            reel={reel}
            index={index}
            onSelect={(selected) => setActiveReel(selected)}
            formatReelNumber={formatReelNumber}
            isLiked={likedReelIds.includes(reel.id)}
            onToggleLike={handleToggleLike}
          />
        ))}
      </div>

      {/* Vintage Champagne-Gold Love Letter Frame Modal */}
      <VintageReelModal
        initialReel={activeReel}
        allReels={reelsData}
        onClose={() => setActiveReel(null)}
        likedReelIds={likedReelIds}
        onToggleLike={handleToggleLike}
      />

      {/* Bottom Dedicated Page Navigation */}
      <div className="mt-14 pt-8 border-t border-[#F8DCE5]/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        {onPrevPage ? (
          <button
            onClick={onPrevPage}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#A64D68]/40 hover:border-[#A64D68] text-[#A64D68] hover:bg-[#F8DCE5]/30 text-sm font-medium transition-all cursor-pointer"
            aria-label="Return to My Letter page"
          >
            <span>← Previous: My Letter</span>
          </button>
        ) : (
          <div className="invisible sm:block w-28" aria-hidden="true" />
        )}

        <div className="text-xs text-[#9A817B] font-letter italic">
          Dedicated Page 3 of 5 · Little Moments
        </div>

        {onNextPage && (
          <button
            onClick={onNextPage}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#A64D68] to-[#8E3E56] hover:from-[#933D56] hover:to-[#5A3545] text-white text-sm font-medium shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer"
            aria-label="Go to Little Things page"
          >
            <span>Next: Little Things ♡</span>
          </button>
        )}
      </div>
    </section>
  );
};
