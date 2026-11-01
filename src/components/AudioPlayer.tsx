import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { romanticAudio } from '../services/soundtrack';

interface AudioPlayerProps {
  embedded?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ embedded = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.6);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Sync default volume
    romanticAudio.setVolume(volume);
  }, []);

  const handleTogglePlay = () => {
    const nextState = romanticAudio.toggle();
    setIsPlaying(nextState);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    romanticAudio.setVolume(val);
    if (val > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      const restore = prevVolume || 0.5;
      setVolume(restore);
      romanticAudio.setVolume(restore);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      setVolume(0);
      romanticAudio.setVolume(0);
    }
  };

  const containerClasses = embedded
    ? "relative z-30"
    : "fixed top-4 right-4 z-50";

  return (
    <div className={containerClasses}>
      <div className="bg-[#FFFDF9]/95 backdrop-blur-md border border-[rgba(166,77,104,0.2)] shadow-sm hover:shadow-md rounded-full px-2 py-1.5 transition-all duration-300">
        <div className="flex items-center gap-1.5">
          {/* Main Play/Pause Button */}
          <button
            onClick={handleTogglePlay}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-[#A64D68] text-white shadow-xs'
                : 'bg-[#F8DCE5] text-[#5A3545] hover:bg-[#F3C7D7]'
            } focus-visible:ring-2 focus-visible:ring-[#A64D68] focus-visible:outline-hidden`}
            aria-label={isPlaying ? 'Pause romantic background music' : 'Play romantic background music'}
            title={isPlaying ? 'Pause music' : 'Play romantic music'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />}
          </button>

          {/* Track Info & Visualizer */}
          <div
            className="cursor-pointer select-none px-1"
            onClick={() => setIsExpanded(!isExpanded)}
            title="Click to adjust volume"
          >
            <div className="flex items-center gap-1">
              <span className="text-[11px] sm:text-xs font-serif font-medium tracking-wide text-[#5A3545] whitespace-nowrap">
                Romantic Reverie
              </span>
              {isPlaying && (
                <span className="flex items-end gap-0.5 h-2.5 w-2.5" aria-hidden="true">
                  <span className="w-0.5 bg-[#A64D68] rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-0.5 bg-[#A64D68] rounded-full animate-bounce h-2.5" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-0.5 bg-[#A64D68] rounded-full animate-bounce h-1.5" style={{ animationDelay: '300ms' }}></span>
                </span>
              )}
            </div>
          </div>

          {/* Volume toggle */}
          <button
            onClick={handleToggleMute}
            className="p-1 text-[#5A3545]/70 hover:text-[#5A3545] rounded-full transition-colors focus-visible:ring-1 focus-visible:ring-[#A64D68] focus-visible:outline-hidden"
            aria-label={isMuted ? 'Unmute music' : 'Mute music'}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-[#A64D68]" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[#5A3545]/80" />
            )}
          </button>
        </div>

        {/* Volume popover floating cleanly beneath without displacing header */}
        {isExpanded && (
          <div className="absolute right-0 top-full mt-2 bg-[#FFFDF9] border border-[rgba(166,77,104,0.22)] shadow-lg rounded-2xl p-2.5 flex items-center gap-2.5 z-50 animate-in fade-in zoom-in-95">
            <span className="text-[10px] text-[#9A817B] font-medium">Vol</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1.5 bg-[#F8DCE5] rounded-lg appearance-none cursor-pointer accent-[#A64D68]"
              aria-label="Volume slider"
            />
            <span className="text-[10px] text-[#5A3545]/70 w-6 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
