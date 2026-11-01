import React, { useState } from 'react';
import {
  Heart,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Feather,
} from 'lucide-react';
import { HeartConfettiCelebration } from './HeartConfettiCelebration';

const MARRIAGE_QUESTION =
  'Will you marry me in every universe, every multiverse, and every life we could ever live? If our souls found each other in a million different worlds, would you still choose me?';

interface OneMoreThingSectionProps {
  onReturnToProposal: () => void;
  onGoHome?: () => void;
  proposalChoice?: string;
  initialSubmissionId?: string;
}

export const OneMoreThingSection: React.FC<OneMoreThingSectionProps> = ({
  onReturnToProposal,
  onGoHome,
  proposalChoice = "Yes, let's give our story a beautiful beginning ❤️",
  initialSubmissionId,
}) => {
  const [marriageAnswer, setMarriageAnswer] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Stable submission ID generated once per form session, preserving deduplication across retries
  const [submissionId] = useState(
    () => initialSubmissionId || `sub_heart_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent accidental duplicate submissions

    setValidationError(null);
    setSubmitError(null);

    const trimmed = marriageAnswer.trim();

    if (!trimmed) {
      setValidationError('Please share your thoughts for the question before sending. ♡');
      return;
    }

    setIsSubmitting(true);

    try {
      // Dispatch directly to server-side backend: sends email with YES choice and her answer
      const response = await fetch('/api/proposal/submit-marriage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId,
          proposalChoice,
          marriageAnswer: trimmed,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSuccess(true);
        setShowCelebration(true);
      } else {
        // Do not display a false success message. Show a friendly error and allow retry.
        setSubmitError(
          result.error ||
            'Unable to process your answer at this moment. Your words are still saved here—please click below to retry sending. ♡'
        );
      }
    } catch (err: unknown) {
      // Do NOT clear answers on network error, allow retry
      setSubmitError(
        'A connection error occurred while sending your answer. Your words are still preserved—please click below to retry. ♡'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="one-more-thing-section"
      className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto relative z-20 animate-in fade-in duration-500"
      aria-label="One More Thing, My Ekta"
    >
      {/* Confetti Explosion Celebration Overlay */}
      {showCelebration && (
        <HeartConfettiCelebration
          onDismiss={() => setShowCelebration(false)}
          title="Answer Sent With Love ♡"
          subtitle="Thank you for sharing your heart, Ekta ✨"
        />
      )}

      {/* Decorative top header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-[#F8DCE5] to-[#FFF5F8] border border-[#E2A9B8] shadow-sm mb-4 relative">
          <Feather className="w-8 h-8 text-[#A64D68]" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#A64D68] text-white flex items-center justify-center text-[10px]">
            ♡
          </span>
        </div>

        <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl text-[#5A3545] font-semibold mb-3">
          One More Thing, My Ekta ♡
        </h1>

        <div className="max-w-xl mx-auto p-4 sm:p-5 rounded-2xl bg-[#FFFDF9]/90 border border-[#F8DCE5] shadow-2xs">
          <p className="font-letter text-base sm:text-lg text-[#5A3545] leading-relaxed italic">
            “There's something I've carried in my heart, something bigger than a simple yes or no. I don't want to put words in your mouth or answer for you. I want to hear your heart, in your own words, because your feelings matter to me more than anything.”
          </p>
        </div>
      </div>

      {/* Main Parchment Card */}
      <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-10 md:p-12 border border-[#F8DCE5] shadow-2xl relative overflow-hidden paper-pattern">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#F8DCE5]/40 to-transparent rounded-bl-full pointer-events-none" />

        {isSuccess ? (
          /* SUCCESS SCREEN (Only after answers are securely stored) */
          <div className="py-6 sm:py-8 text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 rounded-full bg-[#A64D68] text-white flex items-center justify-center mx-auto shadow-md">
              <Heart className="w-8 h-8 fill-white animate-pulse" />
            </div>

            <div className="max-w-lg mx-auto space-y-4">
              <h2 className="font-heading text-2xl sm:text-3xl text-[#A64D68] font-bold">
                Thank you for sharing your heart with me, Ekta. ♡
              </h2>

              <div className="p-5 sm:p-6 rounded-2xl bg-[#FFF5F8] border border-[#E2A9B8] text-left">
                <p className="font-letter text-base sm:text-lg text-[#5A3545] leading-relaxed">
                  I wanted to hear your answers in your own words, and now I have them. Whatever you feel, thank you for trusting me enough to tell me honestly. You deserve to be heard, understood, and loved without pressure.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-emerald-800 bg-emerald-50 py-2.5 px-4 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your answer has been safely saved in Firebase Firestore and notification is queued ♡</span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowCelebration(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#A64D68] hover:bg-[#8E3E56] text-white text-xs sm:text-sm font-medium shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#A64D68]"
                >
                  <Sparkles className="w-4 h-4 text-[#F8DCE5]" aria-hidden="true" />
                  <span>Shower Confetti Again ♡</span>
                </button>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={onReturnToProposal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#A64D68]/40 hover:border-[#A64D68] text-[#A64D68] hover:bg-[#F8DCE5]/30 text-xs sm:text-sm font-medium transition-all cursor-pointer"
              >
                <span>← Previous: Proposal Answer</span>
              </button>

              {onGoHome && (
                <button
                  type="button"
                  onClick={onGoHome}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#A64D68] to-[#8E3E56] hover:from-[#8E3E56] hover:to-[#5A3545] text-white text-xs sm:text-sm font-medium shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <span>Return Home ♡</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* FORM: TWO DEEP QUESTIONS WITH MULTILINE TEXTBOXES */
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {/* Error / Validation Feedback */}
            {validationError && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2 shadow-2xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {submitError && (
              <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/80 text-rose-900 text-xs shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-sm text-rose-950">
                      Unable to deliver message right now
                    </p>
                    <p className="leading-relaxed opacity-95">{submitError}</p>
                    <p className="text-[11px] text-rose-700 pt-1">
                      Your written answer above is preserved. You can click “Send My Answer to You ♡” below to retry.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* THE MARRIAGE QUESTION ONLY */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-[#A64D68] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
                  ♡
                </span>
                <label
                  htmlFor="marriage-question-input"
                  className="font-heading text-lg sm:text-xl text-[#5A3545] font-semibold leading-relaxed"
                >
                  {MARRIAGE_QUESTION}
                </label>
              </div>

              <div className="relative">
                <textarea
                  id="marriage-question-input"
                  rows={6}
                  value={marriageAnswer}
                  onChange={(e) => setMarriageAnswer(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="If our story existed in every universe, what would your heart say? ♡"
                  className="w-full p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#E2A9B8] focus:border-[#A64D68] focus:ring-2 focus:ring-[#A64D68]/30 outline-hidden font-letter text-base sm:text-lg text-[#2B1D24] placeholder:text-[#9A817B]/60 leading-relaxed shadow-inner resize-y transition-all disabled:opacity-60"
                  aria-required="true"
                />
              </div>
            </div>

            {/* ROMANTIC SUBMIT BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#A64D68] to-[#8E3E56] hover:from-[#8E3E56] hover:to-[#5A3545] text-white font-medium text-base sm:text-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-[#A64D68]/40"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-[#F8DCE5]" />
                    <span>Sending your answer with love...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-[#F8DCE5]" />
                    <span>Send My Answer to You ♡</span>
                    <Heart className="w-5 h-5 text-white fill-white/80" />
                  </>
                )}
              </button>
            </div>

            {/* Clear Notice for Ekta */}
            <div className="pt-3 border-t border-[#F8DCE5]/70 flex items-center justify-center gap-2 text-xs text-[#9A817B] text-center max-w-lg mx-auto leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-[#A64D68] shrink-0" />
              <span>
                Notice: Your answers are securely stored in Firebase Firestore and an email notification is queued for the author via Trigger Email.
              </span>
            </div>
          </form>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="mt-8 flex items-center justify-between gap-4 flex-wrap">
        <button
          type="button"
          onClick={onReturnToProposal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#A64D68]/40 hover:border-[#A64D68] text-[#A64D68] hover:bg-[#F8DCE5]/30 text-xs sm:text-sm font-medium transition-all cursor-pointer"
          aria-label="Return to proposal option message"
        >
          <span>← Previous: Proposal Answer</span>
        </button>

        {onGoHome && (
          <button
            type="button"
            onClick={onGoHome}
            className="text-xs text-[#9A817B] hover:text-[#5A3545] underline cursor-pointer"
          >
            Return to Envelope
          </button>
        )}
      </div>
    </section>
  );
};
