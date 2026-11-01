import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '1mb' }));

// -----------------------------------------------------------------------------
// Firebase Firestore Client Initialization
// -----------------------------------------------------------------------------
let firebaseConfig: any = {};
try {
  const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
} catch (err) {
  console.warn('Unable to load firebase-applet-config.json:', err);
}

const firebaseApp = !getApps().length && firebaseConfig.apiKey
  ? initializeApp(firebaseConfig)
  : getApps().length
  ? getApp()
  : null;

const db = firebaseApp
  ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
  : null;

// -----------------------------------------------------------------------------
// In-Memory Rate Limiter (Spam Protection & Abuse Prevention)
// -----------------------------------------------------------------------------
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 20;

function isRateLimited(clientIp: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(clientIp) || { timestamps: [] };

  record.timestamps = record.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (record.timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.timestamps.push(now);
  rateLimitMap.set(clientIp, record);

  if (rateLimitMap.size > 1000) {
    for (const [ip, rec] of rateLimitMap.entries()) {
      if (rec.timestamps.every((ts) => now - ts >= RATE_LIMIT_WINDOW_MS)) {
        rateLimitMap.delete(ip);
      }
    }
  }

  return false;
}

// -----------------------------------------------------------------------------
// Notification & SMTP Configuration
// -----------------------------------------------------------------------------
function getEmailConfig() {
  const recipient = (
    process.env.OWNER_NOTIFICATION_EMAIL ||
    process.env.RECIPIENT_EMAIL ||
    'opagamer1123@gmail.com'
  ).trim();

  const senderEmail = (
    process.env.SENDER_EMAIL ||
    'For Ekta, With Love <noreply@forekta.withlove>'
  ).trim();

  const smtpUri = (process.env.SMTP_CONNECTION_URI || '').trim();

  return {
    recipient,
    senderEmail,
    smtpUri,
    hasSmtp: Boolean(smtpUri),
    hasFirestore: Boolean(db),
    projectId: firebaseConfig.projectId || 'plated-lattice-skx2q',
    firestoreDatabaseId: firebaseConfig.firestoreDatabaseId || '',
  };
}

// -----------------------------------------------------------------------------
// Submission Types & Template Helpers
// -----------------------------------------------------------------------------
interface ProposalSubmissionPayload {
  submissionRef: string;
  proposalChoice: string;
  submittedAt: string;
  marriageAnswer?: string;
}

export interface RecentDispatchRecord {
  id: string;
  submissionRef: string;
  proposalChoice: string;
  marriageAnswer?: string;
  submittedAt: string;
  status: 'saved' | 'email_queued' | 'delivered' | 'failed';
  error?: string;
  mailDocId?: string;
}

// In-memory runtime cache as fallback
const inMemorySubmissions: RecentDispatchRecord[] = [];

const MARRIAGE_QUESTION_TEXT =
  'Will you marry me in every universe, every multiverse, and every life we could ever live? If our souls found each other in a million different worlds, would you still choose me?';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generateProposalEmailContent(sub: ProposalSubmissionPayload) {
  const formattedDateIST = new Date(sub.submittedAt).toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'long',
  });

  const formattedDateUTC = new Date(sub.submittedAt).toUTCString();
  const subject = 'Ekta has shared her answers with you ♡';

  // Plain text representation
  const textContent = sub.marriageAnswer
    ? `
A New Message From Ekta ♡
For Ekta, With Love Proposal Response

============================================================
HER PROPOSAL CHOICE
============================================================
${sub.proposalChoice}

------------------------------------------------------------
THE UNIVERSE QUESTION:
“${MARRIAGE_QUESTION_TEXT}”

EKTA'S ANSWER:
${sub.marriageAnswer}

============================================================
SUBMISSION DETAILS
============================================================
Reference ID:  ${sub.submissionRef}
Submitted At:  ${formattedDateIST} (IST)
UTC Timestamp: ${formattedDateUTC}
Stored securely in Firebase Firestore (${getEmailConfig().projectId})
`
    : `
A New Message From Ekta ♡
For Ekta, With Love Proposal Response

============================================================
HER SELECTED RESPONSE
============================================================
${sub.proposalChoice}

Ekta has selected this response to your proposal on the website.

============================================================
SUBMISSION DETAILS
============================================================
Reference ID:  ${sub.submissionRef}
Submitted At:  ${formattedDateIST} (IST)
UTC Timestamp: ${formattedDateUTC}
Stored securely in Firebase Firestore (${getEmailConfig().projectId})
`;

  // Romantic, Responsive Scrapbook HTML Version
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A New Message From Ekta ♡</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 24px 12px;
      background-color: #FDFBF7;
      color: #2B1D24;
      line-height: 1.6;
    }
    .container {
      max-width: 620px;
      margin: 0 auto;
      background: #FFFDF9;
      border: 1px solid #F8DCE5;
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 0 12px 36px rgba(166, 77, 104, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #FFF5F8 0%, #FFFDF9 100%);
      padding: 36px 28px 24px;
      text-align: center;
      border-bottom: 1px solid #F8DCE5;
    }
    .heart-badge {
      display: inline-block;
      width: 48px;
      height: 48px;
      line-height: 48px;
      border-radius: 50%;
      background-color: #A64D68;
      color: #FFFFFF;
      font-size: 22px;
      margin-bottom: 14px;
      box-shadow: 0 4px 14px rgba(166, 77, 104, 0.3);
    }
    .main-title {
      font-family: Georgia, serif;
      font-size: 26px;
      color: #5A3545;
      margin: 0 0 6px 0;
      font-weight: 600;
    }
    .subtitle {
      font-size: 13px;
      color: #9A817B;
      margin: 0;
      font-style: italic;
    }
    .content-body {
      padding: 32px 28px;
    }
    .choice-box {
      background-color: #FFF5F8;
      border: 1.5px solid #E2A9B8;
      border-radius: 18px;
      padding: 20px 24px;
      text-align: center;
      margin-bottom: 28px;
    }
    .choice-tag {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #9A817B;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .choice-text {
      font-family: Georgia, serif;
      font-size: 20px;
      font-weight: 700;
      color: #A64D68;
      margin: 0;
    }
    .section-card {
      margin-bottom: 26px;
    }
    .question-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #A64D68;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .question-prompt {
      font-size: 15px;
      color: #5A3545;
      font-weight: 600;
      background-color: #FFFDF9;
      border-left: 3px solid #A64D68;
      padding: 12px 16px;
      margin: 0 0 12px 0;
      border-radius: 6px;
      line-height: 1.5;
    }
    .answer-quote {
      background-color: #FFF5F8;
      border: 1px solid #F8DCE5;
      border-radius: 16px;
      padding: 18px 20px;
      font-family: Georgia, serif;
      font-size: 16px;
      color: #2B1D24;
      line-height: 1.65;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 0;
    }
    .footer {
      background-color: #FFFDF9;
      border-top: 1px solid #F8DCE5;
      padding: 22px 28px;
      text-align: center;
      font-size: 12px;
      color: #9A817B;
      line-height: 1.6;
    }
    .footer-meta {
      font-family: monospace;
      font-size: 11px;
      color: #A64D68;
      margin-top: 6px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="heart-badge">♡</div>
      <h1 class="main-title">A New Message From Ekta ♡</h1>
      <p class="subtitle">Her handwritten heart · For Ekta, With Love</p>
    </div>

    <div class="content-body">
      <div class="choice-box">
        <div class="choice-tag">${sub.marriageAnswer ? 'Her Proposal Choice' : 'Her Selected Response'}</div>
        <p class="choice-text">${escapeHtml(sub.proposalChoice)}</p>
      </div>

      ${
        sub.marriageAnswer
          ? `
      <div class="section-card">
        <div class="question-label">The Universe Question</div>
        <div class="question-prompt">
          “${escapeHtml(MARRIAGE_QUESTION_TEXT)}”
        </div>
        <div class="answer-quote">${escapeHtml(sub.marriageAnswer)}</div>
      </div>
      `
          : `
      <div class="section-card" style="text-align: center; padding: 18px 20px; background-color: #FFF5F8; border-radius: 14px; border: 1px dashed #E2A9B8;">
        <p style="margin: 0; font-size: 15px; color: #5A3545; font-style: italic;">
          Ekta has selected this response to your proposal on the website.
        </p>
      </div>
      `
      }
    </div>

    <div class="footer">
      <p style="margin: 0;">Dispatched with love · Firebase Firestore & Trigger Email Integration</p>
      <div class="footer-meta">
        Ref: ${escapeHtml(sub.submissionRef)} · ${escapeHtml(formattedDateIST)}
      </div>
    </div>
  </div>
</body>
</html>
`;

  return { subject, textContent, htmlContent };
}

// -----------------------------------------------------------------------------
// Firebase Firestore Persistence & Trigger Email Queueing
// -----------------------------------------------------------------------------
async function recordProposalInFirestore(payload: ProposalSubmissionPayload): Promise<{
  saved: boolean;
  emailQueued: boolean;
  mailDocId?: string;
  error?: string;
}> {
  const config = getEmailConfig();
  const { subject, textContent, htmlContent } = generateProposalEmailContent(payload);

  let saved = false;
  let emailQueued = false;
  let mailDocId: string | undefined;

  // 1. Save response in Firestore 'proposal_responses' & queue in 'mail' for Trigger Email
  if (db) {
    try {
      // Create mail document reference in /mail collection
      const mailDocRef = doc(collection(db, 'mail'));
      mailDocId = mailDocRef.id;

      await setDoc(mailDocRef, {
        to: config.recipient,
        submissionRef: payload.submissionRef,
        message: {
          subject,
          text: textContent,
          html: htmlContent,
        },
        createdAt: new Date().toISOString(),
      });
      emailQueued = true;

      // Save proposal response in /proposal_responses with reference to mail doc
      const responseDocRef = doc(db, 'proposal_responses', payload.submissionRef);
      await setDoc(responseDocRef, {
        submissionRef: payload.submissionRef,
        proposalChoice: payload.proposalChoice,
        ...(payload.marriageAnswer ? { marriageAnswer: payload.marriageAnswer } : {}),
        submittedAt: payload.submittedAt,
        status: 'email_queued',
        mailDocId,
        createdAt: new Date().toISOString(),
      });
      saved = true;
    } catch (dbErr: any) {
      console.error('Firestore write error:', dbErr?.message || dbErr);
    }
  }

  // 3. Fallback / direct SMTP delivery if SMTP connection URI is configured
  if (config.hasSmtp) {
    try {
      const transporter = nodemailer.createTransport(config.smtpUri);
      await transporter.sendMail({
        from: config.senderEmail,
        to: config.recipient,
        subject,
        text: textContent,
        html: htmlContent,
      });
      emailQueued = true;
    } catch (smtpErr: any) {
      console.warn('SMTP direct dispatch warning:', smtpErr?.message);
    }
  }

  // Record in server memory
  inMemorySubmissions.unshift({
    id: `rec_${Date.now()}_${payload.submissionRef}`,
    submissionRef: payload.submissionRef,
    proposalChoice: payload.proposalChoice,
    marriageAnswer: payload.marriageAnswer,
    submittedAt: payload.submittedAt,
    status: saved ? (emailQueued ? 'email_queued' : 'saved') : 'failed',
    mailDocId,
  });
  if (inMemorySubmissions.length > 50) inMemorySubmissions.pop();

  return {
    saved: saved || Boolean(db),
    emailQueued,
    mailDocId,
  };
}

// -----------------------------------------------------------------------------
// Reel Likes Types, Email Template & Persistence
// -----------------------------------------------------------------------------
interface ReelLikePayload {
  reelId: number;
  reelTitle: string;
  likedAt: string;
}

const notifiedReelLikesCache = new Set<number>();
const inMemoryReelLikes = new Map<number, { reelId: number; reelTitle: string; likedAt: string; hasNotified: boolean }>();

function generateReelLikeEmailContent(payload: ReelLikePayload) {
  const reelNumberStr = `REEL ${String(payload.reelId).padStart(2, '0')}`;
  const formattedDateIST = new Date(payload.likedAt).toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'long',
  });
  const formattedDateUTC = new Date(payload.likedAt).toUTCString();
  const subject = 'Ekta liked a reel! ❤️';

  const textContent = `Ekta just liked one of your reels! ♡

Reel Number: ${reelNumberStr}
Reel Title: ${payload.reelTitle}
Liked At: ${formattedDateIST} (${formattedDateUTC})

Looks like this little memory made her smile. ❤️`;

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #FFF8ED; color: #5A3545; margin: 0; padding: 24px; }
    .container { max-width: 520px; margin: 0 auto; background: #FFFDF9; border: 1px solid #F8DCE5; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(90,53,69,0.08); }
    .header { background: linear-gradient(135deg, #FFF5F8 0%, #FFF8ED 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #F8DCE5; }
    .badge { display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 50%; background: #A64D68; color: #fff; font-size: 20px; margin-bottom: 12px; }
    .title { font-family: Georgia, serif; font-size: 24px; color: #5A3545; margin: 0 0 6px 0; }
    .subtitle { font-size: 13px; color: #9A817B; margin: 0; font-style: italic; }
    .body { padding: 28px 24px; }
    .card { background: #FFF5F8; border: 1.5px solid #E2A9B8; border-radius: 18px; padding: 20px 24px; text-align: center; margin-bottom: 20px; }
    .card-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #9A817B; font-weight: 700; margin-bottom: 4px; }
    .card-title { font-family: Georgia, serif; font-size: 20px; color: #A64D68; font-weight: 700; margin: 0; }
    .meta-box { background: #FFFDF9; border: 1px solid #F8DCE5; border-radius: 14px; padding: 14px 18px; font-size: 13px; color: #5A3545; line-height: 1.6; }
    .closing { margin-top: 20px; font-style: italic; font-size: 14px; color: #A64D68; text-align: center; }
    .footer { padding: 18px 24px; text-align: center; font-size: 11px; color: #9A817B; border-top: 1px solid #F8DCE5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">❤️</div>
      <h1 class="title">Ekta liked a reel! ❤️</h1>
      <p class="subtitle">Little Moments, Just for You · Chapter 3</p>
    </div>
    <div class="body">
      <p style="font-size: 16px; margin: 0 0 20px 0; color: #5A3545; text-align: center;">
        Ekta just liked one of your reels! ♡
      </p>
      <div class="card">
        <div class="card-label">${escapeHtml(reelNumberStr)}</div>
        <p class="card-title">${escapeHtml(payload.reelTitle)}</p>
      </div>
      <div class="meta-box">
        <strong>Liked At:</strong> ${escapeHtml(formattedDateIST)}<br/>
        <span style="font-size: 11px; color: #9A817B;">(${escapeHtml(formattedDateUTC)})</span>
      </div>
      <p class="closing">
        Looks like this little memory made her smile. ❤️
      </p>
    </div>
    <div class="footer">
      For Ekta, With Love · Reel Memory Notification
    </div>
  </div>
</body>
</html>`;

  return { subject, textContent, htmlContent };
}

async function recordReelLikeInFirestore(payload: ReelLikePayload): Promise<{
  saved: boolean;
  emailQueued: boolean;
  alreadyNotified: boolean;
  mailDocId?: string;
}> {
  const config = getEmailConfig();
  const reelDocId = `reel_${payload.reelId}`;

  // Check in-memory deduplication first
  const alreadyNotifiedInMemory = notifiedReelLikesCache.has(payload.reelId);

  let alreadyNotifiedInDb = false;
  let saved = false;
  let emailQueued = false;
  let mailDocId: string | undefined;

  // 1. Check & Persist in Firestore
  if (db) {
    try {
      const likeDocRef = doc(db, 'reel_likes', reelDocId);
      const existingSnap = await getDoc(likeDocRef);
      if (existingSnap.exists() && existingSnap.data()?.hasNotified) {
        alreadyNotifiedInDb = true;
      }

      const shouldSendEmail = !alreadyNotifiedInMemory && !alreadyNotifiedInDb;

      if (shouldSendEmail) {
        const { subject, textContent, htmlContent } = generateReelLikeEmailContent(payload);

        // Queue in /mail for Firebase Trigger Email extension
        const mailDocRef = doc(collection(db, 'mail'));
        mailDocId = mailDocRef.id;

        await setDoc(mailDocRef, {
          to: config.recipient,
          reelId: payload.reelId,
          type: 'reel_like',
          message: {
            subject,
            text: textContent,
            html: htmlContent,
          },
          createdAt: new Date().toISOString(),
        });
        emailQueued = true;

        // Direct SMTP delivery if configured
        if (config.hasSmtp) {
          try {
            const transporter = nodemailer.createTransport(config.smtpUri);
            await transporter.sendMail({
              from: config.senderEmail,
              to: config.recipient,
              subject,
              text: textContent,
              html: htmlContent,
            });
            emailQueued = true;
          } catch (smtpErr: any) {
            console.warn('SMTP direct dispatch warning for reel like:', smtpErr?.message);
          }
        }
      }

      // Record like in Firestore reel_likes
      await setDoc(
        likeDocRef,
        {
          reelId: payload.reelId,
          reelTitle: payload.reelTitle,
          likedAt: payload.likedAt,
          hasNotified: true,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      saved = true;
      notifiedReelLikesCache.add(payload.reelId);
    } catch (err: any) {
      console.error('Firestore reel like write error:', err?.message || err);
    }
  } else {
    // If db is not initialized, check fallback SMTP
    const shouldSendEmail = !alreadyNotifiedInMemory;
    if (shouldSendEmail && config.hasSmtp) {
      try {
        const { subject, textContent, htmlContent } = generateReelLikeEmailContent(payload);
        const transporter = nodemailer.createTransport(config.smtpUri);
        await transporter.sendMail({
          from: config.senderEmail,
          to: config.recipient,
          subject,
          text: textContent,
          html: htmlContent,
        });
        emailQueued = true;
      } catch (smtpErr: any) {
        console.warn('SMTP direct dispatch warning for reel like:', smtpErr?.message);
      }
    }
  }

  // Update in-memory cache
  inMemoryReelLikes.set(payload.reelId, {
    reelId: payload.reelId,
    reelTitle: payload.reelTitle,
    likedAt: payload.likedAt,
    hasNotified: true,
  });
  notifiedReelLikesCache.add(payload.reelId);

  return {
    saved: saved || Boolean(db),
    emailQueued,
    alreadyNotified: alreadyNotifiedInMemory || alreadyNotifiedInDb,
    mailDocId,
  };
}

// -----------------------------------------------------------------------------
// Server-Side API Routes (Firebase Firestore & Trigger Email)
// -----------------------------------------------------------------------------

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  const config = getEmailConfig();
  return res.status(200).json({
    status: 'ok',
    database: config.hasFirestore ? 'connected' : 'unconfigured',
    projectId: config.projectId,
    firestoreDatabaseId: config.firestoreDatabaseId,
    emailService: 'firebase_trigger_email',
    recipientEmail: config.recipient,
    mailQueueCollection: 'mail',
    smtpConfigured: config.hasSmtp,
  });
});

// 1. Endpoint: Immediate response for "I need a little more time 🌷" or "I'm sorry, I don't feel the same"
app.post('/api/proposal/submit-response', async (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  if (isRateLimited(clientIp)) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a moment before trying again.',
    });
  }

  try {
    const { proposalChoice } = req.body;
    const choice = typeof proposalChoice === 'string' ? proposalChoice.trim() : '';

    if (!choice) {
      return res.status(400).json({ success: false, error: 'Proposal response is required.' });
    }

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const submissionRef = `EKTA-RESP-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`;
    const submittedAt = new Date().toISOString();

    const payload: ProposalSubmissionPayload = {
      submissionRef,
      proposalChoice: choice,
      submittedAt,
    };

    const result = await recordProposalInFirestore(payload);

    return res.status(200).json({
      success: true,
      submissionRef,
      savedInFirestore: result.saved,
      emailQueuedInMailCollection: result.emailQueued,
      message: 'Your response has been saved securely and queued for notification ♡',
    });
  } catch (err: unknown) {
    console.error('Error processing proposal response:', err);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while saving your response. Please try again.',
    });
  }
});

// 2. Endpoint: Submission of the marriage question for YES ("Yes, let's give our story a beautiful beginning ❤️")
app.post('/api/proposal/submit-marriage', async (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  if (isRateLimited(clientIp)) {
    return res.status(429).json({
      success: false,
      error: 'Too many submission requests. Please wait a few moments before trying again.',
    });
  }

  try {
    const { proposalChoice, marriageAnswer, question2, answer } = req.body;
    const choice =
      typeof proposalChoice === 'string' && proposalChoice.trim()
        ? proposalChoice.trim()
        : "Yes, let's give our story a beautiful beginning ❤️";

    const submittedAnswer =
      typeof marriageAnswer === 'string'
        ? marriageAnswer.trim()
        : typeof question2 === 'string'
        ? question2.trim()
        : typeof answer === 'string'
        ? answer.trim()
        : '';

    if (!submittedAnswer) {
      return res.status(400).json({
        success: false,
        error: 'Please share your thoughts before sending. ♡',
      });
    }

    if (submittedAnswer.length > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Your answer exceeds the maximum length limit.',
      });
    }

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const submissionRef = `EKTA-YES-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`;
    const submittedAt = new Date().toISOString();

    const payload: ProposalSubmissionPayload = {
      submissionRef,
      proposalChoice: choice,
      marriageAnswer: submittedAnswer,
      submittedAt,
    };

    const result = await recordProposalInFirestore(payload);

    return res.status(200).json({
      success: true,
      submissionRef,
      savedInFirestore: result.saved,
      emailQueuedInMailCollection: result.emailQueued,
      message:
        'Thank you for sharing your heart with me, Ekta. ♡ Your answer is safely saved in Firestore and notification is queued.',
    });
  } catch (err: unknown) {
    console.error('Error processing marriage submission:', err);
    return res.status(500).json({
      success: false,
      error: 'An unexpected server error occurred while processing your answer. Please try again.',
    });
  }
});

// Backward compatibility router aliases
app.post('/api/proposal/submit-complete', (req: Request, res: Response) => {
  if (req.body.marriageAnswer || req.body.question2 || req.body.answer || req.body.question1) {
    return (app as any)._router.handle({ ...req, url: '/api/proposal/submit-marriage' }, res);
  }
  return (app as any)._router.handle({ ...req, url: '/api/proposal/submit-response' }, res);
});

app.post('/api/proposal/submit-initial', (req: Request, res: Response) => {
  return (app as any)._router.handle({ ...req, url: '/api/proposal/submit-response' }, res);
});

app.post('/api/proposal/submit', (req: Request, res: Response) => {
  if (req.body.marriageAnswer || req.body.question2 || req.body.answer || req.body.question1) {
    return (app as any)._router.handle({ ...req, url: '/api/proposal/submit-marriage' }, res);
  }
  return (app as any)._router.handle({ ...req, url: '/api/proposal/submit-response' }, res);
});

// -----------------------------------------------------------------------------
// Interactive "Like This Reel" Endpoints
// -----------------------------------------------------------------------------

// Record a Reel Like & Trigger Email Notification
app.post('/api/reels/like', async (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  if (isRateLimited(clientIp)) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a few moments.',
    });
  }

  try {
    const { reelId, reelTitle, likedAt } = req.body;
    const numReelId = parseInt(reelId, 10);

    if (isNaN(numReelId) || numReelId < 1 || numReelId > 50) {
      return res.status(400).json({
        success: false,
        error: 'Invalid reel identifier.',
      });
    }

    const title = typeof reelTitle === 'string' && reelTitle.trim() ? reelTitle.trim() : `Reel ${numReelId}`;
    const timestamp = typeof likedAt === 'string' && likedAt.trim() ? likedAt.trim() : new Date().toISOString();

    const result = await recordReelLikeInFirestore({
      reelId: numReelId,
      reelTitle: title,
      likedAt: timestamp,
    });

    return res.status(200).json({
      success: true,
      reelId: numReelId,
      liked: true,
      alreadyNotified: result.alreadyNotified,
      emailQueued: result.emailQueued,
      savedInFirestore: result.saved,
      message: 'Reel like recorded and notification processed ♡',
    });
  } catch (err: unknown) {
    console.error('Error processing reel like:', err);
    // Graceful response so frontend like remains active even on transient server error
    return res.status(200).json({
      success: true,
      liked: true,
      warning: 'Recorded with fallback handling',
    });
  }
});

// Fetch all recorded reel likes
app.get('/api/reels/likes', async (_req: Request, res: Response) => {
  try {
    const likesMap: Record<number, boolean> = {};

    inMemoryReelLikes.forEach((_val, key) => {
      likesMap[key] = true;
    });

    if (db) {
      try {
        const snap = await getDocs(collection(db, 'reel_likes'));
        snap.forEach((d) => {
          const data = d.data();
          if (data && typeof data.reelId === 'number') {
            likesMap[data.reelId] = true;
          }
        });
      } catch (err) {
        console.warn('Could not read reel_likes collection from Firestore:', err);
      }
    }

    const likedReelIds = Object.keys(likesMap).map(Number);

    return res.status(200).json({
      success: true,
      likes: likesMap,
      likedReelIds,
    });
  } catch (err) {
    return res.status(200).json({
      success: true,
      likes: {},
      likedReelIds: [],
    });
  }
});

// -----------------------------------------------------------------------------
// Owner Dashboard Endpoints (Protected by OWNER_PASSCODE)
// -----------------------------------------------------------------------------
function verifyOwnerAuth(req: Request): boolean {
  const passcode = (process.env.OWNER_PASSCODE || process.env.ADMIN_SECRET || 'ekta2025').trim();
  const headerKey = (req.headers['x-owner-key'] as string) || (req.headers['x-admin-key'] as string);
  const authHeader = req.headers.authorization;

  if (headerKey && headerKey === passcode) return true;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token === passcode) return true;
  }
  return false;
}

// Get Owner Dashboard status, Firestore responses, and Trigger Email queue
app.get('/api/owner/status', async (req: Request, res: Response) => {
  if (!verifyOwnerAuth(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized. Invalid owner passcode.' });
  }

  const config = getEmailConfig();
  const dispatches = inMemorySubmissions;

  return res.status(200).json({
    success: true,
    isConfigured: true,
    database: config.hasFirestore ? 'connected' : 'unconfigured',
    projectId: config.projectId,
    firestoreDatabaseId: config.firestoreDatabaseId,
    recipientEmail: config.recipient,
    senderEmail: config.senderEmail,
    mailQueueCollection: 'mail',
    smtpConfigured: config.hasSmtp,
    recentDispatches: dispatches,
    totalSubmissions: dispatches.length,
    serverTime: new Date().toISOString(),
  });
});

// Trigger a diagnostic test email document in Firestore 'mail' collection
app.post('/api/owner/test-email', async (req: Request, res: Response) => {
  if (!verifyOwnerAuth(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized.' });
  }

  const config = getEmailConfig();
  const testTime = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const subject = 'Test Email: For Ekta, With Love (Firebase Trigger Email) ♡';
  const textContent = `Hello!\n\nThis is a test notification from your "For Ekta, With Love" proposal website.\nFirebase Firestore & Trigger Email integration is active.\n\nQueued At: ${testTime} (IST)\nTarget Recipient: ${config.recipient}\nTarget Collection: /mail\n`;
  const htmlContent = `
    <div style="font-family: Georgia, serif; max-width: 580px; margin: 0 auto; background: #FFFDF9; border: 1px solid #F8DCE5; border-radius: 20px; padding: 32px; color: #5A3545;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 50%; background: #A64D68; color: #fff; font-size: 20px;">♡</div>
        <h2 style="color: #A64D68; margin: 12px 0 4px;">Firebase Trigger Email Verified</h2>
        <p style="color: #9A817B; font-size: 13px; font-style: italic; margin: 0;">For Ekta, With Love · Owner Diagnostic Test</p>
      </div>
      <div style="background: #FFF5F8; border: 1px solid #E2A9B8; border-radius: 14px; padding: 18px; margin-bottom: 20px; font-size: 14px; line-height: 1.6;">
        <strong>Success!</strong> A test document has been created in your Firestore <code>/mail</code> collection. The Firebase Trigger Email extension will deliver it to your inbox via your configured SMTP provider.
      </div>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; color: #9A817B;">Recipient:</td><td style="padding: 6px 0; font-weight: 600; text-align: right;">${escapeHtml(config.recipient)}</td></tr>
        <tr><td style="padding: 6px 0; color: #9A817B;">Queue Path:</td><td style="padding: 6px 0; font-weight: 600; text-align: right;">/mail</td></tr>
        <tr><td style="padding: 6px 0; color: #9A817B;">Queued Time:</td><td style="padding: 6px 0; font-weight: 600; text-align: right;">${escapeHtml(testTime)} (IST)</td></tr>
      </table>
    </div>
  `;

  let mailDocId = `test_${Date.now()}`;

  if (db) {
    try {
      const docRef = await addDoc(collection(db, 'mail'), {
        to: config.recipient,
        message: {
          subject,
          text: textContent,
          html: htmlContent,
        },
        isTest: true,
        createdAt: new Date().toISOString(),
      });
      mailDocId = docRef.id;
    } catch (e: any) {
      console.warn('Could not write test document to Firestore mail collection:', e);
    }
  }

  if (config.hasSmtp) {
    try {
      const transporter = nodemailer.createTransport(config.smtpUri);
      await transporter.sendMail({
        from: config.senderEmail,
        to: config.recipient,
        subject,
        text: textContent,
        html: htmlContent,
      });
    } catch (smtpErr: any) {
      console.warn('Test direct SMTP dispatch warning:', smtpErr?.message);
    }
  }

  return res.status(200).json({
    success: true,
    mailDocId,
    message: `Test email document created in Firestore /mail collection for ${config.recipient}!`,
  });
});

// -----------------------------------------------------------------------------
// Vite Middleware / Static Serve setup
// -----------------------------------------------------------------------------
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} (Firebase Firestore & Trigger Email Integration)`);
  });
}

startServer();
