/**
 * State Management
 * These variables track tab-specific data in memory for performance.
 */
let trackerCount = {};      // Tracker counts per tab
let trackerList = {};       // Detailed tracker lists per tab
let detectedVideos = {};    // Detected videos per tab
let videoDetectionEnabled = false;

/**
 * Hibernation & Cleanup State
 */
let hibernationEnabled = false;
let hibernationTimeout = 30; // In minutes
let tabLastActive = {};      // tabId -> last active timestamp
let tabUrls = {};            // tabId -> current URL (used for auto-cleanup on close)

// Restore state from session storage on startup to prevent MV3 state loss
chrome.storage.session.get(['trackerCount', 'trackerList', 'detectedVideos', 'tabLastActive', 'tabUrls']).then((result) => {
    trackerCount = { ...trackerCount, ...(result.trackerCount || {}) };
    trackerList = { ...trackerList, ...(result.trackerList || {}) };
    detectedVideos = { ...detectedVideos, ...(result.detectedVideos || {}) };
    tabLastActive = { ...tabLastActive, ...(result.tabLastActive || {}) };
    tabUrls = { ...tabUrls, ...(result.tabUrls || {}) };
}).catch(err => console.error("Error loading session state:", err));

let pendingSessionSave = null;
function saveStateToSession() {
    if (pendingSessionSave) return;
    pendingSessionSave = setTimeout(() => {
        chrome.storage.session.set({
            trackerCount,
            trackerList,
            detectedVideos,
            tabLastActive,
            tabUrls
        }).then(() => {
            pendingSessionSave = null;
        }).catch(err => {
            console.error('Error saving state to session:', err);
            pendingSessionSave = null;
        });
    }, 500);
}

