import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Loader2,
  KeyRound,
  Inbox,
  ShieldCheck,
  Database,
  UserCheck,
  LogIn,
  LogOut,
} from 'lucide-react';
import { auth, db } from '../firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';

interface OwnerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RecentDispatch {
  id: string;
  submissionRef: string;
  proposalChoice: string;
  marriageAnswer?: string;
  question1?: string;
  question2?: string;
  submittedAt: string;
  status: 'saved' | 'email_queued' | 'delivered' | 'failed' | 'dispatched';
  error?: string;
  mailDocId?: string;
}

interface OwnerStatusResponse {
  success: boolean;
  isConfigured: boolean;
  database: string;
  projectId: string;
  firestoreDatabaseId: string;
  recipientEmail: string;
  senderEmail: string;
  mailQueueCollection: string;
  smtpConfigured: boolean;
  recentDispatches: RecentDispatch[];
  totalSubmissions: number;
  serverTime: string;
}

export const OwnerDashboardModal: React.FC<OwnerDashboardModalProps> = ({ isOpen, onClose }) => {
  const [passcode, setPasscode] = useState(() => {
    return sessionStorage.getItem('owner_dashboard_passcode') || '';
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem('owner_dashboard_unlocked') === 'true';
  });
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'status' | 'dispatches' | 'preview'>('status');
  const [isLoading, setIsLoading] = useState(false);
  const [statusData, setStatusData] = useState<OwnerStatusResponse | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Firebase Auth state for Owner
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [directFirestoreSubmissions, setDirectFirestoreSubmissions] = useState<RecentDispatch[]>([]);

  // Test email state
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && user.email === 'opagamer1123@gmail.com') {
        setIsUnlocked(true);
        loadDirectFromFirestore();
      }
    });
    return () => unsubscribe();
  }, []);

  const loadDirectFromFirestore = async () => {
    try {
      const q = query(
        collection(db, 'proposal_responses'),
        orderBy('submittedAt', 'desc'),
        limit(25)
      );
      const snap = await getDocs(q);
      const items: RecentDispatch[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setDirectFirestoreSubmissions(items);
    } catch (err) {
      console.warn('Direct Firestore query note:', err);
    }
  };

  // Fetch status once unlocked
  const fetchStatus = async (keyToUse: string) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/owner/status', {
        headers: {
          'x-owner-key': keyToUse,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusData(data);
        setIsUnlocked(true);
        sessionStorage.setItem('owner_dashboard_unlocked', 'true');
        sessionStorage.setItem('owner_dashboard_passcode', keyToUse);
      } else {
        setIsUnlocked(false);
        setUnlockError(data.error || 'Incorrect passcode. Please try again.');
      }
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : 'Failed to connect to owner endpoint.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && (isUnlocked || currentUser) && passcode) {
      fetchStatus(passcode);
    }
  }, [isOpen]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError(null);
    const trimmed = passcodeInput.trim();
    if (!trimmed) {
      setUnlockError('Please enter the owner passcode.');
      return;
    }
    setPasscode(trimmed);
    fetchStatus(trimmed);
  };

  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    setUnlockError(null);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      if (cred.user.email === 'opagamer1123@gmail.com') {
        setIsUnlocked(true);
        sessionStorage.setItem('owner_dashboard_unlocked', 'true');
        await loadDirectFromFirestore();
        if (passcode) fetchStatus(passcode);
      }
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      setUnlockError(err?.message || 'Could not complete Google sign in.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setDirectFirestoreSubmissions([]);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  const handleSendTestEmail = async () => {
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/owner/test-email', {
        method: 'POST',
        headers: {
          'x-owner-key': passcode || 'ekta2025',
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || 'Test document added to /mail queue for Trigger Email extension!',
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Failed to queue test email document.',
        });
      }
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Network error queueing test email.',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  if (!isOpen) return null;

  // Active submissions list (prefer direct Firestore if owner authenticated with Google, else server session)
  const displaySubmissions =
    directFirestoreSubmissions.length > 0
      ? directFirestoreSubmissions
      : statusData?.recentDispatches || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-[#FFFDF9] rounded-3xl border border-[#F8DCE5] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col paper-pattern">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#F8DCE5] flex items-center justify-between bg-gradient-to-r from-[#FFF5F8] to-[#FFFDF9]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#A64D68] text-white flex items-center justify-center shadow-xs">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-[#5A3545]">
                Owner's Dashboard
              </h3>
              <p className="text-[11px] text-[#9A817B]">
                Firebase Firestore & Trigger Email Integration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F8DCE5]/50 text-[#5A3545] transition-colors cursor-pointer"
            aria-label="Close dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!isUnlocked && !currentUser ? (
            /* Passcode Unlock Screen */
            <div className="py-6 max-w-sm mx-auto text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#FFF5F8] border border-[#E2A9B8] text-[#A64D68] flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-6 h-6" />
              </div>

              <div>
                <h4 className="font-heading text-xl font-bold text-[#5A3545]">
                  Owner Authentication
                </h4>
                <p className="text-xs text-[#9A817B] mt-1">
                  Enter the owner passcode or sign in with Google to access Firestore submissions.
                </p>
              </div>

              <form onSubmit={handleUnlock} className="space-y-3 pt-2">
                <div>
                  <input
                    type="password"
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                    placeholder="Enter owner passcode"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#F8DCE5] bg-white text-sm focus:border-[#A64D68] focus:ring-2 focus:ring-[#A64D68]/20 outline-hidden font-mono text-center"
                    autoFocus
                  />
                </div>

                {unlockError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-1.5 justify-center">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{unlockError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#A64D68] to-[#8E3E56] hover:from-[#8E3E56] hover:to-[#5A3545] text-white text-sm font-medium transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Unlock with Passcode</span>
                    </>
                  )}
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[#F8DCE5]" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-[#FFFDF9] px-2 text-[#9A817B]">or</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isAuthLoading}
                  className="w-full py-2.5 rounded-xl border border-[#F8DCE5] hover:bg-[#FFF5F8] text-[#5A3545] text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isAuthLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#A64D68]" />
                  ) : (
                    <LogIn className="w-4 h-4 text-[#A64D68]" />
                  )}
                  <span>Sign in as Owner (opagamer1123@gmail.com)</span>
                </button>

                <p className="text-[11px] text-[#9A817B] italic">
                  Default passcode: <code className="font-mono text-[#A64D68]">ekta2025</code>
                </p>
              </form>
            </div>
          ) : (
            /* Unlocked Dashboard Content */
            <>
              {/* Owner account banner */}
              {currentUser && (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Signed in as Owner: <strong>{currentUser.email}</strong> (Full Firestore Access)</span>
                  </div>
                  <button
                    onClick={handleGoogleSignOut}
                    className="underline text-emerald-900 font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex border-b border-[#F8DCE5] text-xs gap-2">
                <button
                  onClick={() => setActiveTab('status')}
                  className={`px-3 py-1.5 rounded-t-xl font-medium transition-colors cursor-pointer ${
                    activeTab === 'status'
                      ? 'bg-[#A64D68] text-white'
                      : 'text-[#9A817B] hover:text-[#5A3545] hover:bg-[#F8DCE5]/30'
                  }`}
                >
                  Firebase & SMTP Status
                </button>
                <button
                  onClick={() => setActiveTab('dispatches')}
                  className={`px-3 py-1.5 rounded-t-xl font-medium transition-colors cursor-pointer ${
                    activeTab === 'dispatches'
                      ? 'bg-[#A64D68] text-white'
                      : 'text-[#9A817B] hover:text-[#5A3545] hover:bg-[#F8DCE5]/30'
                  }`}
                >
                  Submissions ({displaySubmissions.length})
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-t-xl font-medium transition-colors cursor-pointer ${
                    activeTab === 'preview'
                      ? 'bg-[#A64D68] text-white'
                      : 'text-[#9A817B] hover:text-[#5A3545] hover:bg-[#F8DCE5]/30'
                  }`}
                >
                  Email Template Preview
                </button>
              </div>

              {/* TAB 1: Status & Test */}
              {activeTab === 'status' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Status Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-[#FFF8ED] border border-[#F8DCE5] space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-[#9A817B] font-bold">
                        Firebase Project & Firestore
                      </span>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-sm font-semibold text-emerald-800">
                          Firestore Connected
                        </span>
                      </div>
                      <p className="text-[11px] text-[#9A817B] font-mono truncate">
                        Project: {statusData?.projectId || 'plated-lattice-skx2q'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FFF8ED] border border-[#F8DCE5] space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-[#9A817B] font-bold">
                        Notification Recipient
                      </span>
                      <div className="text-sm font-semibold text-[#5A3545] truncate font-mono">
                        {statusData?.recipientEmail || 'opagamer1123@gmail.com'}
                      </div>
                      <p className="text-[11px] text-[#9A817B]">
                        Configured via OWNER_NOTIFICATION_EMAIL.
                      </p>
                    </div>
                  </div>

                  {/* Trigger Email Extension Setup Guide */}
                  <div className="p-4 rounded-2xl bg-[#FFF8ED] border border-[#F8DCE5] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-[#9A817B] font-bold">
                        Firebase Trigger Email Extension (firestore-send-email)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold font-mono">
                        Queue: /mail
                      </span>
                    </div>
                    <p className="text-xs text-[#5A3545] leading-relaxed">
                      Whenever Ekta submits her proposal response, this website writes a document into Firestore collection <code className="text-[#A64D68] font-bold">/proposal_responses</code> and queues an email document in <code className="text-[#A64D68] font-bold">/mail</code>.
                    </p>
                    <div className="p-3 bg-white/80 rounded-xl border border-[#F8DCE5] text-[11px] text-[#5A3545] space-y-1.5">
                      <p className="font-semibold text-[#A64D68]">Required SMTP Configuration for Trigger Email Extension:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-[#9A817B]">
                        <li><strong className="text-[#5A3545]">SMTP connection URI:</strong> <code className="font-mono text-[10px]">smtps://username:password@smtp.example.com:465</code></li>
                        <li><strong className="text-[#5A3545]">Email documents collection:</strong> <code className="font-mono text-[10px]">mail</code></li>
                        <li><strong className="text-[#5A3545]">Default FROM address:</strong> <code className="font-mono text-[10px]">For Ekta, With Love &lt;noreply@...&gt;</code></li>
                        <li><strong className="text-[#5A3545]">Supported providers:</strong> SendGrid, Mailgun, AWS SES, Postmark, or Gmail SMTP App Passwords.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Test Email Action Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-[#FFF5F8] to-[#FFFDF9] border border-[#E2A9B8] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-heading text-sm text-[#5A3545] font-semibold">
                          Queue Test Email in Firestore /mail
                        </h4>
                        <p className="text-xs text-[#9A817B]">
                          Writes a test email document to the Firestore Trigger Email collection for {statusData?.recipientEmail || 'your email'}.
                        </p>
                      </div>
                      <Mail className="w-5 h-5 text-[#A64D68]" />
                    </div>

                    <button
                      type="button"
                      onClick={handleSendTestEmail}
                      disabled={isSendingTest}
                      className="px-4 py-2.5 rounded-2xl bg-[#A64D68] hover:bg-[#8E3E56] text-white text-xs font-medium transition-colors shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSendingTest ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Queueing document in /mail...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Queue Test Document</span>
                        </>
                      )}
                    </button>

                    {testResult && (
                      <div
                        className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                          testResult.success
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}
                      >
                        {testResult.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <span>{testResult.message}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: Dispatches Log (Live Firestore Submissions) */}
              {activeTab === 'dispatches' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-heading text-sm text-[#5A3545] font-semibold">
                        Firestore Submissions (/proposal_responses)
                      </h4>
                      <p className="text-[11px] text-[#9A817B]">
                        Stored persistently in Firestore and queued for Trigger Email notification.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (currentUser) loadDirectFromFirestore();
                        if (passcode) fetchStatus(passcode);
                      }}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#F8DCE5] hover:bg-[#F8DCE5]/30 text-xs text-[#5A3545] transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {displaySubmissions.length > 0 ? (
                    <div className="space-y-3">
                      {displaySubmissions.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl bg-[#FFF8ED] border border-[#F8DCE5] space-y-3"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="font-mono text-xs text-[#A64D68] font-bold">
                              {item.submissionRef || item.id}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                                item.status === 'email_queued' || item.status === 'saved' || item.status === 'dispatched'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {item.status === 'email_queued'
                                ? 'Saved in Firestore & Email Queued'
                                : item.status === 'saved'
                                ? 'Saved in Firestore'
                                : 'Received'}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-[#FFF5F8] border border-[#E2A9B8] text-xs font-semibold text-[#A64D68]">
                            Choice: {item.proposalChoice}
                          </div>

                          <div className="space-y-2 text-xs">
                            {item.marriageAnswer ? (
                              <div>
                                <strong className="text-[11px] text-[#A64D68] block">The Universe Question Answer:</strong>
                                <p className="font-letter text-sm text-[#2B1D24] italic bg-white/70 p-2.5 rounded-xl border border-[#F8DCE5] whitespace-pre-wrap">
                                  {item.marriageAnswer}
                                </p>
                              </div>
                            ) : (
                              <p className="text-xs text-[#9A817B] italic">
                                Immediate proposal response recorded in Firestore and queued for Trigger Email.
                              </p>
                            )}
                          </div>

                          <div className="text-[10px] text-[#9A817B] flex items-center justify-between pt-1 border-t border-[#F8DCE5]">
                            <span>Submitted: {new Date(item.submittedAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} (IST)</span>
                            {item.error && <span className="text-rose-600">{item.error}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center space-y-3 bg-[#FFFDF9] rounded-2xl border border-dashed border-[#E2A9B8] p-6">
                      <Inbox className="w-10 h-10 text-[#A64D68]/40 mx-auto" />
                      <div className="max-w-xs mx-auto">
                        <p className="text-sm font-medium text-[#5A3545]">
                          No submissions recorded in this view yet
                        </p>
                        <p className="text-xs text-[#9A817B] mt-1">
                          When Ekta chooses a response, it will be stored in Firestore and queued for email delivery to your inbox.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Email Preview */}
              {activeTab === 'preview' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="text-xs text-[#9A817B]">
                    This is what the email looks like in your inbox when delivered by the Trigger Email extension:
                  </div>

                  <div className="border border-[#F8DCE5] rounded-2xl overflow-hidden bg-white shadow-xs">
                    <div className="bg-[#FFF5F8] p-4 text-center border-b border-[#F8DCE5]">
                      <div className="w-8 h-8 rounded-full bg-[#A64D68] text-white flex items-center justify-center mx-auto text-xs mb-1">
                        ♡
                      </div>
                      <h4 className="font-heading text-base text-[#5A3545] font-bold">
                        A New Message From Ekta ♡
                      </h4>
                      <p className="text-[11px] text-[#9A817B] italic">
                        Her handwritten heart · For Ekta, With Love
                      </p>
                    </div>

                    <div className="p-4 space-y-3 text-xs">
                      <div className="p-3 rounded-xl bg-[#FFF5F8] border border-[#E2A9B8] text-center">
                        <span className="text-[10px] uppercase font-bold text-[#9A817B] block">
                          Her Proposal Choice
                        </span>
                        <span className="font-bold text-[#A64D68] text-sm">
                          Yes, let's give our story a beautiful beginning ❤️
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#FFFDF9] border border-[#F8DCE5] space-y-1">
                        <span className="text-[10px] font-bold text-[#A64D68] uppercase">The Universe Question</span>
                        <p className="font-medium text-[#5A3545] text-[11px]">
                          “Will you marry me in every universe, every multiverse, and every life we could ever live? If our souls found each other in a million different worlds, would you still choose me?”
                        </p>
                        <p className="font-letter text-xs text-[#2B1D24] italic bg-[#FFF5F8] p-2 rounded-lg">
                          (Ekta's complete handwritten thoughts for the universe question...)
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#FFFDF9] p-3 text-center border-t border-[#F8DCE5] text-[10px] text-[#9A817B]">
                      Dispatched with love · Firebase Firestore & Trigger Email Integration
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#F8DCE5] bg-[#FFFDF9] flex items-center justify-between text-xs text-[#9A817B]">
          <span className="font-handwriting text-sm text-[#A64D68]">
            For Ekta, With Love · Owner Panel
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-[#A64D68] hover:bg-[#8E3E56] text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
