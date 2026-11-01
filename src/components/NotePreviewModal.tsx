import React from 'react';
import { X, Eye, EyeOff, Heart, CheckCircle2 } from 'lucide-react';
import { DiaryNote } from '../types/notes';

interface NotePreviewModalProps {
  isOpen: boolean;
  note: DiaryNote | null;
  onClose: () => void;
  onToggleShare: (note: DiaryNote) => void;
}

export const NotePreviewModal: React.FC<NotePreviewModalProps> = ({
  isOpen,
  note,
  onClose,
  onToggleShare,
}) => {
  if (!isOpen || !note) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#5A3545]/45 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
    >
      <div className="bg-[#FFFDF9] rounded-3xl max-w-lg w-full border border-[#F8DCE5] shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#5A3545]/60 hover:text-[#5A3545] rounded-full hover:bg-[#F8DCE5]/40 transition-colors"
          aria-label="Close preview"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-[#A64D68]">
            <Heart className="w-4 h-4 fill-[#F8DCE5]" />
            <span className="font-handwriting text-lg">Preview Before Sharing</span>
          </div>
          <h3 id="preview-modal-title" className="font-heading text-2xl text-[#5A3545] font-semibold">
            How Ekta will see this note
          </h3>
          <p className="text-xs text-[#9A817B] mt-1">
            This preview simulates the exact presentation and typography shown in Ekta's public view.
          </p>
        </div>

        {/* Simulated Note Stationery Card */}
        <div className="bg-[#FFF8ED] rounded-2xl p-6 sm:p-7 border border-[#E2A9B8]/70 shadow-inner my-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#F8DCE5]/30 rounded-bl-full pointer-events-none" />

          <div className="flex items-center justify-between text-xs text-[#9A817B] mb-2">
            <span>{note.date || 'A Special Thought'}</span>
            <span className="font-handwriting text-[#A64D68] text-base">For Ekta ♡</span>
          </div>

          <h4 className="font-heading text-2xl text-[#5A3545] font-bold mb-3">
            {note.title}
          </h4>

          <div className="text-sm sm:text-base text-[#5A3545]/90 font-letter leading-relaxed whitespace-pre-wrap">
            {note.content}
          </div>

          <div className="mt-5 pt-3 border-t border-[#F8DCE5] flex items-center justify-between text-xs text-[#A64D68]">
            <span className="italic font-serif">Written with all my sincerity</span>
            <Heart className="w-4 h-4 fill-current text-[#A64D68]/80" />
          </div>
        </div>

        {/* Deliberate Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#5A3545]/80 flex items-center gap-1.5">
            {note.isShared ? (
              <span className="text-[#A64D68] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-[#A64D68]" />
                Currently visible in "Notes to Share"
              </span>
            ) : (
              <span className="text-[#9A817B]">
                Currently hidden in your Private Diary
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-medium text-[#5A3545]/70 hover:bg-[#F8DCE5]/30"
            >
              Return to Diary
            </button>
            <button
              onClick={() => {
                onToggleShare(note);
                onClose();
              }}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium shadow-sm transition-all flex items-center gap-1.5 ${
                note.isShared
                  ? 'bg-[#5A3545] text-white hover:bg-[#432332]'
                  : 'bg-[#A64D68] text-white hover:bg-[#8E3E56]'
              }`}
            >
              {note.isShared ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>Hide from Ekta</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Reveal this note to Ekta</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
