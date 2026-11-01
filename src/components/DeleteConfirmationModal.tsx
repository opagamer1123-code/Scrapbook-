import React from 'react';
import { AlertCircle, Trash2, X } from 'lucide-react';
import { DiaryNote } from '../types/notes';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  note: DiaryNote | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  note,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !note) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#5A3545]/45 backdrop-blur-xs animate-in fade-in"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
    >
      <div className="bg-[#FFFDF9] rounded-3xl max-w-md w-full border border-[#F8DCE5] shadow-2xl p-6 sm:p-7 relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-[#5A3545]/60 hover:text-[#5A3545] rounded-full hover:bg-[#F8DCE5]/40 transition-colors"
          aria-label="Cancel deletion"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#A64D68] mb-4">
          <Trash2 className="w-6 h-6" />
        </div>

        <h3
          id="delete-dialog-title"
          className="font-serif text-2xl text-[#5A3545] font-semibold mb-2"
        >
          Delete this note?
        </h3>

        <p
          id="delete-dialog-desc"
          className="text-sm text-[#5A3545]/80 font-sans leading-relaxed mb-6"
        >
          Are you sure you want to permanently delete <strong className="text-[#5A3545]">"{note.title}"</strong>?
          This note will be permanently removed from your browser's local storage and cannot be restored.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium text-[#5A3545]/80 hover:bg-[#F8DCE5]/30 transition-colors"
          >
            Keep note
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-medium shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            Yes, delete note
          </button>
        </div>
      </div>
    </div>
  );
};
