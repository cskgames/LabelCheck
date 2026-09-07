# LabelCheck — Legal Metrology AI

A frontend prototype for checking the compliance of packaged commodities under the **Legal Metrology (Packaged Commodities) Rules, 2011**.

The application allows users to capture product-label images using a camera, upload multiple images, simulate AI-based analysis, verify extracted declarations, and save inspection results to scan history.

---

## 🚀 Features

### 📷 Camera Capture

* Opens the device camera when the application starts.
* Uses the **rear/back camera on mobile devices**.
* Supports laptop/desktop webcams.
* Live camera preview.
* ROI (Region of Interest) guide.
* Camera grid and scan-line interface.
* Image quality indicator.

### 📸 Rapid Burst Capture

* Hold the **Capture** button to capture multiple images rapidly.
* Captures up to **15 frames**.
* Capture interval: approximately **180 ms**.
* Supports:

  * Mouse
  * Touch
  * Mobile devices
* Displays all captured frames after capture.

### 🖼️ Image Upload

* Upload **1 to 15 images** at once.
* Supports common image formats.
* Displays all uploaded images.
* Automatically starts the analysis process.

### 🤖 AI Analysis Simulation

The frontend demonstrates the planned inspection pipeline:

1. Image Recovery
2. Text Detection
3. OCR & Extraction
4. Completeness Verification
5. Rules Engine

The current frontend uses simulated analysis progress. Actual OCR and AI models are not connected yet.

### 📋 Compliance Result

Displays extracted declaration fields such as:

* Product Name
* Net Quantity
* MRP
* Manufacturing Date
* Best Before
* Manufacturer Address
* Consumer Care
* Country of Origin
* LMPC / License
* Barcode / GTIN

### ⭐ Product Demonstration

The current prototype uses **Cadbury 5 Star Chocolate Bar** as the demonstration product.

> Product details displayed in the prototype are sample/demo values and should not be treated as actual verified package information.

### 💾 Save Inspection

The **Save Inspection** button:

* Generates a unique scan ID.
* Saves the inspection in browser `localStorage`.
* Adds the inspection to **Scan History**.
* Adds the inspection to **Recent Scans**.
* Places the newest inspection at the top.

### 📊 Scan History

Stores previous inspections locally in the browser.

Saved records include:

* Scan ID
* Product
* Date
* Compliance result
* Confidence

### 🕘 Recent Scans

The latest saved inspection automatically appears at the top of the Recent Scans table.

### 📱 Responsive Design

The interface is designed for:

* Desktop
* Laptop
* Tablet
* Mobile

---

# 📁 Project Structure

```text
LabelCheck/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

---

# 🛠️ Technologies Used

* HTML5
* CSS3
* JavaScript
* Browser MediaDevices API
* HTML5 Canvas
* LocalStorage
* Responsive Web Design

---

# 📷 Camera Setup

The application uses:

```javascript
navigator.mediaDevices.getUserMedia()
```

For mobile devices, the application requests the rear camera using:

```javascript
facingMode: {
    ideal: "environment"
}
```

The camera video element is:

```html
<video
    id="cameraVideo"
    autoplay
    playsinline
    muted>
</video>
```

---

# 📸 Burst Capture

The application can capture up to 15 frames.

Current configuration:

```javascript
const MAX_FRAMES = 15;
const CAPTURE_INTERVAL = 180;
```

The capture process is:

```text
Hold Capture
      ↓
Capture Frame 1
      ↓
Capture Frame 2
      ↓
Capture Frame 3
      ↓
      ...
      ↓
Capture Frame 15
      ↓
Display Captured Images
      ↓
Start Analysis
```

The same image array is used for both camera capture and multiple image uploads:

```javascript
burstFrames = imageURLs;
```

---

# 🖼️ Uploading Images

The file input supports multiple images:

```html
<input
    type="file"
    id="fileInput"
    accept="image/*"
    multiple
    hidden>
```

The application limits uploads to 15 images.

```javascript
if (files.length > 15) {
    notify("Maximum 15 images can be uploaded.");
    return;
}
```

---

# 🔄 Application Workflow

```text
┌─────────────────────┐
│       Capture       │
│ Camera / Upload     │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│   Multiple Images   │
│    1 – 15 Frames    │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Image Analysis      │
│ Recovery            │
│ Text Detection      │
│ OCR                  │
│ Verification        │
│ Rules Engine        │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Compliance Result   │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Save Inspection     │
└──────────┬──────────┘
           ↓
     ┌─────┴─────┐
     ↓           ↓
Recent Scans   History
```

---

# 💾 Local Storage

Inspection records are stored using:

```javascript
localStorage
```

Storage key:

```text
labelcheckInspections
```

Example stored record:

```javascript
{
    scanId: "LM-2026-0907-1234",
    product: "Cadbury 5 Star Chocolate Bar",
    date: "Today, 06:30 PM",
    result: "pass",
    resultText: "✓ Compliant",
    confidence: "96%"
}
```

New records are added using:

```javascript
inspections.unshift(inspection);
```

This ensures the latest inspection appears first.

---

# ⚠️ Current Limitations

This is currently a **frontend prototype**.

The following components are simulated or not yet connected:

* Real OCR
* Real AI image processing
* DBNet text detection
* PP-OCRv5 / PARSeq
* Barcode/GTIN database lookup
* Legal Metrology rules engine
* Backend database
* User authentication
* PDF generation
* Excel export
* Cloud storage
* Automatic legal verification

The current analysis screen simulates the processing pipeline.

---

# 🔐 Camera Permission

The browser must be allowed to access the camera.

For mobile and production deployment, camera access generally requires:

```text
HTTPS
```

During local development, use a local development server such as:

```text
http://localhost
```

instead of opening the HTML file directly with:

```text
file://
```

---

# ▶️ How to Run

## Option 1 — VS Code Live Server

1. Open the project folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html`.
4. Select **Open with Live Server**.
5. Allow camera permission.
6. The LabelCheck dashboard will open.

---

## Option 2 — Python Local Server

Open a terminal inside the project folder:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Allow camera permission when requested.

---

# 📱 Mobile Testing

For testing on a physical mobile device, the website should be hosted through an HTTPS-enabled server.

Then:

1. Open the website on the phone.
2. Allow camera permission.
3. The rear camera will be requested.
4. Point the camera at the product label.
5. Hold **Capture**.
6. Up to 15 frames will be captured.
7. Analysis will start automatically.

---

# 🧹 Reset Saved History

To clear saved inspection records, open the browser console and run:

```javascript
localStorage.removeItem("labelcheckInspections");
```

Refresh the page afterward.

---

# 🔮 Future Development

The frontend can be connected to a backend AI pipeline:

```text
Camera / Upload
       ↓
Image Preprocessing
       ↓
Text Detection
       ↓
OCR
       ↓
Field Extraction
       ↓
Confidence Verification
       ↓
Legal Metrology Rules Engine
       ↓
Compliance Decision
       ↓
Database
       ↓
Report
```

Possible future technologies:

* Python
* FastAPI / Flask
* OpenCV
* DBNet
* PP-OCRv5
* PARSeq
* PostgreSQL / MySQL
* Barcode/GTIN API
* VLM fallback
* PDF report generation
* Excel bulk export

---

# 📌 Project Objective

The objective of LabelCheck is to develop a software system capable of assisting in the verification of packaged commodities against applicable requirements of the **Legal Metrology (Packaged Commodities) Rules, 2011**.

The planned system uses computer vision, OCR, image processing, structured field extraction, confidence verification, and a rules engine to identify potentially missing or non-compliant declarations.

---

# 👨‍💻 Project Status

**Current Status:** Frontend Prototype

**Completed:**

* Dashboard UI
* Camera interface
* Mobile rear-camera support
* Image upload
* Multiple image upload
* 15-frame burst capture
* Captured-image preview
* Analysis workflow UI
* Compliance result UI
* Save inspection
* Recent Scans
* Scan History
* LocalStorage persistence
* Responsive interface

**Next Stage:**

* Backend integration
* Real OCR
* Image processing
* Barcode lookup
* Legal Metrology rules engine
* Database
* PDF reports
* Excel export

---

## 📄 License

This project is developed as an academic/college project and prototype.
