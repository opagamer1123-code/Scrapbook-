const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Cloud Function triggered on new proposal response in Firestore.
 * Automatically ensures an email document is queued in the 'mail' collection
 * for the Firebase Trigger Email extension to deliver via SMTP.
 */
exports.onProposalSubmitted = functions.firestore
  .document('proposal_responses/{responseId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const responseId = context.params.responseId;

    const recipient = process.env.OWNER_NOTIFICATION_EMAIL || 'opagamer1123@gmail.com';
    const submittedAt = data.submittedAt || new Date().toISOString();

    const formattedDateIST = new Date(submittedAt).toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'long',
    });

    const isYes = data.proposalChoice && data.proposalChoice.toLowerCase().includes('yes');
    const subject = 'Ekta has shared her answers with you ♡';

    const plainText = data.marriageAnswer
      ? `A New Message From Ekta ♡\n\nHER PROPOSAL CHOICE:\n${data.proposalChoice}\n\nTHE UNIVERSE QUESTION:\n"Will you marry me in every universe, every multiverse, and every life we could ever live? If our souls found each other in a million different worlds, would you still choose me?"\n\nEKTA'S ANSWER:\n${data.marriageAnswer}\n\nReference: ${data.submissionRef || responseId}\nSubmitted: ${formattedDateIST} (IST)\n`
      : `A New Message From Ekta ♡\n\nHER SELECTED RESPONSE:\n${data.proposalChoice}\n\nReference: ${data.submissionRef || responseId}\nSubmitted: ${formattedDateIST} (IST)\n`;

    const htmlContent = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FFFDF9; border: 1px solid #F8DCE5; border-radius: 24px; padding: 32px; color: #2B1D24;">
        <div style="text-align: center; border-bottom: 1px solid #F8DCE5; padding-bottom: 20px; margin-bottom: 24px;">
          <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 50%; background: #A64D68; color: #fff; font-size: 20px;">♡</div>
          <h2 style="font-size: 24px; color: #5A3545; margin: 10px 0 4px;">A New Message From Ekta ♡</h2>
          <p style="color: #9A817B; font-size: 13px; font-style: italic; margin: 0;">For Ekta, With Love</p>
        </div>

        <div style="background: #FFF5F8; border: 1.5px solid #E2A9B8; border-radius: 16px; padding: 18px; text-align: center; margin-bottom: 20px;">
          <div style="font-size: 11px; text-transform: uppercase; color: #9A817B; font-weight: bold; letter-spacing: 1px;">Selected Response</div>
          <div style="font-size: 18px; color: #A64D68; font-weight: bold; margin-top: 4px;">${data.proposalChoice}</div>
        </div>

        ${
          data.marriageAnswer
            ? `
        <div style="margin-bottom: 24px;">
          <div style="font-size: 12px; color: #A64D68; font-weight: bold; text-transform: uppercase; margin-bottom: 6px;">The Universe Question</div>
          <p style="font-size: 14px; color: #5A3545; font-weight: 600; background: #FFF8ED; border-left: 3px solid #A64D68; padding: 10px 14px; border-radius: 6px; margin: 0 0 10px;">
            “Will you marry me in every universe, every multiverse, and every life we could ever live? If our souls found each other in a million different worlds, would you still choose me?”
          </p>
          <div style="background: #FFF5F8; border: 1px solid #F8DCE5; border-radius: 14px; padding: 16px; font-style: italic; white-space: pre-wrap;">
            ${data.marriageAnswer}
          </div>
        </div>
        `
            : ''
        }

        <div style="border-top: 1px solid #F8DCE5; padding-top: 16px; text-align: center; font-size: 11px; color: #9A817B;">
          Reference: ${data.submissionRef || responseId} · Submitted: ${formattedDateIST} (IST)
        </div>
      </div>
    `;

    // Queue in 'mail' collection for Firebase Trigger Email extension
    try {
      const mailRef = await admin.firestore().collection('mail').add({
        to: recipient,
        submissionRef: data.submissionRef || responseId,
        message: {
          subject,
          text: plainText,
          html: htmlContent,
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await snap.ref.update({
        emailNotificationQueued: true,
        mailDocId: mailRef.id,
      });

      console.log(`Email successfully queued in /mail/${mailRef.id} for response ${responseId}`);
    } catch (err) {
      console.error('Error queueing email document:', err);
    }
  });
