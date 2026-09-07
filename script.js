/* =========================================================
   LABELCHECK - FRONTEND SCRIPT
   ========================================================= */


/* =========================================================
   PAGE MANAGEMENT
   ========================================================= */

const pages = {
    scan: "scanPage",
    history: "historyPage",
    reports: "reportsPage",
    rules: "rulesPage",
    analysis: "analysisPage",
    result: "resultPage"
};

function show(page) {

    Object.values(pages).forEach(id => {

        const element = document.getElementById(id);

        if (element) {
            element.classList.add("hidden");
        }

    });

    const target = document.getElementById(pages[page]);

    if (target) {
        target.classList.remove("hidden");
    }

    document.querySelectorAll(".nav-item").forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.page === page
        );

    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   TOAST NOTIFICATION
   ========================================================= */

const toast = document.getElementById("toast");

function notify(message) {

    if (!toast) {
        return;
    }

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2200);
}


/* =========================================================
   WEBCAM
   ========================================================= */

let cameraStream = null;

async function startCamera() {

    const video = document.getElementById("cameraVideo");

    if (!video) {
        return;
    }

    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia) {

        notify("Camera is not supported by this browser.");

        return;
    }

    try {

        cameraStream = await navigator.mediaDevices.getUserMedia({

            video: {
                facingMode: "user",

                width: {
                    ideal: 1920
                },

                height: {
                    ideal: 1080
                }
            },

            audio: false

        });

        video.srcObject = cameraStream;

        await video.play();

        console.log("Web camera started");

        notify("Camera ready");

    } catch (error) {

        console.error("Camera error:", error);

        notify(
            "Camera access denied. Please allow camera permission."
        );
    }
}


/* =========================================================
   CAPTURE IMAGE FROM WEBCAM
   ========================================================= */

/* =========================================================
   RAPID BURST CAPTURE
   Hold Capture button = capture 10–15 pictures rapidly
   ========================================================= */

const captureBtn = document.getElementById("captureBtn");

let burstCapturing = false;
let burstFrames = [];

const MAX_FRAMES = 15;
const CAPTURE_INTERVAL = 180; // milliseconds


function updateBurstStatus(text) {

    const status =
        document.getElementById("burstStatus");

    if (status) {
        status.textContent = text;
    }
}


/* ---------------------------------------------------------
   Capture one frame from webcam
   --------------------------------------------------------- */

function captureFrame() {

    const video =
        document.getElementById("cameraVideo");

    if (!video || video.readyState < 2) {
        return null;
    }

    const canvas =
        document.createElement("canvas");

    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;

    const ctx =
        canvas.getContext("2d");

    ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );

    return canvas.toDataURL(
        "image/jpeg",
        0.92
    );
}


/* ---------------------------------------------------------
   Start burst capture
   --------------------------------------------------------- */

async function startBurstCapture() {

    if (burstCapturing) {
        return;
    }

    burstCapturing = true;
    burstFrames = [];

    captureBtn.classList.add("capturing");

    captureBtn.textContent =
        "📸 Capturing... 0/" + MAX_FRAMES;

    updateBurstStatus(
        "Hold the button — capturing multiple frames..."
    );


    for (
        let i = 0;
        i < MAX_FRAMES;
        i++
    ) {

        if (!burstCapturing) {
            break;
        }

        const frame =
            captureFrame();

        if (frame) {

            burstFrames.push(frame);

            captureBtn.textContent =
                "📸 Capturing... " +
                burstFrames.length +
                "/" +
                MAX_FRAMES;

            updateBurstStatus(
                "Captured " +
                burstFrames.length +
                " of " +
                MAX_FRAMES +
                " frames"
            );
        }

        await sleep(
            CAPTURE_INTERVAL
        );
    }


    finishBurstCapture();
}


/* ---------------------------------------------------------
   Stop burst capture
   --------------------------------------------------------- */

function stopBurstCapture() {

    if (!burstCapturing) {
        return;
    }

    burstCapturing = false;

    finishBurstCapture();
}


/* ---------------------------------------------------------
   Finish capture
   --------------------------------------------------------- */

function finishBurstCapture() {

    if (!burstCapturing && burstFrames.length === 0) {
        return;
    }

    burstCapturing = false;

    captureBtn.classList.remove("capturing");

    captureBtn.textContent =
        "📷 Hold to Capture";

    updateBurstStatus(
        "Captured " +
        burstFrames.length +
        " frames. Starting analysis..."
    );


    if (burstFrames.length > 0) {

        showBurstPreview();

        setTimeout(() => {

            startAnalysis();

        }, 500);
    }
}


/* ---------------------------------------------------------
   Delay helper
   --------------------------------------------------------- */

function sleep(ms) {

    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}


/* ---------------------------------------------------------
   Show latest captured frame in preview
   --------------------------------------------------------- */

function showBurstPreview() {

    const preview =
        document.querySelector(
            ".preview-placeholder"
        );

    if (!preview || burstFrames.length === 0) {
        return;
    }

    preview.innerHTML = `
        <img
            class="uploaded-preview"
            src="${burstFrames[burstFrames.length - 1]}"
            alt="Captured product"
        >
    `;
}


/* =========================================================
   MOUSE
   ========================================================= */

if (captureBtn) {

    captureBtn.addEventListener(
        "mousedown",
        function () {

            startBurstCapture();

        }
    );

    captureBtn.addEventListener(
        "mouseup",
        function () {

            stopBurstCapture();

        }
    );

    captureBtn.addEventListener(
        "mouseleave",
        function () {

            if (burstCapturing) {
                stopBurstCapture();
            }

        }
    );
}


/* =========================================================
   TOUCH / MOBILE
   ========================================================= */

if (captureBtn) {

    captureBtn.addEventListener(
        "touchstart",
        function (event) {

            event.preventDefault();

            startBurstCapture();

        },
        {
            passive: false
        }
    );


    captureBtn.addEventListener(
        "touchend",
        function (event) {

            event.preventDefault();

            stopBurstCapture();

        },
        {
            passive: false
        }
    );


    captureBtn.addEventListener(
        "touchcancel",
        function () {

            stopBurstCapture();

        }
    );
}
/* =========================================================
   SHOW CAPTURED / UPLOADED IMAGE
   ========================================================= */

function showCapturedImage(imageURL) {

    const captureArea =
        document.getElementById("captureArea");

    if (!captureArea) {
        return;
    }

    captureArea.innerHTML = `

        <img
            src="${imageURL}"
            id="uploadedImage"
            class="uploaded-preview"
            alt="Product Image"
        >

        <div class="roi"></div>

        <div class="camera-grid"></div>

        <div class="scan-line"></div>

        <div class="quality-indicator">

            <span class="quality-dot"></span>

            <span id="qualityText">
                Good quality
            </span>

        </div>

    `;
}function showBurstPreview() {

    const captureArea =
        document.getElementById("captureArea");

    if (!captureArea || burstFrames.length === 0) {
        return;
    }

    captureArea.innerHTML = `

        <div class="burst-preview">

            <div class="burst-header">

                <strong>
                    Captured ${burstFrames.length} Images
                </strong>

                <span>
                    Frames for analysis
                </span>

            </div>

            <div class="burst-images">

                ${burstFrames.map((imageURL, index) => `

                    <div class="burst-image-wrapper">

                        <img
                            src="${imageURL}"
                            class="burst-image"
                            alt="Captured frame ${index + 1}"
                        >

                        <span class="frame-number">
                            ${index + 1}
                        </span>

                    </div>

                `).join("")}

            </div>

        </div>

        <div class="quality-indicator">

            <span class="quality-dot"></span>

            <span id="qualityText">
                ${burstFrames.length} frames captured
            </span>

        </div>

    `;
}



/* =========================================================
   IMAGE UPLOAD - 1 TO 15 IMAGES
   ========================================================= */

const uploadBtn =
    document.getElementById("uploadBtn");

const fileInput =
    document.getElementById("fileInput");


if (uploadBtn && fileInput) {

    /* Open file selector */

    uploadBtn.addEventListener("click", function () {

        fileInput.click();

    });


    /* When images are selected */

    fileInput.addEventListener("change", function (event) {

        const files =
            Array.from(event.target.files);


        /* No file selected */

        if (files.length === 0) {
            return;
        }


        /* Maximum 15 images */

        if (files.length > 15) {

            notify(
                "Maximum 15 images can be uploaded."
            );

            fileInput.value = "";

            return;
        }


        /* Check that every file is an image */

        const invalidFile =
            files.find(
                file => !file.type.startsWith("image/")
            );


        if (invalidFile) {

            notify(
                "Please select only image files."
            );

            fileInput.value = "";

            return;
        }


        /* Convert files to image URLs */

        const imageURLs =
            files.map(file =>
                URL.createObjectURL(file)
            );


        /*
         * Use the same array as
         * camera burst capture
         */

        burstFrames = imageURLs;


        /*
         * Show all uploaded images
         */

        showBurstPreview();


        /* Update quality/status */

        const qualityText =
            document.getElementById("qualityText");

        if (qualityText) {

            qualityText.textContent =
                imageURLs.length +
                " images ready for analysis";

        }


        /* Notification */

        notify(
            imageURLs.length +
            " image" +
            (imageURLs.length > 1 ? "s" : "") +
            " uploaded successfully"
        );


        /*
         * Automatically start analysis
         */

        setTimeout(() => {

            startAnalysis();

        }, 700);

    });

}



/* =========================================================
   ANALYSIS
   ========================================================= */

function startAnalysis() {

    show("analysis");

    const progressBar =
        document.getElementById("progressBar");

    const ocrTick =
        document.getElementById("ocrTick");


    if (progressBar) {
        progressBar.style.width = "0%";
    }


    if (ocrTick) {
        ocrTick.textContent = "";
    }


    let progress = 0;


    const timer = setInterval(() => {

        progress += 4;


        if (progressBar) {

            progressBar.style.width =
                progress + "%";

        }


        /* OCR completed */

        if (progress >= 60 && ocrTick) {

            ocrTick.textContent = "✓";

        }


        /* Analysis completed */

        if (progress >= 100) {

            clearInterval(timer);


            setTimeout(() => {

                show("result");

                notify(
                    "Inspection completed successfully"
                );

            }, 500);

        }

    }, 100);

}


/* =========================================================
   NAVIGATION
   ========================================================= */

document.querySelectorAll(".nav-item").forEach(button => {

    button.addEventListener("click", function () {

        const page = this.dataset.page;

        if (page) {
            show(page);
        }

    });

});


/* =========================================================
   NEW SCAN
   ========================================================= */

const newScan =
    document.getElementById("newScan");

if (newScan) {

        newScan.addEventListener("click", function () {

        show("scan");

        resetScanner();

    });



}
function resetScanner() {

    const captureArea = document.getElementById("captureArea");

    if (!captureArea) {
        return;
    }

    // Restore original camera interface
    captureArea.innerHTML = `
        <video
            id="cameraVideo"
            autoplay
            playsinline
            muted>
        </video>

        <div class="roi"></div>

        <div class="camera-grid"></div>

        <div class="scan-line"></div>

        <div class="quality-indicator">
            <span class="quality-dot"></span>
            <span id="qualityText">
                Good lighting
            </span>
        </div>
    `;

    // Start camera again
    startCamera();
}

/* =========================================================
   HISTORY
   ========================================================= */

const historyBtn =
    document.getElementById("historyBtn");

if (historyBtn) {

    historyBtn.addEventListener("click", function () {

        show("history");

    });

}


const viewAll =
    document.getElementById("viewAll");

if (viewAll) {

    viewAll.addEventListener("click", function () {

        show("history");

    });

}


const historyNew =
    document.getElementById("historyNew");

if (historyNew) {

        historyNew.addEventListener("click", function () {

        show("scan");

        resetScanner();

    });

}


/* =========================================================
   REPORT SCAN
   ========================================================= */

const reportScan =
    document.getElementById("reportScan");

if (reportScan) {

    reportScan.addEventListener("click", function () {

        show("scan");

        resetScanner();

    });

}


/* =========================================================
   BARCODE / QR BUTTON
   ========================================================= */

const codeBtn =
    document.getElementById("codeBtn");

if (codeBtn) {

    codeBtn.addEventListener("click", function () {

        notify(
            "Barcode / QR scanner ready"
        );

    });

}


/* =========================================================
   RESULT BUTTONS
   ========================================================= */

const outlineButton =
    document.querySelector(
        ".result-actions .outline-btn"
    );

if (outlineButton) {

    outlineButton.addEventListener(
        "click",
        function () {

            notify(
                "PDF export is ready for backend integration."
            );

        }
    );

}


/* =========================================================
   SAVE INSPECTION
   ========================================================= */

const primaryButton =
    document.querySelector(".result-actions .primary");

if (primaryButton) {

    primaryButton.addEventListener("click", function () {

        const now = new Date();

        const scanId =
            "LM-" +
            now.getFullYear() +
            "-" +
            String(now.getMonth() + 1).padStart(2, "0") +
            String(now.getDate()).padStart(2, "0") +
            "-" +
            String(Date.now()).slice(-4);

        const inspection = {

            scanId: scanId,

            product:
                "Cadbury 5 Star Chocolate Bar",

            date:
                "Today, " +
                now.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                }),

            result: "pass",

            resultText:
                "✓ Compliant",

            confidence: "96%"
        };

        let inspections =
            JSON.parse(
                localStorage.getItem(
                    "labelcheckInspections"
                )
            ) || [];

        // IMPORTANT:
        // Add newest inspection at the beginning
        inspections.unshift(inspection);

        localStorage.setItem(
            "labelcheckInspections",
            JSON.stringify(inspections)
        );

        // Update BOTH screens
        loadHistory();
        loadRecentScans();

        notify(
            "Inspection saved to Recent Scans and History."
        );
    });
}


function loadHistory() {

    const historyBody =
        document.getElementById("historyTableBody");

    if (!historyBody) {
        return;
    }

    const inspections =
        JSON.parse(
            localStorage.getItem("labelcheckInspections")
        ) || [];

    const demoRecords = [
        {
            id: "LM-2026-0905-0042",
            product: "Premium Basmati Rice",
            date: "Today, 11:42 AM",
            result: "pass",
            resultText: "✓ Compliant",
            confidence: "96%"
        },
        {
            id: "LM-2026-0904-0039",
            product: "Instant Coffee",
            date: "Sep 04, 04:18 PM",
            result: "warn",
            resultText: "! Review",
            confidence: "71%"
        },
        {
            id: "LM-2026-0903-0031",
            product: "Washing Powder",
            date: "Sep 03, 09:25 AM",
            result: "fail",
            resultText: "× Non-compliant",
            confidence: "93%"
        }
    ];

    historyBody.innerHTML = "";

    // Latest saved inspection first
    inspections.forEach(inspection => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${inspection.scanId}</td>

            <td>${inspection.product}</td>

            <td>${inspection.date}</td>

            <td>
                <span class="status ${inspection.result}">
                    ${inspection.resultText}
                </span>
            </td>

            <td>${inspection.confidence}</td>
        `;

        historyBody.appendChild(row);
    });

    // Older/demo records after saved inspections
    demoRecords.forEach(record => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${record.id}</td>

            <td>${record.product}</td>

            <td>${record.date}</td>

            <td>
                <span class="status ${record.result}">
                    ${record.resultText}
                </span>
            </td>

            <td>${record.confidence}</td>
        `;

        historyBody.appendChild(row);
    });
}
/* =========================================================
   START APPLICATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    show("scan");

    startCamera();

    loadHistory();

    loadRecentScans();

});



function loadRecentScans() {

    const recentBody =
        document.getElementById("recentScansBody");

    if (!recentBody) {
        return;
    }

    const inspections =
        JSON.parse(
            localStorage.getItem("labelcheckInspections")
        ) || [];

    // Demo records shown when there are no saved inspections
    const demoRecords = [
        {
            id: "LM-2026-0905-0042",
            product: "Premium Basmati Rice",
            date: "Sep 05, 11:42 AM",
            result: "pass",
            resultText: "✓ Compliant",
            confidence: "96%"
        },
        {
            id: "LM-2026-0904-0039",
            product: "Instant Coffee",
            date: "Sep 04, 04:18 PM",
            result: "warn",
            resultText: "! Review",
            confidence: "71%"
        },
        {
            id: "LM-2026-0903-0031",
            product: "Washing Powder",
            date: "Sep 03, 09:25 AM",
            result: "fail",
            resultText: "× Non-compliant",
            confidence: "93%"
        }
    ];

    recentBody.innerHTML = "";

    // Newest saved inspection first
    inspections.forEach(inspection => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${inspection.scanId}</td>

            <td>
                <strong>${inspection.product}</strong>
            </td>

            <td>${inspection.date}</td>

            <td>
                <span class="status ${inspection.result}">
                    ${inspection.resultText}
                </span>
            </td>

            <td>${inspection.confidence}</td>
        `;

        recentBody.appendChild(row);
    });

    // Add demo records after saved records
    demoRecords.forEach(record => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${record.id}</td>

            <td>
                <strong>${record.product}</strong>
            </td>

            <td>${record.date}</td>

            <td>
                <span class="status ${record.result}">
                    ${record.resultText}
                </span>
            </td>

            <td>${record.confidence}</td>
        `;

        recentBody.appendChild(row);
    });
}