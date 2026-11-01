import React, { useState } from 'react';
import {
  Heart,
  Sparkles,
  Clock,
  Smile,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Loader2,
  Feather,
} from 'lucide-react';
import { proposalConfig } from '../config/proposalConfig';
import { HeartConfettiCelebration } from './HeartConfettiCelebration';
import { OneMoreThingSection } from './OneMoreThingSection';
import { CurvedPaperSheet } from './CurvedPaperSheet';
import { paperFlipAudio } from '../services/paperSound';

type ProposalAnswer = 'yes' | 'time' | 'friend' | null;

interface ProposalSectionProps {
  onBackToLetter: () => void;
  onPrevPage?: () => void;
  onGoHome?: () => void;
  onOpenOwnerDashboard?: () => void;
}

export const ProposalSection: React.FC<ProposalSectionProps> = ({
  onBackToLetter,
  onPrevPage,
  onGoHome,
  onOpenOwnerDashboard,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<ProposalAnswer>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionSubmissionId] = useState(
    () => `sub_ekta_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  );
  const [submissionStatus, setSubmissionStatus] = useState<{
    saved: boolean;
    message: string | null;
    error: string | null;
  }>({
    saved: false,
    message: null,
    error: null,
  });

  const [activeSubPage, setActiveSubPage] = useState<'proposal' | 'one-more-thing'>('proposal');
  const [isTurningPage, setIsTurningPage] = useState(false);
  const [turnDirection, setTurnDirection] = useState<'next' | 'prev'>('next');

  const handleOpenOneMoreThing = () => {
    if (isTurningPage) return;
    setIsTurningPage(true);
    setTurnDirection('next');
    paperFlipAudio.play('next');
  };

  const handleReturnToProposal = () => {
    if (isTurningPage) return;
    setIsTurningPage(true);
    setTurnDirection('prev');
    paperFlipAudio.play('prev');
  };

  const handleSelectAnswer = async (ans: ProposalAnswer) => {
    if (!ans) return;
    if (isSubmitting) return;

    setSelectedAnswer(ans);
    setSubmissionStatus({
      saved: false,
      message: null,
      error: null,
    });

    if (ans === 'yes') {
      // 1. YES: Show existing YES response message, shower hearts, and show "There's something more I want to ask you ♡" button.
      // Email is sent after she answers the marriage question on the next page.
      setShowCelebration(true);
      return;
    }

    // 2 & 3. MORE TIME or NO: Immediately record in Firestore and queue email notification
    // Confetti explosion is strictly disabled for non-YES responses
    setShowCelebration(false);
    setIsSubmitting(true);
    const answerLabel = proposalConfig.proposal.options[ans].label;

    try {
      const response = await fetch('/api/proposal/submit-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalChoice: answerLabel,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmissionStatus({
          saved: true,
          message: 'Your response has been saved in Firebase and queued for notification ♡',
          error: null,
        });
      } else {
        setSubmissionStatus({
          saved: false,
          message: null,
          error:
            result.error ||
            'Unable to process response at this moment. Please click retry below.',
        });
      }
    } catch (apiErr: unknown) {
      setSubmissionStatus({
        saved: false,
        message: null,
        error:
          'A connection error occurred while sending your response. Please click retry below.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAnswer = () => {
    setSelectedAnswer(null);
    setShowCelebration(false);
    setSubmissionStatus({
      saved: false,
      message: null,
      error: null,
    });
  };

  const currentChoiceLabel = selectedAnswer
    ? proposalConfig.proposal.options[selectedAnswer].label
    : "Yes, let's give our story a beautiful beginning ❤️";

  const renderProposalContent = () => (
    <>
      {/* Soft Rose-to-Cream Glow and Central Heart Illustration */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-[#F8DCE5] to-[#FFF5F8] border border-[#E2A9B8] shadow-md shadow-[#F8DCE5]/50 mb-5 relative group">
          <Heart className="w-10 h-10 text-[#A64D68] fill-[#A64D68] animate-pulse" />
          <span className="absolute inset-0 rounded-full bg-[#A64D68]/15 blur-lg -z-10 animate-ping" />
        </div>

        <p className="font-handwriting text-2xl sm:text-3xl text-[#A64D68] mb-2 tracking-wide">
          {proposalConfig.proposal.leadIn}
        </p>
      </div>

      {/* Proposal Card */}
      <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-10 md:p-12 border border-[#F8DCE5] shadow-2xl relative overflow-hidden paper-pattern">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#F8DCE5]/50 to-transparent rounded-bl-full pointer-events-none" />

        <div className="relative z-10 text-center">
          {/* Main Question for Ekta */}
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl text-[#5A3545] font-semibold leading-relaxed sm:leading-relaxed mb-8">
            "{proposalConfig.proposal.question}"
          </h2>

          {/* Three Clearly Visible, Equally Accessible Buttons */}
          {!selectedAnswer ? (
            <div className="space-y-3.5 max-w-md mx-auto">
              {/* Option 1: Yes */}
              <button
                onClick={() => handleSelectAnswer('yes')}
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#A64D68] to-[#8E3E56] hover:from-[#8E3E56] hover:to-[#5A3545] text-white font-medium text-base sm:text-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-3 group focus-visible:ring-3 focus-visible:ring-[#A64D68]/40 focus-visible:outline-hidden disabled:opacity-60 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-[#F8DCE5]" />
                <span>{proposalConfig.proposal.options.yes.label}</span>
                <Heart className="w-5 h-5 text-white fill-white/80 group-hover:scale-110 transition-transform" />
              </button>

              {/* Option 2: Need Time */}
              <button
                onClick={() => handleSelectAnswer('time')}
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#FFF8ED] hover:bg-[#F8DCE5]/50 border border-[#F8DCE5] text-[#5A3545] font-medium text-base shadow-2xs hover:shadow-xs transition-all duration-200 flex items-center justify-center gap-2.5 focus-visible:ring-3 focus-visible:ring-[#A64D68]/40 focus-visible:outline-hidden disabled:opacity-60 cursor-pointer"
              >
                <Clock className="w-4 h-4 text-[#A64D68]" />
                <span>{proposalConfig.proposal.options.time.label}</span>
              </button>

              {/* Option 3: Friendship */}
              <button
                onClick={() => handleSelectAnswer('friend')}
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#FFF8ED] hover:bg-[#F8DCE5]/50 border border-[#F8DCE5] text-[#5A3545] font-medium text-base shadow-2xs hover:shadow-xs transition-all duration-200 flex items-center justify-center gap-2.5 focus-visible:ring-3 focus-visible:ring-[#A64D68]/40 focus-visible:outline-hidden disabled:opacity-60 cursor-pointer"
              >
                <Smile className="w-4 h-4 text-[#A64D68]" />
                <span>{proposalConfig.proposal.options.friend.label}</span>
              </button>
            </div>
          ) : (
            /* Selected Answer Response Card */
            <div className="py-4 animate-in fade-in zoom-in-95 duration-500">
              {/* Submission Progress / Status Feedback Banner (For MORE TIME / NO) */}
              {selectedAnswer !== 'yes' && (
                <div className="mb-6 max-w-md mx-auto">
                  {isSubmitting ? (
                    <div className="p-3.5 rounded-2xl bg-[#FFF0F4] border border-[#F8DCE5] text-xs text-[#A64D68] flex items-center justify-center gap-2 shadow-2xs">
                      <Loader2 className="w-4 h-4 animate-spin text-[#A64D68]" />
                      <span className="font-medium">Saving your response in Firebase with love...</span>
                    </div>
                  ) : submissionStatus.saved ? (
                    <div className="p-3.5 rounded-2xl bg-[#FFF8ED] border border-[#F8DCE5] text-xs text-[#5A3545] flex items-center justify-center gap-2 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium text-emerald-800">
                        {submissionStatus.message || 'Your response is safely recorded in Firebase Firestore ♡'}
                      </span>
                    </div>
                  ) : submissionStatus.error ? (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{submissionStatus.error}</span>
                      </div>
                      <button
                        onClick={() => handleSelectAnswer(selectedAnswer)}
                        disabled={isSubmitting}
                        className="px-2.5 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold cursor-pointer shrink-0 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Response for YES */}
              {selectedAnswer === 'yes' && (
                <div className="bg-[#FFF5F8] p-6 sm:p-8 rounded-2xl border border-[#E2A9B8] space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#A64D68] text-white flex items-center justify-center mx-auto shadow-md">
                    <Heart className="w-7 h-7 fill-white" />
                  </div>
                  <h3 className="font-heading text-2xl sm:text-3xl text-[#A64D68] font-bold">
                    {proposalConfig.proposal.options.yes.responseTitle}
                  </h3>
                  <p className="font-letter text-lg sm:text-xl text-[#5A3545] leading-relaxed max-w-lg mx-auto">
                    {proposalConfig.proposal.options.yes.responseMessage}
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setShowCelebration(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#A64D68] hover:bg-[#8E3E56] text-white text-xs sm:text-sm font-medium shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#A64D68]"
                    >
                      <Sparkles className="w-4 h-4 text-[#F8DCE5]" aria-hidden="true" />
                      <span>Shower Hearts Again ♡</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Response for TIME */}
              {selectedAnswer === 'time' && (
                <div className="bg-[#FFF8ED] p-6 sm:p-8 rounded-2xl border border-[#F8DCE5] space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#F8DCE5] text-[#A64D68] flex items-center justify-center mx-auto shadow-sm">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-2xl sm:text-3xl text-[#5A3545] font-bold">
                    {proposalConfig.proposal.options.time.responseTitle}
                  </h3>
                  <p className="font-letter text-lg sm:text-xl text-[#5A3545] leading-relaxed max-w-lg mx-auto">
                    {proposalConfig.proposal.options.time.responseMessage}
                  </p>
                </div>
              )}

              {/* Response for FRIENDSHIP */}
              {selectedAnswer === 'friend' && (
                <div className="bg-[#FFF8ED] p-6 sm:p-8 rounded-2xl border border-[#F8DCE5] space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#F8DCE5] text-[#A64D68] flex items-center justify-center mx-auto shadow-sm">
                    <Smile className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-2xl sm:text-3xl text-[#5A3545] font-bold">
                    {proposalConfig.proposal.options.friend.responseTitle}
                  </h3>
                  <p className="font-letter text-lg sm:text-xl text-[#5A3545] leading-relaxed max-w-lg mx-auto">
                    {proposalConfig.proposal.options.friend.responseMessage}
                  </p>
                </div>
              )}

              {/* Button to proceed to "One More Thing" follow-up page — ONLY FOR YES */}
              {selectedAnswer === 'yes' && (
                <div className="mt-8 pt-6 border-t border-[#F8DCE5]/70 space-y-3">
                  <button
                    type="button"
                    onClick={handleOpenOneMoreThing}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#A64D68] via-[#94425A] to-[#8E3E56] hover:from-[#8E3E56] hover:to-[#5A3545] text-white font-medium text-base sm:text-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer group focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-[#A64D68]/40"
                  >
                    <Feather className="w-5 h-5 text-[#F8DCE5]" />
                    <span>There's something more I want to ask you ♡</span>
                    <Sparkles className="w-5 h-5 text-[#F8DCE5] group-hover:rotate-12 transition-transform" />
                  </button>
                </div>
              )}

              {/* Back to options button */}
              <div className="mt-4 flex items-center justify-center gap-4">
                <button
                  onClick={handleResetAnswer}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium text-[#A64D68] bg-[#FFF8ED] border border-[#F8DCE5] hover:bg-[#F8DCE5]/50 shadow-2xs transition-all cursor-pointer"
                  aria-label="Return to options"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>← Return to options</span>
                </button>
              </div>
            </div>
          )}

          {/* Notice for Ekta */}
          <div className="mt-8 pt-5 border-t border-[#F8DCE5]/70 flex items-center justify-center gap-2.5 text-xs text-[#9A817B] text-center max-w-lg mx-auto leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-[#A64D68] shrink-0" />
            <span>
              Notice for Ekta: Your response is securely stored in Firebase Firestore, and an email notification is sent to the author.
            </span>
          </div>
        </div>
      </div>

      {/* Dedicated Page Navigation */}
      <div className="mt-12 pt-8 border-t border-[#F8DCE5]/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        {onPrevPage ? (
          <button
            onClick={onPrevPage}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#A64D68]/40 hover:border-[#A64D68] text-[#A64D68] hover:bg-[#F8DCE5]/30 text-sm font-medium transition-all cursor-pointer"
            aria-label="Return to Little Things page"
          >
            <span>← Previous: Little Things</span>
          </button>
        ) : (
          <div className="invisible sm:block w-28" aria-hidden="true" />
        )}

        <div className="flex items-center gap-3">
          <div className="text-xs text-[#9A817B] font-letter italic">
            Dedicated Page 5 of 5 · Questions
          </div>
          {onOpenOwnerDashboard && (
            <>
              <span className="text-[#9A817B]/40" aria-hidden="true">·</span>
              <button
                onClick={onOpenOwnerDashboard}
                className="text-xs text-[#9A817B] hover:text-[#A64D68] inline-flex items-center gap-1 cursor-pointer transition-colors"
                title="Open Owner's Dashboard"
              >
                <Lock className="w-3 h-3 text-[#A64D68]" />
                <span>Owner's Dashboard</span>
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLetter}
            className="text-xs text-[#A64D68] hover:text-[#5A3545] underline font-sans cursor-pointer"
          >
            Re-read My Letter
          </button>
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#A64D68] to-[#8E3E56] text-white text-xs font-medium shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Return Home ♡</span>
            </button>
          )}
        </div>
      </div>
    </>
  );

  const renderOneMoreThingContent = () => (
    <OneMoreThingSection
      onReturnToProposal={handleReturnToProposal}
      onGoHome={onGoHome}
      proposalChoice={currentChoiceLabel}
      initialSubmissionId={sessionSubmissionId}
    />
  );

  return (
    <section
      id="proposal-section"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto relative z-20"
      aria-label="The Final Proposal for Ekta"
    >
      {/* Confetti Explosion Celebration Overlay — Strictly ONLY for YES selection */}
      {showCelebration && selectedAnswer === 'yes' && (
        <HeartConfettiCelebration
          onDismiss={() => setShowCelebration(false)}
          title="She Said Yes! ♡"
          subtitle="A shower of love for Ekta ✨"
        />
      )}

      {/* 3D Physical Paper-Turn Animation Container */}
      <div className="w-full relative [perspective:1400px]">
        {/* Underneath content: Displays target page when turning, active page when idle */}
        {isTurningPage ? (
          <div>
            {turnDirection === 'next' ? renderOneMoreThingContent() : renderProposalContent()}

            <CurvedPaperSheet<'proposal' | 'one-more-thing'>
              currentChapter={turnDirection === 'next' ? 'proposal' : 'one-more-thing'}
              targetChapter={turnDirection === 'next' ? 'one-more-thing' : 'proposal'}
              direction={turnDirection}
              duration={1100}
              onComplete={() => {
                setActiveSubPage(turnDirection === 'next' ? 'one-more-thing' : 'proposal');
                setIsTurningPage(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              renderPageContent={(sub) =>
                sub === 'proposal' ? renderProposalContent() : renderOneMoreThingContent()
              }
            />
          </div>
        ) : activeSubPage === 'one-more-thing' ? (
          renderOneMoreThingContent()
        ) : (
          renderProposalContent()
        )}
      </div>
    </section>
  );
};
