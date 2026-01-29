# Flutter Camera Integration Guide

## 📱 Complete Implementation

### **Backend Changes** ✅

1. **Added Base64 Upload Support**
   - File: `backend/utils/cloudinary.js`
   - Function: `uploadBase64ToCloudinary(base64String, folder, publicId)`
   - Handles base64 images from Flutter camera

2. **Added Base64 Upload Controller**
   - File: `backend/controllers/authController.js`
   - Function: `uploadDocsBase64(req, res)`
   - Route: `POST /api/auth/partner/upload-docs-base64`

3. **Added Route**
   - File: `backend/routes/authRoutes.js`
   - Route: `POST /auth/partner/upload-docs-base64`

### **Frontend Changes** ✅

1. **Flutter Bridge Utility**
   - File: `frontend/src/utils/flutterBridge.js`
   - Functions:
     - `isFlutterApp()` - Detect if running in Flutter
     - `openFlutterCamera()` - Call Flutter camera
     - `uploadBase64Image()` - Upload to backend

2. **API Service**
   - File: `frontend/src/services/apiService.js`
   - Function: `authService.uploadDocsBase64(images)`

3. **UI Component**
   - File: `frontend/src/app/partner/steps/StepOwnerDetails.jsx`
   - Added camera button for Flutter app
   - Handles both camera and gallery selection

---

## 📋 Flutter Side Implementation

### **1. Add Dependencies to `pubspec.yaml`**

```yaml
dependencies:
  flutter_inappwebview: ^6.0.0
  image_picker: ^1.0.7
```

Run: `flutter pub get`

### **2. Add Permissions**

**Android** - `android/app/src/main/AndroidManifest.xml`:
```xml
<manifest>
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
</manifest>
```

**iOS** - `ios/Runner/Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to capture photos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs photo library access to select photos</string>
```

### **3. Flutter WebView Setup**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:convert';
import 'dart:io';

class PartnerWebView extends StatefulWidget {
  @override
  _PartnerWebViewState createState() => _PartnerWebViewState();
}

class _PartnerWebViewState extends State<PartnerWebView> {
  InAppWebViewController? webViewController;
  final ImagePicker _picker = ImagePicker();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Partner Registration'),
      ),
      body: InAppWebView(
        initialUrlRequest: URLRequest(
          url: WebUri("http://localhost:5174/partner/signup"), // Your frontend URL
        ),
        initialSettings: InAppWebViewSettings(
          javaScriptEnabled: true,
          domStorageEnabled: true,
          mediaPlaybackRequiresUserGesture: false,
        ),
        onWebViewCreated: (controller) {
          webViewController = controller;
          
          // Add camera handler
          controller.addJavaScriptHandler(
            handlerName: 'openCamera',
            callback: (args) async {
              return await _openCamera();
            },
          );
        },
        onLoadStart: (controller, url) {
          print('Page started loading: $url');
        },
        onLoadStop: (controller, url) async {
          print('Page finished loading: $url');
        },
      ),
    );
  }

  Future<Map<String, dynamic>> _openCamera() async {
    try {
      // Show dialog to choose camera or gallery
      final source = await showDialog<ImageSource>(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('Select Image Source'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: Icon(Icons.camera_alt),
                title: Text('Camera'),
                onTap: () => Navigator.pop(context, ImageSource.camera),
              ),
              ListTile(
                leading: Icon(Icons.photo_library),
                title: Text('Gallery'),
                onTap: () => Navigator.pop(context, ImageSource.gallery),
              ),
            ],
          ),
        ),
      );

      if (source == null) {
        return {'success': false, 'message': 'Cancelled'};
      }

      // Pick image
      final XFile? image = await _picker.pickImage(
        source: source,
        imageQuality: 80, // Compress to 80% quality
        maxWidth: 1920,
        maxHeight: 1920,
      );

      if (image == null) {
        return {'success': false, 'message': 'No image selected'};
      }

      // Read file as bytes
      final bytes = await image.readAsBytes();
      
      // Convert to base64
      final base64String = base64Encode(bytes);

      print('Image captured: ${image.name}, Size: ${bytes.length} bytes');

      // Return to JavaScript
      return {
        'success': true,
        'base64': base64String,
        'mimeType': 'image/jpeg',
        'fileName': image.name,
      };
    } catch (e) {
      print('Camera error: $e');
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }
}
```

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────┐
│ FLUTTER APP                             │
├─────────────────────────────────────────┤
│ 1. User taps "Take Photo" button       │
│ 2. JavaScript calls:                    │
│    window.flutter_inappwebview          │
│      .callHandler('openCamera')        │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ FLUTTER NATIVE                          │
├─────────────────────────────────────────┤
│ 3. Handler receives call                │
│ 4. Opens camera/gallery picker          │
│ 5. User captures/selects image         │
│ 6. Reads file as bytes                 │
│ 7. Converts to base64                  │
│ 8. Returns: {success, base64, etc.}    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ FRONTEND (JavaScript)                   │
├─────────────────────────────────────────┤
│ 9. Receives base64 data                │
│ 10. Calls backend API:                 │
│     POST /auth/partner/upload-docs-     │
│     base64                              │
│     Body: {images: [{base64, ...}]}    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ BACKEND                                 │
├─────────────────────────────────────────┤
│ 11. Receives base64 data               │
│ 12. Uploads to Cloudinary              │
│ 13. Returns URL & publicId             │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ FRONTEND                                │
├─────────────────────────────────────────┤
│ 14. Displays uploaded image            │
│ 15. Saves URL in form state            │
└─────────────────────────────────────────┘
```

---

## ✅ Testing Checklist

### Backend:
- [ ] Base64 upload endpoint working: `/api/auth/partner/upload-docs-base64`
- [ ] Cloudinary upload successful
- [ ] Image transformations applied
- [ ] Response contains URL and publicId

### Frontend (Browser):
- [ ] Shows only file upload button (no camera button)
- [ ] File upload works normally

### Frontend (Flutter App):
- [ ] Camera button appears
- [ ] Camera opens on button click
- [ ] Image captured successfully
- [ ] Upload to backend successful
- [ ] Image displays in UI
- [ ] Gallery selection also works

---

## 🐛 Debugging Tips

### Check if running in Flutter:
```javascript
console.log('Flutter check:', {
  flutter_inappwebview: window.flutter_inappwebview !== undefined,
  flutter: window.flutter !== undefined,
  userAgent: navigator.userAgent
});
```

### Test Flutter handler:
```javascript
if (window.flutter_inappwebview) {
  window.flutter_inappwebview.callHandler('openCamera')
    .then(result => console.log('Camera result:', result))
    .catch(err => console.error('Camera error:', err));
}
```

### Backend logs:
```
[Upload Docs Base64] Received X images
[Cloudinary] Uploading base64 image to folder: partner-documents
[Cloudinary] Upload success: https://res.cloudinary.com/...
[Upload Docs Base64] Successfully uploaded X documents
```

---

## 📝 Notes

1. **Image Quality**: Flutter compresses to 80% quality and max 1920px
2. **Base64 Size**: Large images will have large base64 strings (handle timeouts)
3. **Permissions**: Always request camera/storage permissions
4. **Error Handling**: Show user-friendly messages
5. **Fallback**: File input always available as backup

---

## 🚀 Done!

Backend is ready! Just implement the Flutter side and test! 🎉
