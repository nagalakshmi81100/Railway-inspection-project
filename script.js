// ==========================================
// ASTRONOVA RAILWAY SECURITY SYSTEM
// CORRECTED JAVASCRIPT
// ==========================================

let patrolRunning = true;
let lastObstacleState = false;
let currentLanguage = "en";

let aiModel = null;
let aiModelLoading = null;
let lastAIAlert = "";

// Replace this with your published Teachable Machine model URL
const MODEL_URL =
    "https://teachablemachine.withgoogle.com/models/Ox8HIyPrm/";


// ==========================================
// SAFE ELEMENT SELECTOR
// ==========================================

function getElement(id) {
    return document.getElementById(id);
}


// ==========================================
// ALERT HISTORY
// ==========================================

function addAlertHistory(message) {
    const alertHistory = getElement("alertHistory");

    if (!alertHistory) return;

    let savedAlerts = [];

    try {
        savedAlerts =
            JSON.parse(localStorage.getItem("railwayAlerts")) || [];
    } catch (error) {
        savedAlerts = [];
    }

    savedAlerts.unshift({
        message: message,
        time: new Date().toLocaleTimeString()
    });

    savedAlerts = savedAlerts.slice(0, 5);

    localStorage.setItem(
        "railwayAlerts",
        JSON.stringify(savedAlerts)
    );

    displayAlertHistory();
}


function displayAlertHistory() {
    const alertHistory = getElement("alertHistory");

    if (!alertHistory) return;

    let savedAlerts = [];

    try {
        savedAlerts =
            JSON.parse(localStorage.getItem("railwayAlerts")) || [];
    } catch (error) {
        savedAlerts = [];
    }

    alertHistory.innerHTML = "";

    if (savedAlerts.length === 0) {
        alertHistory.innerHTML = "<li>No alerts recorded</li>";
        return;
    }

    savedAlerts.forEach(function (alert) {
        const listItem = document.createElement("li");

        listItem.textContent =
            alert.time + " - " + alert.message;

        alertHistory.appendChild(listItem);
    });
}


function clearAlertHistory() {
    localStorage.removeItem("railwayAlerts");
    displayAlertHistory();
}


// ==========================================
// PATROL CONTROL
// ==========================================

function startPatrol() {
    patrolRunning = true;

    const status = getElement("patrolStatus");

    if (status) {
        status.textContent = "Patrol Running";
        status.style.color = "green";
    }

    updateDashboard();
}


function stopPatrol() {
    patrolRunning = false;

    const status = getElement("patrolStatus");

    if (status) {
        status.textContent = "Patrol Stopped";
        status.style.color = "red";
    }

    updateDashboard();
}


// ==========================================
// SENSOR SIMULATION
// ==========================================

function updateDashboard() {
    const lidarValue = Math.floor(Math.random() * 81) + 20;

    const rollValue =
        (Math.random() * 20 - 10).toFixed(1);

    const pitchValue =
        (Math.random() * 20 - 10).toFixed(1);

    const cameraResultValue =
        Math.random() < 0.2
            ? "Possible Object/Environment Issue"
            : "No Visible Issue Detected";

    const obstacleDetected = lidarValue < 30;

    const motionUnstable =
        Math.abs(Number(rollValue)) > 8 ||
        Math.abs(Number(pitchValue)) > 8;

    // Sensor values
    if (getElement("lidar")) {
        getElement("lidar").textContent = lidarValue;
    }

    if (getElement("camera")) {
        getElement("camera").textContent = "Active";
    }

    if (getElement("cameraResult")) {
        getElement("cameraResult").textContent =
            cameraResultValue;
    }

    if (getElement("roll")) {
        getElement("roll").textContent = rollValue;
    }

    if (getElement("pitch")) {
        getElement("pitch").textContent = pitchValue;
    }

    if (getElement("latitude")) {
        getElement("latitude").textContent = "11.0168";
    }

    if (getElement("longitude")) {
        getElement("longitude").textContent = "75.9558";
    }

    if (getElement("servo")) {
        getElement("servo").textContent =
            patrolRunning ? "Moving" : "Stopped";
    }

    if (getElement("robot")) {
        getElement("robot").textContent =
            patrolRunning ? "Patrolling" : "Stopped";
    }

    // Obstacle alert
    const obstacleAlert = getElement("obstacleAlert");

    if (obstacleDetected) {
        if (getElement("robot")) {
            getElement("robot").textContent =
                "Object/Obstacle Detected";
        }

        if (obstacleAlert) {
            obstacleAlert.textContent =
                "⚠️ OBJECT/OBSTACLE DETECTED";

            obstacleAlert.style.color = "red";
            obstacleAlert.style.backgroundColor = "#ffe0e0";
        }

        if (!lastObstacleState) {
            addAlertHistory("Object or obstacle detected");
        }

        lastObstacleState = true;

    } else {
        if (obstacleAlert) {
            obstacleAlert.textContent =
                "✅ RAILWAY ENVIRONMENT MONITORED";

            obstacleAlert.style.color = "green";
            obstacleAlert.style.backgroundColor = "#e0ffe0";
        }

        lastObstacleState = false;
    }

    // Sensor fusion
    if (getElement("fusionLidar")) {
        getElement("fusionLidar").textContent =
            obstacleDetected ? "Obstacle Detected" : "Normal";
    }

    if (getElement("fusionCamera")) {
        getElement("fusionCamera").textContent = "Active";
    }

    if (getElement("fusionMotion")) {
        getElement("fusionMotion").textContent =
            motionUnstable ? "Unstable" : "Stable";
    }

    if (getElement("fusionGPS")) {
        getElement("fusionGPS").textContent = "Available";
    }

    const fusionStatus = getElement("fusionStatus");

    if (fusionStatus) {
        if (obstacleDetected || motionUnstable) {
            fusionStatus.textContent =
                "⚠️ Potential Issue Detected";

            fusionStatus.style.color = "red";
        } else {
            fusionStatus.textContent =
                "✅ Environment Normal";

            fusionStatus.style.color = "green";
        }
    }

    // Obstacle avoidance
    const avoidanceStatus = getElement("avoidanceStatus");
    const robotAction = getElement("robotAction");
    const movementStatus = getElement("movementStatus");

    if (!patrolRunning) {
        if (avoidanceStatus) {
            avoidanceStatus.textContent = "Patrol Stopped";
            avoidanceStatus.style.color = "red";
        }

        if (robotAction) {
            robotAction.textContent = "⏹ Robot Stopped";
        }

        if (movementStatus) {
            movementStatus.textContent = "Not Moving";
        }

    } else if (obstacleDetected) {
        if (avoidanceStatus) {
            avoidanceStatus.textContent = "Obstacle Detected";
            avoidanceStatus.style.color = "red";
        }

        if (robotAction) {
            robotAction.textContent = "🛑 Robot Stopped";
        }

        if (movementStatus) {
            movementStatus.textContent = "Changing Direction";
        }

    } else {
        if (avoidanceStatus) {
            avoidanceStatus.textContent = "Path Clear";
            avoidanceStatus.style.color = "green";
        }

        if (robotAction) {
            robotAction.textContent = "✅ Patrolling";
        }

        if (movementStatus) {
            movementStatus.textContent = "Moving Forward";
        }
    }

    // Screening status
    const narcoticsResult = getElement("narcoticsResult");

    if (narcoticsResult) {
        narcoticsResult.textContent =
            obstacleDetected
                ? "Potential Issue - Review Required"
                : "Normal - No Issue Detected";
    }
}


// ==========================================
// LANGUAGE TOGGLE
// ==========================================

function toggleLanguage() {
    const languageButton = getElement("languageToggle");
    const subtitle = getElement("mainSubtitle");

    if (currentLanguage === "en") {
        currentLanguage = "ta";

        if (subtitle) {
            subtitle.textContent =
                "AI அடிப்படையிலான ரயில்வே பாதுகாப்பு ஆய்வு அமைப்பு";
        }

        if (languageButton) {
            languageButton.textContent = "English";
        }

    } else {
        currentLanguage = "en";

        if (subtitle) {
            subtitle.textContent =
                "AI-Enabled Railway Security Inspection System";
        }

        if (languageButton) {
            languageButton.textContent = "தமிழ்";
        }
    }
}


// ==========================================
// LOAD AI MODEL
// ==========================================

async function loadAIModel() {
    const aiResult = getElement("aiResult");
    const aiAlert = getElement("aiAlert");

    if (typeof tmImage === "undefined") {
        if (aiResult) {
            aiResult.textContent =
                "❌ Teachable Machine library not loaded";
        }

        if (aiAlert) {
            aiAlert.textContent = "AI library unavailable";
            aiAlert.style.color = "red";
        }

        console.error("tmImage library is missing.");
        return null;
    }

    if (aiModel) {
        return aiModel;
    }

    if (aiModelLoading) {
        return aiModelLoading;
    }

    if (aiResult) {
        aiResult.textContent = "⏳ Loading AI model...";
    }

    if (aiAlert) {
        aiAlert.textContent = "Please wait...";
        aiAlert.style.color = "orange";
    }

    aiModelLoading = tmImage.load(
        MODEL_URL + "model.json",
        MODEL_URL + "metadata.json"
    )
    .then(function (model) {
        aiModel = model;

        if (aiResult) {
            aiResult.textContent = "✅ AI model ready";
        }

        if (aiAlert) {
            aiAlert.textContent = "✅ No Alert";
            aiAlert.style.color = "green";
        }

        console.log("✅ AI model loaded successfully");

        return aiModel;
    })
    .catch(function (error) {
        console.error("❌ AI model loading error:", error);

        if (aiResult) {
            aiResult.textContent =
                "❌ AI model loading failed";
        }

        if (aiAlert) {
            aiAlert.textContent =
                "Check your model URL or internet connection";

            aiAlert.style.color = "red";
        }

        aiModel = null;
        aiModelLoading = null;

        return null;
    });

    return aiModelLoading;
}


// ==========================================
// AI IMAGE ANALYSIS
// ==========================================

async function analyzeImage(event) {
    const file =
        event.target.files && event.target.files[0];

    const previewImage = getElement("previewImage");
    const aiResult = getElement("aiResult");
    const aiAlert = getElement("aiAlert");

    if (!file || !previewImage || !aiResult || !aiAlert) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        aiResult.textContent = "❌ Please select an image file";
        aiAlert.textContent = "Invalid file type";
        aiAlert.style.color = "red";
        return;
    }

    const model = await loadAIModel();

    if (!model) {
        aiResult.textContent = "❌ AI model is not ready";
        return;
    }

    const imageURL = URL.createObjectURL(file);

    previewImage.style.display = "block";
    previewImage.src = imageURL;

    previewImage.onload = async function () {
        try {
            aiResult.textContent = "🔍 Analyzing image...";
            aiAlert.textContent = "⏳ Please wait...";
            aiAlert.style.color = "orange";

            const predictions =
                await model.predict(previewImage);

            if (!predictions || predictions.length === 0) {
                throw new Error("No predictions received");
            }

            predictions.sort(function (a, b) {
                return b.probability - a.probability;
            });

            const bestPrediction = predictions[0];

            const className =
                String(bestPrediction.className || "Unknown");

            const confidence =
                (bestPrediction.probability * 100).toFixed(2);

            aiResult.textContent =
                "Result: " + className + " - " + confidence + "%";

            const label = className.toLowerCase();

            const suspicious =
                label.includes("suspicious") ||
                label.includes("danger") ||
                label.includes("threat") ||
                label.includes("abnormal") ||
                label.includes("unsafe") ||
                label.includes("alert") ||
                label.includes("review");

            if (suspicious) {
                aiAlert.textContent =
                    "⚠️ Potentially Suspicious - Verification Required";

                aiAlert.style.color = "red";

                if (lastAIAlert !== className) {
                    addAlertHistory(
                        "AI flagged image: " + className
                    );
                }

                lastAIAlert = className;

            } else {
                aiAlert.textContent = "✅ No Alert";
                aiAlert.style.color = "green";
                lastAIAlert = "";
            }

        } catch (error) {
            console.error("❌ Image analysis error:", error);

            aiResult.textContent =
                "❌ Image analysis failed";

            aiAlert.textContent =
                "Check the browser console";

            aiAlert.style.color = "red";

        } finally {
            URL.revokeObjectURL(imageURL);
        }
    };

    previewImage.onerror = function () {
        aiResult.textContent = "❌ Image preview failed";
        aiAlert.textContent = "Please select another image";
        aiAlert.style.color = "red";

        URL.revokeObjectURL(imageURL);
    };
}


// ==========================================
// PAGE INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
    console.log("🚀 ASTRONOVA application started");

    const imageUpload = getElement("imageUpload");

    if (imageUpload) {
        imageUpload.addEventListener("change", analyzeImage);
    }

    updateDashboard();
    displayAlertHistory();
    loadAIModel();

    setInterval(updateDashboard, 3000);
});