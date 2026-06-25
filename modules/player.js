import { elements, settings, notify, saveSettings, state } from '../popup.js';
import { isValidUrl } from './utils.js';

const translations = window.translations;

let playerScale = 100;
let playerHeight = 400;
let playerHistory = [];
let currentUrlIndex = -1;
let isNavigating = false;
let _messageListenerAdded = false;
let _isFullscreen = false;

// Search engine map - dùng settings.searchEngine của user
const SEARCH_ENGINES = {
    google: 'https://www.google.com/search?q=',
    duckduckgo: 'https://duckduckgo.com/?q=',
    bing: 'https://www.bing.com/search?q=',
    yahoo: 'https://search.yahoo.com/search?p=',
    brave: 'https://search.brave.com/search?q=',
};

// ─── URL Helpers ──────────────────────────────────────────────────────────────
function normalizeInputUrl(input) {
    if (!input) return '';
    const trimmed = input.trim();
    if (isValidUrl(trimmed)) return trimmed;
    if (/^[a-z0-9-]+(\.[a-z]{2,})/i.test(trimmed) && !trimmed.includes(' ')) {
        const withProtocol = 'https://' + trimmed;
        if (isValidUrl(withProtocol)) return withProtocol;
    }
    return trimmed;
}

function buildSearchUrl(query) {
    const engine = settings.searchEngine || 'google';
    const base = SEARCH_ENGINES[engine] || SEARCH_ENGINES.google;
    return `${base}${encodeURIComponent(query)}`;
}

function normalizeForHistory(u) {
    try {
        const parsed = new URL(u);
        return parsed.origin + parsed.pathname + parsed.search;
    } catch { return u; }
}

// ─── Loading State ────────────────────────────────────────────────────────────
function setPlayerLoading(isLoading) {
    const container = elements.playerContainer;
    if (!container) return;
    container.classList.toggle('player-loading', isLoading);
}

// ─── Info Bar ─────────────────────────────────────────────────────────────────
function updateInfoBar(url) {
    const bar = document.getElementById('playerInfoBar');
    if (!bar) return;
    if (!url || url === 'about:blank') {
        bar.classList.add('hidden');
        return;
    }
    try {
        const parsed = new URL(url);
        const isSecure = parsed.protocol === 'https:';
        bar.innerHTML = `
            <span class="info-bar-lock">${isSecure ? '🔒' : '⚠️'}</span>
            <span class="info-bar-domain">${parsed.hostname}</span>
        `;
        bar.classList.remove('hidden');
    } catch {
        bar.classList.add('hidden');
    }
}

// ─── History Persistence ──────────────────────────────────────────────────────
function persistHistory() {
    const toStore = playerHistory.slice(-50);
    chrome.storage.local.set({ stealthHistory: toStore, stealthHistoryIndex: currentUrlIndex });
}

// ─── Inline Confirm (replaces native confirm() blocked by CSP) ────────────────
function showInlineConfirm(message, onConfirm) {
    const existing = document.getElementById('playerConfirmOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'playerConfirmOverlay';
    overlay.className = 'player-confirm-overlay';
    overlay.innerHTML = `
        <div class="player-confirm-box">
            <p>${message}</p>
            <div class="player-confirm-actions">
                <button class="confirm-cancel-btn">Hủy</button>
                <button class="confirm-ok-btn">Xóa</button>
            </div>
        </div>
    `;

    const stealthSection = document.getElementById('stealthSection');
    (stealthSection || document.body).appendChild(overlay);

    overlay.querySelector('.confirm-ok-btn').addEventListener('click', () => {
        overlay.remove();
        onConfirm();
    });
    overlay.querySelector('.confirm-cancel-btn').addEventListener('click', () => {
        overlay.remove();
    });
}

// ─── Internal: load URL into iframe ──────────────────────────────────────────
function _loadIntoPlayer(url) {
    const { stealthPlayer, playerContainer } = elements;
    if (!stealthPlayer) return;
    setPlayerLoading(true);
    stealthPlayer.src = url;
    updateInfoBar(url);
    playerContainer?.classList.add('has-content');
    chrome.storage.local.set({ lastPlayerUrl: url });
}

// ─── Internal: add URL to history ────────────────────────────────────────────
function _addToHistory(url) {
    const normalized = normalizeForHistory(url);
    const currentNorm = playerHistory[currentUrlIndex] ? normalizeForHistory(playerHistory[currentUrlIndex]) : null;
    if (normalized === currentNorm) return;

    playerHistory = playerHistory.slice(0, currentUrlIndex + 1);
    playerHistory.push(url);
    if (playerHistory.length > 50) playerHistory.shift();
    currentUrlIndex = playerHistory.length - 1;
    updatePlayerNavState();
    persistHistory();
}

// ─── Open Stealth Window (MV3 compatible) ────────────────────────────────────
function openStealthWindowInternal(url) {
    if (!url) {
        notify('Vui lòng nhập URL trước.', 'warning');
        return;
    }
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;

    // MV3: chrome.extension.isAllowedIncognitoAccess is deprecated
    chrome.windows.create({ url: formattedUrl, type: 'popup', width: 1024, height: 768, incognito: true }, () => {
        if (chrome.runtime.lastError) {
            chrome.windows.create({ url: formattedUrl, type: 'popup', width: 1024, height: 768 }, () => {
                setTimeout(() => {
                    chrome.history.deleteUrl({ url: formattedUrl });
                    notify('Stealth Window mở (không có Incognito, đã xóa lịch sử).', 'warning');
                }, 3000);
            });
        } else {
            notify('Incognito Stealth Window đã mở!', 'success');
        }
    });
}

// ─── Fullscreen ───────────────────────────────────────────────────────────────
function toggleFullscreen() {
    const container = elements.playerContainer;
    if (!container) return;
    if (!document.fullscreenElement) {
        (container.requestFullscreen || container.webkitRequestFullscreen || (() => {})).call(container);
    } else {
        (document.exitFullscreen || document.webkitExitFullscreen || (() => {})).call(document);
    }
}

// ─── Add current page to favorites ───────────────────────────────────────────
function addCurrentPageToFavorites() {
    const url = elements.stealthUrl?.value.trim();
    if (!url || !isValidUrl(url)) {
        notify('Không có URL hợp lệ để thêm vào yêu thích.', 'warning');
        return;
    }
    try {
        const hostname = new URL(url).hostname.replace('www.', '');
        if (settings.favoriteWebsites.some(f => f.url === url)) {
            notify('Trang này đã có trong danh sách yêu thích!', 'warning');
            return;
        }
        settings.favoriteWebsites.push({ name: hostname, url });
        saveSettings();
        renderFavoriteWebsites();
        notify(`Đã thêm "${hostname}" vào yêu thích!`, 'success');
    } catch {
        notify('Không thể thêm URL này.', 'error');
    }
}

// ─── Core: Load Content ───────────────────────────────────────────────────────
export function loadPlayerContent() {
    const { stealthUrl, stealthPlayer } = elements;
    if (!stealthUrl || !stealthPlayer) return;

    const raw = stealthUrl.value.trim();

    if (!raw) {
        if (!settings.autoClearStealth) {
            chrome.storage.local.get(['stealthHistory', 'stealthHistoryIndex', 'lastPlayerUrl'], (result) => {
                const history = result.stealthHistory || [];
                if (history.length > 0) {
                    playerHistory = history;
                    currentUrlIndex = result.stealthHistoryIndex ?? history.length - 1;
                    const lastUrl = playerHistory[currentUrlIndex];
                    stealthUrl.value = lastUrl;
                    _loadIntoPlayer(lastUrl);
                    updatePlayerNavState();
                    notify('Privacy Player: Đã khôi phục lịch sử', 'success');
                } else if (result.lastPlayerUrl) {
                    playerHistory = [result.lastPlayerUrl];
                    currentUrlIndex = 0;
                    stealthUrl.value = result.lastPlayerUrl;
                    _loadIntoPlayer(result.lastPlayerUrl);
                    updatePlayerNavState();
                }
            });
        } else {
            chrome.storage.local.remove(['stealthHistory', 'stealthHistoryIndex', 'lastPlayerUrl']);
            playerHistory = [];
            currentUrlIndex = -1;
            stealthPlayer.src = 'about:blank';
            elements.playerContainer?.classList.remove('has-content');
            updateInfoBar('');
            updatePlayerNavState();
        }
        return;
    }

    const url = normalizeInputUrl(raw);
    stealthUrl.value = url;

    if (isValidUrl(url)) {
        _addToHistory(url);
        _loadIntoPlayer(url);
        notify('Privacy Player: Đang tải...', 'success');
    } else {
        const searchUrl = buildSearchUrl(raw);
        _addToHistory(searchUrl);
        _loadIntoPlayer(searchUrl);
        notify('Privacy Player: Đang tìm kiếm...', 'success');
    }
}

// ─── Sandbox ──────────────────────────────────────────────────────────────────
export function updatePlayerSandbox() {
    const { stealthPlayer } = elements;
    if (!stealthPlayer) return;
    stealthPlayer.setAttribute('sandbox', [
        'allow-scripts', 'allow-same-origin', 'allow-forms',
        'allow-popups', 'allow-popups-to-escape-sandbox',
        'allow-downloads', 'allow-presentation'
    ].join(' '));
}

// ─── Size ─────────────────────────────────────────────────────────────────────
export function updatePlayerSize() {
    const { playerContainer } = elements;
    if (!playerContainer) return;

    playerContainer.style.width = `${playerScale}%`;
    playerContainer.style.marginLeft = `${(100 - playerScale) / 2}%`;
    playerContainer.style.height = `${playerHeight}px`;

    const extraWidth = Math.max(0, (playerScale - 100) * 5);
    const extraHeight = Math.max(0, playerHeight - 400);
    const maxWidth = Math.min(800, window.innerWidth || 800);
    const targetWidth = Math.min(maxWidth, 800 + extraWidth);
    const targetHeight = Math.min(700, 500 + extraHeight);

    document.body.style.width = `${targetWidth}px`;
    document.body.style.height = `${targetHeight}px`;
}

// ─── Nav State ────────────────────────────────────────────────────────────────
export function updatePlayerNavState() {
    const { goBackPlayer, goForwardPlayer } = elements;
    if (goBackPlayer) goBackPlayer.disabled = currentUrlIndex <= 0;
    if (goForwardPlayer) goForwardPlayer.disabled = currentUrlIndex >= playerHistory.length - 1;
}

// ─── Render Favorites ─────────────────────────────────────────────────────────
export function renderFavoriteWebsites() {
    const { favoriteWebsitesList } = elements;
    if (!favoriteWebsitesList) return;

    const lang = settings.language || 'vi';
    const dict = translations[lang] || translations.vi;
    favoriteWebsitesList.innerHTML = '';

    if (!settings.favoriteWebsites || settings.favoriteWebsites.length === 0) {
        favoriteWebsitesList.innerHTML = `<p class="empty-favorites-card">${dict.noFavorites || '✨ Chưa có trang yêu thích nào.'}</p>`;
        return;
    }

    const fragment = document.createDocumentFragment();
    settings.favoriteWebsites.forEach((fav, index) => {
        const div = document.createElement('div');
        div.className = 'favorite-item';

        const favicon = document.createElement('img');
        favicon.className = 'favorite-favicon';
        favicon.width = 16;
        favicon.height = 16;
        try {
            const origin = new URL(fav.url).origin;
            favicon.src = `${origin}/favicon.ico`;
        } catch { favicon.src = 'icons/about-us.png'; }
        favicon.onerror = () => { favicon.src = 'icons/about-us.png'; };

        const nameSpan = document.createElement('span');
        nameSpan.className = 'favorite-name';
        nameSpan.title = fav.url;
        nameSpan.textContent = fav.name;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'favorite-actions';

        const goButton = document.createElement('button');
        goButton.className = 'favorite-go-btn';
        goButton.dataset.url = fav.url;
        goButton.title = `Mo ${fav.name}`;
        goButton.textContent = '🚀';

        const deleteButton = document.createElement('button');
        deleteButton.className = 'favorite-delete-btn';
        deleteButton.dataset.index = index;
        deleteButton.title = `Xoa ${fav.name}`;
        deleteButton.textContent = '🗑️';

        actionsDiv.appendChild(goButton);
        actionsDiv.appendChild(deleteButton);
        div.appendChild(favicon);
        div.appendChild(nameSpan);
        div.appendChild(actionsDiv);
        fragment.appendChild(div);
    });
    favoriteWebsitesList.appendChild(fragment);
}

// ─── Lock Screen ──────────────────────────────────────────────────────────────
export function checkStealthLock() {
    const { stealthLockScreen, stealthPassInput, unlockStealth } = elements;

    const proceedLoad = () => {
        state.isStealthUnlocked = true;
        if (stealthLockScreen) stealthLockScreen.classList.remove('show');

        const { stealthPlayer } = elements;
        if (stealthPlayer && (!stealthPlayer.src || stealthPlayer.src === 'about:blank' || stealthPlayer.src === location.href)) {
            chrome.storage.local.get(['lastPlayerUrl'], (res) => {
                if (res.lastPlayerUrl) {
                    _loadIntoPlayer(res.lastPlayerUrl);
                    if (elements.stealthUrl) elements.stealthUrl.value = res.lastPlayerUrl;
                    if (!playerHistory.includes(res.lastPlayerUrl)) {
                        playerHistory.push(res.lastPlayerUrl);
                        currentUrlIndex = playerHistory.length - 1;
                        updatePlayerNavState();
                    }
                    notify('Dang khoi phuc noi dung...', 'success');
                }
            });
        }
    };

    if (!state.isStealthUnlocked) {
        if (stealthLockScreen) stealthLockScreen.classList.add('show');
        import('../popup.js').then(popup => {
            popup.setupUnifiedLockScreen(stealthLockScreen, stealthPassInput, unlockStealth, proceedLoad);
        });
    } else {
        proceedLoad();
    }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
export function init() {
    const {
        stealthPlayer, loadStealth, openStealthWindow, enlargePlayer, shrinkPlayer,
        resetPlayer, goBackPlayer, goForwardPlayer, reloadPlayer, toggleTheaterMode,
        togglePip, addFavoriteBtn, newFavoriteName, newFavoriteUrl
    } = elements;

    updatePlayerSandbox();

    if (settings.followDefaultPlayerSize) {
        playerScale = settings.defaultPlayerWidth || 100;
        playerHeight = settings.defaultPlayerHeight || 400;
    }
    updatePlayerSize();
    checkStealthLock();

    // Enter key in URL bar
    const stealthUrlInput = elements.stealthUrl;
    if (stealthUrlInput) {
        stealthUrlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); loadPlayerContent(); }
        });
    }

    if (loadStealth) loadStealth.addEventListener('click', () => loadPlayerContent());

    if (stealthPlayer) {
        stealthPlayer.addEventListener('load', () => {
            setPlayerLoading(false);
            setTimeout(() => { isNavigating = false; }, 500);
            if (stealthPlayer.src && stealthPlayer.src !== 'about:blank' && stealthPlayer.src !== location.href) {
                elements.playerContainer?.classList.add('has-content');
                updateInfoBar(stealthPlayer.src);
            }
        });
        stealthPlayer.addEventListener('error', () => setPlayerLoading(false));
    }

    if (openStealthWindow) {
        openStealthWindow.addEventListener('click', () => {
            const url = elements.stealthUrl?.value.trim();
            openStealthWindowInternal(url);
        });
    }

    if (enlargePlayer) {
        enlargePlayer.addEventListener('click', () => {
            let changed = false;
            if (playerScale < 150) { playerScale += 10; changed = true; }
            if (playerHeight < 800) { playerHeight += 50; changed = true; }
            if (changed) {
                updatePlayerSize();
                if (!settings.followDefaultPlayerSize) {
                    settings.defaultPlayerWidth = playerScale;
                    settings.defaultPlayerHeight = playerHeight;
                    saveSettings();
                }
            } else {
                notify('Da dat kich thuoc toi da.', 'warning');
            }
        });
    }

    if (shrinkPlayer) {
        shrinkPlayer.addEventListener('click', () => {
            let changed = false;
            if (playerScale > 50) { playerScale -= 10; changed = true; }
            if (playerHeight > 250) { playerHeight -= 50; changed = true; }
            if (changed) {
                updatePlayerSize();
                if (!settings.followDefaultPlayerSize) {
                    settings.defaultPlayerWidth = playerScale;
                    settings.defaultPlayerHeight = playerHeight;
                    saveSettings();
                }
            } else {
                notify('Da dat kich thuoc toi thieu.', 'warning');
            }
        });
    }

    if (resetPlayer) {
        resetPlayer.addEventListener('click', () => {
            if (stealthPlayer) stealthPlayer.src = 'about:blank';
            if (elements.stealthUrl) elements.stealthUrl.value = '';
            elements.playerContainer?.classList.remove('has-content', 'player-loading');
            updateInfoBar('');
            playerHistory = [];
            currentUrlIndex = -1;
            updatePlayerNavState();
            chrome.storage.local.remove(['lastPlayerUrl']);
            notify('Player da reset!', 'success');
        });
    }

    if (goBackPlayer) {
        goBackPlayer.addEventListener('click', () => {
            if (currentUrlIndex > 0) {
                isNavigating = true;
                currentUrlIndex--;
                const prevUrl = playerHistory[currentUrlIndex];
                _loadIntoPlayer(prevUrl);
                if (elements.stealthUrl) elements.stealthUrl.value = prevUrl;
                updatePlayerNavState();
                setTimeout(() => { isNavigating = false; }, 1500);
            }
        });
    }

    if (goForwardPlayer) {
        goForwardPlayer.addEventListener('click', () => {
            if (currentUrlIndex < playerHistory.length - 1) {
                isNavigating = true;
                currentUrlIndex++;
                const nextUrl = playerHistory[currentUrlIndex];
                _loadIntoPlayer(nextUrl);
                if (elements.stealthUrl) elements.stealthUrl.value = nextUrl;
                updatePlayerNavState();
                setTimeout(() => { isNavigating = false; }, 1500);
            }
        });
    }

    if (reloadPlayer) {
        reloadPlayer.addEventListener('click', () => {
            const currentUrl = elements.stealthUrl?.value.trim();
            if (currentUrl && currentUrl !== 'about:blank' && stealthPlayer) {
                setPlayerLoading(true);
                stealthPlayer.src = currentUrl;
            }
        });
    }

    if (toggleTheaterMode) {
        toggleTheaterMode.addEventListener('click', () => {
            try { stealthPlayer?.contentWindow?.postMessage({ type: 'toggleTheaterMode' }, '*'); } catch {}
            toggleTheaterMode.classList.toggle('active');
        });
    }

    if (togglePip) {
        togglePip.addEventListener('click', () => {
            try {
                stealthPlayer?.contentWindow?.postMessage({ type: 'togglePip' }, '*');
                notify('Dang yeu cau Picture-in-Picture...', 'success');
            } catch {}
        });
    }

    const fullscreenBtn = document.getElementById('fullscreenPlayer');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
    document.addEventListener('fullscreenchange', () => {
        _isFullscreen = !!document.fullscreenElement;
        if (fullscreenBtn) {
            fullscreenBtn.title = _isFullscreen ? 'Thoat Toan Man Hinh' : 'Toan Man Hinh';
            fullscreenBtn.classList.toggle('active', _isFullscreen);
        }
    });

    const addCurrentBtn = document.getElementById('addCurrentToFavorite');
    if (addCurrentBtn) addCurrentBtn.addEventListener('click', addCurrentPageToFavorites);

    const clearHistoryBtn = document.getElementById('clearPlayerHistory');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            playerHistory = [];
            currentUrlIndex = -1;
            updatePlayerNavState();
            chrome.storage.local.remove(['stealthHistory', 'stealthHistoryIndex', 'lastPlayerUrl']);
            notify('Da xoa lich su Player.', 'success');
        });
    }

    if (addFavoriteBtn) {
        addFavoriteBtn.addEventListener('click', () => {
            if (!newFavoriteName || !newFavoriteUrl) return;
            const name = newFavoriteName.value.trim();
            const url = newFavoriteUrl.value.trim();
            if (!name || !url) { notify('Vui long nhap ten va URL.', 'warning'); return; }
            const normalizedUrl = normalizeInputUrl(url);
            if (!isValidUrl(normalizedUrl)) { notify('URL khong hop le.', 'error'); return; }
            if (settings.favoriteWebsites.some(f => f.url === normalizedUrl)) {
                notify('Trang nay da co trong danh sach!', 'warning'); return;
            }
            settings.favoriteWebsites.push({ name, url: normalizedUrl });
            saveSettings();
            renderFavoriteWebsites();
            newFavoriteName.value = '';
            newFavoriteUrl.value = '';
            notify(`Da them "${name}" vao yeu thich!`, 'success');
        });
    }

    const favoriteWebsitesList = document.getElementById('favoriteWebsitesList');
    if (favoriteWebsitesList) {
        favoriteWebsitesList.addEventListener('click', (e) => {
            const goBtn = e.target.closest('.favorite-go-btn');
            if (goBtn) {
                if (elements.stealthUrl) elements.stealthUrl.value = goBtn.dataset.url;
                loadPlayerContent();
                return;
            }
            const deleteBtn = e.target.closest('.favorite-delete-btn');
            if (deleteBtn) {
                const index = parseInt(deleteBtn.dataset.index);
                const fav = settings.favoriteWebsites[index];
                if (!fav) return;
                showInlineConfirm(`Xoa "${fav.name}" khoi danh sach yeu thich?`, () => {
                    settings.favoriteWebsites.splice(index, 1);
                    saveSettings();
                    renderFavoriteWebsites();
                    notify('Da xoa khoi danh sach yeu thich.', 'warning');
                });
            }
        });
    }

    if (!_messageListenerAdded) {
        _messageListenerAdded = true;
        chrome.runtime.onMessage.addListener((message) => {
            const { stealthPlayer: player } = elements;

            if (message.type === 'privacyPlayerLinkClicked') {
                const { url, action } = message;
                if (action === 'block') { notify('Link bi chan theo cai dat.', 'warning'); return; }
                if (action === 'newTab') { chrome.tabs.create({ url }); notify('Da mo trong tab moi!', 'success'); return; }
                if (action === 'incognito') { openStealthWindowInternal(url); return; }

                isNavigating = true;
                _addToHistory(url);
                if (player) player.src = url;
                if (elements.stealthUrl) elements.stealthUrl.value = url;
                updateInfoBar(url);
                setTimeout(() => { isNavigating = false; }, 1500);

            } else if (message.type === 'iframeNavigated') {
                const targetUrl = message.url;
                if (!targetUrl || targetUrl === 'about:blank' || targetUrl.startsWith('chrome')) return;

                const ignoredPaths = ['/analytics', '/pixel', '/collect', '/telemetry', '/beacon', '/event', '/track', '/tr/', '/ads/', '/advertising/', '/doubleclick/', '/gtm/', '/gtag/'];
                const ignoredExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'css', 'js', 'ico', 'woff', 'woff2', 'mp4', 'webm', 'ogg', 'mp3'];

                try {
                    const parsed = new URL(targetUrl);
                    const path = parsed.pathname.toLowerCase();
                    if (ignoredPaths.some(p => path.includes(p))) return;
                    if (ignoredExts.includes(path.split('.').pop())) return;
                    if (path.includes('/embed/') || path.includes('/player/')) return;
                    if (parsed.hostname.includes('duckduckgo.com') && path.includes('/post')) return;
                } catch { return; }

                if (!isNavigating) {
                    const normTarget = normalizeForHistory(targetUrl);
                    const normCurrent = normalizeForHistory(playerHistory[currentUrlIndex] || '');
                    if (normTarget !== normCurrent) {
                        if (elements.stealthUrl) elements.stealthUrl.value = targetUrl;
                        updateInfoBar(targetUrl);
                        _addToHistory(targetUrl);
                    }
                }
            }
        });
    }

    renderFavoriteWebsites();
    loadPlayerContent();
}
