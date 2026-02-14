import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firebaseAdmin = null;

export const initializeFirebase = () => {
  try {
    // Path to service account key - assuming it's in the root backend folder
    const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

    // Check if service account file exists
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(`serviceAccountKey.json file not found at ${serviceAccountPath}`);
    }

    // Read service account key
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    // AESTHETICS & ROBUSTNESS: Handle Time Drift (Common on some hosting/Windows envs)
    // If the server time is ahead of Google's time, JWT tokens are rejected.
    // We apply a small negative offset to 'Date.now' for the Firebase SDK.
    const originalNow = Date.now;
    Date.now = function () {
      return originalNow() - 300000; // Offset by -5 minutes to stay within Google's sync window
    };

    // Sanitize private_key
    if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    // Initialize Firebase Admin
    if (!admin.apps.length) {
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          privateKey: serviceAccount.private_key
        })
      });
      console.log('✓ Firebase Admin initialized with time-drift compensation (%s)', serviceAccount.project_id);
    } else {
      firebaseAdmin = admin.app();
    }

    return firebaseAdmin;
  } catch (error) {
    console.error('Firebase Admin initialization error:', error.message);
    return null;
  }
};

// Get Firebase Admin instance
export const getFirebaseAdmin = () => {
  if (!firebaseAdmin) {
    initializeFirebase();
  }
  return firebaseAdmin;
};

export { admin };
