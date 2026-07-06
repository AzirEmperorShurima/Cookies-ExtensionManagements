import { settings, saveSettings, notify } from '../popup.js';

/**
 * Encrypted Cloud Sync Module
 * Uses Web Crypto API to encrypt data with AES-GCM before syncing to chrome.storage.sync
 */

const SYNC_KEY_NAME = 'enc_sync_data';

async function deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );
    
    return window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

async function encryptData(data, password) {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    
    const enc = new TextEncoder();
    const encodedData = enc.encode(JSON.stringify(data));
    
    const encryptedContent = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encodedData
    );
    
    // Combine salt, iv, and encrypted data for storage
    const encryptedArray = new Uint8Array(encryptedContent);
    const combined = new Uint8Array(salt.length + iv.length + encryptedArray.length);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(encryptedArray, salt.length + iv.length);
    
    // Convert to base64
    return btoa(String.fromCharCode.apply(null, combined));
}

async function decryptData(base64Data, password) {
    const combined = new Uint8Array(atob(base64Data).split('').map(c => c.charCodeAt(0)));
    
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const data = combined.slice(28);
    
    const key = await deriveKey(password, salt);
    
    try {
        const decryptedContent = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            data
        );
        const dec = new TextDecoder();
        return JSON.parse(dec.decode(decryptedContent));
    } catch (e) {
        throw new Error("Invalid Password or Corrupted Data");
    }
}

export async function uploadToCloud(password) {
    if (!password) {
        throw new Error("Password is required for encryption");
    }
    
    // Gather data to sync
    const dataToSync = {
        settings: settings
    };
    
    // Get other data from local storage
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['vaultItems', 'zenCustomUrls', 'zenSchedule', 'userZappedCssRules'], async (res) => {
            dataToSync.vaultItems = res.vaultItems || [];
            dataToSync.zenCustomUrls = res.zenCustomUrls || [];
            dataToSync.zenSchedule = res.zenSchedule || {};
            dataToSync.userZappedCssRules = res.userZappedCssRules || {};
            
            try {
                const encrypted = await encryptData(dataToSync, password);
                chrome.storage.sync.set({ [SYNC_KEY_NAME]: encrypted }, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(true);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    });
}

export async function restoreFromCloud(password) {
    if (!password) {
        throw new Error("Password is required for decryption");
    }
    
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([SYNC_KEY_NAME], async (res) => {
            if (!res[SYNC_KEY_NAME]) {
                return reject(new Error("No synced data found on cloud"));
            }
            
            try {
                const decryptedData = await decryptData(res[SYNC_KEY_NAME], password);
                
                // Restore settings
                if (decryptedData.settings) {
                    Object.assign(settings, decryptedData.settings);
                    saveSettings();
                }
                
                // Restore local storage
                const localData = {};
                if (decryptedData.vaultItems) localData.vaultItems = decryptedData.vaultItems;
                if (decryptedData.zenCustomUrls) localData.zenCustomUrls = decryptedData.zenCustomUrls;
                if (decryptedData.zenSchedule) localData.zenSchedule = decryptedData.zenSchedule;
                if (decryptedData.userZappedCssRules) localData.userZappedCssRules = decryptedData.userZappedCssRules;
                
                chrome.storage.local.set(localData, () => {
                    resolve(true);
                });
            } catch (err) {
                reject(err);
            }
        });
    });
}

export function initSyncUI() {
    const upBtn = document.getElementById('cloudSyncUpBtn');
    const downBtn = document.getElementById('cloudSyncDownBtn');
    const passInput = document.getElementById('syncPasswordInput');
    const statusMsg = document.getElementById('syncStatusMsg');
    
    if (!upBtn || !downBtn || !passInput) return;
    
    upBtn.addEventListener('click', async () => {
        const pwd = passInput.value;
        if (!pwd) {
            notify("Vui lòng nhập Mật khẩu Đồng bộ", 'error');
            return;
        }
        
        upBtn.textContent = 'Uploading...';
        try {
            await uploadToCloud(pwd);
            statusMsg.textContent = "✅ Uploaded successfully!";
            statusMsg.style.color = "#00b894";
            notify("Đã đồng bộ dữ liệu lên Cloud an toàn", "success");
        } catch (e) {
            statusMsg.textContent = "❌ " + e.message;
            statusMsg.style.color = "#d63031";
        }
        upBtn.textContent = 'Upload to Cloud';
    });
    
    downBtn.addEventListener('click', async () => {
        const pwd = passInput.value;
        if (!pwd) {
            notify("Vui lòng nhập Mật khẩu Đồng bộ", 'error');
            return;
        }
        
        downBtn.textContent = 'Restoring...';
        try {
            await restoreFromCloud(pwd);
            statusMsg.textContent = "✅ Restored successfully! Please reload extension.";
            statusMsg.style.color = "#00b894";
            notify("Khôi phục dữ liệu thành công. Vui lòng tải lại trang.", "success");
            
            // Reload after 2 seconds
            setTimeout(() => window.location.reload(), 2000);
        } catch (e) {
            statusMsg.textContent = "❌ " + e.message;
            statusMsg.style.color = "#d63031";
        }
        downBtn.textContent = 'Restore from Cloud';
    });
}
