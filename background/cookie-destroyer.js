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



// Zen Mode Context Menu
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "add-to-zen-mode",
        title: "Add current site to Zen Mode block",
        contexts: ["page"]
    });
});

function safeGetDomain(urlStr) {
    try {
        return new URL(urlStr).hostname;
    } catch (e) {
        return null;
    }
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "add-to-zen-mode") {
        const domain = safeGetDomain(tab.url);
        if (!domain) return;
        chrome.storage.local.get(['zenCustomUrls'], (result) => {
            let urls = result.zenCustomUrls;
            if (!urls || !Array.isArray(urls) || urls.length === 0) {
                urls = ['facebook.com', 'tiktok.com', 'youtube.com', 'instagram.com', 'twitter.com', 'x.com', 'reddit.com', 'netflix.com'];
            }
            if (!urls.includes(domain)) {
                urls.push(domain);
                chrome.storage.local.set({ zenCustomUrls: urls }, () => {
                    chrome.notifications.create({
                        type: "basic",
                        iconUrl: ASSETS.icons.default,
                        title: "Zen Mode",
                        message: "Added " + domain + " to Zen Mode blocklist!"
                    });
                });
            } else {
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: ASSETS.icons.default,
                    title: "Zen Mode",
                    message: domain + " is already blocked in Zen Mode."
                });
            }
        });
    }
});

