/**
 * Panic Button Logic
 */
async function executePanic() {
    try {
        const result = await chrome.storage.local.get(['appSettings']);
        const settings = result.appSettings ? { ...DEFAULT_SETTINGS, ...result.appSettings } : DEFAULT_SETTINGS;
        const action = settings.panicAction || 'closeIncognito';

        let safeUrl = 'https://www.google.com';
        if (settings.safeUrls && settings.safeUrls.length > 0) {
            const randomIndex = Math.floor(Math.random() * settings.safeUrls.length);
            safeUrl = settings.safeUrls[randomIndex];
        } else if (settings.safeRedirectUrl) {
            safeUrl = settings.safeRedirectUrl;
        }

        switch (action) {
            case 'closeIncognito': {
                const windows = await chrome.windows.getAll({ populate: true });
                const normalWindow = windows.find(win => !win.incognito);
                if (normalWindow) {
                    await chrome.tabs.create({ windowId: normalWindow.id, url: safeUrl }).catch(() => { });
                } else {
                    await chrome.windows.create({ url: safeUrl }).catch(() => { });
                }
                const promises = windows
                    .filter(win => win.incognito)
                    .map(win => chrome.windows.remove(win.id).catch(() => { }));
                await Promise.all(promises);
                break;
            }
            case 'redirectAll': {
                const tabs = await chrome.tabs.query({});
                const redirectPromises = tabs
                    .filter(tab => tab.url !== safeUrl && !tab.url.startsWith('chrome://'))
                    .map(tab => chrome.tabs.update(tab.id, { url: safeUrl }).catch(() => { }));
                await Promise.all(redirectPromises);
                break;
            }
            case 'closeAll': {
                const newWin = await chrome.windows.create({ url: safeUrl, focused: true });
                const windows = await chrome.windows.getAll({ populate: true });
                const closePromises = windows
                    .filter(win => win.id !== newWin.id)
                    .map(win => chrome.windows.remove(win.id).catch(() => { }));
                await Promise.all(closePromises);
                break;
            }
        }
    } catch (e) {
        console.error('[Adblock] Panic Mode Execution Error:', e);
    }
}

/**
 * Session Manager Helpers
 */
async function executeQuickSaveSession() {
    try {
        const tabs = await chrome.tabs.query({});
        const sessionName = `Quick Session ${new Date().toLocaleString()}`;
        const sessionData = {
            id: Date.now(),
            name: sessionName,
            date: new Date().toISOString(),
            tabType: 'all',
            tabs: tabs.map(t => ({
                url: t.url,
                title: t.title,
                incognito: t.incognito
            }))
        };

        chrome.storage.local.get(['appSettings'], (result) => {
            const settings = result.appSettings || {};
            if (!settings.savedSessions) settings.savedSessions = [];
            settings.savedSessions.unshift(sessionData);
            chrome.storage.local.set({ appSettings: settings }, () => {
                chrome.notifications.create({
                    type: 'basic',
                    title: 'Session Manager',
                    message: `Đã lưu phiên làm việc nhanh: ${sessionName}`,
                    iconUrl: ASSETS.icons.icon128
                });
            });
        });
    } catch (error) {
        console.error('Quick Save Session Error:', error);
    }
}

/**
 * Encryption Helpers for Vault Sync
 */
async function deriveKey(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return await crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

async function encryptData(data, password) {
    try {
        const key = await deriveKey(password);
        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encodedData = encoder.encode(JSON.stringify(data));
        const encryptedContent = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, encodedData);
        return { iv: Array.from(iv), content: Array.from(new Uint8Array(encryptedContent)) };
    } catch (e) {
        console.error('Encryption error:', e);
        return null;
    }
}

async function decryptData(encryptedObj, password) {
    try {
        const key = await deriveKey(password);
        const iv = new Uint8Array(encryptedObj.iv);
        const content = new Uint8Array(encryptedObj.content);
        const decryptedContent = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, content);
        const decoder = new TextDecoder();
        return JSON.parse(decoder.decode(decryptedContent));
    } catch (e) {
        console.error('Decryption error:', e);
        return null;
    }
}

async function syncVaultToCloud() {
    chrome.storage.local.get(['appSettings', 'privacyVault'], async (result) => {
        const settings = result.appSettings || {};
        const vault = result.privacyVault || [];
        if (!settings.vaultSyncEnabled || !settings.masterSyncKey || vault.length === 0) return;

        chrome.storage.session.get(['sessionPassword'], async (sessionResult) => {
            const password = sessionResult.sessionPassword;
            if (!password) return;
            const masterKey = await decryptData(settings.masterSyncKey, password);
            if (!masterKey) return;
            const encrypted = await encryptData(vault, masterKey);
            if (encrypted) {
                chrome.storage.sync.set({ encryptedVault: encrypted }, () => {
                    console.log('Vault synced to cloud from background');
                });
            }
        });
    });
}

