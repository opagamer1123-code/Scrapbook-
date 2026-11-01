import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Film, ExternalLink, ChevronUp, ChevronDown, Sparkles, Heart } from 'lucide-react';
import { ReelItem } from '../content/reels';

interface VintageReelModalProps {
  initialReel: ReelItem | null;
  allReels?: ReelItem[];
  reel?: ReelItem | null; // Backward compatibility
  onClose: () => void;
  likedReelIds?: number[];
  onToggleLike?: (reel: ReelItem) => void;
}

// Delicate Ornamental Botanical & Floral Corner Flourish
const VintageCornerFloral: React.FC<{
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}> = ({ position }) => {
  const transform =
    position === 'top-left'
      ? ''
      : position === 'top-right'
      ? 'scale(-1, 1)'
      : position === 'bottom-left'
      ? 'scale(1, -1)'
      : 'scale(-1, -1)';

  const positionClasses =
    position === 'top-left'
      ? 'top-2.5 left-2.5'
      : position === 'top-right'
      ? 'top-2.5 right-2.5'
      : position === 'bottom-left'
      ? 'bottom-2.5 left-2.5'
      : 'bottom-2.5 right-2.5';

  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute w-7 h-7 sm:w-8 sm:h-8 pointer-events-none select-none z-10 ${positionClasses}`}
      style={{ transform }}
      aria-hidden="true"
    >
      {/* Outer champagne-gold curved corner scroll */}
      <path
        d="M3 41V16C3 8.8203 8.8203 3 16 3H41"
        stroke="#C7A66A"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      {/* Delicate inner dusty-rose dotted guideline */}
      <path
        d="M7 38V18C7 11.9249 11.9249 7 18 7H38"
        stroke="#D99AA5"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeDasharray="2 2.5"
      />
      {/* Fine floral petal flourish */}
      <path
        d="M17 17C17 13.5 19.5 11 23 11C26.5 11 29 13.5 29 17C29 20.5 26.5 23 23 23C19.5 23 17 20.5 17 17Z"
        fill="#F8DCE5"
        fillOpacity="0.45"
        stroke="#C7A66A"
        strokeWidth="0.9"
      />
      {/* Tiny hand-drawn heart detail */}
      <path
        d="M23 14.5C23 14.5 21.8 13 20.2 13C18.5 13 17.5 14.2 17.5 15.8C17.5 18 20.8 20.2 23 21.8C25.2 20.2 28.5 18 28.5 15.8C28.5 14.2 27.5 13 25.8 13C24.2 13 23 14.5 23 14.5Z"
        fill="#A64D68"
        fillOpacity="0.85"
      />
      {/* Pressed leaf branches */}
      <path
        d="M10 28C11.5 25.5 14 25.5 15.5 27"
        stroke="#C7A66A"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <path
        d="M28 10C25.5 11.5 25.5 14 27 15.5"
        stroke="#C7A66A"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      {/* Tiny corner pearl */}
      <circle cx="5" cy="5" r="1.5" fill="#C7A66A" />
    </svg>
  );
};

export const VintageReelModal: React.FC<VintageReelModalProps> = ({
  initialReel,
  allReels = [],
  reel,
  onClose,
  likedReelIds: propLikedReelIds,
  onToggleLike: propOnToggleLike,
}) => {
  const selectedReel = initialReel || reel;

  // Filter ONLY reels that have an actual video URL added in the list
  const activePlayableReels = allReels.filter(
    (r) => Boolean(r.videoUrl && r.videoUrl.trim().length > 0)
  );

  // If selectedReel is not playable (e.g. empty card clicked), handle single card mode
  const isSelectedPlayable = Boolean(
    selectedReel?.videoUrl && selectedReel.videoUrl.trim().length > 0
  );

  // Determine starting index within playable list
  const initialIndex = isSelectedPlayable
    ? Math.max(
        0,
        activePlayableReels.findIndex((r) => r.id === selectedReel?.id)
      )
    : 0;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [slideDirection, setSlideDirection] = useState<'up' | 'down' | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);
  const wheelDebounceRef = useRef<boolean>(false);

  // Liked reels persistent state & floating heart animation particles
  const [likedReelIds, setLikedReelIds] = useState<number[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('for_ekta_liked_reels_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [floatingHearts, setFloatingHearts] = useState<
    Array<{ id: number; offsetX: number; emoji: string }>
  >([]);

  // Sync liked reels from server Firestore on mount
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

  // Active reel to display
  const currentReel = isSelectedPlayable
    ? activePlayableReels[currentIndex] || selectedReel
    : selectedReel;

  const effectiveLikedIds = propLikedReelIds ?? likedReelIds;
  const isCurrentReelLiked = currentReel ? effectiveLikedIds.includes(currentReel.id) : false;

  const handleToggleLike = useCallback(() => {
    if (!currentReel) return;
    const reelId = currentReel.id;
    const wasLiked = (propLikedReelIds ?? likedReelIds).includes(reelId);

    // Spawn 4 floating romantic heart particles
    const burstId = Date.now();
    const burstParticles = [
      { id: burstId + 1, offsetX: -24, emoji: '♡' },
      { id: burstId + 2, offsetX: -8, emoji: '❤️' },
      { id: burstId + 3, offsetX: 8, emoji: '✨' },
      { id: burstId + 4, offsetX: 24, emoji: '♡' },
    ];
    setFloatingHearts((prev) => [...prev, ...burstParticles]);
    setTimeout(() => {
      setFloatingHearts((prev) =>
        prev.filter((p) => !burstParticles.some((bp) => bp.id === p.id))
      );
    }, 1250);

    if (propOnToggleLike) {
      propOnToggleLike(currentReel);
    } else if (!wasLiked) {
      const updated = [...likedReelIds, reelId];
      setLikedReelIds(updated);
      try {
        localStorage.setItem('for_ekta_liked_reels_v1', JSON.stringify(updated));
      } catch {}

      // Trigger backend like record & email notification
      fetch('/api/reels/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reelId,
          reelTitle: currentReel.title,
          likedAt: new Date().toISOString(),
        }),
      }).catch((err) => {
        console.warn('Silent reel like sync:', err);
      });
    }
  }, [currentReel, likedReelIds, propLikedReelIds, propOnToggleLike]);

  // Reset index when initial selection changes
  useEffect(() => {
    if (isSelectedPlayable && selectedReel) {
      const idx = activePlayableReels.findIndex((r) => r.id === selectedReel.id);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
    setVideoError(false);
    setSlideDirection(null);
  }, [selectedReel, isSelectedPlayable, activePlayableReels.length]);

  const handleTriggerClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      onClose();
      setIsClosing(false);
    }, 220);
  }, [isClosing, onClose]);

  // Navigate to Next Reel (Swipe Up / Scroll Down)
  const handleNextReel = useCallback(() => {
    if (activePlayableReels.length <= 1) return;
    setSlideDirection('up');
    setVideoError(false);
    setCurrentIndex((prev) => (prev + 1) % activePlayableReels.length);
  }, [activePlayableReels.length]);

  // Navigate to Previous Reel (Swipe Down / Scroll Up)
  const handlePrevReel = useCallback(() => {
    if (activePlayableReels.length <= 1) return;
    setSlideDirection('down');
    setVideoError(false);
    setCurrentIndex((prev) =>
      prev === 0 ? activePlayableReels.length - 1 : prev - 1
    );
  }, [activePlayableReels.length]);

  // Keyboard navigation & Escape handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleTriggerClose();
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        handleNextReel();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevReel();
      }
    };

    if (currentReel) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [currentReel, handleTriggerClose, handleNextReel, handlePrevReel]);

  // Ensure video element plays and loops continuously on change
  useEffect(() => {
    if (videoRef.current && currentReel?.videoUrl) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback if browser requires user interaction for unmuted audio
        });
      }
    }
  }, [currentReel?.id, currentReel?.videoUrl]);

  // Touch Swipe Gesture Handlers (Instagram-Style Vertical Swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const endY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - endY;
    const duration = Date.now() - touchStartTime.current;

    // Minimum 45px distance and under 600ms swipe time
    if (Math.abs(deltaY) > 45 && duration < 600) {
      if (deltaY > 0) {
        // Swiped UP -> Next reel
        handleNextReel();
      } else {
        // Swiped DOWN -> Previous reel
        handlePrevReel();
      }
    }
    touchStartY.current = null;
  };

  // Mouse Wheel / Trackpad Scroll (Instagram-Style Snap Scroll)
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) < 35 || wheelDebounceRef.current) return;
    wheelDebounceRef.current = true;
    setTimeout(() => {
      wheelDebounceRef.current = false;
    }, 380);

    if (e.deltaY > 0) {
      handleNextReel();
    } else {
      handlePrevReel();
    }
  };

  if (!currentReel) return null;

  const formatReelNumber = (id: number) => {
    return `REEL ${String(id).padStart(2, '0')}`;
  };

  const isGooglePhotosLink =
    Boolean(currentReel.videoUrl) &&
    (currentReel.videoUrl.includes('photos.google.com') ||
      currentReel.videoUrl.includes('photos.app.goo.gl'));

  const hasPlayableStream = Boolean(
    currentReel.videoUrl &&
      currentReel.videoUrl.trim().length > 0 &&
      !isGooglePhotosLink &&
      !videoError
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-[#2B1D24]/85 backdrop-blur-md transition-opacity duration-200 select-none ${
        isClosing ? 'animate-out fade-out duration-200' : 'animate-in fade-in duration-300'
      }`}
      onClick={handleTriggerClose}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label={`${formatReelNumber(currentReel.id)}: ${currentReel.title}`}
    >
      {/* Outer Modal Container with Floating Close Button & Navigation */}
      <div
        className={`relative w-full max-w-[340px] sm:max-w-[370px] md:max-w-[390px] max-h-[96vh] flex flex-col items-center ${
          isClosing
            ? 'animate-out zoom-out-95 fade-out duration-200 ease-in'
            : 'animate-in zoom-in-95 fade-in duration-300 ease-out'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button — Placed OUTSIDE the decorative frame */}
        <button
          type="button"
          onClick={handleTriggerClose}
          className="absolute -top-11 sm:-top-13 right-0 z-30 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF8ED]/95 hover:bg-[#FFFDF9] text-[#5A3545] border border-[#C7A66A]/60 shadow-lg text-xs font-serif font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#C7A66A]"
          aria-label="Close love letter frame"
        >
          <X className="w-3.5 h-3.5 text-[#A64D68]" />
          <span className="text-[11px] sm:text-xs tracking-wider uppercase font-sans">Close</span>
        </button>

        {/* Floating Side Instagram Navigation Arrows (Desktop / Tablet) */}
        {activePlayableReels.length > 1 && (
          <div className="hidden sm:flex flex-col items-center gap-2 absolute -right-16 top-1/2 -translate-y-1/2 z-30">
            {/* Prev Button (Scroll Up) */}
            <button
              type="button"
              onClick={handlePrevReel}
              className="w-10 h-10 rounded-full bg-[#FFF8ED]/90 hover:bg-[#FFF8ED] text-[#A64D68] border border-[#C7A66A]/60 shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
              title="Previous Reel (Swipe down or ↑ key)"
              aria-label="Previous Reel"
            >
              <ChevronUp className="w-5 h-5" />
            </button>

            {/* Reel Counter Tag */}
            <div className="px-2 py-1 rounded-full bg-[#FFF8ED]/90 border border-[#C7A66A]/40 text-[10px] font-serif font-bold text-[#A64D68] shadow-xs">
              {currentIndex + 1} / {activePlayableReels.length}
            </div>

            {/* Next Button (Scroll Down) */}
            <button
              type="button"
              onClick={handleNextReel}
              className="w-10 h-10 rounded-full bg-[#FFF8ED]/90 hover:bg-[#FFF8ED] text-[#A64D68] border border-[#C7A66A]/60 shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
              title="Next Reel (Swipe up or ↓ key)"
              aria-label="Next Reel"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* =================================================================== */}
        {/* VINTAGE CHAMPAGNE-GOLD LOVE LETTER FRAME */}
        {/* =================================================================== */}
        <div
          key={currentReel.id}
          className={`w-full max-h-[calc(94vh-36px)] overflow-y-auto no-scrollbar bg-[#FFF8ED] rounded-3xl p-3 sm:p-4.5 relative border border-[#C7A66A]/50 shadow-[0_25px_60px_-15px_rgba(90,53,69,0.45),0_4px_16px_rgba(199,166,106,0.25)] flex flex-col transition-transform ${
            slideDirection === 'up'
              ? 'animate-in slide-in-from-bottom-8 fade-in duration-300'
              : slideDirection === 'down'
              ? 'animate-in slide-in-from-top-8 fade-in duration-300'
              : ''
          }`}
          style={{
            backgroundImage: `
              radial-gradient(circle at 10% 15%, rgba(199, 166, 106, 0.08) 0%, transparent 40%),
              radial-gradient(circle at 90% 85%, rgba(217, 154, 165, 0.12) 0%, transparent 45%),
              linear-gradient(to bottom, #FFFDF9 0%, #FFF8ED 100%)
            `,
          }}
        >
          {/* Subtle Vintage Gold Outline Layer */}
          <div className="absolute inset-1.5 sm:inset-2 rounded-[22px] sm:rounded-[24px] border border-[#C7A66A]/45 pointer-events-none" />

          {/* Delicate Ornamental Floral Patterns in all Four Corners */}
          <VintageCornerFloral position="top-left" />
          <VintageCornerFloral position="top-right" />
          <VintageCornerFloral position="bottom-left" />
          <VintageCornerFloral position="bottom-right" />

          {/* Decorative Top Love-Letter Header with Reel Counter */}
          <div className="text-center pt-1 pb-2 relative z-10 flex items-center justify-center gap-2 text-[#C7A66A]">
            <span className="text-[10px] sm:text-xs">୨୧</span>
            <span className="w-8 sm:w-12 h-px bg-gradient-to-r from-transparent to-[#C7A66A]/60" />
            <span className="text-[#A64D68] text-xs font-serif font-bold tracking-[0.22em] uppercase">
              {formatReelNumber(currentReel.id)}
              {activePlayableReels.length > 1 && (
                <span className="text-[#C7A66A] font-normal tracking-normal text-[10px] ml-1.5">
                  ({currentIndex + 1}/{activePlayableReels.length})
                </span>
              )}
            </span>
            <span className="w-8 sm:w-12 h-px bg-gradient-to-l from-transparent to-[#C7A66A]/60" />
            <span className="text-[10px] sm:text-xs">୨୧</span>
          </div>

          {/* Inner Border: Elegant Dusty Rose (#D99AA5) with thin Champagne-Gold (#C7A66A) boundary */}
          <div className="p-1 sm:p-1.5 rounded-2xl bg-[#FFFDF9] border-2 border-[#D99AA5] shadow-[inset_0_2px_6px_rgba(90,53,69,0.08)] relative z-10 flex justify-center">
            {/* The 9:16 Vertical Video Screen — Sized proportionally to viewport height */}
            <div className="relative w-full aspect-[9/16] max-h-[46vh] sm:max-h-[50vh] max-w-[270px] sm:max-w-[290px] bg-[#1A0E15] rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
              {hasPlayableStream ? (
                <video
                  ref={videoRef}
                  src={currentReel.videoUrl}
                  poster={currentReel.thumbnailUrl || undefined}
                  controls
                  autoPlay
                  loop
                  playsInline
                  onError={() => setVideoError(true)}
                  className="w-full h-full object-contain"
                />
              ) : isGooglePhotosLink || videoError ? (
                /* Google Photos Link Fallback */
                <div className="p-5 sm:p-6 text-center space-y-3.5 max-w-xs mx-auto text-[#FFF8ED]">
                  <div className="w-14 h-14 rounded-full bg-[#A64D68]/30 border border-[#C7A66A]/60 text-[#F8DCE5] flex items-center justify-center mx-auto shadow-inner">
                    <Film className="w-7 h-7 text-[#F8DCE5]" />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#A64D68] text-[#FFF8ED] border border-[#C7A66A]/40">
                      Google Photos Memory
                    </span>
                    <h4 className="font-heading font-serif text-base sm:text-lg text-[#FFFDF9] font-semibold">
                      {currentReel.title}
                    </h4>
                  </div>
                  <p className="text-xs text-[#FFF8ED]/85 leading-relaxed font-letter">
                    This video is linked from your Google Photos. Tap below to watch directly:
                  </p>
                  <a
                    href={currentReel.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#A64D68] to-[#8E3E56] hover:from-[#933D56] hover:to-[#5A3545] text-white text-xs font-semibold shadow-md border border-[#C7A66A]/50 transition-all cursor-pointer"
                  >
                    <span>Watch in Google Photos</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <p className="text-[10px] text-[#FFF8ED]/50 pt-1 font-letter italic">
                    Tip: You can also drop the MP4 file in to play directly inside this frame! ♡
                  </p>
                </div>
              ) : (
                /* Empty Reel Placeholder */
                <div className="p-6 text-center space-y-3 max-w-xs mx-auto text-[#FFF8ED]">
                  <div className="w-14 h-14 rounded-full bg-white/10 text-[#F8DCE5] flex items-center justify-center mx-auto shadow-inner border border-[#C7A66A]/30">
                    <Film className="w-7 h-7 text-[#F8DCE5]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-heading font-serif text-base text-white font-semibold">
                      {currentReel.title}
                    </h4>
                    <p className="font-letter text-xs text-[#F8DCE5] italic">
                      A sweet video memory is being prepared.
                    </p>
                  </div>
                </div>
              )}

              {/* Instagram-Style Floating Quick Like Button Directly On Video */}
              <div className="absolute right-2.5 bottom-3.5 z-30 flex flex-col items-center gap-0.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleLike();
                  }}
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer active:scale-90 ${
                    isCurrentReelLiked
                      ? 'bg-[#FFF0F4] text-[#E2556E] border-2 border-[#E2A9B8] ring-4 ring-[#E2556E]/25 scale-105'
                      : 'bg-black/60 hover:bg-black/80 text-white border border-white/50 hover:scale-110'
                  }`}
                  title={isCurrentReelLiked ? 'You liked this reel ♡' : 'Tap to like this reel'}
                  aria-label={isCurrentReelLiked ? 'Liked reel' : 'Like this reel'}
                >
                  <Heart
                    className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${
                      isCurrentReelLiked
                        ? 'text-[#E2556E] fill-[#E2556E] animate-heart-pop drop-shadow-sm'
                        : 'text-white'
                    }`}
                    strokeWidth={isCurrentReelLiked ? 2 : 1.75}
                  />
                </button>
                <span
                  className={`text-[9px] font-semibold tracking-wider uppercase drop-shadow-md select-none px-1.5 py-0.5 rounded-full ${
                    isCurrentReelLiked
                      ? 'bg-[#A64D68] text-white font-bold shadow-xs'
                      : 'bg-black/60 text-white/95 backdrop-blur-xs'
                  }`}
                >
                  {isCurrentReelLiked ? 'Liked ♡' : 'Like'}
                </span>
              </div>
            </div>
          </div>

          {/* =================================================================== */}
          {/* DETAILS BENEATH THE VIDEO */}
          {/* =================================================================== */}
          <div className="pt-3 sm:pt-3.5 pb-1 text-center relative z-10 space-y-1">
            {/* Title in Elegant Serif Typography */}
            <h3 className="font-heading font-serif text-base sm:text-lg text-[#5A3545] font-semibold tracking-wide leading-snug">
              {currentReel.title}
            </h3>

            {/* Exactly Requested Handwritten Message */}
            <p className="font-handwriting text-base sm:text-lg text-[#A64D68] leading-tight">
              “A little moment, saved just for you, Ekta ♡”
            </p>

            {/* Optional Caption */}
            {currentReel.caption && (
              <p className="font-letter italic text-[11px] sm:text-xs text-[#9A817B] max-w-xs mx-auto pt-0.5 leading-relaxed line-clamp-2">
                {currentReel.caption}
              </p>
            )}

            {/* Interactive Love Letter Like Button Banner */}
            <div className="pt-2 sm:pt-2.5 pb-0.5 flex flex-col items-center justify-center relative">
              {/* Floating Mini-Hearts on Like Animation */}
              {floatingHearts.map((heart) => (
                <span
                  key={heart.id}
                  className="absolute pointer-events-none select-none text-base z-40"
                  style={{
                    left: `calc(50% + ${heart.offsetX}px)`,
                    bottom: '40px',
                    animation: 'floatUpHeart 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
                  }}
                  aria-hidden="true"
                >
                  {heart.emoji}
                </span>
              ))}

              <button
                type="button"
                onClick={handleToggleLike}
                className={`group inline-flex items-center gap-2.5 px-5 py-2.5 min-h-[46px] rounded-full transition-all duration-300 border shadow-md cursor-pointer select-none active:scale-95 ${
                  isCurrentReelLiked
                    ? 'bg-gradient-to-r from-[#FFF0F4] to-[#FFF5F8] border-[#E2A9B8] text-[#A64D68] shadow-sm ring-2 ring-[#F8DCE5]'
                    : 'bg-white hover:bg-[#FFF5F8] border-[#C7A66A]/60 hover:border-[#E2A9B8] text-[#5A3545] hover:shadow-lg hover:-translate-y-0.5'
                }`}
                aria-label={
                  isCurrentReelLiked
                    ? 'You liked this little memory'
                    : `Like ${formatReelNumber(currentReel.id)}: ${currentReel.title}`
                }
              >
                <Heart
                  className={`w-5 h-5 transition-all duration-300 ${
                    isCurrentReelLiked
                      ? 'text-[#E2556E] fill-[#E2556E] scale-110 animate-heart-pop drop-shadow-2xs'
                      : 'text-[#A64D68] group-hover:scale-110'
                  }`}
                  strokeWidth={isCurrentReelLiked ? 2 : 1.75}
                />
                <span className="text-xs sm:text-[13px] font-serif tracking-wide">
                  {isCurrentReelLiked ? (
                    <span className="font-semibold text-[#A64D68]">
                      You liked this little memory ♡
                    </span>
                  ) : (
                    <span className="font-medium text-[#5A3545]">
                      Like this little memory <span className="text-[#A64D68]">♡</span>
                    </span>
                  )}
                </span>
              </button>
            </div>

            {/* Mobile Swipe Guidance and Rose & Gold Flourish */}
            {activePlayableReels.length > 1 && (
              <div className="pt-1.5 flex sm:hidden items-center justify-center gap-2 text-[#A64D68]">
                <button
                  type="button"
                  onClick={handlePrevReel}
                  className="p-1 rounded-full bg-[#F8DCE5]/60 text-[#A64D68]"
                  aria-label="Previous reel"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-serif text-[#C7A66A] tracking-wider uppercase">
                  Swipe Up / Down ({currentIndex + 1} of {activePlayableReels.length})
                </span>
                <button
                  type="button"
                  onClick={handleNextReel}
                  className="p-1 rounded-full bg-[#F8DCE5]/60 text-[#A64D68]"
                  aria-label="Next reel"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Subtle Pressed-Flower & Heart Accent at Bottom Center */}
            <div className="pt-1 flex items-center justify-center gap-1.5 text-[#C7A66A]/80 text-[11px]">
              <span>✿</span>
              <span className="text-[#A64D68]">♡</span>
              <span>✿</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
