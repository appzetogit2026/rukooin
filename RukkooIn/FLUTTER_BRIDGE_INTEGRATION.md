# Flutter Bridge Integration Guide (Multiple Image Support)

Naye `flutterBridge.js` updates ke baad, ab aapko Flutter side par `openCamera` handler ko thoda upgrade karna hoga taaki wo Multiple aur Single dono scenarios handle kar sake.

## 1. WebView Handler Update (Dart Code)

Aapko apne Flutter `InAppWebView` ke `onWebViewCreated` ya jaha bhi handlers define hain, waha niche diye gaye logic ka use karna chahiye:

```dart
import 'dart:convert';
import 'package:image_picker/image_picker.dart';

// ... WebView implementation code ...

_webViewController?.addJavaScriptHandler(
  handlerName: 'openCamera',
  callback: (args) async {
    final ImagePicker picker = ImagePicker();
    
    // Tip: Aap JS se 'args' bhej kar detect kar sakte hain ki Gallery kholni hai ya Camera
    // Filhal hum donon options ko handle karne ka example de rahe hain.

    try {
      // Multiple Selection Example (Gallery)
      final List<XFile> pickedFiles = await picker.pickMultiImage();
      
      if (pickedFiles.isNotEmpty) {
        List<Map<String, dynamic>> imagesList = [];
        
        for (var file in pickedFiles) {
          final bytes = await file.readAsBytes();
          final String base64Image = base64Encode(bytes);
          
          imagesList.add({
            'base64': base64Image,
            'mimeType': 'image/jpeg', 
            'fileName': file.name,
          });
        }
        
        // Naya format jo humne JS me handle kiya hai
        return {
          'success': true,
          'images': imagesList, 
        };
      } else {
        return {'success': false, 'message': 'Selection cancelled'};
      }
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  },
);
```

## 2. Expected Data Formats

Humne `flutterBridge.js` ko itna smart banaya hai ki wo niche diye gaye **dono** formats ko samajh lega:

### A. Multiple Images Selection (Property Gallery ke liye)
Flutter se ye JSON return karein:
```json
{
  "success": true,
  "images": [
    { "base64": "...", "mimeType": "image/jpeg", "fileName": "img1.jpg" },
    { "base64": "...", "mimeType": "image/png", "fileName": "img2.png" }
  ]
}
```

### B. Single Image Capture (KYC ya Profile ke liye)
Agar sirf ek hi photo capture kar rahe hain, toh purana format bhi valid hai:
```json
{
  "success": true,
  "base64": "...",
  "mimeType": "image/jpeg",
  "fileName": "photo.jpg"
}
```

## 3. Frontend Implementation Note
Ab jab aap React me `pickImage` function call karenge:
- Agar Flutter se 1 image aayegi, toh callback me `(url, publicId)` milega.
- Agar Multiple images aayengi, toh callback me `(filesArray)` milega jisme saare uploaded URLs honge.

---
**RukkooIn Web-App Bridge v2**
