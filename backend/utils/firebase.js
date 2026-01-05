import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct path to serviceAccountKey.json
// Assuming utils is in backend/utils and serviceAccountKey.json is in backend/
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

// Check if file exists
if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ serviceAccountKey.json not found at:', serviceAccountPath);
    console.error('Please verify the file location.');
} else {
    // Read and parse the JSON file manually (to support ES modules import of JSON without experimental flag)
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin Initialized Successfully');
    } catch (error) {
        console.error('❌ Firebase Admin Initialization Error:', error);
    }
}

/**
 * Send a generic notification to a device
 * @param {string} token - FCM Device Token
 * @param {string} title - Notification Title
 * @param {string} body - Notification Body
 * @param {object} data - Optional data payload
 */
export const sendNotification = async (token, title, body, data = {}) => {
    try {
        const message = {
            notification: {
                title,
                body
            },
            data: data, // Data payload must be strings
            token: token
        };

        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
        return { success: true, response };
    } catch (error) {
        console.error('Error sending message:', error);
        return { success: false, error };
    }
};

export default admin;
