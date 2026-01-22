# FCM Notification System & Mobile App Integration Guide

## 1. API Overview (Backend)

The backend provides specific endpoints to update the FCM (Firebase Cloud Messaging) token for a user. This token is used to send push notifications. We support distinguishing between `web` and `app` platforms.

### **A. User & Partner Endpoint**
*   **URL**: `/api/users/fcm-token`
*   **Method**: `PUT`
*   **Auth**: Required (Bearer Token of User/Partner)
*   **Body**:
    ```json
    {
      "fcmToken": "YOUR_FCM_TOKEN_HERE",
      "platform": "app" // or "web"
    }
    ```
*   **Response**: `200 OK`

### **B. Admin Endpoint**
*   **URL**: `/api/admin/fcm-token`
*   **Method**: `PUT`
*   **Auth**: Required (Bearer Token of Admin)
*   **Body**:
    ```json
    {
      "fcmToken": "YOUR_FCM_TOKEN_HERE",
      "platform": "app" // or "web"
    }
    ```

---

## 2. Web Frontend Integration (Already Implemented)
The React frontend (`src/App.jsx`) automatically handles `web` tokens:
1.  Requests notification permission on load.
2.  Generates a Web Push token.
3.  Calls the API with `platform: 'web'`.

---

## 3. Mobile App Integration (Hybrid / WebView)

If you are wrapping this website in a mobile app (e.g., Flutter, React Native, Android/iOS Native), you need to inject the **Native App's FCM Token** into the WebView so the backend knows to send notifications to the phone, not the browser service worker.

The frontend is listening for the token in two ways. You can implement **EITHER** of these methods in your mobile app.

### **Method A: Post Message (Recommended)**
When your mobile app launches and retrieves its FCM token, inject a JavaScript message into the WebView.

**JavaScript Code to run in WebView:**
```javascript
window.postMessage({ 
  type: 'FCM_TOKEN_UPDATE', 
  token: 'INSERT_NATIVE_FCM_TOKEN_HERE' 
}, '*');
```

**Flutter Example (using `webview_flutter`):**
```dart
// After getting fcmToken from FirebaseMessaging in Flutter
_webViewController.runJavaScript("""
  window.postMessage({ 
    type: 'FCM_TOKEN_UPDATE', 
    token: '$fcmToken' 
  }, '*');
""");
```

### **Method B: JavaScript Bridge (Global Object)**
Inject a global JavaScript object named `NativeApp` that has a function `getFcmToken` which returns a Promise or the token string.

**WebView Implementation Logic:**
The frontend code checks:
```javascript
if (window.NativeApp && window.NativeApp.getFcmToken) {
    const appToken = await window.NativeApp.getFcmToken();
    // ... sends token to backend as 'app' platform
}
```

---

## 4. How Notifications work for "App" Users

1.  **User Logs in via App**: The WebView loads the login page.
2.  **Token Injection**: The Native App (Flutter) gets the FCM token and sends it to the WebView using `postMessage`.
3.  **Backend Update**: The React frontend receives the message and calls `/api/users/fcm-token` with `platform: 'app'`.
4.  **Sending Notification**:
    *   When the backend sends a notification, it sees the `app` token.
    *   It sends the payload to FCM.
    *   **Imporant**: Your Native App (Flutter/Android/iOS) must have the Firebase Messaging SDK installed to strictly handle receiving and displaying this notification in the system tray. The WebView *cannot* display system notifications for the app directly; the Native code does that.

## 5. Summary Checklist for App Developer
1.  [ ] Install Firebase Messaging SDK in your Mobile App (Flutter/RN).
2.  [ ] Configure `google-services.json` (Android) / `GoogleService-Info.plist` (iOS) in your mobile project.
3.  [ ] implement logic to retrieve the FCM token in native code.
4.  [ ] On WebView load (or token refresh), inject the token into the web page using `window.postMessage`.
