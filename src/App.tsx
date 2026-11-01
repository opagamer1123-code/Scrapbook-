/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FloatingPetals } from './components/FloatingPetals';
import { HeartCursorTrail } from './components/HeartCursorTrail';
import { OpeningEnvelope } from './components/OpeningEnvelope';
import { LoveLetter } from './components/LoveLetter';
import { NotesSection } from './components/NotesSection';
import { LittleThingsSection } from './components/LittleThingsSection';
import { ProposalSection } from './components/ProposalSection';
import { PrivacyNoticeModal } from './components/PrivacyNoticeModal';
import { OwnerDashboardModal } from './components/OwnerDashboardModal';
import { DiaryNote } from './types/notes';
import { loadNotesFromStorage, saveNotesToStorage } from './services/notesStorage';
import { Heart, ChevronRight, BookOpen, Feather, Sparkles, Smile, Lock } from 'lucide-react';

export type AppPage = 'home' | 'letter' | 'notes' | 'little-things' | 'questions';

const pageMetadata: Record<AppPage, { index: number; title: string; subtitle: string }> = {
  'home': { index: 1, title: 'Home', subtitle: 'The Beginning of His Story' },
  'letter': { index: 2, title: 'My Letter', subtitle: 'It Has Always Been Her' },
  'notes': { index: 3, title: 'Notes to Share', subtitle: 'Little Moments, Just for You' },
  'little-things': { index: 4, title: 'Little Things', subtitle: 'Memories I Admire' },
  'questions': { index: 5, title: 'Questions', subtitle: 'Her Answer' },
};

export default function App() {
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<AppPage>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'letter' || hash === 'letter-section') return 'letter';
      if (hash === 'notes' || hash === 'notes-section' || hash === 'notes-shared' || hash === 'notes-private') return 'notes';
      if (hash === 'little-things' || hash === 'little-things-section') return 'little-things';
      if (hash === 'questions' || hash === 'proposal' || hash === 'proposal-section') return 'questions';
    }
    return 'home';
  });

  const [notes, setNotes] = useState<DiaryNote[]>([]);
  const isOwnerMode = false; // Pure visitor presentation experience for Ekta
  const [notesTab, setNotesTab] = useState<'shared' | 'private'>('shared');
  const [isPrivacyNoticeOpen, setIsPrivacyNoticeOpen] = useState(false);
  const [isOwnerDashboardOpen, setIsOwnerDashboardOpen] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Initialize notes from browser localStorage
  useEffect(() => {
    const { notes: loadedNotes, error } = loadNotesFromStorage();
    setNotes(loadedNotes);
    if (error) {
      setStorageError(error);
    }
  }, []);

  // Listen for browser back / forward hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'letter' || hash === 'letter-section') setCurrentPage('letter');
      else if (hash === 'notes' || hash === 'notes-section' || hash === 'notes-shared') {
        setCurrentPage('notes');
        setNotesTab('shared');
      } else if (hash === 'notes-private') {
        setCurrentPage('notes');
        setNotesTab('private');
      } else if (hash === 'little-things' || hash === 'little-things-section') setCurrentPage('little-things');
      else if (hash === 'questions' || hash === 'proposal' || hash === 'proposal-section') setCurrentPage('questions');
      else if (hash === 'home' || hash === 'envelope-section' || hash === '') setCurrentPage('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update notes in state and persist to localStorage
  const handleUpdateNotes = (newNotes: DiaryNote[]) => {
    setNotes(newNotes);
    const { success, error } = saveNotesToStorage(newNotes);
    if (!success && error) {
      setStorageError(error);
    } else {
      setStorageError(null);
    }
  };

  // Dedicated Page Switcher
  const navigateToPage = (target: AppPage | string, targetNotesTab?: 'shared' | 'private') => {
    let resolvedPage: AppPage = 'home';

    if (target === 'envelope-section' || target === 'home') resolvedPage = 'home';
    else if (target === 'letter-section' || target === 'letter') resolvedPage = 'letter';
    else if (target === 'notes-section' || target === 'notes' || target === 'notes-shared' || target === 'notes-private') resolvedPage = 'notes';
    else if (target === 'little-things-section' || target === 'little-things') resolvedPage = 'little-things';
    else if (target === 'proposal-section' || target === 'questions') resolvedPage = 'questions';

    setCurrentPage(resolvedPage);

    if (targetNotesTab) {
      setNotesTab(targetNotesTab);
    } else if (target === 'notes-private') {
      setNotesTab('private');
    } else if (target === 'notes-shared') {
      setNotesTab('shared');
    }

    // Update URL hash for clean bookmarking & browser back/forward history
    const targetHash = resolvedPage === 'home' ? '' : resolvedPage;
    if (window.location.hash.replace('#', '') !== targetHash) {
      window.history.pushState(null, '', targetHash ? `#${targetHash}` : window.location.pathname);
    }

    // Always scroll smoothly to the top of the newly displayed dedicated page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navActiveKey =
    currentPage === 'home'
      ? 'envelope-section'
      : currentPage === 'letter'
      ? 'letter-section'
      : currentPage === 'notes'
      ? notesTab === 'private'
        ? 'notes-private'
        : 'notes-shared'
      : currentPage === 'little-things'
      ? 'little-things-section'
      : 'proposal-section';

  return (
    <div className="min-h-screen bg-[#FFF8ED] text-[#5A3545] relative flex flex-col font-sans selection:bg-[#F8DCE5] selection:text-[#5A3545]">
      {/* Floating Petals and Romantic Sparkles */}
      <FloatingPetals />

      {/* Romantic Custom Cursor Heart Trail */}
      <HeartCursorTrail />

      {/* Persistent Navigation Header with embedded Music Player */}
      <Navbar
        activeSection={navActiveKey}
        onNavigate={(secId, tab) => navigateToPage(secId, tab)}
        onOpenPrivacyNotice={() => setIsPrivacyNoticeOpen(true)}
      />

      {/* Storage Warning Banner if localStorage is inaccessible */}
      {storageError && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 text-center">
          {storageError}
        </div>
      )}

      {/* Dedicated Section Indicator / Story Stage Stepper */}
      <nav
        aria-label="Story chapter breadcrumbs"
        className="bg-[#FFFDF9]/95 border-b border-[#F8DCE5]/80 py-2.5 px-4 sticky top-[72px] z-30 backdrop-blur-xs"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar text-xs">
          {(['home', 'letter', 'notes', 'little-things', 'questions'] as AppPage[]).map((pageKey, idx) => {
            const meta = pageMetadata[pageKey];
            const isCurrent = currentPage === pageKey;

            return (
              <React.Fragment key={pageKey}>
                <button
                  onClick={() => navigateToPage(pageKey)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all shrink-0 ${
                    isCurrent
                      ? 'bg-[#A64D68] text-white font-semibold shadow-xs scale-102'
                      : 'text-[#9A817B] hover:text-[#5A3545] hover:bg-[#F8DCE5]/40'
                  }`}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isCurrent ? 'bg-white/20 text-white' : 'bg-[#F8DCE5] text-[#A64D68]'
                    }`}
                  >
                    {meta.index}
                  </span>
                  <span>{meta.title}</span>
                </button>

                {idx < 4 && (
                  <ChevronRight className="w-3.5 h-3.5 text-[#A64D68]/30 shrink-0" aria-hidden="true" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </nav>

      {/* Main Experience Content: Render ONLY the Dedicated Page */}
      <main className="flex-1 animate-in fade-in duration-300">
        {/* DEDICATED PAGE 1: Home */}
        {currentPage === 'home' && (
          <OpeningEnvelope
            isOpen={isEnvelopeOpen}
            onOpen={() => setIsEnvelopeOpen(true)}
            onLetterRevealed={() => navigateToPage('letter')}
          />
        )}

        {/* DEDICATED PAGE 2: My Letter */}
        {currentPage === 'letter' && (
          <LoveLetter
            onContinueStory={() => navigateToPage('notes', 'shared')}
            onPrevSection={() => navigateToPage('home')}
          />
        )}

        {/* DEDICATED PAGE 3: Notes to Share (& Private Diary in Owner Mode) */}
        {currentPage === 'notes' && (
          <NotesSection
            notes={notes}
            isOwnerMode={isOwnerMode}
            onUpdateNotes={handleUpdateNotes}
            activeTab={notesTab}
            onTabChange={(tab) => setNotesTab(tab)}
            onSwitchToOwnerMode={() => {}}
            onNextPage={() => navigateToPage('little-things')}
            onPrevPage={() => navigateToPage('letter')}
          />
        )}

        {/* DEDICATED PAGE 4: Little Things */}
        {currentPage === 'little-things' && (
          <LittleThingsSection
            isOwnerMode={isOwnerMode}
            onContinueToQuestion={() => navigateToPage('questions')}
            onPrevPage={() => navigateToPage('notes', 'shared')}
          />
        )}

        {/* DEDICATED PAGE 5: Questions */}
        {currentPage === 'questions' && (
          <ProposalSection
            onBackToLetter={() => navigateToPage('letter')}
            onPrevPage={() => navigateToPage('little-things')}
            onGoHome={() => navigateToPage('home')}
            onOpenOwnerDashboard={() => setIsOwnerDashboardOpen(true)}
          />
        )}
      </main>

      {/* Romantic Footer */}
      <footer className="border-t border-[#F8DCE5] py-8 px-4 text-center text-xs text-[#9A817B] relative z-20 bg-[#FFFDF9]/80">
        <div className="max-w-2xl mx-auto space-y-3">
          <p className="font-handwriting text-xl text-[#A64D68]">
            For Ekta, With All My Heart ♡
          </p>
          <div className="flex items-center justify-center gap-3 text-[11px] text-[#9A817B] flex-wrap">
            <span>Page {pageMetadata[currentPage].index} of 5 · {pageMetadata[currentPage].title}</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsPrivacyNoticeOpen(true)}
              className="hover:text-[#A64D68] underline cursor-pointer"
            >
              Storage & Privacy Notice
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsOwnerDashboardOpen(true)}
              className="hover:text-[#A64D68] underline inline-flex items-center gap-1 cursor-pointer font-medium"
              title="Access Owner's Dashboard (Email settings & dispatches)"
            >
              <Lock className="w-3 h-3 text-[#A64D68]" />
              <span>Owner's Dashboard</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Privacy Notice Modal */}
      <PrivacyNoticeModal
        isOpen={isPrivacyNoticeOpen}
        onClose={() => setIsPrivacyNoticeOpen(false)}
      />

      {/* Owner's Dashboard Modal */}
      <OwnerDashboardModal
        isOpen={isOwnerDashboardOpen}
        onClose={() => setIsOwnerDashboardOpen(false)}
      />
    </div>
  );
}
