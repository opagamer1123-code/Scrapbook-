import React, { useState } from 'react';
import { Heart, Menu, X, Shield } from 'lucide-react';
import { proposalConfig } from '../config/proposalConfig';
import { AudioPlayer } from './AudioPlayer';

interface NavbarProps {
  activeSection: string;
  isOwnerMode?: boolean;
  onToggleOwnerMode?: () => void;
  onNavigate: (sectionId: string, notesTab?: 'shared' | 'private') => void;
  onOpenPrivacyNotice: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  onOpenPrivacyNotice,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string, notesTab?: 'shared' | 'private') => {
    onNavigate(sectionId, notesTab);
    setMobileMenuOpen(false);
  };

  const isItemActive = (key: string) => {
    if (key === 'envelope-section') return activeSection === 'envelope-section' || activeSection === 'home';
    if (key === 'letter-section') return activeSection === 'letter-section' || activeSection === 'letter';
    if (key === 'notes-shared') return activeSection === 'notes-shared' || activeSection === 'notes' || activeSection === 'notes-section';
    if (key === 'notes-private') return activeSection === 'notes-private';
    if (key === 'little-things-section') return activeSection === 'little-things-section' || activeSection === 'little-things';
    if (key === 'proposal-section') return activeSection === 'proposal-section' || activeSection === 'questions';
    return false;
  };

  const navItemClass = (isActive: boolean) =>
    `text-xs sm:text-sm font-medium transition-all duration-200 rounded-full px-3.5 py-1.5 focus-visible:ring-2 focus-visible:ring-[#A64D68]/60 focus-visible:outline-hidden ${
      isActive
        ? 'bg-[#F8DCE5]/75 text-[#A64D68] shadow-2xs font-semibold'
        : 'text-[#5A3545]/80 hover:text-[#A64D68] hover:bg-[#F8DCE5]/35'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[rgba(166,77,104,0.18)] h-[72px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
        {/* Left: Emblem + Brand Title */}
        <button
          onClick={() => handleNavClick('envelope-section')}
          className="flex items-center gap-2.5 text-left group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#A64D68]/60 rounded-full p-1 shrink-0"
          aria-label="Navigate to Home"
        >
          <div className="w-8 h-8 rounded-full bg-[#F8DCE5] text-[#A64D68] border border-[rgba(166,77,104,0.22)] flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shadow-2xs">
            <Heart className="w-4 h-4 fill-[#A64D68]" />
          </div>
          <div>
            <span className="font-heading text-base sm:text-lg font-bold tracking-tight text-[#5A3545] whitespace-nowrap">
              {proposalConfig.siteTitle}
            </span>
          </div>
        </button>

        {/* Center: Desktop Navigation Links with subtle rose pill for active state */}
        <nav
          className="hidden xl:flex items-center gap-1.5 lg:gap-2 text-xs sm:text-sm"
          aria-label="Primary navigation"
        >
          <button
            onClick={() => handleNavClick('envelope-section')}
            className={navItemClass(isItemActive('envelope-section'))}
          >
            Home
          </button>

          <button
            onClick={() => handleNavClick('letter-section')}
            className={navItemClass(isItemActive('letter-section'))}
          >
            My Letter
          </button>

          <button
            onClick={() => handleNavClick('notes-section', 'shared')}
            className={navItemClass(isItemActive('notes-shared'))}
          >
            Notes to Share
          </button>

          <button
            onClick={() => handleNavClick('little-things-section')}
            className={navItemClass(isItemActive('little-things-section'))}
          >
            Little Things
          </button>

          <button
            onClick={() => handleNavClick('proposal-section')}
            className={navItemClass(isItemActive('proposal-section'))}
          >
            Questions
          </button>
        </nav>

        {/* Right: Embedded Music Player + Privacy Icon */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Embedded Audio Player directly inside header to prevent overlapping */}
          <AudioPlayer embedded={true} />

          {/* Privacy Notice Icon */}
          <button
            onClick={onOpenPrivacyNotice}
            className="p-1.5 text-[#9A817B] hover:text-[#5A3545] hover:bg-[#F8DCE5]/30 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-[#A64D68]/60 focus-visible:outline-hidden"
            title="Local storage and privacy info"
            aria-label="View local storage privacy information"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Actions: Audio Player + Hamburger Menu */}
        <div className="flex xl:hidden items-center gap-2">
          <AudioPlayer embedded={true} />

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#5A3545] rounded-xl hover:bg-[#F8DCE5]/40 transition-colors focus-visible:ring-2 focus-visible:ring-[#A64D68]/60 focus-visible:outline-hidden"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#FFFDF9] border-b border-[rgba(166,77,104,0.18)] px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-1 text-sm text-[#5A3545]">
            <button
              onClick={() => handleNavClick('envelope-section')}
              className={`text-left py-2 px-3.5 rounded-xl font-medium transition-colors ${
                isItemActive('envelope-section') ? 'bg-[#F8DCE5]/70 text-[#A64D68]' : 'hover:bg-[#F8DCE5]/30'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('letter-section')}
              className={`text-left py-2 px-3.5 rounded-xl font-medium transition-colors ${
                isItemActive('letter-section') ? 'bg-[#F8DCE5]/70 text-[#A64D68]' : 'hover:bg-[#F8DCE5]/30'
              }`}
            >
              My Letter
            </button>
            <button
              onClick={() => handleNavClick('notes-section', 'shared')}
              className={`text-left py-2 px-3.5 rounded-xl font-medium transition-colors ${
                isItemActive('notes-shared') ? 'bg-[#F8DCE5]/70 text-[#A64D68]' : 'hover:bg-[#F8DCE5]/30'
              }`}
            >
              Notes to Share
            </button>
            <button
              onClick={() => handleNavClick('little-things-section')}
              className={`text-left py-2 px-3.5 rounded-xl font-medium transition-colors ${
                isItemActive('little-things-section') ? 'bg-[#F8DCE5]/70 text-[#A64D68]' : 'hover:bg-[#F8DCE5]/30'
              }`}
            >
              Little Things
            </button>
            <button
              onClick={() => handleNavClick('proposal-section')}
              className={`text-left py-2 px-3.5 rounded-xl font-medium transition-colors ${
                isItemActive('proposal-section') ? 'bg-[#F8DCE5]/70 text-[#A64D68]' : 'hover:bg-[#F8DCE5]/30'
              }`}
            >
              Questions
            </button>
          </nav>

          <div className="pt-3 border-t border-[rgba(166,77,104,0.18)] flex items-center justify-between text-xs text-[#9A817B]">
            <span className="font-handwriting text-sm text-[#A64D68]">For Ekta, With Love ♡</span>
            <button
              onClick={onOpenPrivacyNotice}
              className="underline flex items-center gap-1 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Storage Policy</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
