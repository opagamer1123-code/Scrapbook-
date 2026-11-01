import React from 'react';
import { X, ShieldCheck, Database, Lock, Mail } from 'lucide-react';

interface PrivacyNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyNoticeModal: React.FC<PrivacyNoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#5A3545]/45 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
    >
      <div className="bg-[#FFFDF9] rounded-3xl max-w-lg w-full border border-[#F8DCE5] shadow-2xl p-6 sm:p-8 relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#5A3545]/60 hover:text-[#5A3545] rounded-full hover:bg-[#F8DCE5]/40 transition-colors"
          aria-label="Close privacy notice"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-[#F8DCE5] text-[#A64D68] flex items-center justify-center mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <h3 id="privacy-modal-title" className="font-serif text-2xl text-[#5A3545] font-semibold mb-2">
          Privacy & Data Disclosure
        </h3>
        <p className="text-xs text-[#5A3545]/70 mb-5">
          We believe in complete honesty and transparency regarding how your notes and answers are stored.
        </p>

        <div className="space-y-4 text-xs sm:text-sm text-[#5A3545]/85">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FFF8ED] border border-[#F8DCE5]">
            <Lock className="w-4 h-4 text-[#A64D68] shrink-0 mt-0.5" />
            <div>
              <strong className="block text-[#5A3545] font-semibold mb-0.5">
                Local Scrapbook Notes
              </strong>
              <span>
                Personal sticky notes in the Notes chapter remain saved privately in your device's browser <code className="bg-[#F8DCE5]/40 px-1 py-0.5 rounded text-[11px]">localStorage</code>.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FFF8ED] border border-[#F8DCE5]">
            <Database className="w-4 h-4 text-[#A64D68] shrink-0 mt-0.5" />
            <div>
              <strong className="block text-[#5A3545] font-semibold mb-0.5">
                Secure Firebase Firestore Storage
              </strong>
              <span>
                When Ekta submits her proposal response or marriage question answer, it is securely stored in Firebase Firestore with hardened security rules preventing unauthorized public access.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FFF8ED] border border-[#F8DCE5]">
            <Mail className="w-4 h-4 text-[#A64D68] shrink-0 mt-0.5" />
            <div>
              <strong className="block text-[#5A3545] font-semibold mb-0.5">
                Firebase Trigger Email Integration
              </strong>
              <span>
                An email notification containing Ekta's chosen response and handwritten answer is queued in Firestore and dispatched to the website author via Trigger Email and SMTP.
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#F8DCE5] text-right">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#A64D68] hover:bg-[#8E3E56] text-white text-xs sm:text-sm font-medium transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
