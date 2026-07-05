// sync.js
// Basic wrapper for chrome.storage.sync

export async function syncToCloud(dataObj) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set(dataObj, () => {
            if (chrome.runtime.lastError) {
                console.error('Cloud Sync Error:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            }
            else resolve();
        });
    });
}

export async function syncFromCloud(keys) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(keys, (res) => {
            if (chrome.runtime.lastError) {
                console.error('Cloud Sync Error:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            }
            else resolve(res);
        });
    });
}

// Future expansion: Google Drive API wrapper for large Vault items
export async function uploadToGoogleDrive(fileBlob, filename, token) {
    // Requires chrome.identity.getAuthToken
    // Left as placeholder per implementation plan.
    console.log('Google Drive upload placeholder for', filename);
}
