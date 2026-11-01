import React from 'react';
import { Pin, Eye, EyeOff, Edit3, Trash2, Calendar, Heart, Tag } from 'lucide-react';
import { DiaryNote } from '../types/notes';

interface NoteCardProps {
  note: DiaryNote;
  isOwnerView: boolean;
  onEdit?: (note: DiaryNote) => void;
  onDelete?: (note: DiaryNote) => void;
  onTogglePin?: (noteId: string) => void;
  onToggleShare?: (note: DiaryNote) => void;
  onPreview?: (note: DiaryNote) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isOwnerView,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleShare,
  onPreview,
}) => {
  const categoryNames: Record<string, string> = {
    thought: 'A Thought',
    admiration: 'Admiration',
    confession: 'Unspoken Words',
    memory: 'A Memory',
    general: 'Note',
  };

  return (
    <article
      className={`relative bg-[#FFFDF9] rounded-2xl p-6 sm:p-7 border transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between ${
        note.isPinned
          ? 'border-[#A64D68]/40 ring-1 ring-[#A64D68]/20 bg-gradient-to-b from-[#FFFDF9] to-[#FFF5F8]'
          : 'border-[#F8DCE5]'
      }`}
    >
      {/* Washi Tape / Pin Motif */}
      <div className="absolute -top-3 left-8 z-10">
        {note.isPinned ? (
          <div className="bg-[#A64D68] text-white px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium flex items-center gap-1 shadow-xs">
            <Pin className="w-3 h-3 fill-current rotate-45" />
            <span>Pinned Note</span>
          </div>
        ) : (
          <div className="w-10 h-3 bg-[#F8DCE5]/80 backdrop-blur-xs rounded-xs shadow-2xs rotate-[-2deg]" />
        )}
      </div>

      <div>
        {/* Header Metadata (Clean unboxed typography) */}
        <div className="flex items-center justify-between text-xs text-[#9A817B] mb-3 pt-1 flex-wrap gap-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-[#A64D68]">
              {categoryNames[note.category] || 'Note'}
            </span>
            <span aria-hidden="true">·</span>
            {note.date ? (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#A64D68]/70" />
                <span>{note.date}</span>
              </span>
            ) : (
              <span>Personal Note</span>
            )}
            {isOwnerView && (
              <>
                <span aria-hidden="true">·</span>
                <span
                  className={
                    note.isShared
                      ? 'text-[#A64D68] font-medium'
                      : 'text-[#9A817B]'
                  }
                >
                  {note.isShared ? 'Revealed to Ekta' : 'Private in Diary'}
                </span>
              </>
            )}
          </div>

          <Heart className="w-3.5 h-3.5 text-[#F8DCE5] fill-[#F8DCE5]" />
        </div>

        {/* Note Title */}
        <h3 className="font-heading text-xl sm:text-2xl text-[#5A3545] font-semibold leading-snug mb-3">
          {note.title}
        </h3>

        {/* Multiline Content with preserved linebreaks in Lora font */}
        <div className="text-sm sm:text-base text-[#5A3545]/90 font-letter leading-relaxed whitespace-pre-wrap break-words">
          {note.content}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="mt-6 pt-4 border-t border-[#F8DCE5]/60 flex items-center justify-between">
        {isOwnerView ? (
          <div className="flex items-center gap-1.5 flex-wrap w-full justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => onTogglePin?.(note.id)}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  note.isPinned
                    ? 'text-[#A64D68] bg-[#F8DCE5]/50'
                    : 'text-[#5A3545]/60 hover:text-[#5A3545] hover:bg-[#F8DCE5]/20'
                }`}
                title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
                aria-label={note.isPinned ? 'Unpin note' : 'Pin note to top'}
              >
                <Pin className="w-4 h-4" />
              </button>

              <button
                onClick={() => onEdit?.(note)}
                className="p-1.5 rounded-lg text-xs text-[#5A3545]/60 hover:text-[#5A3545] hover:bg-[#F8DCE5]/20 transition-colors"
                title="Edit note"
                aria-label="Edit note"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDelete?.(note)}
                className="p-1.5 rounded-lg text-xs text-[#A64D68]/70 hover:text-[#A64D68] hover:bg-[#F8DCE5]/30 transition-colors"
                title="Delete note"
                aria-label="Delete note"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onPreview?.(note)}
                className="text-xs px-2 py-1 rounded-md text-[#5A3545]/80 hover:text-[#5A3545] bg-[#F8DCE5]/30 hover:bg-[#F8DCE5]/60 transition-colors flex items-center gap-1"
                title="Preview note card as Ekta will see it"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>

              <button
                onClick={() => onToggleShare?.(note)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors font-medium flex items-center gap-1 ${
                  note.isShared
                    ? 'bg-[#A64D68] text-white hover:bg-[#8E3E56]'
                    : 'bg-[#FFFDF9] border border-[#A64D68]/40 text-[#A64D68] hover:bg-[#F8DCE5]/40'
                }`}
                title={note.isShared ? 'Hide from Ekta' : 'Reveal this note to Ekta'}
              >
                {note.isShared ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Reveal to Ekta</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-between items-center text-xs text-[#A64D68]/80 font-handwriting text-base">
            <span>Written with sincerity for Ekta ♡</span>
            <span className="font-sans text-[11px] text-[#9A817B]">Saved locally</span>
          </div>
        )}
      </div>
    </article>
  );
};
