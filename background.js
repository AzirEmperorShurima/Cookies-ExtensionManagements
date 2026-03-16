importScripts('email.min.js');

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

/**
 * Context Menu Management
 * Using Resilient Manifest V3 style to ensure menus are recreated when needed.
 */
function createAllContextMenus() {
    chrome.contextMenus.removeAll(() => {
        // 1. Create main session manager menu
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
        });

        // 3. Update restore session items from storage
        chrome.storage.local.get(['appSettings'], (result) => {
            const settings = result.appSettings || {};
            const sessions = settings.savedSessions || [];
            
            if (sessions.length === 0) {
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
                });
            }
        });
    });
}

chrome.runtime.onInstalled.addListener(createAllContextMenus);
chrome.runtime.onStartup.addListener(createAllContextMenus);

/**
 * Sync context menus when storage changes (e.g., sessions updated in popup)
 */
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.appSettings) {
        const oldSessions = changes.appSettings.oldValue?.savedSessions || [];
        const newSessions = changes.appSettings.newValue?.savedSessions || [];
        // Only recreate menus if sessions list actually changed
        if (JSON.stringify(oldSessions) !== JSON.stringify(newSessions)) {
            createAllContextMenus();
        }
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
        const settings = result.appSettings || {};
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
        const settings = result.appSettings || {};
        const sessions = settings.savedSessions || [];
        const session = sessions.find(s => s.id === sessionId);

        if (session) {
            // Group tabs by incognito status to open in correct window types
            const normalTabs = session.tabs.filter(t => !t.incognito);
            const incognitoTabs = session.tabs.filter(t => t.incognito);

            if (normalTabs.length > 0) {
                chrome.windows.create({
                    url: normalTabs.map(t => t.url),
                    incognito: false
                });
            }

            if (incognitoTabs.length > 0) {
                chrome.extension.isAllowedIncognitoAccess((isAllowed) => {
                    if (isAllowed) {
                        chrome.windows.create({
                            url: incognitoTabs.map(t => t.url),
                            incognito: true
                        });
                    } else {
                        // Fallback to normal window if incognito access not granted
                        chrome.windows.create({
                            url: incognitoTabs.map(t => t.url),
                            incognito: false
                        });
                    }
                });
            }
        }
    }
});

/**
 * Initialize extension state from storage
 */
chrome.storage.local.get(['appSettings'], (result) => {
    const settings = result.appSettings || {};
    videoDetectionEnabled = settings.videoDownloaderEnabled || false;
    hibernationEnabled = settings.hibernationEnabled || false;
    hibernationTimeout = settings.hibernationTimeout || 30;
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
            } catch(e) {
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
            chrome.runtime.sendMessage({
                type: 'updateTrackerCount',
                tabId: details.tabId,
                count: trackerCount[details.tabId],
                list: trackerList[details.tabId]
            }).catch(() => {});
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
            const settings = result.appSettings || {};
            
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
                } catch(e) {
                    filename = title || `telegram_stream_${Date.now()}.mp4`;
                }
            } else {
                filename = title || urlObj.pathname.split('/').pop() || 'video_file';
            }
        } catch(e) {
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

    // Update UI badge
    chrome.action.setBadgeText({ text: detectedVideos[tabId].length.toString(), tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#e53e3e' });
    chrome.runtime.sendMessage({ type: 'newVideoDetected', tabId, video: videoData }).catch(() => {});
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
    }).catch(() => {});
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
    // 1. Reset data when tab starts loading
    if (changeInfo.status === 'loading') {
        trackerCount[tabId] = 0;
        trackerList[tabId] = [];
        detectedVideos[tabId] = [];
        chrome.action.setBadgeText({ text: '', tabId: tabId });
    }

    // 2. Update tabUrls for Auto-Cleanup logic
    if (tab.url && !tab.url.startsWith('chrome')) {
        tabUrls[tabId] = tab.url;
    }

    // 3. Handle Privacy Player mapping
    chrome.storage.local.get(['privacyPlayerTabId', 'appSettings'], (result) => {
        const playerTabId = result.privacyPlayerTabId;
        if (tabId === playerTabId && changeInfo.url) {
            console.log('Privacy Player Container updated (ignoring URL update)');
        }
    });

    // 4. Auto-inject Telegram downloader script
    if (changeInfo.status === 'complete' && tab.url) {
        const isTelegram = ['web.telegram.org', 'webk.telegram.org', 'webz.telegram.org']
            .some(h => tab.url.includes(h));
            
        if (isTelegram) {
            chrome.storage.local.get(['appSettings'], (result) => {
                const settings = result.appSettings || {};
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

/**
 * Tab Removed Handler
 * Performs cleanup and auto-cookie destruction
 */
chrome.tabs.onRemoved.addListener((tabId) => {
    // 1. Cleanup Cookies & URL Mappings
    chrome.storage.local.get(['appSettings', 'tabUrlMapping', 'privacyPlayerTabId'], async (result) => {
        const settings = result.appSettings || {};
        const mapping = result.tabUrlMapping || {};
        const playerTabId = result.privacyPlayerTabId;
        
        // Handle Privacy Player closure
        if (tabId === playerTabId) {
            chrome.storage.local.remove('privacyPlayerTabId');
            if (settings.autoClearStealth) {
                chrome.storage.local.remove('lastPlayerUrl');
                console.log('Privacy Player: Auto-clear Stealth History (lastPlayerUrl removed)');
            }
        }

        // Auto-Cleanup Cookies on tab close
        const urlToClean = tabUrls[tabId] || mapping[tabId];
        if (settings.cookieDestroyer && urlToClean) {
            try {
                const url = new URL(urlToClean);
                const domain = url.hostname;
                const whitelist = settings.whitelist || [];
                
                const isWhitelisted = whitelist.some(d => domain.includes(d));
                
                if (!isWhitelisted) {
                    const cookies = await chrome.cookies.getAll({ domain: domain });
                    await Promise.all(
                        cookies.map(c => {
                            const cookieUrl = `http${c.secure ? 's' : ''}://${c.domain}${c.path}`;
                            return chrome.cookies.remove({ url: cookieUrl, name: c.name });
                        })
                    );
                    console.log(`Auto-Cleanup: Cookies for ${domain} removed.`);
                }
            } catch (e) {
                console.error('Auto-Cleanup Error:', e);
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
});

/**
 * Tab Hibernation Logic
 * Periodically discards inactive tabs to save RAM
 */
chrome.tabs.onActivated.addListener((activeInfo) => {
    tabLastActive[activeInfo.tabId] = Date.now();
});

setInterval(() => {
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
}, 60000); // Check every minute

/**
 * Global Message Listener
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const tabId = request.tabId || (sender.tab ? sender.tab.id : null);

    if (request.type === 'getTrackerCount' && tabId) {
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
            }).catch(() => {});
        }
        addDetectedVideo(sender.tab.id, request.video.url, request.video.type, request.video.size || 'Detected', '', request.video.filename, request.video.thumbnail, sender.frameId);
    } else if (request.type === 'pageNavigatedInFrame') {
        chrome.runtime.sendMessage({
            type: 'iframeNavigated',
            url: request.url,
            title: request.title,
            fromContentScript: true
        }).catch(() => {});
    } else if (request.type === 'updateHibernation') {
        hibernationEnabled = request.enabled;
        hibernationTimeout = request.timeout;
    } else if (request.type === 'iframeNavigated') {
        const url = request.url;
        chrome.storage.local.set({ lastPlayerUrl: url });

        if (sender.tab) {
            chrome.storage.local.get(['privacyPlayerTabId', 'tabUrlMapping'], (result) => {
                if (result.privacyPlayerTabId === sender.tab.id) {
                    const mapping = result.tabUrlMapping || {};
                    mapping[sender.tab.id] = url;
                    chrome.storage.local.set({ tabUrlMapping: mapping });
                }
            });
        } else {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const activeTab = tabs[0];
                if (activeTab) {
                    chrome.storage.local.get(['tabUrlMapping'], (mappingResult) => {
                        const mapping = mappingResult.tabUrlMapping || {};
                        mapping[activeTab.id] = url;
                        chrome.storage.local.set({ tabUrlMapping: mapping });
                    });
                }
            });
        }
    } else if (request.type === 'tg_stats_update') {
        chrome.runtime.sendMessage(request).catch(() => {});
    } else if (request.type === 'createNotification') {
        chrome.notifications.create(request.options);
    } else if (request.type === 'updateSecurityRules') {
        updateSecurityRules();
    } else if (request.type === 'setPrivacyPlayerTabId') {
        chrome.storage.local.set({ privacyPlayerTabId: sender.tab.id });
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
                        }).catch(() => {});
                    }
                }
            });
        }
    }
    return true;
});

// Lắng nghe sự kiện click menu chuột phải
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "quickPanic") {
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
            name: tab.title || "New Favorite",
            url: info.linkUrl || info.pageUrl
        };

        chrome.storage.local.get(['appSettings'], (result) => {
            const settings = result.appSettings || {};
            const favorites = settings.favoriteWebsites || [];
            if (!favorites.some(f => f.url === favoriteItem.url)) {
                favorites.push(favoriteItem);
                settings.favoriteWebsites = favorites;
                chrome.storage.local.set({ appSettings: settings }, () => {
                    chrome.notifications.create({
                        type: 'basic',
                        title: 'Favorite Websites',
                        message: `Đã thêm "${favoriteItem.name.substring(0, 20)}..." vào trang web yêu thích!`,
                        iconUrl: 'icons/icon128.png'
                    });
                });
            } else {
                chrome.notifications.create({
                    type: 'basic',
                    title: 'Favorite Websites',
                    message: 'Trang web này đã có trong danh sách yêu thích!',
                    iconUrl: 'icons/icon128.png'
                });
            }
        });
    } else if (info.menuItemId === "quickSaveSession") {
        executeQuickSaveSession();
    }
});

/**
 * Panic Button Logic
 */
async function executePanic() {
    chrome.storage.local.get(['appSettings'], (result) => {
        const settings = result.appSettings || {};
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
                    windows.forEach(win => {
                        if (win.incognito) chrome.windows.remove(win.id);
                    });
                    chrome.tabs.create({ url: safeUrl });
                });
                break;
            case 'redirectAll':
                chrome.tabs.query({}, (tabs) => {
                    tabs.forEach(tab => chrome.tabs.update(tab.id, { url: safeUrl }));
                });
                break;
            case 'closeAll':
                chrome.windows.create({ url: safeUrl, focused: true }, () => {
                    chrome.windows.getAll({}, (windows) => {
                        windows.forEach(win => {
                            chrome.windows.get(win.id, (w) => {
                                if (w.tabs && w.tabs[0] && w.tabs[0].url !== safeUrl) {
                                    chrome.windows.remove(win.id);
                                }
                            });
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
    chrome.contextMenus.create({ id: "addToVault", title: "Add to Privacy Vault 🔐", contexts: ["page", "link"] });
    chrome.contextMenus.create({ id: "addToFavorites", title: "Add to Favorite Websites ⭐", contexts: ["page", "link"] });
    chrome.contextMenus.create({ id: "quickPanic", title: "Quick Panic Button 🚨", contexts: ["all"] });
    chrome.contextMenus.create({ id: "quickSaveSession", title: "Quick Save Session 📋", contexts: ["all"] });
});

chrome.commands.onCommand.addListener((command) => {
    if (command === "activate_panic") executePanic();
});

// Chặn ngay lập tức các yêu cầu điều hướng từ tab mới tạo ra từ Player
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.frameId !== 0) return;
    chrome.storage.local.get(['appSettings', 'privacyPlayerTabId'], (result) => {
        const settings = result.appSettings || {};
        const playerTabId = result.privacyPlayerTabId;
        if ((settings.linkClickBehavior === 'player' || settings.linkClickBehavior === 'block') && playerTabId) {
            chrome.tabs.get(details.tabId, (tab) => {
                if (chrome.runtime.lastError || !tab) return;
                if (tab.openerTabId === playerTabId) {
                    chrome.tabs.remove(details.tabId);
                    if (settings.linkClickBehavior === 'player') {
                        chrome.tabs.sendMessage(parseInt(playerTabId), { type: 'loadUrlInPlayer', url: details.url }).catch(() => {});
                    }
                }
            });
        }
    });
});

chrome.tabs.onCreated.addListener((tab) => {
    chrome.storage.local.get(['appSettings', 'privacyPlayerTabId'], (result) => {
        const settings = result.appSettings || {};
        const playerTabId = result.privacyPlayerTabId;
        const isFromPlayer = tab.openerTabId && tab.openerTabId === playerTabId;
        if ((settings.linkClickBehavior === 'player' || settings.linkClickBehavior === 'block') && isFromPlayer) {
            chrome.tabs.remove(tab.id);
            const targetUrl = tab.pendingUrl || tab.url;
            if (targetUrl && !targetUrl.startsWith('chrome://')) {
                if (settings.linkClickBehavior === 'player' && playerTabId) {
                    chrome.tabs.sendMessage(parseInt(playerTabId), { type: 'loadUrlInPlayer', url: targetUrl }).catch(() => {});
                }
            }
        }
    });
});

// Hàm cập nhật quy tắc bảo mật động (Clickjacking & Real-time Protection)
async function updateSecurityRules() {
    const result = await chrome.storage.local.get(['appSettings']);
    const settings = result.appSettings || {};
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
    const ruleIdsToRemove = [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011];

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
        id: 1011,
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

    // 4. Chặn Popup quảng cáo cứng đầu (như miss.ai/pop và Tsyndicate)
    if (settings.linkClickBehavior === 'block' || settings.linkClickBehavior === 'player') {
        const adBlockRules = [
            { id: 1004, filter: '*miss.ai/pop*' },
            { id: 1005, filter: '*tsyndicate.com*' },
            { id: 1006, filter: '*tsyndicate.net*' },
            { id: 1007, filter: '*trafficstars.com*' },
            { id: 1008, filter: '*exoclick.com*' },
            { id: 1009, filter: '*tsyndicate.io*' },
            { id: 1010, filter: '*tsyndicads.com*' }
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

    // Áp dụng các quy tắc mới
    try {
        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: ruleIdsToRemove,
            addRules: rulesToAdd
        });
        console.log('Security rules updated successfully');
    } catch (error) {
        console.error('Error updating security rules:', error);
    }
}

// Khởi chạy khi extension được load
updateSecurityRules();

