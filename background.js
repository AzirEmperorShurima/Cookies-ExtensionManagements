importScripts('modules/vendor/tldts.min.js');
importScripts('email.min.js');

function safeGetDomain(urlOrHostname) {
    if (!urlOrHostname) return '';
    try {
        if (self.tldts && self.tldts.parse) {
            const parsed = self.tldts.parse(urlOrHostname);
            return parsed.domain || parsed.hostname || urlOrHostname;
        }
        const hostname = urlOrHostname.includes('://') ? new URL(urlOrHostname).hostname : urlOrHostname;
        return hostname.replace(/^www\./, '');
    } catch (e) {
        return '';
    }
}

async function updateTabBadge(tabId) {
    const videosCount = detectedVideos[tabId] ? detectedVideos[tabId].length : 0;
    if (videosCount > 0) {
        chrome.action.setBadgeText({ text: videosCount.toString(), tabId });
        chrome.action.setBadgeBackgroundColor({ color: '#e53e3e', tabId });
        return;
    }

    try {
        const result = await chrome.storage.local.get(['adblockSettings']);
        const settings = result.adblockSettings || {};
        const enabledSources = settings.enabledSources || [];
        if (enabledSources.length > 0) {
            chrome.action.setBadgeText({ text: 'ON', tabId });
            chrome.action.setBadgeBackgroundColor({ color: '#38a169', tabId });
        } else {
            chrome.action.setBadgeText({ text: '', tabId });
        }
    } catch (e) {
        chrome.action.setBadgeText({ text: '', tabId });
    }
}


const DEFAULT_SETTINGS = {
    darkMode: false,
    autoClearStealth: true,
    showNotifications: true,
    cookieDestroyer: false,
    historyIncognito: false,
    defaultPlayerWidth: 100,
    defaultPlayerHeight: 400,
    followDefaultPlayerSize: true,
    searchEngine: 'google',
    favoriteWebsites: [],
    useSidePanel: false,
    realTimeProtection: true,
    blockClickjacking: true,
    blockCryptoMining: true,
    protectionLevel: 'standard',
    language: 'vi',
    playerBackgroundType: 'default',
    playerLinkBehavior: 'inside',
    playerLinkFilter: 'all',
    customBgUrl: '',
    customBgList: [],
    panicAction: 'closeIncognito',
    safeRedirectUrl: 'https://www.google.com',
    savedSessions: [],
    telegramDownloaderEnabled: false,
    videoDownloaderEnabled: false,
    multiAccountEnabled: false,
    accountContainers: [],
    hibernationEnabled: false,
    hibernationTimeout: 30,
    whitelist: ['google.com', 'facebook.com', 'gmail.com', 'youtube.com', 'github.com'],
    alwaysRequirePassword: true,
    vaultSyncEnabled: false,
    masterSyncKey: null,
    linkClickBehavior: 'player',
    appliedLinkType: 'all',
    safeUrls: [],
    requireStrongPassword: false,
    showPasswordInSettings: true,
    playerIsolatedIdentity: true,
    adblockEnabled: true,
    easylistEnabled: true,
    customAdblockRules: '',
    customAdblockCssRules: ''
};

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

/**
 * Context Menu Management
 * Using Resilient Manifest V3 style to ensure menus are recreated when needed.
 */
function createAllContextMenus() {
    chrome.contextMenus.removeAll(() => {
        checkLastError("sessionManager");
        chrome.contextMenus.create({ id: "addToVault", title: "Add to Privacy Vault 🔐", contexts: ["page", "link"] });
        chrome.contextMenus.create({ id: "addToFavorites", title: "Add to Favorite Websites ⭐", contexts: ["page", "link"] });
        chrome.contextMenus.create({ id: "quickPanic", title: "Quick Panic Button 🚨", contexts: ["all"] });
        chrome.contextMenus.create({ id: "quickSaveSession", title: "Quick Save Session 📋", contexts: ["all"] });
        chrome.contextMenus.create({
            id: "sessionManager",
            title: "📋 Session Manager",
            contexts: ["page", "link"]
        });

        // 2. Create static session items
        const staticItems = [
            { id: "saveAllTabs", title: "💾 Save All Tabs" },
            { id: "saveNormalTabs", title: "🌐 Save Normal Tabs" },
            { id: "saveIncognitoTabs", title: "🔒 Save Incognito Tabs" },
            { id: "saveCurrentTab", title: "📄 Save Current Tab" },
            { id: "separator_session", type: "separator" },
            { id: "restoreSessionParent", title: "📂 Restore Session..." }
        ];

        staticItems.forEach(item => {
            chrome.contextMenus.create({
                id: item.id,
                parentId: "sessionManager",
                title: item.title,
                type: item.type || "normal",
                contexts: ["page", "link"]
            });
            checkLastError(item.id);
        });

        // 3. Update restore session items from storage
        chrome.storage.local.get(['appSettings'], (result) => {
            const settings = result.appSettings ? { ...DEFAULT_SETTINGS, ...result.appSettings } : DEFAULT_SETTINGS;
            const sessions = settings.savedSessions || [];

            if (sessions.length === 0) {
                checkLastError("noSessions");
                chrome.contextMenus.create({
                    id: "noSessions",
                    parentId: "restoreSessionParent",
                    title: "(No saved sessions)",
                    enabled: false,
                    contexts: ["page", "link"]
                });
            } else {
                // Show up to 5 most recent sessions
                sessions.slice(0, 5).forEach((session, index) => {
                    chrome.contextMenus.create({
                        id: `restoreSession_${session.id}`,
                        parentId: "restoreSessionParent",
                        title: `${index + 1}. ${session.name}`,
                        contexts: ["page", "link"]
                    });
                    checkLastError(`restoreSession_${session.id}`);
                });
            }
        });
    });
}
function checkLastError(id) {
    if (chrome.runtime.lastError) {
        const msg = chrome.runtime.lastError.message;
        if (msg && !msg.includes("duplicate id")) {
            console.error(`Context menu error for ${id}:`, msg);
        }
    }
}
chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
        const newSeed = crypto.getRandomValues(new Uint32Array(4)).join('-');
        await chrome.storage.local.set({ installSeed: newSeed });
    } else if (details.reason === 'update') {
        try {
            // Migration cho Zapper
            const legacy = await chrome.storage.local.get(['easyListParsedCssRules']);
            if (legacy.easyListParsedCssRules) {
                await chrome.storage.local.set({ userZappedCssRules: legacy.easyListParsedCssRules });
            }
            const result = await chrome.storage.local.get(['adblockSettings']);
            const settings = result.adblockSettings || {};
            const enabledSources = settings.enabledSources || [];
            if (enabledSources.length > 0) {
                await chrome.declarativeNetRequest.updateEnabledRulesets({
                    enableRulesetIds: enabledSources
                });
                console.log('[AdBlock] Đã khôi phục rulesets:', enabledSources);
            }
        } catch (e) {
            console.error('[AdBlock] Lỗi khôi phục rulesets:', e);
        }
    }

    createAllContextMenus();
    try {
        const result = await chrome.storage.local.get(['appSettings']);
        if (!result.appSettings) {
            await chrome.storage.local.set({ appSettings: DEFAULT_SETTINGS });
            console.log('Initialized default app settings on install');
        }
    } catch (e) {
        console.error('Error initializing default settings:', e);
    }
    await updateSecurityRules();
});
chrome.runtime.onStartup.addListener(createAllContextMenus);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_TOP_LEVEL_DOMAIN') {
        const url = sender.tab ? sender.tab.url : null;
        sendResponse({ domain: safeGetDomain(url) });
        return false;
    }
});

/**
 * Sync context menus when storage changes (e.g., sessions updated in popup)
 */
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.appSettings) {
        const oldValue = changes.appSettings.oldValue || {};
        const newValue = changes.appSettings.newValue || {};

        const oldSessions = oldValue.savedSessions || [];
        const newSessions = newValue.savedSessions || [];
        // Only recreate menus if sessions list actually changed
        if (JSON.stringify(oldSessions) !== JSON.stringify(newSessions)) {
            createAllContextMenus();
        }

        // Sync local variables and alarms
        videoDetectionEnabled = newValue.videoDownloaderEnabled || false;
        hibernationEnabled = newValue.hibernationEnabled || false;
        hibernationTimeout = newValue.hibernationTimeout || 30;

        if (newValue.hibernationEnabled !== oldValue.hibernationEnabled ||
            newValue.hibernationTimeout !== oldValue.hibernationTimeout) {
            updateHibernationAlarm(newValue.hibernationEnabled || false, newValue.hibernationTimeout || 30);
        }

        // Dynamic rule update on settings change
        updateSecurityRules();
    }
});

/**
 * Context Menu Click Handler
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    // Handle session saving commands
    if (info.menuItemId.startsWith("save")) {
        const mode = info.menuItemId;
        const allTabs = await chrome.tabs.query({});
        let tabsToSave = [];

        if (mode === "saveAllTabs") {
            tabsToSave = allTabs;
        } else if (mode === "saveNormalTabs") {
            tabsToSave = allTabs.filter(t => !t.incognito);
        } else if (mode === "saveIncognitoTabs") {
            tabsToSave = allTabs.filter(t => t.incognito);
        } else if (mode === "saveCurrentTab") {
            tabsToSave = [tab];
        }

        if (tabsToSave.length === 0) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon128.png',
                title: 'Session Manager',
                message: 'No suitable tabs found to save.'
            });
            return;
        }

        const timestamp = new Date().toLocaleString();
        const sessionName = `Quick Session (${timestamp})`;

        const sessionData = {
            id: Date.now(),
            name: sessionName,
            date: new Date().toISOString(),
            tabType: mode.replace("save", "").toLowerCase(),
            tabs: tabsToSave.map(t => ({
                url: t.url,
                title: t.title,
                incognito: t.incognito
            }))
        };

        const result = await chrome.storage.local.get(['appSettings']);
        const settings = result.appSettings ? { ...DEFAULT_SETTINGS, ...result.appSettings } : DEFAULT_SETTINGS;
        if (!settings.savedSessions) settings.savedSessions = [];
        settings.savedSessions.unshift(sessionData);

        await chrome.storage.local.set({ appSettings: settings });

        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Session Manager',
            message: `Saved session "${sessionName}" with ${tabsToSave.length} tabs.`
        });
    }
    // Handle session restoration commands
    else if (info.menuItemId.startsWith("restoreSession_")) {
        const sessionId = parseInt(info.menuItemId.split("_")[1]);
        const result = await chrome.storage.local.get(['appSettings']);
        const settings = result.appSettings ? { ...DEFAULT_SETTINGS, ...result.appSettings } : DEFAULT_SETTINGS;
        const sessions = settings.savedSessions || [];
        const session = sessions.find(s => s.id === sessionId);

        if (session) {
            // Group tabs by incognito status to open in correct window types
            const normalTabs = session.tabs.filter(t => !t.incognito);
            const incognitoTabs = session.tabs.filter(t => t.incognito);

            if (normalTabs.length > 0) {
                try {
                    chrome.windows.create({
                        url: normalTabs.map(t => t.url),
                        incognito: false
                    });
                } catch (error) {
                    console.error("Error creating normal window:", error);
                }
            }

            if (incognitoTabs.length > 0) {
                chrome.extension.isAllowedIncognitoAccess(async (isAllowed) => {
                    if (isAllowed) {
                        try {
                            chrome.windows.create({
                                url: incognitoTabs.map(t => t.url),
                                incognito: true
                            });
                        } catch (error) {
                            console.error("Error creating incognito window:", error);
                        }
                    } else {
                        // Fallback to normal window if incognito access not granted
                        try {
                            chrome.windows.create({
                                url: incognitoTabs.map(t => t.url),
                                incognito: false
                            });
                        } catch (error) {
                            console.error("Error creating fallback normal window:", error);
                        }
                    }
                });
            }
        }
    }
    // Handle Quick Panic and Vault additions
    else if (info.menuItemId === "quickPanic") {
        executePanic();
    } else if (info.menuItemId === "addToVault") {
        const item = {
            id: Date.now(),
            title: tab.title || "No Title",
            url: info.linkUrl || info.pageUrl,
            date: new Date().toISOString()
        };

        chrome.storage.local.get(['privacyVault'], (result) => {
            const vault = result.privacyVault || [];
            vault.push(item);
            chrome.storage.local.set({ privacyVault: vault }, () => {
                syncVaultToCloud();
                chrome.notifications.create({
                    type: 'basic',
                    title: 'Privacy Vault',
                    message: `Đã thêm "${item.title.substring(0, 20)}..." vào két sắt bí mật!`,
                    iconUrl: 'icons/icon128.png'
                });
            });
        });
    } else if (info.menuItemId === "addToFavorites") {
        const favoriteItem = {
            name: tab.title || "Website",
            url: info.linkUrl || info.pageUrl
        };
        chrome.storage.local.get(['appSettings'], (result) => {
            const settings = result.appSettings || DEFAULT_SETTINGS;
            if (!settings.favoriteWebsites) settings.favoriteWebsites = [];

            // Check if already exists
            const exists = settings.favoriteWebsites.some(f => f.url === favoriteItem.url);
            if (!exists) {
                settings.favoriteWebsites.push(favoriteItem);
                chrome.storage.local.set({ appSettings: settings }, () => {
                    chrome.notifications.create({
                        type: 'basic',
                        title: 'Favorite Websites',
                        message: `Đã thêm "${favoriteItem.name}" vào danh sách yêu thích!`,
                        iconUrl: 'icons/icon128.png'
                    });
                });
            } else {
                chrome.notifications.create({
                    type: 'basic',
                    title: 'Favorite Websites',
                    message: `Trang này đã có trong danh sách yêu thích!`,
                    iconUrl: 'icons/icon128.png'
                });
            }
        });
    } else if (info.menuItemId === "quickSaveSession") {
        executeQuickSaveSession();
    }
});

/**
 * Initialize extension state from storage
 */
//Replace callback with Promise-based API
chrome.storage.local.get(['appSettings']).then((result) => {
    const settings = result.appSettings ? { ...DEFAULT_SETTINGS, ...result.appSettings } : DEFAULT_SETTINGS;
    videoDetectionEnabled = settings.videoDownloaderEnabled || false;
    hibernationEnabled = settings.hibernationEnabled || false;
    hibernationTimeout = settings.hibernationTimeout || 30;
    updateHibernationAlarm(hibernationEnabled, hibernationTimeout);
});

// Common tracker domains for detection
const TRACKER_DOMAINS = [
    'google-analytics.com', 'doubleclick.net', 'facebook.net', 'googlesyndication.com',
    'adnxs.com', 'quantserve.com', 'scorecardresearch.com', 'amazon-adsystem.com',
    'casalemedia.com', 'criteo.com', 'rubiconproject.com', 'pubmatic.com'
];

// Video file extensions and patterns to monitor
const VIDEO_EXTENSIONS = ['mp4', 'mkv', 'webm', 'avi', 'mov', 'flv', 'wmv', 'm3u8', 'ts', 'mpd', 'm4v', '3gp', 'ogv', 'm4s'];
const TELEGRAM_STREAM_PATTERN = [
    'https://web.telegram.org/stream/*',
    'https://webk.telegram.org/stream/*',
    'https://webz.telegram.org/stream/*'
];

/**
 * Detect Telegram video streams via network requests
 */
function setupTelegramStreamDetection() {
    chrome.webRequest.onBeforeRequest.addListener(
        (details) => {
            if (!videoDetectionEnabled || details.tabId === -1) return;

            const url = details.url;
            if (!url.includes('/stream/')) return;

            try {
                // Decode and parse JSON metadata from URL
                const encoded = url.split('/stream/')[1];
                const meta = JSON.parse(decodeURIComponent(encoded));

                const filename = meta.fileName || 'telegram_video.mp4';
                const size = meta.size ? (meta.size / 1024 / 1024).toFixed(1) + ' MB' : 'Streaming';

                addDetectedVideo(
                    details.tabId,
                    url, // Absolute URL for fetching
                    meta.mimeType || 'video/mp4',
                    size,
                    details.initiator,
                    ''
                );
            } catch (e) {
                // Fallback for parsing failures
                addDetectedVideo(details.tabId, url, 'video/mp4', 'Telegram Stream', details.initiator, '');
            }
        },
        { urls: TELEGRAM_STREAM_PATTERN },
        ['requestBody']
    );
}

/**
 * Monitor network requests for trackers and video files
 */
chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        if (details.tabId === -1) return;

        const urlString = details.url;
        const url = new URL(urlString);
        const isTracker = TRACKER_DOMAINS.some(domain => url.hostname.includes(domain));

        if (isTracker) {
            const domain = url.hostname;

            // Update detailed tracker list per tab
            if (!trackerList[details.tabId]) trackerList[details.tabId] = [];
            const existing = trackerList[details.tabId].find(t => t.domain === domain);
            if (existing) {
                existing.count++;
                existing.lastSeen = Date.now();
            } else {
                trackerList[details.tabId].push({
                    domain: domain,
                    firstSeen: Date.now(),
                    lastSeen: Date.now(),
                    count: 1
                });
            }

            // Update total tracker count and notify popup
            trackerCount[details.tabId] = (trackerCount[details.tabId] || 0) + 1;
            saveStateToSession();
            chrome.runtime.sendMessage({
                type: 'updateTrackerCount',
                tabId: details.tabId,
                count: trackerCount[details.tabId],
                list: trackerList[details.tabId]
            }).catch(() => { });
        }

        // Detect videos via URL patterns
        if (videoDetectionEnabled) {
            const path = url.pathname.toLowerCase();
            const extension = path.split('.').pop();

            // Match manifest files or direct video links
            if (VIDEO_EXTENSIONS.includes(extension) ||
                urlString.includes('.m3u8') ||
                urlString.includes('.mpd') ||
                urlString.includes('googlevideo.com') ||
                urlString.includes('/videoplayback') ||
                urlString.includes('manifest') ||
                urlString.includes('.ts')) {

                // Filter out small segments for HLS streams
                if (extension === 'ts' && urlString.includes('seg-')) {
                    if (!urlString.includes('seg-1.')) return;
                }

                const type = extension || (urlString.includes('m3u8') ? 'm3u8' : 'video');
                addDetectedVideo(details.tabId, urlString, type, 'Streaming...', details.initiator, '');
            }
        }
    },
    { urls: ["<all_urls>"] }
);

/**
 * Handle new tab creation from Privacy Player (popup mode)
 */
chrome.webNavigation.onCreatedNavigationTarget.addListener((details) => {
    // sourceTabId -1 indicates creation from extension popup/iframe
    if (details.sourceTabId === -1) {
        chrome.storage.local.get(['appSettings'], (result) => {
            const settings = result.appSettings ? { ...DEFAULT_SETTINGS, ...result.appSettings } : DEFAULT_SETTINGS;

            // Redirect to incognito if configured
            if (settings.playerLinkBehavior === 'incognito') {
                chrome.extension.isAllowedIncognitoAccess((isAllowed) => {
                    if (isAllowed) {
                        chrome.tabs.remove(details.tabId); // Close original tab
                        chrome.windows.create({
                            url: details.url,
                            incognito: true,
                            type: 'popup',
                            width: 800,
                            height: 600
                        });
                    }
                });
            }
        });
    }
});

/**
 * Detect videos via Response Headers (MIME Types)
 */
chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
        if (!videoDetectionEnabled || details.tabId === -1) return;

        const contentTypeHeader = details.responseHeaders.find(h => h.name.toLowerCase() === 'content-type');
        const contentLengthHeader = details.responseHeaders.find(h => h.name.toLowerCase() === 'content-length');

        if (contentTypeHeader) {
            const contentType = contentTypeHeader.value.toLowerCase();
            // Check for video MIME types or common stream formats
            if (contentType.startsWith('video/') ||
                contentType === 'application/x-mpegurl' ||
                contentType === 'application/vnd.apple.mpegurl' ||
                contentType === 'application/dash+xml' ||
                (contentType === 'application/octet-stream' && isVideoUrl(details.url))) {

                let size = 'Unknown size';
                if (contentLengthHeader) {
                    const bytes = parseInt(contentLengthHeader.value);
                    if (bytes > 1024 * 1024) size = (bytes / (1024 * 1024)).toFixed(1) + ' MB';
                    else if (bytes > 1024) size = (bytes / 1024).toFixed(1) + ' KB';
                    else size = bytes + ' bytes';
                }

                let type = contentType.split('/')[1] || 'video';
                if (type.includes(';')) type = type.split(';')[0];
                if (type === 'x-mpegurl' || type === 'vnd.apple.mpegurl') type = 'm3u8';

                addDetectedVideo(details.tabId, details.url, type, size, details.initiator, '');
            }
        }
    },
    { urls: ["<all_urls>"] },
    ["responseHeaders"]
);

/**
 * Check if a URL points to a video based on its file extension
 */
function isVideoUrl(url) {
    const path = new URL(url).pathname.toLowerCase();
    const extension = path.split('.').pop();
    return VIDEO_EXTENSIONS.includes(extension);
}

/**
 * Helper to add a detected video to the internal state and notify popup
 */
function addDetectedVideo(tabId, url, type, size = 'Unknown size', initiator = '', title = '', thumb = '', frameId = 0) {
    if (!detectedVideos[tabId]) {
        detectedVideos[tabId] = [];
    }

    // Prevent detecting requests initiated by the extension itself
    if (initiator && initiator.includes(chrome.runtime.id)) return;

    // Ignore invalid URLs
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('blob:')) {
        return;
    }    // nhưng nếu không thì bỏ qua để tránh crash
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('blob:')) {
        console.warn('[Video Detector] Bỏ qua URL không hợp lệ:', url.substring(0, 80));
        return;
    }

    // Check for existing video to update title or thumbnail
    const normalizedUrl = url.split('?')[0];
    const existingIndex = detectedVideos[tabId].findIndex(v => v.url.split('?')[0] === normalizedUrl);

    if (existingIndex !== -1) {
        const existing = detectedVideos[tabId][existingIndex];
        if (title && (!existing.filename || existing.filename.length < title.length)) {
            existing.filename = decodeURIComponent(title);
        }
        if (thumb && !existing.thumbnail) {
            existing.thumbnail = thumb;
        }
        return;
    }

    // Determine filename from URL or metadata
    let filename = '';
    if (url.startsWith('blob:')) {
        filename = title || `streaming_video_${Date.now()}`;
    } else {
        try {
            const urlObj = new URL(url);
            // Handle Telegram stream metadata
            if (url.includes('/stream/')) {
                try {
                    const meta = JSON.parse(decodeURIComponent(urlObj.pathname.split('/stream/')[1] || '{}'));
                    filename = title || meta.fileName || `telegram_stream_${Date.now()}.mp4`;
                } catch (e) {
                    filename = title || `telegram_stream_${Date.now()}.mp4`;
                }
            } else {
                filename = title || urlObj.pathname.split('/').pop() || 'video_file';
            }
        } catch (e) {
            filename = title || `video_${Date.now()}`;
        }
    }

    // Sanitize filename
    filename = filename.replace(/[<>:"/\\|?*]/g, '_').trim();
    if (!filename.includes('.')) {
        let ext = 'mp4';
        if (type.includes('m3u8')) ext = 'm3u8';
        else if (type.includes('mpd')) ext = 'mpd';
        filename += '.' + ext;
    }

    const videoData = {
        url, type, size,
        filename: decodeURIComponent(filename),
        thumbnail: thumb,
        tabId, frameId,
        timestamp: Date.now()
    };

    detectedVideos[tabId].push(videoData);
    saveStateToSession();

    // Update UI badge
    updateTabBadge(tabId);
    chrome.runtime.sendMessage({ type: 'newVideoDetected', tabId, video: videoData }).catch(() => { });

    // Trigger Global Media Sniffer Bubble
    chrome.tabs.sendMessage(tabId, { type: 'SHOW_SNIFFER_BUBBLE', video: videoData }).catch(() => { });
}

/**
 * Handle navigation inside iframes (Privacy Player)
 */
function handleIframeNavigation(details) {
    // Notify popup about iframe URL changes
    chrome.runtime.sendMessage({
        type: 'iframeNavigated',
        tabId: details.tabId,
        url: details.url,
        frameId: details.frameId,
        processId: details.processId,
        timestamp: Date.now()
    }).catch(() => { });
}

/**
 * Monitor sub-frame requests from Privacy Player
 */
chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        // Only track requests from the extension itself
        if (details.type === 'sub_frame' && details.initiator && details.initiator.startsWith('chrome-extension://')) {
            handleIframeNavigation(details);
        }
    },
    { urls: ["<all_urls>"] }
);

/**
 * Tab Updated Handler
 * Resets state on reload and handles auto-injection
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        tabLastActive[tabId] = Date.now(); // Update hibernation tracker
    }
    // 1. Reset data when tab starts loading
    if (changeInfo.status === 'loading') {
        trackerCount[tabId] = 0;
        trackerList[tabId] = [];
        detectedVideos[tabId] = [];
        updateTabBadge(tabId);
        saveStateToSession();
    }

    // 2. Update tabUrls for Auto-Cleanup logic
    if (tab.url && !tab.url.startsWith('chrome')) {
        tabUrls[tabId] = tab.url;
        saveStateToSession();
    }


    if (changeInfo.status === 'complete' && tab.url) {
        const isTelegram = ['web.telegram.org', 'webk.telegram.org', 'webz.telegram.org']
            .some(h => tab.url.includes(h));

        if (isTelegram) {
            chrome.storage.local.get(['appSettings'], (result) => {
                const settings = result.appSettings ? { ...DEFAULT_SETTINGS, ...result.appSettings } : DEFAULT_SETTINGS;
                if (settings.telegramDownloaderEnabled) {
                    chrome.scripting.executeScript({
                        target: { tabId },
                        files: ['telegram_content.js']
                    }).catch(err => console.error('Auto-inject Telegram error:', err));
                }
            });
        }
    }
});

// ============ Hàng đợi bền vững (Queue-Persist Cookie Destroyer) ============
const QUEUE_PREFIX = 'pendingDelete:';

async function enqueuePendingDeletion(domain) {
    const key = QUEUE_PREFIX + domain;
    await chrome.storage.local.set({ [key]: { queuedAt: Date.now() } });
}

async function markDeletionDone(domain) {
    const key = QUEUE_PREFIX + domain;
    await chrome.storage.local.remove(key);
}

let isProcessingCookieQueue = false;
async function processPendingDeletions() {
    if (isProcessingCookieQueue) return;
    isProcessingCookieQueue = true;
    try {
        const allKeys = await chrome.storage.local.get(null);
        const pendingDomains = Object.keys(allKeys)
            .filter(k => k.startsWith(QUEUE_PREFIX))
            .map(k => k.substring(QUEUE_PREFIX.length));

        if (pendingDomains.length === 0) return;

        // Giữ SW sống bằng ping nhẹ
        await new Promise(res => chrome.storage.local.get('__keepalive__', () => res()));

        for (const domain of pendingDomains) {
            try {
                const cookies = await chrome.cookies.getAll({ domain });
                await Promise.allSettled(
                    cookies.map(cookie => {
                        const url = (cookie.secure ? 'https://' : 'http://') + cookie.domain.replace(/^\./, '') + cookie.path;
                        return chrome.cookies.remove({ url, name: cookie.name });
                    })
                );
                await markDeletionDone(domain);
            } catch (err) {
                console.error(`[CookieDestroyer] Lỗi khi xóa domain ${domain}:`, err);
            }
        }
    } finally {
        isProcessingCookieQueue = false;
    }
}

chrome.runtime.onStartup.addListener(processPendingDeletions);
chrome.alarms.create('retryCookieDestroyer', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'retryCookieDestroyer') {
        processPendingDeletions();
    } else if (alarm.name === 'zenModeAlarm') {
        chrome.storage.local.remove(['zenEndTime']);
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [9000, 9001, 9002, 9003, 9004, 9005, 9006, 9007]
        });
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Zen Mode Hoàn tất',
            message: 'Chúc mừng bạn đã hoàn thành phiên làm việc tập trung!'
        });
    } else if (alarm.name === "hibernationCheck") {
        if (!hibernationEnabled) return;

        const now = Date.now();
        const timeoutMs = hibernationTimeout * 60 * 1000;

        chrome.tabs.query({ active: false, pinned: false, discarded: false }, (tabs) => {
            tabs.forEach(tab => {
                const lastActive = tabLastActive[tab.id] || 0;
                if (lastActive > 0 && (now - lastActive) > timeoutMs) {
                    chrome.tabs.discard(tab.id, (discardedTab) => {
                        if (chrome.runtime.lastError) {
                            console.error('Hibernation error:', chrome.runtime.lastError);
                        } else {
                            console.log(`Tab ${tab.id} hibernated to save RAM.`);
                        }
                    });
                }
            });
        });
    }
});

let batchTimer = null;
function scheduleDebouncedBatchProcess() {
    clearTimeout(batchTimer);
    batchTimer = setTimeout(processPendingDeletions, 500);
}

/**
 * Tab Removed Handler
 * Performs cleanup and auto-cookie destruction
 */
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    // 1. Cleanup Cookies & URL Mappings
    chrome.storage.local.get(['appSettings', 'tabUrlMapping'], async (result) => {
        const settings = result.appSettings ? { ...DEFAULT_SETTINGS, ...result.appSettings } : DEFAULT_SETTINGS;
        const mapping = result.tabUrlMapping || {};

        // Auto-Cleanup Cookies on tab close
        const urlToClean = tabUrls[tabId] || mapping[tabId];
        if (settings.cookieDestroyer && urlToClean) {
            const domain = safeGetDomain(urlToClean);
            if (domain) {
                const whitelist = settings.whitelist || [];
                const isWhitelisted = whitelist.some(w => domain === w || domain.endsWith('.' + w));

                if (!isWhitelisted) {
                    await enqueuePendingDeletion(domain);
                    if (removeInfo && removeInfo.isWindowClosing) {
                        scheduleDebouncedBatchProcess();
                    } else {
                        await processPendingDeletions();
                    }
                }
            }
        }

        // Remove mappings and URLs to prevent memory leaks
        if (mapping[tabId]) {
            delete mapping[tabId];
            chrome.storage.local.set({ tabUrlMapping: mapping });
        }
        delete tabUrls[tabId];
    });

    // 2. Clear memory-based state
    delete trackerCount[tabId];
    delete trackerList[tabId];
    delete detectedVideos[tabId];
    delete tabLastActive[tabId];
    saveStateToSession();
});

/**
 * Tab Hibernation Logic
 * Periodically discards inactive tabs to save RAM
 */
chrome.tabs.onActivated.addListener((activeInfo) => {
    tabLastActive[activeInfo.tabId] = Date.now();
    saveStateToSession();
});

function updateHibernationAlarm(enabled, timeout) {
    chrome.alarms.clear("hibernationCheck").then(() => {
        if (enabled) {
            chrome.alarms.create("hibernationCheck", { periodInMinutes: 1 });
            console.log(`Hibernation alarm registered. Timeout: ${timeout}m`);
        } else {
            console.log("Hibernation alarm disabled.");
        }
    }).catch(err => console.error("Alarm error:", err));
}


/**
 * Global Message Listener
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const tabId = request.tabId || (sender.tab ? sender.tab.id : null);

    if (request.type === 'ZAP_ELEMENT') {
        const { selector, domain } = request;
        chrome.storage.local.get(['userZappedCssRules'], (res) => {
            const rules = res.userZappedCssRules || {};
            if (!rules[domain]) rules[domain] = [];
            if (!rules[domain].includes(selector)) {
                rules[domain].push(selector);
                chrome.storage.local.set({ userZappedCssRules: rules });

                // Inject the rule immediately to the current tab
                if (sender.tab && sender.tab.id) {
                    chrome.scripting.insertCSS({
                        target: { tabId: sender.tab.id },
                        css: `${selector} { display: none !important; }`
                    }).catch(console.error);
                }
            }
        });
        return;
    } else if (request.type === 'ACTIVATE_ZAPPER') {
        chrome.scripting.executeScript({
            target: { tabId: request.tabId },
            files: ['modules/zapper-content.js']
        }).then(() => sendResponse({ success: true }))
          .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    } else if (request.type === 'START_ZEN') {
        const endTime = Date.now() + (request.minutes * 60 * 1000);
        chrome.storage.local.set({ zenEndTime: endTime });
        chrome.alarms.create('zenModeAlarm', { delayInMinutes: request.minutes });
        // Block social media
        const blockRules = [
            { id: 9000, priority: 1, action: { type: 'block' }, condition: { urlFilter: '||facebook.com', resourceTypes: ['main_frame'] } },
            { id: 9001, priority: 1, action: { type: 'block' }, condition: { urlFilter: '||twitter.com', resourceTypes: ['main_frame'] } },
            { id: 9002, priority: 1, action: { type: 'block' }, condition: { urlFilter: '||x.com', resourceTypes: ['main_frame'] } },
            { id: 9003, priority: 1, action: { type: 'block' }, condition: { urlFilter: '||reddit.com', resourceTypes: ['main_frame'] } },
            { id: 9004, priority: 1, action: { type: 'block' }, condition: { urlFilter: '||tiktok.com', resourceTypes: ['main_frame'] } },
            { id: 9005, priority: 1, action: { type: 'block' }, condition: { urlFilter: '||instagram.com', resourceTypes: ['main_frame'] } },
            { id: 9006, priority: 1, action: { type: 'block' }, condition: { urlFilter: '||netflix.com', resourceTypes: ['main_frame'] } },
            { id: 9007, priority: 1, action: { type: 'block' }, condition: { urlFilter: '||youtube.com', resourceTypes: ['main_frame'] } }
        ];
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [9000, 9001, 9002, 9003, 9004, 9005, 9006, 9007],
            addRules: blockRules
        });
        sendResponse({ success: true });
        return true;
    } else if (request.type === 'STOP_ZEN') {
        chrome.storage.local.remove(['zenEndTime']);
        chrome.alarms.clear('zenModeAlarm');
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [9000, 9001, 9002, 9003, 9004, 9005, 9006, 9007]
        });
        sendResponse({ success: true });
        return true;
    } else if (request.type === 'getTrackerCount' && tabId) {
        sendResponse({
            count: trackerCount[tabId] || 0,
            list: trackerList[tabId] || []
        });
    } else if (request.type === 'getDetectedVideos' && tabId) {
        sendResponse({ videos: detectedVideos[tabId] || [] });
    } else if (request.type === 'toggleVideoDetection') {
        videoDetectionEnabled = request.enabled;
    } else if (request.type === 'newVideoDetected' && tabId) {
        addDetectedVideo(tabId, request.video.url, request.video.type, request.video.size || 'Scan detected', '', request.video.filename, request.video.thumbnail, request.video.frameId);
    } else if (request.type === 'newVideoDetectedFromContent' && sender.tab) {
        if (request.video.currentFrameUrl) {
            chrome.runtime.sendMessage({
                type: 'iframeNavigated',
                url: request.video.currentFrameUrl,
                tabId: sender.tab.id,
                frameId: sender.frameId,
                fromContentScript: true
            }).catch(() => { });
        }
        addDetectedVideo(sender.tab.id, request.video.url, request.video.type, request.video.size || 'Detected', '', request.video.filename, request.video.thumbnail, sender.frameId);
    } else if (request.type === 'pageNavigatedInFrame') {
        chrome.runtime.sendMessage({
            type: 'iframeNavigated',
            url: request.url,
            title: request.title,
            tabId: sender.tab ? sender.tab.id : -1,
            fromContentScript: true
        }).catch(() => { });
    } else if (request.type === 'updateHibernation') {
        hibernationEnabled = request.enabled;
        hibernationTimeout = request.timeout;
    } else if (request.type === 'iframeNavigated') {
        const url = request.url;

        const isJunkUrl = (u) => {
            if (!u) return true;
            if (u === 'about:blank' || u === 'about:newtab') return true;
            if (u.startsWith('chrome:') || u.startsWith('chrome-extension:')) return true;
            if (u.startsWith('data:') || u.startsWith('blob:')) return true;
            try {
                const parsed = new URL(u);
                const path = parsed.pathname.toLowerCase();
                if (parsed.hostname === 'www.youtube.com' && path.includes('/live_chat')) return true;
                if (parsed.hostname === 'www.youtube.com' && path.includes('/heartbeat')) return true;
                const junkPaths = ['/analytics', '/pixel', '/collect', '/beacon', '/track', '/ping'];
                if (junkPaths.some(p => path.includes(p))) return true;
            } catch (e) { return true; }
            return false;
        };

        if (isJunkUrl(url)) return;

        chrome.storage.local.get(['tabUrlMapping', 'stealthHistory'], (result) => {
            const mapping = result.tabUrlMapping || {};
            const history = result.stealthHistory || [];

            let realTabId = null;
            if (sender.tab) {
                realTabId = sender.tab.id;
            } else if (request.tabId && request.tabId !== -1) {
                realTabId = request.tabId;
            }

            if (realTabId) {
                mapping[realTabId] = url;
            } else {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs[0]) mapping[tabs[0].id] = url;
                });
            }

            const fromPopup = !realTabId;
            let newHistory = [...history];
            if (fromPopup) {
                if (newHistory[newHistory.length - 1] !== url) {
                    newHistory.push(url);
                    if (newHistory.length > 50) newHistory = newHistory.slice(-50);
                }
                chrome.storage.local.set({
                    tabUrlMapping: mapping,
                    stealthHistory: newHistory,
                    lastPlayerUrl: url
                });
            } else {
                chrome.storage.local.set({ tabUrlMapping: mapping });
            }
            // if (newHistory[newHistory.length - 1] !== url) {
            //     newHistory.push(url);
            //     if (newHistory.length > 50) {
            //         newHistory = newHistory.slice(-50);
            //     }
            // }

            // chrome.storage.local.set({
            //     tabUrlMapping: mapping,
            //     stealthHistory: newHistory,
            //     lastPlayerUrl: url
            // });
        })
    } else if (request.type === 'tg_stats_update') {
        chrome.runtime.sendMessage(request).catch(() => { });
    } else if (request.type === 'createNotification') {
        chrome.notifications.create(request.options);
    } else if (request.type === 'updateSecurityRules') {
        updateSecurityRules();
        // Cập nhật lại badge cho tất cả các tab vì cài đặt adblock có thể thay đổi
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => updateTabBadge(tab.id));
        });

    } else if (request.type === 'tg_toggle_changed') {
        if (request.enabled) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const tab = tabs[0];
                if (tab && tab.url) {
                    const isTelegram = ['web.telegram.org', 'webk.telegram.org', 'webz.telegram.org']
                        .some(h => tab.url.includes(h));
                    if (isTelegram) {
                        chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            files: ['telegram_content.js']
                        }).catch(() => { });
                    }
                }
            });
        }
    }
});


/**
 * Panic Button Logic
 */
async function executePanic() {
    chrome.storage.local.get(['appSettings'], (result) => {
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
            case 'closeIncognito':
                chrome.windows.getAll({ populate: true }, (windows) => {
                    const normalWindow = windows.find(win => !win.incognito);
                    if (normalWindow) {
                        chrome.tabs.create({ windowId: normalWindow.id, url: safeUrl }).catch(() => { });
                    } else {
                        chrome.windows.create({ url: safeUrl }).catch(() => { });
                    }
                    windows.forEach(win => {
                        if (win.incognito) {
                            chrome.windows.remove(win.id).catch(() => { });
                        }
                    });
                });
                break;
            case 'redirectAll':
                chrome.tabs.query({}, (tabs) => {
                    tabs.forEach(tab => {
                        if (tab.url !== safeUrl) {
                            chrome.tabs.update(tab.id, { url: safeUrl }).catch(() => { });
                        }
                    });
                });
                break;
            case 'closeAll':
                chrome.windows.create({ url: safeUrl, focused: true }, (newWin) => {
                    chrome.windows.getAll({ populate: true }, (windows) => {
                        windows.forEach(win => {
                            if (win.id !== newWin.id) {
                                chrome.windows.remove(win.id).catch(() => { });
                            }
                        });
                    });
                });
                break;
        }
    });
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
                    iconUrl: 'icons/icon128.png'
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

/**
 * Global Listeners
 */
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['appSettings'], (result) => {
        const settings = result.appSettings || {};
        const useSidePanel = settings.useSidePanel || false;
        chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: useSidePanel }).catch(e => console.error(e));
    });

    chrome.notifications.create({
        type: 'basic',
        title: 'Privacy & Cookie Manager',
        message: 'Welcome to Cookie Manager! Click the extension icon to get started.',
        iconUrl: 'icons/icon128.png'
    });

    // Tạo menu chuột phải
    // chrome.contextMenus.create({ id: "addToVault", title: "Add to Privacy Vault 🔐", contexts: ["page", "link"] });
    // chrome.contextMenus.create({ id: "addToFavorites", title: "Add to Favorite Websites ⭐", contexts: ["page", "link"] });
    // chrome.contextMenus.create({ id: "quickPanic", title: "Quick Panic Button 🚨", contexts: ["all"] });
    // chrome.contextMenus.create({ id: "quickSaveSession", title: "Quick Save Session 📋", contexts: ["all"] });
});

chrome.commands.onCommand.addListener((command) => {
    if (command === "activate_panic") executePanic();
});

chrome.tabs.onCreated.addListener((tab) => {
    tabLastActive[tab.id] = Date.now(); // Track for hibernation
});

// Hàm cập nhật quy tắc bảo mật động (Clickjacking & Real-time Protection)
async function updateSecurityRules() {
    const result = await chrome.storage.local.get(['appSettings']);
    const settings = result.appSettings ? { ...DEFAULT_SETTINGS, ...result.appSettings } : DEFAULT_SETTINGS;
    const userWhitelist = settings.whitelist || [];

    // Các domain mặc định cần loại trừ để đảm bảo tính năng bảo mật/captcha hoạt động
    const baseExclusions = [
        'challenges.cloudflare.com',
        'cloudflare.com',
        'gstatic.com',
        'google.com',
        'hcaptcha.com',
        'recaptcha.net'
    ];

    // Kết hợp với whitelist của người dùng để cho phép họ tự khắc phục các trang bị lỗi
    const allExclusions = Array.from(new Set([...baseExclusions, ...userWhitelist]));

    const rulesToAdd = [];

    // 1. Clickjacking Protection Rule
    if (settings.blockClickjacking || settings.protectionLevel === 'enhanced' || settings.protectionLevel === 'noscript') {
        rulesToAdd.push({
            id: 1001,
            priority: 1,
            action: {
                type: 'modifyHeaders',
                responseHeaders: [
                    { header: 'X-Frame-Options', operation: 'set', value: 'SAMEORIGIN' }
                ]
            },
            condition: {
                urlFilter: '*',
                resourceTypes: ['main_frame', 'sub_frame'],
                excludedRequestDomains: allExclusions
            }
        });
    }

    // 1.1 Privacy Player - Allow Embedding for Search Engines (Unblocking rule)
    rulesToAdd.push({
        id: 2001,
        priority: 2, // Higher priority than protection rules
        action: {
            type: 'modifyHeaders',
            responseHeaders: [
                { header: 'X-Frame-Options', operation: 'remove' },
                { header: 'Content-Security-Policy', operation: 'remove' },
                { header: 'Frame-Options', operation: 'remove' }
            ]
        },
        condition: {
            urlFilter: '*',
            resourceTypes: ['sub_frame'],
            // Only strip headers for known search engine domains to allow them in Privacy Player
            requestDomains: [
                'google.com', 'www.google.com',
                'bing.com', 'www.bing.com',
                'yahoo.com', 'search.yahoo.com',
                'baidu.com', 'www.baidu.com',
                'yandex.com', 'yandex.ru'
            ]
        }
    });

    const sessionRulesToAdd = [];

    // 1.2 Privacy Player - Stateless Identity & Universal Embed rules targeting tabIds: [-1]
    if (settings.playerIsolatedIdentity) {
        sessionRulesToAdd.push({
            id: 2002,
            priority: 4,
            action: {
                type: 'modifyHeaders',
                requestHeaders: [
                    { header: 'Cookie', operation: 'remove' },
                    { header: 'Authorization', operation: 'remove' }
                ],
                responseHeaders: [
                    { header: 'Set-Cookie', operation: 'remove' }
                ]
            },
            condition: {
                urlFilter: '*',
                tabIds: [-1]
            }
        });
    }

    sessionRulesToAdd.push({
        id: 2003,
        priority: 4,
        action: {
            type: 'modifyHeaders',
            responseHeaders: [
                { header: 'X-Frame-Options', operation: 'remove' },
                { header: 'Content-Security-Policy', operation: 'remove' },
                { header: 'Frame-Options', operation: 'remove' }
            ]
        },
        condition: {
            urlFilter: '*',
            resourceTypes: ['sub_frame'],
            tabIds: [-1]
        }
    });

    // 2. Real-time Protection Rule
    if (settings.realTimeProtection || settings.protectionLevel === 'enhanced' || settings.protectionLevel === 'noscript') {
        const headers = [
            { header: 'X-Content-Type-Options', operation: 'set', value: 'nosniff' },
            { header: 'Referrer-Policy', operation: 'set', value: 'strict-origin-when-cross-origin' }
        ];

        // Loại bỏ X-XSS-Protection vì nó gây lỗi với Cloudflare và đã lỗi thời
        if (settings.protectionLevel === 'enhanced' || settings.protectionLevel === 'noscript') {
            headers.push({ header: 'Content-Security-Policy', operation: 'set', value: "upgrade-insecure-requests" });
        }

        rulesToAdd.push({
            id: 1002,
            priority: 1,
            action: {
                type: 'modifyHeaders',
                responseHeaders: headers
            },
            condition: {
                urlFilter: '*',
                resourceTypes: ['main_frame', 'sub_frame'],
                excludedRequestDomains: allExclusions,
                excludedInitiatorDomains: [
                    'challenges.cloudflare.com',
                    'cloudflare.com',
                    'hcaptcha.com',
                    'recaptcha.net'
                ]
            }
        });
    }

    // 3. NoScript (Max Security) - Chặn tất cả các script nhưng ngoại trừ captcha
    if (settings.protectionLevel === 'noscript') {
        rulesToAdd.push({
            id: 1003,
            priority: 2,
            action: { type: 'block' },
            condition: {
                urlFilter: '*',
                resourceTypes: ['script'],
                excludedRequestDomains: [
                    'challenges.cloudflare.com',
                    'cloudflare.com',
                    'gstatic.com',
                    'google.com',
                    'hcaptcha.com',
                    'recaptcha.net'
                ]
            }
        });
    }

    // 4. Chặn Popup quảng cáo cứng đầu (như miss.ai/pop và Tsyndicate, Adsterra, PropellerAds, PopAds)
    if (settings.linkClickBehavior === 'block' || settings.linkClickBehavior === 'player') {
        const adBlockRules = [
            { id: 1004, filter: '*miss.ai/pop*' },
            { id: 1005, filter: '*tsyndicate.com*' },
            { id: 1006, filter: '*tsyndicate.net*' },
            { id: 1007, filter: '*trafficstars.com*' },
            { id: 1008, filter: '*exoclick.com*' },
            { id: 1009, filter: '*tsyndicate.io*' },
            { id: 1010, filter: '*tsyndicads.com*' },
            { id: 1011, filter: '*onclickads.net*' },
            { id: 1012, filter: '*adsterra.com*' },
            { id: 1013, filter: '*propellerads.com*' },
            { id: 1014, filter: '*popads.net*' },
            { id: 1015, filter: '*popcash.net*' },
            { id: 1016, filter: '*mgid.com*' },
            { id: 1017, filter: '*clickadu.com*' },
            { id: 1018, filter: '*juicyads.com*' }
        ];

        adBlockRules.forEach(rule => {
            rulesToAdd.push({
                id: rule.id,
                priority: 3,
                action: { type: 'block' },
                condition: {
                    urlFilter: rule.filter,
                    resourceTypes: ['main_frame', 'sub_frame', 'script', 'xmlhttprequest', 'image', 'other']
                }
            });
        });
    }

    // 5. Áp dụng thêm quy tắc Adblock động đã được biên dịch (nếu adblockEnabled)
    if (settings.adblockEnabled) {
        try {
            const adblockStorage = await chrome.storage.local.get(['compiledAdblockRules']);
            const compiledRules = adblockStorage.compiledAdblockRules || [];
            compiledRules.forEach(rule => {
                // Chỉ nạp các quy tắc hợp lệ có ID từ 3000 trở đi để tránh đè lên quy tắc hệ thống
                if (rule.id >= 3000) {
                    rulesToAdd.push(rule);
                }
            });
        } catch (e) {
            console.error('[Background] Failed to load compiled adblock rules:', e);
        }
    }

    // Áp dụng các quy tắc mới bằng cách chia làm 2 nhóm để tránh lỗi nhóm này làm sập nhóm kia
    try {
        const existingRules = await chrome.declarativeNetRequest.getDynamicRules();

        const systemRulesToAdd = rulesToAdd.filter(r => r.id < 3000);
        const systemRuleIdsToRemove = existingRules.filter(r => r.id < 3000).map(r => r.id);

        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: systemRuleIdsToRemove,
            addRules: systemRulesToAdd
        });

        const adblockRulesToAdd = rulesToAdd.filter(r => r.id >= 3000);
        const adblockRuleIdsToRemove = existingRules.filter(r => r.id >= 3000).map(r => r.id);

        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: adblockRuleIdsToRemove,
            addRules: adblockRulesToAdd
        });

        console.log(`Dynamic rules updated successfully. System rules: ${systemRulesToAdd.length}, Adblock rules: ${adblockRulesToAdd.length}`);
    } catch (error) {
        console.error('Error updating security rules:', error);
    }

    try {
        const existingSessionRules = await chrome.declarativeNetRequest.getSessionRules();
        const existingSessionIds = existingSessionRules.map(r => r.id);

        await chrome.declarativeNetRequest.updateSessionRules({
            removeRuleIds: existingSessionIds,
            addRules: sessionRulesToAdd
        });
        console.log('Session security rules updated successfully');
    } catch (error) {
        console.error('Error updating session security rules:', error);
    }
}

// Khởi chạy khi extension được load
updateSecurityRules();

// Thống kê quảng cáo bị chặn (Debug mode / Developer mode hỗ trợ onRuleMatchedDebug)
if (chrome.declarativeNetRequest && chrome.declarativeNetRequest.onRuleMatchedDebug) {
    chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
        if (info.rule && info.rule.ruleId >= 1004 && info.request && info.request.method !== 'OPTIONS') {
            chrome.storage.local.get(['adsBlockedCount'], (res) => {
                const current = res.adsBlockedCount || 0;
                chrome.storage.local.set({ adsBlockedCount: current + 1 });
            });
        }
    });
}

/**
 * Ephemeral Tabs (Smart Destroyer)
 */
// const tabUrls = {};
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url && !tab.url.startsWith('chrome://')) {
        tabUrls[tabId] = tab.url;
    }
});
chrome.tabs.onRemoved.addListener((tabId) => {
    const url = tabUrls[tabId];
    delete tabUrls[tabId];
    if (!url) return;
    try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        chrome.storage.local.get(['ephemeralDomains'], (res) => {
            const ephemerals = res.ephemeralDomains || [];
            if (ephemerals.includes(domain)) {
                // Check if other tabs have this domain
                let hasOther = false;
                for (const tId in tabUrls) {
                    if (tabUrls[tId].includes(domain)) hasOther = true;
                }
                if (!hasOther) {
                    chrome.browsingData.remove({
                        origins: [urlObj.origin]
                    }, {
                        "cache": true,
                        "cookies": true,
                        "localStorage": true,
                        "indexedDB": true
                    });
                }
            }
        });


    } catch (e) { }
});

