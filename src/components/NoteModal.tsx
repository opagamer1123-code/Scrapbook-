import React, { useState, useEffect } from 'react';
import { X, Heart, Pin, Eye, Calendar, Tag } from 'lucide-react';
import { DiaryNote, NoteCategory } from '../types/notes';

interface NoteModalProps {
  isOpen: boolean;
  initialNote?: DiaryNote | null;
  onClose: () => void;
  onSave: (noteData: {
    title: string;
    content: string;
    date?: string;
    isPinned: boolean;
    isShared: boolean;
    category: NoteCategory;
  }) => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  initialNote,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<NoteCategory>('thought');
  const [isPinned, setIsPinned] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setContent(initialNote.content);
      setDate(initialNote.date || '');
      setCategory(initialNote.category || 'thought');
      setIsPinned(initialNote.isPinned);
      setIsShared(initialNote.isShared);
    } else {
      setTitle('');
      setContent('');
      const today = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
      }).format(new Date());
      setDate(today);
      setCategory('thought');
      setIsPinned(false);
      setIsShared(false);
    }
    setError('');
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for your note.');
      return;
    }
    if (!content.trim()) {
      setError('Please write your note content.');
      return;
    }

    onSave({
      title: title.trim(),
      content: content.trim(),
      date: date.trim() || undefined,
      category,
      isPinned,
      isShared,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#5A3545]/40 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-modal-title"
    >
      <div className="bg-[#FFFDF9] rounded-3xl max-w-lg w-full border border-[#F8DCE5] shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#5A3545]/60 hover:text-[#5A3545] rounded-full hover:bg-[#F8DCE5]/40 transition-colors"
          aria-label="Close note dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-[#A64D68]">
          <Heart className="w-4 h-4 fill-[#F8DCE5]" />
          <span className="font-handwriting text-lg">Things I Never Said</span>
        </div>

        <h2
          id="note-modal-title"
          className="font-heading text-2xl sm:text-3xl text-[#5A3545] font-semibold mb-5"
        >
          {initialNote ? 'Edit Diary Note' : 'Write a Note for Ekta'}
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5A3545]/80 uppercase tracking-wider mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. A Thought of You"
              className="w-full px-4 py-2.5 rounded-xl border border-[#F8DCE5] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#A64D68] text-sm text-[#5A3545] placeholder-[#5A3545]/40"
              maxLength={120}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#5A3545]/80 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 absolute left-3.5 top-3 text-[#A64D68]/60" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NoteCategory)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#F8DCE5] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#A64D68] text-sm text-[#5A3545]"
                >
                  <option value="thought">Thought</option>
                  <option value="admiration">Admiration</option>
                  <option value="confession">Confession</option>
                  <option value="memory">Memory</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A3545]/80 uppercase tracking-wider mb-1.5">
                Date (Optional)
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-[#A64D68]/60" />
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g. October 24"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#F8DCE5] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#A64D68] text-sm text-[#5A3545] placeholder-[#5A3545]/40"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A3545]/80 uppercase tracking-wider mb-1.5 flex justify-between">
              <span>Note Content</span>
              <span className="text-[11px] text-[#5A3545]/50 font-normal">
                {content.length} characters
              </span>
            </label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (error) setError('');
              }}
              placeholder="Write what has been in your thoughts... line breaks are preserved."
              className="w-full px-4 py-3 rounded-xl border border-[#F8DCE5] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#A64D68] text-sm text-[#5A3545] placeholder-[#5A3545]/40 leading-relaxed resize-y font-letter"
            />
          </div>

          {/* Privacy & sharing settings */}
          <div className="bg-[#FFF8ED] p-4 rounded-2xl border border-[#F8DCE5]/80 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 rounded text-[#A64D68] accent-[#A64D68] cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-[#5A3545] flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5 text-[#A64D68]" />
                Pin this note to the top of my list
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
                className="w-4 h-4 rounded text-[#A64D68] accent-[#A64D68] mt-0.5 cursor-pointer"
              />
              <div>
                <span className="text-xs sm:text-sm font-medium text-[#5A3545] flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#A64D68]" />
                  Reveal note to Ekta (Public "Notes to Share")
                </span>
                <p className="text-[11px] text-[#9A817B] mt-0.5">
                  If unchecked, note remains strictly in your Private Diary.
                </p>
              </div>
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full text-xs font-medium text-[#5A3545]/70 hover:text-[#5A3545] hover:bg-[#F8DCE5]/30 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#A64D68] hover:bg-[#8E3E56] text-white text-xs sm:text-sm font-medium shadow-sm transition-all"
            >
              {initialNote ? 'Save Changes' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
