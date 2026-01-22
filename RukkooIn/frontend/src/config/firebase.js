import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDvZuIOlJce5MFqM7UdaPnMxnHggOVwUnA",
  authDomain: "rukkooin-39480.firebaseapp.com",
  projectId: "rukkooin-39480",
  storageBucket: "rukkooin-39480.firebasestorage.app",
  messagingSenderId: "463389493822",
  appId: "1:463389493822:web:c2ea780030601e5e965f6f"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// VAPID Key from User
const VAPID_KEY = "BJmKApyZ-Zz6k8h2CxKMAkqdWb3tGLU6g1XlSw3ZSjb8O2jC2rDTbjeW2614Y0alK8AFcoCG6nauT72Extj748k";

export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (currentToken) {
      console.log('Current token for client: ', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export { messaging };
