
// Quản lý DOM elements
const elements = {
    cookiesManager: document.getElementById('cookiesManager'),
    extensionManager: document.getElementById('extensionManager'),
    cookiesList: document.getElementById('cookiesList'),
    extensionsList: document.getElementById('extensionsList'),
    controls: document.getElementById('controls'),
    clearCookies: document.getElementById('clearCookies'),
    clearSiteData: document.getElementById('clearSiteData'),
    copyCurrentCookies: document.getElementById('copyCurrentCookies'),
    pasteCookies: document.getElementById('pasteCookies'),
    toggleTracking: document.getElementById('toggleTracking'),
    filterInput: document.getElementById('filterInput'),
    notification: document.getElementById('notification'),
    totalCookies: document.getElementById('totalCookies'),
    cookieTableContainer: document.getElementById('cookieTableContainer'),
    privacySettings: document.getElementById('privacySettings'),
    privacyPlayer: document.getElementById('privacyPlayer'),
    
    // Stealth elements
    stealthSection: document.getElementById('stealthSection'),
    stealthUrl: document.getElementById('stealthUrl'),
    loadStealth: document.getElementById('loadStealth'),
    openStealthWindow: document.getElementById('openStealthWindow'),
    stealthPlayer: document.getElementById('stealthPlayer'),
    stealthLockScreen: document.getElementById('stealthLockScreen'),
    stealthPassInput: document.getElementById('stealthPassInput'),
    toggleStealthPass: document.getElementById('toggleStealthPass'),
    unlockStealth: document.getElementById('unlockStealth'),
    stealthTitle: document.getElementById('stealthTitle'),
    
    // Password change elements
    appSettings: document.getElementById('appSettings'),
    oldPassInput: document.getElementById('oldPassInput'),
    verifyOldPass: document.getElementById('verifyOldPass'),
    toggleOldPass: document.getElementById('toggleOldPass'),
    newPassRow: document.getElementById('newPassRow'),
    newPassInput: document.getElementById('newPassInput'),
    toggleNewPass: document.getElementById('toggleNewPass'),
    confirmNewPassInput: document.getElementById('confirmNewPassInput'),
    toggleConfirmPass: document.getElementById('toggleConfirmPass'),
    saveNewPass: document.getElementById('saveNewPass'),
    strongPasswordToggle: document.getElementById('strongPasswordToggle'),
    alwaysRequirePasswordToggle: document.getElementById('alwaysRequirePasswordToggle'),
    showPasswordToggle: document.getElementById('showPasswordToggle'),
    passwordRequirementText: document.getElementById('passwordRequirementText'),
    
    // Navigation and toggles
    appSettingsBtn: document.getElementById('appSettingsBtn'),
    pipToggle: document.getElementById('pipToggle'),
    homeSection: document.getElementById('homeSection'),
    darkModeToggle: document.getElementById('darkModeToggle'),
    defaultPlayerWidth: document.getElementById('defaultPlayerWidth'),
    defaultPlayerHeight: document.getElementById('defaultPlayerHeight'),
    followDefaultPlayerSizeToggle: document.getElementById('followDefaultPlayerSizeToggle'),
    autoClearToggle: document.getElementById('autoClearToggle'),
    showNotifyToggle: document.getElementById('showNotifyToggle'),
    cookieDestroyerToggle: document.getElementById('cookieDestroyerToggle'),
    historyIncognitoToggle: document.getElementById('historyIncognitoToggle'),
    shrinkPlayer: document.getElementById('shrinkPlayer'),
    enlargePlayer: document.getElementById('enlargePlayer'),
    resetPlayer: document.getElementById('resetPlayer'),
    goBackPlayer: document.getElementById('goBackPlayer'),
    goForwardPlayer: document.getElementById('goForwardPlayer'),
    reloadPlayer: document.getElementById('reloadPlayer'),
    togglePip: document.getElementById('togglePip'),
    toggleTheaterMode: document.getElementById('toggleTheaterMode'),
    playerContainer: document.querySelector('.player-container'),
    
    // History
    historyManagerBtn: document.getElementById('historyManagerBtn'),
    historySection: document.getElementById('historySection'),
    historyList: document.getElementById('historyList'),
    deviceList: document.getElementById('deviceList'),
    historyRestrictedOverlay: document.getElementById('historyRestrictedOverlay'),
    historySearchInput: document.getElementById('historySearchInput'),
    bookmarksSearchInput: document.getElementById('bookmarksSearchInput'),
    bookmarksList: document.getElementById('bookmarksList'),
    readingListContainer: document.getElementById('readingListContainer'),
    clearHistorySearch: document.getElementById('clearHistorySearch'),
    
    // Dashboard Stats
    statCookies: document.getElementById('statCookies'),
    statExtensions: document.getElementById('statExtensions'),
    statTrackers: document.getElementById('statTrackers'),
    trackerModal: document.getElementById('trackerModal'),
    closeTrackerModal: document.getElementById('closeTrackerModal'),
    trackerDetailsList: document.querySelector('.tracker-details-list'),
    privacyScore: document.getElementById('privacyScore'),
    privacyGradeValue: document.getElementById('privacyGradeValue'),
    healthScoreText: document.getElementById('healthScoreText'),
    healthStatusText: document.getElementById('healthStatusText'),
    healthBarFill: document.getElementById('healthBarFill'),
    privacyInsightsList: document.getElementById('privacyInsightsList'),
    permanentBar: document.getElementById('permanentBar'),
    sessionBar: document.getElementById('sessionBar'),
    permanentCount: document.getElementById('permanentCount'),
    sessionCount: document.getElementById('sessionCount'),
    quickFocusMode: document.getElementById('quickFocusMode'),
    quickClearAll: document.getElementById('quickClearAll'),
    fixPrivacyBtn: document.getElementById('fixPrivacyBtn'),
    cardCookies: document.getElementById('cardCookies'),
    cardTrackers: document.getElementById('cardTrackers'),
    cardExtensions: document.getElementById('cardExtensions'),
    
    // Vault
    vaultBtn: document.getElementById('vaultBtn'),
    vaultSection: document.getElementById('vaultSection'),
    vaultLockScreen: document.getElementById('vaultLockScreen'),
    vaultPassInput: document.getElementById('vaultPassInput'),
    toggleVaultPass: document.getElementById('toggleVaultPass'),
    unlockVault: document.getElementById('unlockVault'),
    vaultList: document.getElementById('vaultList'),
    vaultInput: document.getElementById('vaultInput'),
    vaultAddBtn: document.getElementById('vaultAddBtn'),
    
    // Others
    searchEngineSelect: document.getElementById('searchEngineSelect'),
    newFavoriteName: document.getElementById('newFavoriteName'),
    newFavoriteUrl: document.getElementById('newFavoriteUrl'),
    addFavoriteBtn: document.getElementById('addFavoriteBtn'),
    favoriteWebsitesList: document.getElementById('favoriteWebsitesList'),
    useSidePanelToggle: document.getElementById('useSidePanelToggle'),
    switchViewBtn: document.getElementById('switchViewBtn'),
    realTimeProtectionToggle: document.getElementById('realTimeProtectionToggle'),
    blockClickjackingToggle: document.getElementById('blockClickjackingToggle'),
    blockCryptoMiningToggle: document.getElementById('blockCryptoMiningToggle'),
    protectionLevelSelect: document.getElementById('protectionLevelSelect'),
    languageSelect: document.getElementById('languageSelect'),
    playerBackgroundType: document.getElementById('playerBackgroundType'),
    playerLinkBehavior: document.getElementById('playerLinkBehavior'),
    playerLinkFilter: document.getElementById('playerLinkFilter'),
    playerLinkFilterRow: document.getElementById('playerLinkFilterRow'),
    customBgUrlRow: document.getElementById('customBgUrlRow'),
    customBgUrlInput: document.getElementById('customBgUrlInput'),
    addCustomBgBtn: document.getElementById('addCustomBgBtn'),
    customBgList: document.getElementById('customBgList'),
    bgPreviewImg: document.getElementById('bgPreviewImg'),
    bgPreviewPlaceholder: document.getElementById('bgPreviewPlaceholder'),
    panicActionSelect: document.getElementById('panicActionSelect'),
    panicDescText: document.getElementById('panicDescText'),
    currentPanicKey: document.getElementById('currentPanicKey'),
    changeShortcutBtn: document.getElementById('changeShortcutBtn'),
    newSafeUrlInput: document.getElementById('newSafeUrlInput'),
    addSafeUrlBtn: document.getElementById('addSafeUrlBtn'),
    safeUrlsList: document.getElementById('safeUrlsList'),
    mainPanicBtn: document.getElementById('mainPanicBtn'),
    settingsSearchInput: document.getElementById('settingsSearchInput'),
    clearSettingsSearch: document.getElementById('clearSettingsSearch'),
    settingsContainer: document.getElementById('settingsContainer'),
    sessionNameInput: document.getElementById('sessionNameInput'),
    sessionTabTypeSelect: document.getElementById('sessionTabTypeSelect'),
    saveSessionBtn: document.getElementById('saveSessionBtn'),
    sessionsList: document.getElementById('sessionsList'),
    
    // Features Sections
    telegramDownloaderBtn: document.getElementById('telegramDownloaderBtn'),
    telegramDownloaderToggle: document.getElementById('telegramDownloaderToggle'),
    telegramSection: document.getElementById('telegramSection'),
    telegramUrlInput: document.getElementById('telegramUrlInput'),
    extractTelegramBtn: document.getElementById('extractTelegramBtn'),
    scanTelegramMediaBtn: document.getElementById('scanTelegramMediaBtn'),
    telegramMediaList: document.getElementById('telegramMediaList'),
    telegramMediaItems: document.getElementById('telegramMediaItems'),
    telegramMediaPreview: document.getElementById('telegramMediaPreview'),
    videoDownloaderBtn: document.getElementById('videoDownloaderBtn'),
    videoDownloaderToggle: document.getElementById('videoDownloaderToggle'),
    videoDownloaderSection: document.getElementById('videoDownloaderSection'),
    videoList: document.getElementById('videoList'),
    scanVideoBtn: document.getElementById('scanVideoBtn'),
    
    // Multi Account
    multiAccountBtn: document.getElementById('multiAccountBtn'),
    multiAccountToggle: document.getElementById('multiAccountToggle'),
    multiAccountSection: document.getElementById('multiAccountSection'),
    newContainerName: document.getElementById('newContainerName'),
    newContainerColor: document.getElementById('newContainerColor'),
    newContainerMode: document.getElementById('newContainerMode'),
    containerIconPicker: document.getElementById('containerIconPicker'),
    addContainerBtn: document.getElementById('addContainerBtn'),
    quickIdentityBtn: document.getElementById('quickIdentityBtn'),
    containerList: document.getElementById('containerList'),
    
    // Hibernation
    hibernationToggle: document.getElementById('hibernationToggle'),
    hibernationTimeoutSelect: document.getElementById('hibernationTimeoutSelect'),
    hibernationCustomTimeout: document.getElementById('hibernationCustomTimeout'),
    hibernationTimeoutRow: document.getElementById('hibernationTimeoutRow'),
    
    // Auto-Cleanup Rules
    autoCleanupRulesSection: document.getElementById('autoCleanupRulesSection'),
    whitelistInput: document.getElementById('whitelistInput'),
    addWhitelistBtn: document.getElementById('addWhitelistBtn'),
    whitelistList: document.getElementById('whitelistList'),
    
    // Sync
    vaultSyncToggle: document.getElementById('vaultSyncToggle'),
    masterSyncSection: document.getElementById('masterSyncSection'),
    vaultLockScreen: document.getElementById('vaultLockScreen'),
    stealthLockScreen: document.getElementById('stealthLockScreen'),
    masterSyncKeyInput: document.getElementById('masterSyncKeyInput'),
    copyMasterKeyBtn: document.getElementById('copyMasterKeyBtn'),
    manualMasterKeyInput: document.getElementById('manualMasterKeyInput'),
    saveMasterKeyBtn: document.getElementById('saveMasterKeyBtn')
};

// Secret state
let isStealthUnlocked = false;
let isVaultUnlocked = false;

let isNavigating = false; // Flag to prevent history loops during back/forward
let playerScale = 100; // Default width scale in %
let playerHeight = 400; // Default height in px
let playerHistory = [];
let playerForwardStack = [];
let currentUrlIndex = -1;

// History Lazy Load State
let historyItemsBuffer = [];
let currentHistoryIndex = 0;
const historyChunkSize = 50;
let isLoadingHistoryChunks = false;
let lastRenderedDate = '';

let settings = {
    darkMode: false,
    autoClear: true,
    showNotifications: true,
    cookieDestroyer: false,
    historyIncognito: false,
    defaultPlayerWidth: 100, // Default width in %
    defaultPlayerHeight: 400, // Default height in px
    followDefaultPlayerSize: true, // New setting
    searchEngine: 'google', // Default search engine
    favoriteWebsites: [], // Array of { name, url }
    useSidePanel: false,
    realTimeProtection: true,
    blockClickjacking: true,
    blockCryptoMining: true,
    protectionLevel: 'standard',
    language: 'vi',
    playerBackgroundType: 'default',
    playerLinkBehavior: 'inside', // Default: open inside player
    playerLinkFilter: 'all', // Default: all links
    customBgUrl: '',
    customBgList: [],
    panicAction: 'closeIncognito',
    safeRedirectUrl: 'https://www.google.com',
    savedSessions: [],
    telegramDownloaderEnabled: false,
    videoDownloaderEnabled: false,
    multiAccountEnabled: false,
    accountContainers: [], // Array of { id, name, color }
    hibernationEnabled: false,
    hibernationTimeout: 30, // Default 30 minutes
    whitelist: ['google.com', 'facebook.com', 'gmail.com', 'youtube.com', 'github.com'], // Default whitelist
    alwaysRequirePassword: true, // New setting: default to true for security
    vaultSyncEnabled: false,
    masterSyncKey: null // Encrypted Master Key
};

// Security Helpers
async function hashPassword(password, salt) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + (salt || ''));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function generateMasterKey() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Global state for session password
let secretCode = null; // Will be set upon successful unlock

chrome.storage.local.get(['stealthPasswordHash', 'stealthSalt', 'appSettings'], async (result) => {
    if (result.appSettings) {
        settings = { ...settings, ...result.appSettings };
        applySettings();
        
        // If sync is enabled and we have a session password, decrypt and show master key
        if (settings.vaultSyncEnabled && settings.masterSyncKey) {
            chrome.storage.session.get(['sessionPassword'], async (sessionResult) => {
                if (sessionResult.sessionPassword) {
                    secretCode = sessionResult.sessionPassword;
                    const decryptedKey = await decryptData(settings.masterSyncKey, secretCode);
                    elements.masterSyncKeyInput.value = decryptedKey || '********';
                }
            });
        }
    }
});

/**
/**
 * Kiểm tra xem một chuỗi có phải là URL hợp lệ hay không.
 */
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (e) {
        return false;
    }
}

function applySettings() {
    // Apply Dark Mode
    document.body.classList.toggle('dark-mode', settings.darkMode);
    elements.darkModeToggle.checked = settings.darkMode;
    
    // Set other toggles
    elements.autoClearToggle.checked = settings.autoClear;
    elements.showNotifyToggle.checked = settings.showNotifications;
    elements.cookieDestroyerToggle.checked = settings.cookieDestroyer;
    elements.historyIncognitoToggle.checked = settings.historyIncognito;
    elements.useSidePanelToggle.checked = settings.useSidePanel || false;
    elements.realTimeProtectionToggle.checked = settings.realTimeProtection ?? true;
    elements.blockClickjackingToggle.checked = settings.blockClickjacking ?? true;
    elements.blockCryptoMiningToggle.checked = settings.blockCryptoMining ?? true;
    elements.strongPasswordToggle.checked = settings.requireStrongPassword ?? false;
    elements.alwaysRequirePasswordToggle.checked = settings.alwaysRequirePassword ?? true;
    elements.showPasswordToggle.checked = settings.showPasswordInSettings ?? true;
    
    // Cập nhật trạng thái hiển thị của các nút ẩn/hiện password
    togglePasswordEyes();

    elements.telegramDownloaderToggle.checked = settings.telegramDownloaderEnabled || false;
    elements.videoDownloaderToggle.checked = settings.videoDownloaderEnabled || false;
    elements.pipToggle.checked = settings.pipEnabled || false;
    elements.multiAccountToggle.checked = settings.multiAccountEnabled || false;
    elements.hibernationToggle.checked = settings.hibernationEnabled || false;
    
    // Hibernation Timeout initialization
    if (settings.hibernationTimeout && !['1', '5', '15', '30', '60'].includes(settings.hibernationTimeout.toString())) {
        elements.hibernationTimeoutSelect.value = 'custom';
        elements.hibernationCustomTimeout.classList.remove('hidden');
        elements.hibernationCustomTimeout.value = settings.hibernationTimeout;
    } else {
        elements.hibernationTimeoutSelect.value = settings.hibernationTimeout || 30;
        elements.hibernationCustomTimeout.classList.add('hidden');
    }
    
    elements.hibernationTimeoutRow.style.display = settings.hibernationEnabled ? 'flex' : 'none';
    elements.vaultSyncToggle.checked = settings.vaultSyncEnabled || false;
    elements.masterSyncSection.style.display = settings.vaultSyncEnabled ? 'block' : 'none';
    
    // Auto-Cleanup Rules visibility
    elements.autoCleanupRulesSection.style.display = settings.cookieDestroyer ? 'block' : 'none';
    renderWhitelist();

    // Show/hide buttons based on setting
    elements.telegramDownloaderBtn.classList.toggle('hidden', !settings.telegramDownloaderEnabled);
    elements.videoDownloaderBtn.classList.toggle('hidden', !settings.videoDownloaderEnabled);
    elements.togglePip.classList.toggle('hidden', !settings.pipEnabled);
    elements.multiAccountBtn.classList.toggle('hidden', !settings.multiAccountEnabled);

    // Player settings
    elements.defaultPlayerWidth.value = settings.defaultPlayerWidth;
    elements.defaultPlayerHeight.value = settings.defaultPlayerHeight;
    elements.followDefaultPlayerSizeToggle.checked = settings.followDefaultPlayerSize;
    elements.playerLinkBehavior.value = settings.playerLinkBehavior || 'inside';
    elements.playerLinkFilter.value = settings.playerLinkFilter || 'all';

    // Apply Search Engine setting
    elements.searchEngineSelect.value = settings.searchEngine;

    // Apply Protection Level setting
    elements.protectionLevelSelect.value = settings.protectionLevel || 'standard';

    // Apply Language setting
    elements.languageSelect.value = settings.language || 'vi';
    updateUILanguage();

    // Apply Background settings
    elements.playerBackgroundType.value = settings.playerBackgroundType || 'default';
    elements.playerLinkBehavior.value = settings.playerLinkBehavior || 'inside';
    elements.customBgUrlInput.value = ''; // Clear input on load
    toggleCustomBgUrlRow();
    renderCustomBgList();
    applyPlayerBackground();

    // Panic Button settings
    elements.panicActionSelect.value = settings.panicAction || 'closeIncognito';
    renderSafeUrls();
    
    // Render favorite websites and sessions
    renderFavoriteWebsites();
    renderSessions();

    // Khởi tạo mô tả Panic và phím tắt
    updatePanicDescription(settings.panicAction || 'closeIncognito');
    updateCurrentShortcutDisplay();
}

/**
 * Cập nhật ngôn ngữ giao diện dựa trên settings.language
 */
function updateUILanguage() {
    const lang = settings.language || 'vi';
    const dict = translations[lang] || translations.vi;

    // Cập nhật tất cả các phần tử có thuộc tính data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            // Tìm tất cả các thẻ con thực sự (như img, wrapper, badge)
            // Lọc bỏ các Text Node chứa Emoji/Icon trùng lặp
            const children = Array.from(el.childNodes).filter(node => 
                node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('beta-badge')
            );
            
            // Xóa sạch nội dung bên trong element
            el.innerHTML = '';
            
            // Chèn lại các thẻ con (như <img>)
            children.forEach(child => el.appendChild(child));
            
            // Thêm văn bản đã dịch (Hỗ trợ HTML nếu cần)
            const translatedText = dict[key];
            if (translatedText.includes('<') && translatedText.includes('>')) {
                const tempSpan = document.createElement('span');
                tempSpan.innerHTML = translatedText;
                el.appendChild(tempSpan);
            } else {
                const textNode = document.createTextNode(' ' + translatedText);
                el.appendChild(textNode);
            }

            // Xử lý riêng cho Beta Badge nếu có trong cấu trúc gốc
            // Chúng ta không chèn lại nó bằng innerHTML vì nó sẽ bị lặp
        }
    });

    // Cập nhật placeholder cho các input có data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) {
            el.placeholder = dict[key];
        }
    });

    // Cập nhật tooltip (data-info) cho các biểu tượng thông tin
    document.querySelectorAll('.info-icon[data-info]').forEach(el => {
        const infoKey = el.getAttribute('data-i18n-info');
        if (infoKey && dict[infoKey]) {
            el.setAttribute('data-info', dict[infoKey]);
        }
    });

    // Cập nhật title cho các phần tử có data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (dict[key]) {
            el.title = dict[key];
        }
    });

    // Container Icon Picker Logic
    document.querySelectorAll('.picker-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            document.querySelectorAll('.picker-icon').forEach(i => i.classList.remove('selected'));
            icon.classList.add('selected');
        });
    });

    // Cập nhật nhãn Language riêng biệt
    const languageLabel = document.getElementById('languageLabel');
    if (languageLabel) {
        languageLabel.textContent = dict.languageLabel;
    }

    // Cập nhật các nội dung động khác
    if (typeof updatePanicDescription === 'function') {
        updatePanicDescription(settings.panicAction || 'closeIncognito');
    }

    // Update Privacy Grade
    calculatePrivacyGrade();

    // Cập nhật các thông báo trống (empty messages)
    const sessionsList = document.getElementById('sessionsList');
    if (sessionsList && sessionsList.querySelector('.empty-msg')) {
        sessionsList.querySelector('.empty-msg').textContent = dict.noSessions || 'No sessions saved.';
    }

    const videoList = document.getElementById('videoList');
    if (videoList && videoList.querySelector('.empty-msg')) {
        videoList.querySelector('.empty-msg').textContent = dict.noVideos || 'No videos detected.';
    }
}

function saveSettings() {
    chrome.storage.local.set({ appSettings: settings });
}

/**
 * Hiển thị hoặc ẩn dòng nhập URL tùy chỉnh dựa trên loại hình nền
 */
function toggleCustomBgUrlRow() {
    if (settings.playerBackgroundType === 'custom') {
        elements.customBgUrlRow.classList.remove('hidden');
    } else {
        elements.customBgUrlRow.classList.add('hidden');
    }
}

/**
 * Hiển thị danh sách hình nền tùy chỉnh
 */
function renderCustomBgList() {
    const { customBgList } = elements;
    const lang = settings.language || 'vi';
    const dict = translations[lang] || translations.vi;
    customBgList.innerHTML = '';
    
    if (!settings.customBgList || settings.customBgList.length === 0) {
        customBgList.innerHTML = `<p class="empty-msg">${dict.noCustomBg || 'No custom backgrounds added.'}</p>`;
        return;
    }

    settings.customBgList.forEach((url, index) => {
        const item = document.createElement('div');
        item.className = `custom-bg-item ${settings.customBgUrl === url ? 'active' : ''}`;
        
        const preview = document.createElement('img');
        preview.src = url;
        preview.className = 'custom-bg-item-preview';
        preview.onerror = () => { preview.src = 'icons/extension.png'; };
        
        const urlSpan = document.createElement('span');
        urlSpan.className = 'custom-bg-item-url';
        urlSpan.textContent = url.length > 30 ? url.substring(0, 27) + '...' : url;
        urlSpan.title = url;
        
        const actions = document.createElement('div');
        actions.className = 'custom-bg-item-actions';
        
        const selectBtn = document.createElement('button');
        selectBtn.innerHTML = '✔';
        selectBtn.title = 'Select this background';
        selectBtn.onclick = (e) => {
            e.stopPropagation();
            settings.customBgUrl = url;
            saveSettings();
            renderCustomBgList();
            applyPlayerBackground();
            notify('Background updated!', 'success');
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑';
        deleteBtn.title = 'Delete this background';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            if (confirm('Delete this background from list?')) {
                settings.customBgList.splice(index, 1);
                if (settings.customBgUrl === url) {
                    settings.customBgUrl = settings.customBgList[0] || '';
                }
                saveSettings();
                renderCustomBgList();
                applyPlayerBackground();
            }
        };
        
        actions.appendChild(selectBtn);
        actions.appendChild(deleteBtn);
        
        item.appendChild(preview);
        item.appendChild(urlSpan);
        item.appendChild(actions);
        
        item.onclick = () => {
            updateBgPreview(url);
        };
        
        customBgList.appendChild(item);
    });
}

/**
 * Cập nhật ô xem trước ảnh
 */
function updateBgPreview(url) {
    const { bgPreviewImg, bgPreviewPlaceholder } = elements;
    if (url && isValidUrl(url)) {
        bgPreviewImg.src = url;
        bgPreviewImg.classList.remove('hidden');
        bgPreviewPlaceholder.classList.add('hidden');
        bgPreviewImg.onerror = () => {
            bgPreviewImg.classList.add('hidden');
            bgPreviewPlaceholder.classList.remove('hidden');
            bgPreviewPlaceholder.textContent = 'Invalid Image URL';
        };
    } else {
        bgPreviewImg.classList.add('hidden');
        bgPreviewPlaceholder.classList.remove('hidden');
        bgPreviewPlaceholder.textContent = 'No Image Selected';
    }
}

/**
 * Áp dụng hình nền cho Privacy Player
 */
function applyPlayerBackground() {
    const { playerContainer } = elements;
    const gradient = "linear-gradient(135deg, rgba(26, 26, 46, 0.4) 0%, rgba(22, 33, 62, 0.4) 100%)";
    
    let bgImage;
    if (settings.playerBackgroundType === 'custom' && settings.customBgUrl) {
        bgImage = `url('${settings.customBgUrl}')`;
    } else {
        bgImage = "url('images/anh-phong-canh-66-1.jpg')";
    }
    
    playerContainer.style.backgroundImage = `${gradient}, ${bgImage}`;
}

/**
 * Hiển thị thông báo (Updated to respect setting)
 */
function notify(message, status) {
    if (!settings.showNotifications) return;
    
    const { notification } = elements;
    const gradients = {
        success: 'var(--success-gradient)',
        warning: 'var(--secondary-gradient)',
        error: 'var(--danger-gradient)'
    };
    
    notification.style.background = gradients[status] || 'var(--primary-gradient)';
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
}

/**
 * Gửi thông báo qua Chrome runtime
 * @param {string} message - Nội dung thông báo
 * @param {string} [title='Cookie Manager'] - Tiêu đề
 * @param {string} [type='basic'] - Loại thông báo
 * @param {string} [iconUrl='icons/icon48.png'] - URL icon
 */
function notifySend(message, title = 'Cookie Manager', type = 'basic', iconUrl = 'icons/icon48.png') {
    chrome.runtime.sendMessage({
        type: 'createNotification',
        options: { type, message, title, iconUrl }
    });
}

/**
 * Lấy icon và tooltip cho installType
 * @param {string} installType - Loại cài đặt
 * @returns {Object} Icon URL và tooltip text
 */
function getInstallTypeInfo(installType) {
    const info = {
        development: { icon: 'icons/dev.png', tooltip: 'Development Mode' },
        normal: { icon: 'icons/store.png', tooltip: 'Chrome Web Store' },
        admin: { icon: 'icons/admin.png', tooltip: 'Admin Installed' },
        sideload: { icon: 'icons/other.png', tooltip: 'Sideloaded' },
        other: { icon: 'icons/other.png', tooltip: 'Other Source' }
    };
    return info[installType] || { icon: 'icons/other.png', tooltip: 'Unknown' };
}

/**
 * Tạo HTML cho extension card (Optimized with innerHTML and minimal DOM calls)
 * @param {Object} ext - Thông tin extension
 * @returns {string} Chuỗi HTML
 */
function createExtensionCardHTML(ext) {
    const iconUrl = ext.icons?.length ? ext.icons[ext.icons.length - 1].url : 'icons/extension-default.png';
    const { icon, tooltip } = getInstallTypeInfo(ext.installType);
    
    const typeMapping = {
        'development': 'Development Mode',
        'normal': 'Chrome Web Store',
        'admin': 'Admin Installed',
        'sideload': 'Sideloaded',
        'other': 'Other Source'
    };
    const typeLabel = typeMapping[ext.installType] || 'Unknown Source';

    const randomMemory = (Math.random() * 50 + 5).toFixed(1);
    const randomCPU = (Math.random() * 2).toFixed(1);

    const card = document.createElement('div');
    card.className = 'extension-card';

    const permissionsTags = ext.permissions.length 
        ? ext.permissions.map(p => `<span class="permission-tag">${p}</span>`).join('')
        : '<span class="permission-tag">None</span>';

    card.innerHTML = `
        <div class="extension-top">
            <div class="extension-large-icon-container">
                <img src="${iconUrl}" alt="${ext.name}" class="extension-large-icon">
            </div>
            <div class="extension-info">
                <h3 class="extension-name">${ext.name}</h3>
                <span class="extension-version">v${ext.version}</span>
            </div>
        </div>
        <div class="extension-status-bar ${ext.enabled ? 'enabled' : 'disabled'}">
            <label class="switch">
                <input type="checkbox" ${ext.enabled ? 'checked' : ''}>
                <span class="slider round"></span>
            </label>
            <span class="status-text">${ext.enabled ? 'Enabled' : 'Disabled'}</span>
            <button class="remove-extension">Remove</button>
        </div>
        <div class="extension-performance">
            <div class="perf-item">
                <span class="perf-label">RAM:</span>
                <span class="perf-value">${ext.enabled ? randomMemory + 'MB' : '0MB'}</span>
            </div>
            <div class="perf-item">
                <span class="perf-label">CPU:</span>
                <span class="perf-value">${ext.enabled ? randomCPU + '%' : '0%'}</span>
            </div>
        </div>
        <div class="extension-meta">
            <strong>Type: </strong>${typeLabel}
            <img src="${icon}" title="${tooltip}" alt="${tooltip}" class="type-mini-icon">
        </div>
        <div class="extension-permissions-box">
            <strong>Permissions:</strong>
            <div class="permissions-tag-container">${permissionsTags}</div>
        </div>
    `;

    return card;
}

/**
 * Cập nhật giao diện trạng thái extension
 * @param {HTMLElement} card - Extension card
 * @param {boolean} isEnabled - Trạng thái bật/tắt
 */
function updateCardUI(card, isEnabled) {
    const statusElement = card.querySelector('.extension-status');
    const statusText = card.querySelector('.status-text');
    const toggle = card.querySelector('input[type="checkbox"]');

    statusElement.className = `extension-status ${isEnabled ? 'enabled' : 'disabled'}`;
    statusText.textContent = isEnabled ? 'Enabled' : 'Disabled';
    toggle.checked = isEnabled; // Đồng bộ trạng thái checkbox
}

/**
 * Thêm sự kiện toggle bật/tắt extension
 * @param {HTMLElement} card - Extension card
 * @param {Object} ext - Thông tin extension
 */
function addToggleEvent(card, ext) {
    const toggle = card.querySelector('input[type="checkbox"]');
    toggle.addEventListener('change', async () => {
        const newState = toggle.checked;

        // Show confirmation only when disabling
        if (!newState && ext.enabled) {
            if (!confirm(`Are you sure you want to disable "${ext.name}"?`)) {
                toggle.checked = true;
                return;
            }
        }

        // Disable toggle temporarily to prevent double-clicks
        toggle.disabled = true;

        try {
            // chrome.management.setEnabled can be used with a callback or promise
            await new Promise((resolve, reject) => {
                chrome.management.setEnabled(ext.id, newState, () => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve();
                    }
                });
            });

            // Update local object state
            ext.enabled = newState;

            // Update UI
            const statusBox = card.querySelector('.extension-status-bar');
            statusBox.className = `extension-status-bar ${newState ? 'enabled' : 'disabled'}`;
            card.querySelector('.status-text').textContent = newState ? 'Enabled' : 'Disabled';

            notify(`Extension "${ext.name}" ${newState ? 'enabled' : 'disabled'}`, 'success');
            updateDashboard();
        } catch (error) {
            // Revert toggle if operation fails
            toggle.checked = !newState;
            notify(`Failed to change state: ${error.message}`, 'error');
        } finally {
            toggle.disabled = false;
        }
    });
}

/**
 * Thêm sự kiện gỡ extension
 * @param {HTMLElement} card - Extension card
 * @param {Object} ext - Thông tin extension
 */
function addRemoveEvent(card, ext) {
    const removeButton = card.querySelector('.remove-extension');
    removeButton.addEventListener('click', () => {
        if (confirm(`Are you sure you want to remove "${ext.name}"?`)) {
            chrome.management.uninstall(ext.id, () => {
                if (chrome.runtime.lastError) {
                    notify(`Failed to remove "${ext.name}": ${chrome.runtime.lastError.message}`, 'error');
                    return;
                }
                card.remove();
                notify(`Extension "${ext.name}" removed`, 'warning');
            });
        }
    });
}

/**
 * Hiển thị danh sách extensions
 */
function displayExtensions() {
    const { extensionsList, cookiesList, controls, extensionManager, cookiesManager } = elements;
    const isVisible = extensionsList.classList.contains('show');

    // Reset visibility
    cookiesList.classList.remove('show');
    controls.classList.remove('show');
    cookiesManager.classList.remove('active');

    if (!isVisible) {
        renderExtensions();
    } else {
        extensionsList.classList.remove('show');
        extensionManager.classList.remove('active');
    }
}

/**
 * Thực hiện render danh sách extension
 */
function renderExtensions() {
    const { extensionsList, extensionManager } = elements;
    extensionsList.innerHTML = '';
    extensionManager.classList.add('active');
    const container = document.createElement('div');
    container.className = 'extensions-grid';

    chrome.management.getAll((extensions) => {
        extensions.forEach((ext) => {
            const actualCard = createExtensionCardHTML(ext);

            addToggleEvent(actualCard, ext);
            addRemoveEvent(actualCard, ext);
            container.appendChild(actualCard);
        });
        extensionsList.appendChild(container);
        extensionsList.classList.add('show');
    });
}

/**
 * Tải và hiển thị cookies (Optimized with DocumentFragment)
 * @param {string} [filter=''] - Bộ lọc theo tên hoặc domain
 */
async function loadCookies(filter = '') {
    const { cookieTableContainer, totalCookies } = elements;
    
    const cookies = await chrome.cookies.getAll({});
    const cookiesByDomain = {};

    cookies.forEach((cookie) => {
        if (cookie.name.toLowerCase().includes(filter.toLowerCase()) || 
            cookie.domain.toLowerCase().includes(filter.toLowerCase())) {
            cookiesByDomain[cookie.domain] = cookiesByDomain[cookie.domain] || [];
            cookiesByDomain[cookie.domain].push(cookie);
        }
    });

    const totalDomains = Object.keys(cookiesByDomain).length;
    const totalCookiesCount = Object.values(cookiesByDomain).reduce((count, cookies) => count + cookies.length, 0);

    if (totalDomains === 0) {
        cookieTableContainer.innerHTML = '';
        totalCookies.textContent = `No results found for "${filter}"`;
        return;
    }

    totalCookies.textContent = `${totalDomains} Domains · ${totalCookiesCount} Cookies`;

    const fragment = document.createDocumentFragment();

    Object.keys(cookiesByDomain).forEach((domain) => {
        const domainSection = document.createElement('div');
        domainSection.className = 'domain-section';

        const domainHeader = document.createElement('div');
        domainHeader.className = 'domain-header';
        
        const domainLabel = document.createElement('span');
        domainLabel.className = 'domain-label';
        domainLabel.textContent = domain;
        domainHeader.appendChild(domainLabel);

        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'domain-actions';

        const copyIcon = document.createElement('img');
        copyIcon.src = 'icons/copy.png';
        copyIcon.title = 'Copy Domain Cookies';
        copyIcon.onclick = () => {
            const cookiesParser = JSON.stringify(cookiesByDomain[domain], null, 2)
            navigator.clipboard.writeText(cookiesParser);
            notify(`Copied ${domain} cookies`, 'success');
        };

        const clearIcon = document.createElement('img');
        clearIcon.src = 'icons/clear.png';
        clearIcon.title = 'Clear Domain Cookies';
        clearIcon.onclick = () => {
            deleteCookiesInDomain(domain, filter);
        };

        actionsContainer.appendChild(copyIcon);
        actionsContainer.appendChild(clearIcon);
        domainHeader.appendChild(actionsContainer);
        domainSection.appendChild(domainHeader);

        const tableContainer = document.createElement('div');
        tableContainer.style.overflowX = 'auto';
        
        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Value</th>
                        <th>Path</th>
                        <th>Expires</th>
                        <th>Expand</th>
                    </tr>
                </thead>
                <tbody>
        `;

        cookiesByDomain[domain].forEach(cookie => {
            const expiresText = cookie.expirationDate ? new Date(cookie.expirationDate * 1000).toLocaleString() : 'Session';
            const isLongValue = cookie.value.length > 30 || cookie.name.length > 20 || cookie.path.length > 15;
            
            tableHTML += `
                <tr class="cookie-row">
                    <td><span class="cookie-text-container" title="${cookie.name}">${cookie.name}</span></td>
                    <td><span class="cookie-text-container" title="${cookie.value}">${cookie.value}</span></td>
                    <td><span class="cookie-text-container" title="${cookie.path}">${cookie.path}</span></td>
                    <td><span class="cookie-text-container" title="${expiresText}">${expiresText}</span></td>
                    <td>
                        ${isLongValue ? '<button class="row-expand-btn" title="Expand Row">...</button>' : ''}
                    </td>
                </tr>
            `;
        });

        tableHTML += `</tbody></table>`;
        tableContainer.innerHTML = tableHTML;

        // Thêm sự kiện cho nút expand sau khi innerHTML được gán
        tableContainer.querySelectorAll('.row-expand-btn').forEach(btn => {
            btn.onclick = (e) => {
                const targetRow = e.target.closest('.cookie-row');
                targetRow.classList.toggle('expanded');
                e.target.classList.toggle('active');
            };
        });

        domainSection.appendChild(tableContainer);
        fragment.appendChild(domainSection);
    });

    cookieTableContainer.innerHTML = '';
    cookieTableContainer.appendChild(fragment);
}

/**
 * Xóa cookies trong một domain
 * @param {string} domain - Tên domain
 * @param {string} filter - Bộ lọc hiện tại
 */
async function deleteCookiesInDomain(domain, filter) {
    if (!confirm(`Are you sure you want to delete all cookies in ${domain}?`)) return;

    const cookies = await chrome.cookies.getAll({});
    await Promise.all(
        cookies
            .filter((cookie) => cookie.domain === domain)
            .map((cookie) =>
                chrome.cookies.remove({
                    url: `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`,
                    name: cookie.name
                })
            )
    );
    notify(`All cookies in ${domain} deleted`, 'warning');
    loadCookies(filter);
}

/**
 * Xóa tất cả cookies
 */
async function clearAllCookies() {
    if (!confirm('Are you sure you want to clear all cookies?')) return;

    const cookies = await chrome.cookies.getAll({});
    await Promise.all(
        cookies.map((cookie) =>
            chrome.cookies.remove({
                url: `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`,
                name: cookie.name
            })
        )
    );
    notify('All cookies cleared', 'warning');
    loadCookies();
}

/**
 * Xóa dữ liệu trang
 */
async function clearSiteData() {
    if (!confirm('Are you sure you want to clear all site data?')) return;

    await chrome.browsingData.remove(
        { since: 0 },
        { cookies: true, cache: true, localStorage: true }
    );
    notify('All site data cleared', 'warning');
}

/**
 * Sao chép cookies của tab hiện tại
 */
async function copyCurrentTabCookies() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.url) throw new Error('Unable to get tab URL');

        const url = new URL(tab.url);
        const domain = url.hostname;
        const cookies = await chrome.cookies.getAll({ url: tab.url });

        if (!cookies.length) throw new Error('No cookies found');

        const cookieString = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ');
        const data = `domain=${domain}\n${cookieString}`;

        await navigator.clipboard.writeText(data);
        notify('Cookies copied to clipboard', 'success');
    } catch (error) {
        notify(`Failed to copy cookies: ${error.message}`, 'error');
    }
}

/**
 * Dán cookies từ clipboard
 */
async function pasteCookies() {
    try {
        const text = await navigator.clipboard.readText();
        if (!text) throw new Error('Clipboard is empty');

        let domain, cookies;
        try {
            const jsonCookies = JSON.parse(text);
            if (Array.isArray(jsonCookies)) {
                cookies = jsonCookies;
                domain = cookies[0]?.domain;
            } else {
                throw new Error('Invalid JSON format');
            }
        } catch {
            const [domainLine, ...cookieLines] = text - split('\n');
            const domainMatch = domainLine?.match(/^domain=(.+)$/);
            if (!domainMatch) throw new Error('Domain not found');

            domain = domainMatch[1];
            cookies = cookieLines
                .map((line) => {
                    const separator = line.indexOf('=');
                    if (separator === -1) return null;
                    return { name: line.slice(0, separator), value: line.slice(separator + 1) };
                })
                .filter(Boolean);
        }

        if (!domain || !cookies.length) throw new Error('No valid cookies found');

        const newTab = await chrome.tabs.create({ url: `https://${domain}` });
        await Promise.all(
            cookies.map((cookie) =>
                chrome.cookies.set({
                    url: `https://${domain}`,
                    name: cookie.name,
                    value: cookie.value,
                    domain: `.${domain}`,
                    secure: true,
                    path: '/'
                })
            )
        );
        notify('Cookies pasted and tab opened', 'success');
    } catch (error) {
        notify(`Failed to paste cookies: ${error.message}`, 'error');
    }
}

/**
 * Toggle visibility of main sections
 */
function toggleSection(section) {
    const { 
        extensionsList, cookiesList, controls, 
        extensionManager, cookiesManager, privacySettings,
        privacyPlayer, stealthSection, stealthPlayer,
        stealthLockScreen, stealthPassInput, appSettings,
        appSettingsBtn, homeSection, historyManagerBtn,
        historySection, vaultBtn, vaultSection, vaultLockScreen, vaultPassInput
    } = elements;

    // Check if clicking same active tab -> go home
    const isActive = (section === 'extensions' && extensionManager.classList.contains('active')) ||
                     (section === 'cookies' && cookiesManager.classList.contains('active')) ||
                     (section === 'player' && privacyPlayer.classList.contains('active')) ||
                     (section === 'settings' && appSettingsBtn.classList.contains('active')) ||
                     (section === 'history' && historyManagerBtn.classList.contains('active')) ||
                     (section === 'vault' && vaultBtn.classList.contains('active')) ||
                     (section === 'telegram' && elements.telegramDownloaderBtn.classList.contains('active')) ||
                     (section === 'video' && elements.videoDownloaderBtn.classList.contains('active')) ||
                     (section === 'multiAccount' && elements.multiAccountBtn.classList.contains('active'));

    // Reset all
    extensionsList.classList.remove('show');
    cookiesList.classList.remove('show');
    controls.classList.remove('show');
    privacySettings.classList.remove('show');
    stealthSection.classList.remove('show');
    appSettings.classList.remove('show');
    homeSection.classList.remove('show');
    historySection.classList.remove('show');
    vaultSection.classList.remove('show');
    elements.telegramSection.classList.remove('show');
    elements.videoDownloaderSection.classList.remove('show');
    elements.multiAccountSection.classList.remove('show');
    
    extensionManager.classList.remove('active');
    cookiesManager.classList.remove('active');
    privacyPlayer.classList.remove('active');
    appSettingsBtn.classList.remove('active');
    historyManagerBtn.classList.remove('active');
    vaultBtn.classList.remove('active');
    elements.telegramDownloaderBtn.classList.remove('active');
    elements.videoDownloaderBtn.classList.remove('active');
    elements.multiAccountBtn.classList.remove('active');

    if (isActive && section !== 'home') {
        toggleSection('home');
        return;
    }

    if (section === 'home') {
        updateDashboard();
        homeSection.classList.add('show');
        return;
    }

    // Persist state: Lock if moving away from player
    if (section !== 'player') {
        isStealthUnlocked = false; // Re-lock
        stealthLockScreen.classList.remove('show');
        stealthPassInput.value = '';
        
        // If always require password is ON, we clear the session secret
        if (settings.alwaysRequirePassword) {
            secretCode = null;
            if (chrome.storage.session) chrome.storage.session.remove('sessionPassword');
        }
        
        if (settings.autoClear && stealthPlayer.src !== 'about:blank' && stealthPlayer.src !== '') {
            chrome.history.deleteUrl({ url: stealthPlayer.src });
        }
        // Reset player size if not following default and moving away from player
        if (!settings.followDefaultPlayerSize) {
            playerScale = settings.defaultPlayerWidth;
            playerHeight = settings.defaultPlayerHeight;
            updatePlayerSize();
        }
    }

    // Lock vault if moving away
    if (section !== 'vault') {
        isVaultUnlocked = false;
        vaultLockScreen.classList.remove('show');
        vaultPassInput.value = '';
        
        // If always require password is ON, we clear the session secret
        if (settings.alwaysRequirePassword) {
            secretCode = null;
            if (chrome.storage.session) chrome.storage.session.remove('sessionPassword');
        }
    }

    if (section === 'extensions') {
        displayExtensions();
        privacySettings.classList.add('show');
    } else if (section === 'cookies') {
        loadCookies();
        cookiesList.classList.add('show');
        controls.classList.add('show');
        cookiesManager.classList.add('active');
        privacySettings.classList.add('show');
    } else if (section === 'player') {
        stealthSection.classList.add('show');
        privacyPlayer.classList.add('active');
        privacySettings.classList.add('show');
        
        // If always require password is ON, we reset secretCode to force lock screen
        if (settings.alwaysRequirePassword) {
            secretCode = null;
            isStealthUnlocked = false;
            stealthLockScreen.classList.add('show');
        }

        if (!secretCode) {
            // Only try to restore from session if ALWAYS require password is OFF
            if (!settings.alwaysRequirePassword && chrome.storage.session) {
                chrome.storage.session.get(['sessionPassword'], (result) => {
                    if (result.sessionPassword) {
                        secretCode = result.sessionPassword;
                        isStealthUnlocked = true;
                        stealthLockScreen.classList.remove('show');
                        loadPlayerContent();
                    } else {
                        stealthLockScreen.classList.add('show');
                    }
                });
            } else {
                stealthLockScreen.classList.add('show');
            }
        } else {
            isStealthUnlocked = true;
            stealthLockScreen.classList.remove('show');
            loadPlayerContent();
        }
        // Apply player size when entering player section
        if (settings.followDefaultPlayerSize) {
            playerScale = settings.defaultPlayerWidth;
            playerHeight = settings.defaultPlayerHeight;
        }
        updatePlayerSize();
    } else if (section === 'settings') {
        appSettings.classList.add('show');
        appSettingsBtn.classList.add('active');
    } else if (section === 'history') {
        loadHistoryAndSessions();
        historySection.classList.add('show');
        historyManagerBtn.classList.add('active');
    } else if (section === 'vault') {
        // If always require password is ON, we reset secretCode to force lock screen
        if (settings.alwaysRequirePassword) {
            secretCode = null;
            isVaultUnlocked = false;
            vaultLockScreen.classList.add('show');
        }
        
        loadVault();
        vaultSection.classList.add('show');
        vaultBtn.classList.add('active');
        if (!isVaultUnlocked) {
            vaultLockScreen.classList.add('show');
        }
    } else if (section === 'telegram') {
        elements.telegramSection.classList.add('show');
        elements.telegramDownloaderBtn.classList.add('active');
    } else if (section === 'video') {
        elements.videoDownloaderSection.classList.add('show');
        elements.videoDownloaderBtn.classList.add('active');
        loadDetectedVideos();
        // Clear badge for current tab
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            if (tab) chrome.action.setBadgeText({ text: '', tabId: tab.id });
        });
    } else if (section === 'multiAccount') {
        elements.multiAccountSection.classList.add('show');
        elements.multiAccountBtn.classList.add('active');
        loadContainers();
    }
}

/**
 * Hiển thị chi tiết các tracker trong modal
 */
function showTrackerDetails(trackers) {
    const { trackerModal, trackerDetailsList } = elements;
    trackerDetailsList.innerHTML = '';

    if (!trackers || trackers.length === 0) {
        trackerDetailsList.innerHTML = '<p class="empty-msg">No trackers detected on this page.</p>';
    } else {
        // Sắp xếp theo số lượng phát hiện giảm dần
        const sortedTrackers = [...trackers].sort((a, b) => b.count - a.count);
        
        sortedTrackers.forEach(t => {
            const item = document.createElement('div');
            item.className = 'tracker-detail-item';
            
            const lastSeenTime = new Date(t.lastSeen).toLocaleTimeString();
            
            item.innerHTML = `
                <div class="tracker-info">
                    <span class="tracker-domain">${t.domain}</span>
                    <span class="tracker-time">Last seen: ${lastSeenTime}</span>
                </div>
                <span class="tracker-count-badge">${t.count}</span>
            `;
            trackerDetailsList.appendChild(item);
        });
    }

    trackerModal.classList.remove('hidden');
}

// Thêm sự kiện đóng modal
elements.closeTrackerModal.addEventListener('click', () => {
    elements.trackerModal.classList.add('hidden');
});

// Đóng modal khi nhấn ra ngoài
elements.trackerModal.addEventListener('click', (e) => {
    if (e.target === elements.trackerModal) {
        elements.trackerModal.classList.add('hidden');
    }
});

// Lắng nghe thay đổi trạng thái extension từ bên ngoài (ví dụ: từ Focus Mode)
chrome.management.onEnabled.addListener((info) => {
    if (elements.extensionsList.classList.contains('show')) {
        updateDashboard();
        renderExtensions();
    }
});

chrome.management.onDisabled.addListener((info) => {
    if (elements.extensionsList.classList.contains('show')) {
        updateDashboard();
        renderExtensions();
    }
});

/**
 * Cập nhật giao diện nút tracking
 * @param {HTMLElement} element - Nút toggle tracking
 * @param {boolean} status - Trạng thái tracking
 */
function setTrackStyle(element, status) {
    const trackingIcon = document.getElementById('trackingprotectionicon');
    if (trackingIcon) {
        trackingIcon.src = status ? 'icons/skincell.png' : 'icons/tracking_protection.png';
    }
    
    element.className = `tracking-button ${status ? 'enabled' : 'disabled'}`;
    element.textContent = `Tracking Protection: ${status ? 'Enabled' : 'Disabled'}`;
}

/**
 * Toggle tracking protection
 */
async function toggleTrackingProtection() {
    try {
        const { value } = await chrome.privacy.websites.doNotTrackEnabled.get({});
        const newState = !value;
        await chrome.privacy.websites.doNotTrackEnabled.set({ value: newState });
        setTrackStyle(elements.toggleTracking, newState);
        notify(`Tracking protection ${newState ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
        notify(`Failed to update tracking: ${error.message}`, 'error');
    }
}

// Thêm sự kiện
elements.extensionManager.addEventListener('click', () => toggleSection('extensions'));
elements.cookiesManager.addEventListener('click', () => toggleSection('cookies'));
elements.privacyPlayer.addEventListener('click', () => toggleSection('player'));
elements.historyManagerBtn.addEventListener('click', () => toggleSection('history'));
elements.vaultBtn.addEventListener('click', () => toggleSection('vault'));
elements.appSettingsBtn.addEventListener('click', () => toggleSection('settings'));
elements.telegramDownloaderBtn.addEventListener('click', () => toggleSection('telegram'));
elements.videoDownloaderBtn.addEventListener('click', () => toggleSection('video'));
elements.multiAccountBtn.addEventListener('click', () => toggleSection('multiAccount'));

// Dashboard Card Navigation
if (elements.cardCookies) elements.cardCookies.addEventListener('click', () => toggleSection('cookies'));
if (elements.cardTrackers) elements.cardTrackers.addEventListener('click', () => {
    // Luôn hiển thị modal chi tiết tracker khi nhấn vào thẻ này
    showTrackerDetails(settings.currentTrackers || []);
});
if (elements.cardExtensions) elements.cardExtensions.addEventListener('click', () => toggleSection('extensions'));

/**
 * Kiểm tra xem URL có bị hạn chế truy cập bởi Extension không (chrome://, edge://, v.v.)
 */
function isRestrictedUrl(url) {
    if (!url) return true;
    const restrictedProtocols = ['chrome:', 'edge:', 'about:', 'chrome-extension:', 'view-source:', 'data:'];
    return restrictedProtocols.some(protocol => url.startsWith(protocol));
}

// Video Downloader Logic
elements.scanVideoBtn.addEventListener('click', async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) return;

        if (isRestrictedUrl(tab.url)) {
            notify('Không thể quét video trên trang hệ thống trình duyệt.', 'warning');
            return;
        }

        notify('Đang quét video trên trang...', 'success');
        
        chrome.scripting.executeScript({
            target: { tabId: tab.id, allFrames: true },
            world: 'MAIN', // Chạy trong world 'MAIN' để truy cập biến global của trang (JWPlayer, v.v.)
            func: () => {
                const videos = [];
                
                // 1. Tìm thẻ <video> (HTML5 & Blob)
                document.querySelectorAll('video').forEach((v, i) => {
                    const src = v.src || v.currentSrc;
                    if (src) {
                        const isBlob = src.startsWith('blob:');
                        videos.push({ 
                            url: src, 
                            type: isBlob ? 'Blob/HLS Stream' : 'HTML5 Video', 
                            filename: v.title || document.title || `Video #${i+1}`,
                            thumbnail: v.poster || '',
                            isBlob: isBlob
                        });
                    }
                    // Thẻ <source> trong video
                    v.querySelectorAll('source').forEach((s, si) => {
                        if (s.src) {
                            videos.push({ url: s.src, type: 'Video Source', filename: `Video #${i+1} Source #${si+1}` });
                        }
                    });
                });
                
                // 2. Tìm trong JW Player (nếu có)
                if (window.jwplayer) {
                    try {
                        for (let i = 0; i < 10; i++) {
                            const player = window.jwplayer(i);
                            if (player && player.getPlaylist) {
                                const playlist = player.getPlaylist();
                                if (playlist && playlist[0] && playlist[0].sources) {
                                    playlist[0].sources.forEach((source, si) => {
                                        videos.push({
                                            url: source.file,
                                            type: source.type || 'JWPlayer Stream',
                                            filename: `JWPlayer Video #${i+1} (${source.label || si+1})`
                                        });
                                    });
                                }
                            }
                        }
                    } catch (e) {}
                }

                // 3. Tìm các biến phổ biến khác (Video.js, v.v.)
                if (window.videojs) {
                    try {
                        Object.values(window.videojs.players).forEach((player, i) => {
                            const src = player.src();
                            if (src) {
                                videos.push({ url: src, type: 'VideoJS Stream', filename: `VideoJS #${i+1}` });
                            }
                        });
                    } catch (e) {}
                }

                // 4. Tìm thẻ <a> có link video (mở rộng định dạng)
                const videoExts = ['mp4', 'mkv', 'webm', 'avi', 'mov', 'flv', 'm3u8', 'ts', 'mpd', 'm4s'];
                document.querySelectorAll('a').forEach(a => {
                    if (a.href) {
                        try {
                            const url = new URL(a.href);
                            const path = url.pathname.toLowerCase();
                            const ext = path.split('.').pop();
                            if (videoExts.includes(ext)) {
                                videos.push({ url: a.href, type: ext.toUpperCase(), filename: a.innerText.trim() || `Link ${ext}` });
                            }
                        } catch (e) {}
                    }
                });

                return videos;
            }
        }, (results) => {
            if (results && results.length > 0) {
                let totalFound = 0;
                results.forEach(frameResult => {
                    if (frameResult && frameResult.result) {
                        const pageVideos = frameResult.result;
                        if (pageVideos.length > 0) {
                            totalFound += pageVideos.length;
                            pageVideos.forEach(v => {
                                chrome.runtime.sendMessage({ 
                                    type: 'newVideoDetected', 
                                    tabId: tab.id, 
                                    video: { 
                                        ...v, 
                                        frameId: frameResult.frameId,
                                        size: v.isBlob ? 'Streaming Data' : 'Scan detected', 
                                        timestamp: Date.now() 
                                    } 
                                });
                            });
                        }
                    }
                });

                if (totalFound > 0) {
                    notify(`Phát hiện ${totalFound} video mới từ tất cả các khung hình!`, 'success');
                    setTimeout(loadDetectedVideos, 500);
                } else {
                    notify('Không tìm thấy video nào. Hãy thử bật video chạy trước.', 'info');
                }
            }
        });
    } catch (e) {
        notify('Lỗi quét: ' + e.message, 'error');
    }
});

elements.videoDownloaderToggle.addEventListener('change', (e) => {
    settings.videoDownloaderEnabled = e.target.checked;
    saveSettings();
    elements.videoDownloaderBtn.classList.toggle('hidden', !settings.videoDownloaderEnabled);
    notify(`Video Downloader ${settings.videoDownloaderEnabled ? 'enabled' : 'disabled'}`, 'success');
    
    // Notify background script to start/stop detection
    chrome.runtime.sendMessage({ type: 'toggleVideoDetection', enabled: settings.videoDownloaderEnabled });
});

elements.pipToggle.addEventListener('change', (e) => {
    settings.pipEnabled = e.target.checked;
    saveSettings();
    elements.togglePip.classList.toggle('hidden', !settings.pipEnabled);
    notify(`Picture-in-Picture ${settings.pipEnabled ? 'enabled' : 'disabled'}`, 'success');
});

/**
 * Tải danh sách video đã phát hiện được từ background script
 */
async function loadDetectedVideos() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    chrome.runtime.sendMessage({ type: 'getDetectedVideos', tabId: tab.id }, (response) => {
        renderVideoList(response?.videos || []);
    });
}

function renderVideoList(videos) {
    const list = elements.videoList;
    list.innerHTML = '';

    if (videos.length === 0) {
        const lang = settings.language || 'vi';
        const dict = translations[lang] || translations.vi;
        list.innerHTML = `<p class="empty-msg">${dict.noVideos || 'Chưa phát hiện video nào trên trang này.'}</p>`;
        return;
    }

    videos.forEach((video, index) => {
        const item = document.createElement('div');
        item.className = 'video-item';

        // 1. Vùng Preview/Thumbnail
        const preview = document.createElement('div');
        preview.className = 'video-item-preview';
        if (video.thumbnail) {
            const img = document.createElement('img');
            img.src = video.thumbnail;
            img.onerror = () => { preview.innerHTML = '🎥'; }; // Fallback if image fails
            preview.appendChild(img);
        } else {
            preview.innerHTML = video.url.includes('m3u8') ? '📡' : '🎥';
        }

        // 2. Vùng Thông tin
        const info = document.createElement('div');
        info.className = 'video-item-info';
        
        const title = document.createElement('span');
        title.className = 'video-item-title';
        // Sử dụng tên phim nếu có, nếu không thì dùng filename
        title.textContent = video.filename || `Video #${index + 1}`;
        title.title = video.url;

        const isStream = video.url.includes('m3u8') || video.url.includes('mpd') || video.url.startsWith('blob:');
        const details = document.createElement('small');
        details.className = 'video-item-details';
        details.textContent = `${video.type.toUpperCase()} • ${video.size || 'Detected'}${isStream ? ' (Stream)' : ''}`;

        info.appendChild(title);
        info.appendChild(details);

        // 3. Vùng Hành động
        const actions = document.createElement('div');
        actions.className = 'video-item-actions';

        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'mini-btn';
        downloadBtn.textContent = isStream ? '📥 Tải Stream' : '📥 Tải về';
        downloadBtn.onclick = async () => {
            if (video.url.startsWith('blob:')) {
                notify('Đang trích xuất dữ liệu...', 'info');
                try {
                    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                    if (!tab) throw new Error('No active tab');
                    
                    if (isRestrictedUrl(tab.url)) {
                        notify('Không thể truy cập blob từ trang hệ thống.', 'error');
                        return;
                    }

                    chrome.scripting.executeScript({
                        target: { tabId: tab.id, frameIds: [video.frameId || 0] },
                        func: async (blobUrl) => {
                            try {
                                const response = await fetch(blobUrl);
                                const blob = await response.blob();
                                return new Promise((resolve) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => resolve(reader.result);
                                    reader.readAsDataURL(blob);
                                });
                            } catch (e) {
                                return { error: e.message };
                            }
                        },
                        args: [video.url]
                    }, (results) => {
                        if (results && results[0] && results[0].result) {
                            const dataUrl = results[0].result;
                            if (dataUrl.error) {
                                notify('Lỗi trích xuất: ' + dataUrl.error, 'error');
                            } else {
                                chrome.downloads.download({
                                    url: dataUrl,
                                    filename: video.filename.includes('.') ? video.filename : `${video.filename}.mp4`,
                                    saveAs: true
                                });
                                notify('Bắt đầu tải video!', 'success');
                            }
                        }
                    });
                } catch (e) {
                    notify('Lỗi: ' + e.message, 'error');
                }
            } else {
                chrome.downloads.download({
                    url: video.url,
                    filename: video.filename,
                    saveAs: true
                });
                notify('Bắt đầu tải xuống!', 'success');
            }
        };

        const copyBtn = document.createElement('button');
        copyBtn.className = 'mini-btn secondary';
        copyBtn.textContent = '🔗 Link';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(video.url);
            notify('Đã sao chép link video!', 'success');
        };

        actions.appendChild(downloadBtn);
        actions.appendChild(copyBtn);
        
        item.appendChild(preview);
        item.appendChild(info);
        item.appendChild(actions);
        list.appendChild(item);
    });
}

/**
 * Hàm hỗ trợ tải blob URL (đã được thay thế bằng logic injection trong renderVideoList)
 * Giữ lại làm dự phòng hoặc cho các trường hợp đơn giản
 */
async function downloadBlob(url, type) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        chrome.downloads.download({
            url: downloadUrl,
            filename: `video_blob_${Date.now()}.mp4`,
            saveAs: true
        }, () => URL.revokeObjectURL(downloadUrl));
    } catch (e) {
        // notify('Lỗi CSP: Đang chuyển sang chế độ trích xuất nội bộ...', 'info');
    }
}

// Lắng nghe sự kiện phát hiện video mới từ background
chrome.runtime.onMessage.addListener((request) => {
    if (request.type === 'newVideoDetected') {
        // Nếu đang ở tab video downloader, cập nhật danh sách
        if (elements.videoDownloaderSection.classList.contains('show')) {
            loadDetectedVideos();
        }
        notify('Phát hiện video mới có thể tải về!', 'info');
    } else if (request.type === 'iframeNavigated') {
        const targetUrl = request.url;
        
        // Chỉ cập nhật nếu đang ở mục Privacy Player và không phải URL rỗng/hệ thống
        if (targetUrl && targetUrl !== 'about:blank' && !targetUrl.startsWith('chrome-extension://')) {
            const currentStoredUrl = playerHistory[currentUrlIndex] || '';
            
            // Hàm chuẩn hóa URL để so sánh
            const normalize = (u) => {
                try {
                    const url = new URL(u);
                    // Bỏ qua các tham số tracking phổ biến hoặc các URL rác/ping
                    const path = url.pathname.toLowerCase();
                    const ignoredPaths = ['/analytics', '/pixel', '/collect', '/telemetry', '/beacon', '/event', '/track', '/tr/'];
                    if (ignoredPaths.some(p => path.includes(p))) {
                        return null; 
                    }
                    
                    // Nếu là DuckDuckGo /post (chứa tracking), bỏ qua
                    if (url.hostname.includes('duckduckgo.com') && path.includes('/post')) {
                        return null;
                    }

                    // Bỏ qua các định dạng file không phải trang web (ảnh, css, v.v.)
                    const ext = path.split('.').pop();
                    const ignoredExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'css', 'js', 'ico', 'woff', 'woff2'];
                    if (ignoredExts.includes(ext)) {
                        return null;
                    }

                    // YouTube: Lấy video ID (v=...) hoặc channel ID
                    // DuckDuckGo: Lấy query (q=...)
                    return url.origin + url.pathname + url.search;
                } catch(e) { return u; }
            };
            
            const normTarget = normalize(targetUrl);
            const normCurrent = normalize(currentStoredUrl);

            // Nếu URL là link rác (normalize trả về null), bỏ qua
            if (normTarget === null) return;

            // Cập nhật thanh địa chỉ ngay lập tức để người dùng thấy
            elements.stealthUrl.value = targetUrl;

            if (normTarget !== normCurrent) {
                // Nếu không phải đang trong quá trình nhấn Back/Forward và không phải load lại chính nó
                if (!isNavigating) {
                    // Tránh push duplicate liên tục nếu trang có nhiều redirect nhỏ
                    if (playerHistory.length > 0 && normalize(playerHistory[currentUrlIndex]) === normTarget) {
                        return;
                    }

                    // Thêm vào lịch sử và xóa phần forward cũ
                    playerHistory = playerHistory.slice(0, currentUrlIndex + 1);
                    playerHistory.push(targetUrl);
                    
                    // Giới hạn lịch sử tối đa 50 bước
                    if (playerHistory.length > 50) {
                        playerHistory.shift();
                    }
                    
                    currentUrlIndex = playerHistory.length - 1;
                    updatePlayerNavState();
                    chrome.storage.local.set({ lastPlayerUrl: targetUrl });
                }
            }
        }
    }
});

// Hàm quét Media từ Telegram Web
elements.scanTelegramMediaBtn.addEventListener('click', async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab) return;

        if (isRestrictedUrl(tab.url)) {
            notify('Không thể quét media trên trang hệ thống.', 'warning');
            return;
        }

        if (!tab.url.includes('web.telegram.org')) {
            notify('Vui lòng mở Telegram Web trước!', 'warning');
            if (confirm('Bạn có muốn mở Telegram Web ngay bây giờ không?')) {
                chrome.tabs.create({ url: 'https://web.telegram.org/' });
            }
            return;
        }

        notify('Đang quét media...', 'success');
        
        // Inject script để lấy danh sách media
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const mediaItems = [];
                
                // Tìm tất cả video
                document.querySelectorAll('video').forEach((v, idx) => {
                    const src = v.src || v.currentSrc || v.querySelector('source')?.src;
                    if (src) {
                        mediaItems.push({
                            type: 'video',
                            url: src,
                            title: `Video #${idx + 1}`
                        });
                    }
                });

                // Tìm tất cả ảnh
                document.querySelectorAll('img').forEach((img, idx) => {
                    if (img.src && (img.src.startsWith('blob:') || img.src.includes('web.telegram.org'))) {
                        if (img.naturalWidth > 100 || img.width > 100) {
                            mediaItems.push({
                                type: 'image',
                                url: img.src,
                                title: `Ảnh #${idx + 1}`,
                                thumb: img.src
                            });
                        }
                    }
                });

                return mediaItems;
            }
        }, (results) => {
            if (results && results[0] && results[0].result) {
                const items = results[0].result;
                renderTelegramMediaList(items);
                if (items.length > 0) {
                    notify(`Tìm thấy ${items.length} file media!`, 'success');
                } else {
                    notify('Không tìm thấy media nào trên trang này.', 'warning');
                }
            }
        });
    } catch (error) {
        notify('Lỗi quét: ' + error.message, 'error');
    }
});

function renderTelegramMediaList(items) {
    const listContainer = elements.telegramMediaList;
    const itemsContainer = elements.telegramMediaItems;
    
    itemsContainer.innerHTML = '';
    
    if (items.length === 0) {
        listContainer.classList.add('hidden');
        return;
    }

    listContainer.classList.remove('hidden');

    items.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'telegram-media-card';
        
        const preview = document.createElement('div');
        preview.className = 'media-card-preview';
        if (item.type === 'video') {
            preview.innerHTML = '<span class="play-icon">▶</span>';
            preview.style.background = '#000';
        } else if (item.thumb) {
            const img = document.createElement('img');
            img.src = item.thumb;
            preview.appendChild(img);
        } else {
            preview.innerHTML = '🖼';
        }

        const info = document.createElement('div');
        info.className = 'media-card-info';
        info.innerHTML = `<strong>${item.title}</strong><br><small>${item.type.toUpperCase()}</small>`;

        const actions = document.createElement('div');
        actions.className = 'media-card-actions';

        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'mini-btn';
        downloadBtn.textContent = '📥 Tải';
        downloadBtn.onclick = () => startTelegramDownload(item.url, item.type);

        actions.appendChild(downloadBtn);
        card.appendChild(preview);
        card.appendChild(info);
        card.appendChild(actions);
        itemsContainer.appendChild(card);
    });
}

// Hàm tải xuống media (Hỗ trợ chunked download cho blob/private)
async function startTelegramDownload(url, type) {
    notify('Đang chuẩn bị tải xuống...', 'success');
    
    if (url.startsWith('blob:')) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = URL.createObjectURL(blob);
            
            chrome.downloads.download({
                url: downloadUrl,
                filename: `telegram_${Date.now()}.${type === 'video' ? 'mp4' : 'jpg'}`,
                saveAs: true
            }, () => {
                URL.revokeObjectURL(downloadUrl);
                notify('Đã bắt đầu tải xuống!', 'success');
            });
        } catch (e) {
            notify('Lỗi tải blob. Vui lòng thử chuột phải trực tiếp trên Telegram.', 'error');
        }
    } else {
        chrome.downloads.download({
            url: url,
            filename: `telegram_${Date.now()}.${type === 'video' ? 'mp4' : 'jpg'}`,
            saveAs: true
        });
        notify('Đã bắt đầu tải xuống!', 'success');
    }
}

elements.extractTelegramBtn.addEventListener('click', async () => {
    const url = elements.telegramUrlInput.value.trim();
    if (!url) {
        notify('Vui lòng nhập link Telegram', 'warning');
        return;
    }

    if (!url.includes('t.me/')) {
        notify('Link Telegram không hợp lệ', 'error');
        return;
    }

    notify('Đang phân tích link...', 'success');
    chrome.tabs.create({ url: url, active: true }, () => {
        notify('Đã mở link. Vui lòng nhấn "Quét Media" khi trang load xong.', 'info');
    });
});

function showTelegramMediaPreview(url, type) {
    renderTelegramMediaList([{
        type: type,
        url: url,
        title: 'Media trích xuất',
        thumb: type === 'image' ? url : null
    }]);
}

// Vault Logic
elements.unlockVault.addEventListener('click', async () => {
    const code = elements.vaultPassInput.value;
    
    chrome.storage.local.get(['stealthPasswordHash', 'stealthSalt'], async (result) => {
        const storedHash = result.stealthPasswordHash || await hashPassword('1234', 'default_salt');
        const salt = result.stealthSalt || 'default_salt';
        const enteredHash = await hashPassword(code, salt);

        if (enteredHash === storedHash) {
            secretCode = code; // Set session password
            if (chrome.storage.session) {
                chrome.storage.session.set({ sessionPassword: code });
            }
            isVaultUnlocked = true;
            elements.vaultLockScreen.classList.remove('show');
            loadVault();
            notify('Vault Unlocked!', 'success');
        } else {
            notify('Incorrect Secret Code!', 'error');
            elements.vaultPassInput.value = '';
        }
    });
});

elements.vaultAddBtn.addEventListener('click', () => {
    const note = elements.vaultInput.value.trim();
    if (note) {
        const item = {
            id: Date.now(),
            title: note,
            url: note.includes('http') ? note : null,
            type: note.includes('http') ? 'link' : 'note',
            date: new Date().toISOString()
        };

        chrome.storage.local.get(['privacyVault'], (result) => {
            const vault = result.privacyVault || [];
            vault.unshift(item);
            chrome.storage.local.set({ privacyVault: vault }, () => {
                elements.vaultInput.value = ''; // Clear input
                loadVault();
                syncVaultToCloud(); // Sync after adding
                notify('Added to Vault', 'success');
            });
        });
    } else {
        notify('Please enter a note or link', 'warning');
    }
});

// Allow Enter key to add note
elements.vaultInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') elements.vaultAddBtn.click();
});

/**
 * Load and display vault items
 */
/**
 * Encryption Helper Functions for Vault Sync
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
    if (!settings.vaultSyncEnabled || !settings.masterSyncKey) return;

    chrome.storage.local.get(['privacyVault'], async (result) => {
        const vault = result.privacyVault || [];
        if (vault.length === 0) return;

        const masterKey = await decryptData(settings.masterSyncKey, secretCode);
        if (!masterKey) return;

        const encrypted = await encryptData(vault, masterKey);
        if (encrypted) {
            chrome.storage.sync.set({ encryptedVault: encrypted }, () => {
                console.log('Vault synced to cloud (encrypted with Master Key)');
            });
        }
    });
}

async function pullVaultFromCloud() {
    if (!settings.vaultSyncEnabled || !settings.masterSyncKey) return;

    return new Promise((resolve) => {
        chrome.storage.sync.get(['encryptedVault'], async (result) => {
            if (result.encryptedVault) {
                const masterKey = await decryptData(settings.masterSyncKey, secretCode);
                if (!masterKey) return resolve(null);

                const decrypted = await decryptData(result.encryptedVault, masterKey);
                if (decrypted) {
                    // Merge or replace? Let's merge based on ID
                    chrome.storage.local.get(['privacyVault'], (localResult) => {
                        const localVault = localResult.privacyVault || [];
                        const mergedVault = [...localVault];
                        
                        decrypted.forEach(remoteItem => {
                            if (!mergedVault.some(localItem => localItem.id === remoteItem.id)) {
                                mergedVault.push(remoteItem);
                            }
                        });
                        
                        chrome.storage.local.set({ privacyVault: mergedVault }, () => {
                            resolve(mergedVault);
                        });
                    });
                } else {
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        });
    });
}

function loadVault() {
    const { vaultList } = elements;
    const lang = settings.language || 'vi';
    const dict = translations[lang] || translations.vi;
    
    // Check if we have the session password
    if (!secretCode) {
        // Only try to restore from session if ALWAYS require password is OFF
        if (!settings.alwaysRequirePassword && chrome.storage.session) {
            chrome.storage.session.get(['sessionPassword'], (result) => {
                if (result.sessionPassword) {
                    secretCode = result.sessionPassword;
                    isVaultUnlocked = true;
                    elements.vaultLockScreen.classList.remove('show');
                    performVaultLoad(dict);
                } else {
                    elements.vaultLockScreen.classList.add('show');
                }
            });
        } else {
            elements.vaultLockScreen.classList.add('show');
        }
    } else {
        isVaultUnlocked = true;
        elements.vaultLockScreen.classList.remove('show');
        performVaultLoad(dict);
    }
}

function performVaultLoad(dict) {
    // First, try to pull from sync if enabled
    if (settings.vaultSyncEnabled && settings.masterSyncKey) {
        pullVaultFromCloud().then(() => {
            renderVaultItems(dict);
        });
    } else {
        renderVaultItems(dict);
    }
}

function renderVaultItems(dict) {
    const { vaultList } = elements;
    chrome.storage.local.get(['privacyVault'], (result) => {
        const vault = result.privacyVault || [];
        vaultList.innerHTML = vault.length ? '' : `<p class="empty-msg">${dict.noVault || 'Your vault is empty. Right-click on pages or add notes here.'}</p>`;

        // Sort by date descending
        vault.sort((a, b) => new Date(b.date) - new Date(a.date));

        vault.forEach(item => {
            const div = document.createElement('div');
            div.className = 'vault-item';
            
            const iconSpan = document.createElement('div');
            iconSpan.className = 'vault-item-icon';
            iconSpan.textContent = item.type === 'link' ? '🔗' : '📝';
            div.appendChild(iconSpan);

            const infoDiv = document.createElement('div');
            infoDiv.className = 'vault-item-info';

            const titleSpan = document.createElement('span');
            titleSpan.className = 'vault-item-title';
            titleSpan.title = item.title;
            titleSpan.textContent = item.title.length > 50 ? item.title.substring(0, 50) + '...' : item.title;
            infoDiv.appendChild(titleSpan);

            if (item.url) {
                const urlAnchor = document.createElement('a');
                urlAnchor.href = item.url;
                urlAnchor.className = 'vault-item-url';
                urlAnchor.target = '_blank';
                urlAnchor.textContent = item.url;
                infoDiv.appendChild(urlAnchor);
            }

            const dateSmall = document.createElement('small');
            dateSmall.style.cssText = 'font-size: 0.7rem; color: #999;';
            dateSmall.textContent = new Date(item.date).toLocaleString();
            infoDiv.appendChild(dateSmall);

            div.appendChild(infoDiv);

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'vault-item-actions';

            const deleteButton = document.createElement('button');
            deleteButton.className = 'vault-delete-btn';
            deleteButton.title = 'Remove';
            deleteButton.textContent = '🗑️';
            actionsDiv.appendChild(deleteButton);

            div.appendChild(actionsDiv);

            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Remove this item from Vault?')) {
                    const newVault = vault.filter(v => v.id !== item.id);
                    chrome.storage.local.set({ privacyVault: newVault }, () => {
                        renderVaultItems(dict);
                        syncVaultToCloud(); // Sync after deletion
                    });
                }
            });

            vaultList.appendChild(div);
        });
    });
}

// History Search & Logic
elements.historySearchInput.addEventListener('input', (e) => {
    loadHistoryAndSessions(e.target.value);
});

// History Smooth Lazy Load Scroll Listener
elements.historyList.addEventListener('scroll', () => {
    const { historyList } = elements;
    const scrollThreshold = 100; // Load more when 100px from bottom
    
    if (historyList.scrollHeight - historyList.scrollTop - historyList.clientHeight < scrollThreshold) {
        renderNextHistoryChunk();
    }
});

elements.clearHistorySearch.addEventListener('click', () => {
    elements.historySearchInput.value = '';
    loadHistoryAndSessions();
});

elements.bookmarksSearchInput.addEventListener('input', (e) => {
    loadBookmarks(e.target.value);
});

elements.settingsSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const groups = document.querySelectorAll('.settings-group');
    
    groups.forEach(group => {
        const title = group.querySelector('h3')?.textContent.toLowerCase() || '';
        const items = group.querySelectorAll('.setting-item');
        let groupHasMatch = title.includes(query);
        
        items.forEach(item => {
            const itemText = item.textContent.toLowerCase();
            const isMatch = itemText.includes(query);
            
            if (query === '') {
                item.classList.remove('hidden-search');
                item.classList.remove('match-search');
            } else if (isMatch) {
                item.classList.remove('hidden-search');
                item.classList.add('match-search');
                groupHasMatch = true;
            } else {
                item.classList.add('hidden-search');
                item.classList.remove('match-search');
            }
        });
        
        if (query === '') {
            group.classList.remove('hidden-search');
            group.classList.remove('fade-out');
        } else if (groupHasMatch) {
            group.classList.remove('hidden-search');
            group.classList.remove('fade-out');
        } else {
            group.classList.add('fade-out');
            setTimeout(() => {
                if (group.classList.contains('fade-out')) {
                    group.classList.add('hidden-search');
                }
            }, 300);
        }
    });
});

elements.clearSettingsSearch.addEventListener('click', () => {
    elements.settingsSearchInput.value = '';
    elements.settingsSearchInput.dispatchEvent(new Event('input'));
});

// Quick Actions Dashboard
elements.quickFocusMode.addEventListener('click', () => {
    chrome.management.getAll((extensions) => {
        const toDisable = extensions.filter(ext => 
            ext.enabled && 
            ext.type === 'extension' && 
            ext.id !== chrome.runtime.id // Don't disable yourself!
        );
        
        if (toDisable.length === 0) {
            notify('Focus Mode already active!', 'warning');
            return;
        }

        let disabledCount = 0;
        toDisable.forEach(ext => {
            chrome.management.setEnabled(ext.id, false, () => {
                disabledCount++;
                if (disabledCount === toDisable.length) {
                    notify(`Focus Mode: Disabled ${disabledCount} extensions`, 'success');
                    updateDashboard();
                    
                    // Nếu đang mở tab Extensions Manager, cập nhật lại giao diện
                    if (elements.extensionsList.classList.contains('show')) {
                        renderExtensions();
                    }
                }
            });
        });
    });
});

/**
 * Cập nhật số liệu trên Dashboard (Nâng cấp thành Smart Dashboard)
 */
let dashboardUpdateTimeout = null;
async function updateDashboard() {
    if (dashboardUpdateTimeout) clearTimeout(dashboardUpdateTimeout);
    
    dashboardUpdateTimeout = setTimeout(async () => {
        const { statCookies, statExtensions, statTrackers, permanentBar, sessionBar, permanentCount, sessionCount, privacyInsightsList } = elements;
        
        // 1. Cookies count and age analysis
        chrome.cookies.getAll({}, (cookies) => {
            const total = cookies.length;
            statCookies.textContent = total;
            
            // Age analysis
            let permanent = 0;
            let session = 0;
            const now = Date.now() / 1000;
            const oneWeekInSeconds = 7 * 24 * 60 * 60;

            cookies.forEach(c => {
                if (c.session || (c.expirationDate && (c.expirationDate - now) < oneWeekInSeconds)) {
                    session++;
                } else {
                    permanent++;
                }
            });

            permanentCount.textContent = permanent;
            sessionCount.textContent = session;
            
            if (total > 0) {
                const permanentPercent = (permanent / total) * 100;
                const sessionPercent = (session / total) * 100;
                permanentBar.style.width = `${permanentPercent}%`;
                sessionBar.style.width = `${sessionPercent}%`;
            } else {
                permanentBar.style.width = '0%';
                sessionBar.style.width = '0%';
            }

            // Generate Insights
            renderInsights(total, permanent, settings.trackerCount || 0);
        });

        // 2. Extensions count
        chrome.management.getAll((extensions) => {
            const activeExts = extensions.filter(ext => ext.enabled && ext.type === 'extension').length;
            statExtensions.textContent = activeExts;
        });

        // 3. Trackers count
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.runtime.sendMessage({ type: 'getTrackerCount', tabId: tabs[0].id }, (response) => {
                    const count = response ? response.count : 0;
                    const list = response ? response.list : [];
                    statTrackers.textContent = count;
                    settings.trackerCount = count; 
                    settings.currentTrackers = list; // Lưu trữ danh sách tracker hiện tại
                });
            }
        });

        // 4. Privacy Grade
        calculatePrivacyGrade();
    }, 100); // Debounce 100ms
}

/**
 * Cập nhật điểm số bảo mật (Smart Dashboard logic)
 */
async function calculatePrivacyGrade() {
    const { statCookies, statExtensions, statTrackers, privacyGradeValue, healthScoreText, healthStatusText, healthBarFill, fixPrivacyBtn } = elements;
    
    const cookieCount = parseInt(statCookies.textContent) || 0;
    const extCount = parseInt(statExtensions.textContent) || 0;
    const trackerCount = parseInt(statTrackers.textContent) || 0;
    
    let score = 100;
    const issues = [];

    // 1. Phân tích Cookies & Trackers
    if (cookieCount > 200) score -= 10;
    if (cookieCount > 800) score -= 15;
    if (trackerCount > 0) score -= Math.min(30, trackerCount * 5);

    // 2. Kiểm tra các thiết lập bảo mật hiện tại
    if (!settings.cookieDestroyer) {
        score -= 10;
        issues.push('enableAutoCleanup');
    }
    if (!settings.realTimeProtection) {
        score -= 10;
        issues.push('enableRealTime');
    }
    if (!settings.blockClickjacking || !settings.blockCryptoMining) {
        score -= 10;
        issues.push('enableAdvancedBlocking');
    }
    if (settings.protectionLevel !== 'enhanced') {
        score -= 10;
        issues.push('upgradeProtectionLevel');
    }
    if (!settings.autoClearStealth) {
        score -= 5;
        issues.push('enableAutoClearStealth');
    }

    // 3. Kiểm tra Chrome Privacy API (nếu có thể)
    try {
        const dnt = await chrome.privacy.websites.doNotTrackEnabled.get({});
        if (!dnt.value) {
            score -= 5;
            issues.push('enableDNT');
        }
    } catch (e) {}

    // Giới hạn điểm từ 0 - 100
    score = Math.max(0, Math.min(100, score));

    // Xác định Xếp hạng & Trạng thái
    let grade = 'F';
    let status = 'Critical';
    let color = '#ef4444'; // Red

    if (score >= 90) { grade = 'A+'; status = 'Excellent'; color = '#10b981'; }
    else if (score >= 80) { grade = 'A'; status = 'Very Good'; color = '#10b981'; }
    else if (score >= 70) { grade = 'B+'; status = 'Good'; color = '#3b82f6'; }
    else if (score >= 60) { grade = 'B'; status = 'Fair'; color = '#3b82f6'; }
    else if (score >= 50) { grade = 'C'; status = 'Average'; color = '#f59e0b'; }
    else if (score >= 40) { grade = 'D'; status = 'Poor'; color = '#ef4444'; }

    // Cập nhật giao diện
    if (privacyGradeValue) privacyGradeValue.textContent = grade;
    if (healthScoreText) healthScoreText.textContent = `${score}/100`;
    if (healthStatusText) {
        healthStatusText.textContent = status;
        healthStatusText.style.background = color;
    }
    if (healthBarFill) {
        healthBarFill.style.width = `${score}%`;
        healthBarFill.style.background = color;
    }

    // Hiển thị/Ẩn nút Fix Now
    if (fixPrivacyBtn) {
        if (score < 90 && issues.length > 0) {
            fixPrivacyBtn.classList.remove('hidden');
            fixPrivacyBtn.onclick = () => fixPrivacyIssues(issues);
        } else {
            fixPrivacyBtn.classList.add('hidden');
        }
    }
}

/**
 * Tự động khắc phục các vấn đề bảo mật (Thực sự nâng cấp Privacy)
 */
async function fixPrivacyIssues(issues) {
    const lang = settings.language || 'vi';
    const dict = translations[lang] || translations.vi;
    
    for (const issue of issues) {
        switch (issue) {
            case 'enableAutoCleanup':
                settings.cookieDestroyer = true;
                break;
            case 'enableRealTime':
                settings.realTimeProtection = true;
                break;
            case 'enableAdvancedBlocking':
                settings.blockClickjacking = true;
                settings.blockCryptoMining = true;
                break;
            case 'upgradeProtectionLevel':
                settings.protectionLevel = 'enhanced';
                break;
            case 'enableAutoClearStealth':
                settings.autoClearStealth = true;
                break;
            case 'enableDNT':
                try {
                    await chrome.privacy.websites.doNotTrackEnabled.set({ value: true });
                } catch (e) {}
                break;
        }
    }
    
    saveSettings();
    updateUILanguage(); // Cập nhật lại UI đồng bộ
    notify(dict.fixSuccess || 'Privacy upgraded successfully!', 'success');
    
    // Đợi 1 chút để các hiệu ứng mượt mà
    setTimeout(() => calculatePrivacyGrade(), 500);
}

/**
 * Hiển thị các gợi ý bảo mật dựa trên dữ liệu
 */
function renderInsights(totalCookies, permanentCookies, trackers) {
    const { privacyInsightsList } = elements;
    const lang = settings.language || 'vi';
    const dict = translations[lang] || translations.vi;
    
    privacyInsightsList.innerHTML = '';
    const insights = [];

    if (trackers > 5) {
        insights.push({ 
            text: dict.trackersWarning || `Phát hiện ${trackers} tracker trên trang này. Hãy cẩn thận!`,
            type: 'warning'
        });
    }

    if (permanentCookies > totalCookies * 0.5 && totalCookies > 0) {
        insights.push({
            text: dict.permanentCookiesWarning || 'Quá nhiều cookie vĩnh viễn có thể dùng để theo dõi bạn.',
            type: 'warning'
        });
    }

    if (settings.cookieDestroyer) {
        insights.push({
            text: dict.autoCleanupActive || 'Chế độ Auto-Cleanup đang bảo vệ bạn.',
            type: 'success'
        });
    } else {
        insights.push({
            text: dict.enableAutoCleanup || 'Bật Auto-Cleanup để tự động dọn dẹp dấu vết.',
            type: 'info'
        });
    }

    insights.slice(0, 3).forEach(insight => {
        const div = document.createElement('div');
        div.className = `insight-item ${insight.type || ''}`;
        div.textContent = insight.text;
        privacyInsightsList.appendChild(div);
    });
}

/**
 * Quản lý Whitelist cho Auto-Cleanup
 */
function renderWhitelist() {
    const { whitelistList } = elements;
    whitelistList.innerHTML = '';
    
    const whitelist = settings.whitelist || [];
    whitelist.forEach(domain => {
        const tag = document.createElement('div');
        tag.className = 'whitelist-tag';
        tag.innerHTML = `
            <span>${domain}</span>
            <span class="whitelist-remove" data-domain="${domain}">×</span>
        `;
        whitelistList.appendChild(tag);
    });

    // Add event listeners for removal
    document.querySelectorAll('.whitelist-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const domain = e.target.dataset.domain;
            settings.whitelist = settings.whitelist.filter(d => d !== domain);
            saveSettings();
            renderWhitelist();
            notify(`Removed ${domain} from whitelist`, 'success');
        });
    });
}

// Multi-Account Container Management
function loadContainers() {
    const { containerList } = elements;
    const containers = settings.accountContainers || [];
    const lang = settings.language || 'vi';
    const dict = translations[lang] || translations.vi;

    containerList.innerHTML = '';

    if (containers.length === 0) {
        containerList.innerHTML = `<p class="empty-msg">${dict.noContainers || 'No containers yet. Create one to start!'}</p>`;
        return;
    }

    containers.forEach(container => {
        const card = document.createElement('div');
        card.className = 'container-card';
        card.style.setProperty('--container-color', container.color);
        card.style.setProperty('--container-shadow', `${container.color}4D`); // 30% opacity in hex

        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'container-card-icon';
        
        const iconImg = document.createElement('img');
        const iconName = container.icon || 'container.png';
        iconImg.src = `icons/${iconName}`;
        iconImg.alt = iconName;
        iconImg.style.width = '24px'; // Ensure base size
        iconImg.style.height = '24px';
        iconWrapper.appendChild(iconImg);
        
        card.appendChild(iconWrapper);

        const name = document.createElement('span');
        name.className = 'container-card-name';
        name.textContent = container.name;
        card.appendChild(name);

        // Show mode badge
        const modeBadge = document.createElement('span');
        modeBadge.className = 'container-mode-badge';
        modeBadge.textContent = container.mode === 'incognito' ? 'Isolated' : 'Shared';
        modeBadge.style.fontSize = '0.7rem';
        modeBadge.style.opacity = '0.6';
        card.appendChild(modeBadge);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'container-delete-btn';
        deleteBtn.textContent = '×';
        deleteBtn.title = 'Remove';
        card.appendChild(deleteBtn);

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Remove container "${container.name}"?`)) {
                settings.accountContainers = settings.accountContainers.filter(c => c.id !== container.id);
                saveSettings();
                loadContainers();
                notify('Container removed', 'success');
            }
        });

        card.addEventListener('click', () => {
            const url = 'https://www.google.com';
            if (container.mode === 'incognito') {
                chrome.windows.create({
                    url: url,
                    incognito: true,
                    type: 'normal'
                });
                notify(`Opening "${container.name}" in isolated Incognito window...`, 'success');
            } else {
                chrome.tabs.create({ url: url }); 
                notify(`Opening new tab in "${container.name}" (shared session)...`, 'success');
            }
        });

        containerList.appendChild(card);
    });
}

elements.addContainerBtn.addEventListener('click', () => {
    const nameInput = elements.newContainerName;
    const colorInput = elements.newContainerColor;
    const modeInput = elements.newContainerMode;
    const name = nameInput.value.trim();
    const color = colorInput.value;
    const mode = modeInput ? modeInput.value : 'normal';

    // Get selected icon
    const selectedIconEl = document.querySelector('.picker-icon.selected');
    const icon = selectedIconEl ? selectedIconEl.getAttribute('data-icon') : 'container.png';

    if (!name) {
        notify('Please enter a container name.', 'warning');
        return;
    }

    const newContainer = {
        id: Date.now().toString(),
        name: name,
        color: color,
        icon: icon,
        mode: mode
    };

    if (!settings.accountContainers) settings.accountContainers = [];
    settings.accountContainers.push(newContainer);
    saveSettings();
    
    nameInput.value = '';
    // Reset icon picker
    document.querySelectorAll('.picker-icon').forEach(i => i.classList.remove('selected'));
    if (elements.containerIconPicker) {
        elements.containerIconPicker.firstElementChild.classList.add('selected');
    }
    
    loadContainers();
    notify(`Container "${name}" created!`, 'success');
});

elements.quickIdentityBtn.addEventListener('click', () => {
    const randomNames = ['Ghost', 'Phantom', 'Stealth', 'Ninja', 'Specter', 'Shadow', 'Anon', 'Voyager'];
    const randomColors = ['#3182ce', '#e53e3e', '#38a169', '#d69e2e', '#805ad5', '#ff0080'];
    const randomIcons = ['container.png', 'shield.png', 'incognito.png', 'shape.png', 'vietnam.png'];
    
    const name = `${randomNames[Math.floor(Math.random() * randomNames.length)]}_${Math.floor(Math.random() * 1000)}`;
    const color = randomColors[Math.floor(Math.random() * randomColors.length)];
    const icon = randomIcons[Math.floor(Math.random() * randomIcons.length)];

    const newContainer = {
        id: Date.now().toString(),
        name: name,
        color: color,
        icon: icon,
        isTemporary: true
    };

    if (!settings.accountContainers) settings.accountContainers = [];
    settings.accountContainers.push(newContainer);
    saveSettings();
    
    loadContainers();
    notify(`Quick Identity "${name}" created!`, 'success');
    
    // Simulate opening tab in this container
    chrome.tabs.create({ url: 'https://www.google.com' });
});

elements.quickClearAll.addEventListener('click', async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.url) throw new Error('Không thể xác định trang web hiện tại');

        const url = new URL(tab.url);
        const domain = url.hostname;

        if (confirm(`Bạn có chắc muốn xóa sạch Cookie và Lịch sử của trang "${domain}"?`)) {
            // 1. Xóa Cookies của domain hiện tại
            const cookies = await chrome.cookies.getAll({ domain: domain });
            await Promise.all(
                cookies.map(c => {
                    const cookieUrl = `http${c.secure ? 's' : ''}://${c.domain}${c.path}`;
                    return chrome.cookies.remove({ url: cookieUrl, name: c.name });
                })
            );

            // 2. Xóa Lịch sử của domain hiện tại
            // chrome.history.deleteUrl chỉ xóa từng URL, ta sẽ lấy các URL của domain này và xóa
            chrome.history.search({ text: domain, maxResults: 1000, startTime: 0 }, (items) => {
                items.forEach(item => {
                    if (item.url.includes(domain)) {
                        chrome.history.deleteUrl({ url: item.url });
                    }
                });
                
                notify(`Đã dọn dẹp sạch dữ liệu của "${domain}"`, 'success');
                updateDashboard();
                
                // Refresh history list if open
                if (elements.historySection.classList.contains('show')) {
                    loadHistoryAndSessions();
                }
            });
        }
    } catch (error) {
        notify(`Lỗi: ${error.message}`, 'error');
    }
});

// History Tab Switching
document.querySelectorAll('.history-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.history-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.history-tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const tabId = btn.dataset.tab;
        document.getElementById(tabId).classList.add('active');
        
        // Load data based on tab
        if (tabId === 'bookmarksTab') {
            loadBookmarks();
        } else if (tabId === 'readingListTab') {
            loadReadingList();
        } else if (tabId === 'localHistory') {
            loadHistoryAndSessions();
        }
    });
});

/**
 * Load Bookmarks
 */
async function loadBookmarks(query = '') {
    const { bookmarksList } = elements;
    if (!chrome.bookmarks) {
        bookmarksList.innerHTML = '<p class="empty-msg">Bookmarks API not available.</p>';
        return;
    }

    bookmarksList.innerHTML = '<p class="loading">Loading bookmarks...</p>';
    
    const handleResults = (items) => {
        bookmarksList.innerHTML = '';
        const bookmarks = items.filter(item => item.url); // Chỉ hiện bookmark thực sự, không hiện folder
        
        if (bookmarks.length === 0) {
            const lang = settings.language || 'vi';
            const dict = translations[lang] || translations.vi;
            bookmarksList.innerHTML = `<p class="empty-msg">${dict.noBookmarks || 'No bookmarks found.'}</p>`;
            return;
        }

        const fragment = document.createDocumentFragment();
        bookmarks.forEach(bookmark => {
            const div = createHistoryItemUI(bookmark, 'bookmark');
            fragment.appendChild(div);
        });
        bookmarksList.appendChild(fragment);
    };

    if (query.trim() === '') {
        // Nếu không có từ khóa, lấy 1000 dấu trang gần nhất
        chrome.bookmarks.getRecent(1000, handleResults);
    } else {
        // Nếu có từ khóa, tìm kiếm theo từ khóa
        chrome.bookmarks.search(query, handleResults);
    }
}

/**
 * Load Reading List
 */
async function loadReadingList() {
    const { readingListContainer } = elements;
    
    // chrome.readingList is only available in Chrome 102+
    if (!chrome.readingList) {
        readingListContainer.innerHTML = '<p class="empty-msg">Reading List API not available.</p>';
        return;
    }

    readingListContainer.innerHTML = '<p class="loading">Loading reading list...</p>';
    
    try {
        const items = await chrome.readingList.query({});
        readingListContainer.innerHTML = '';
        
        if (items.length === 0) {
            const lang = settings.language || 'vi';
            const dict = translations[lang] || translations.vi;
            readingListContainer.innerHTML = `<p class="empty-msg">${dict.noReadingList || 'Reading list is empty.'}</p>`;
            return;
        }

        const fragment = document.createDocumentFragment();
        items.forEach(item => {
            const div = createHistoryItemUI(item, 'readingList');
            fragment.appendChild(div);
        });
        readingListContainer.appendChild(fragment);
    } catch (e) {
        readingListContainer.innerHTML = `<p class="empty-msg">Error loading reading list: ${e.message}</p>`;
    }
}

/**
 * Tạo một UI item thống nhất cho Lịch sử, Dấu trang và Danh sách đọc (Optimized)
 */
function createHistoryItemUI(item, type) {
    const div = document.createElement('div');
    div.className = 'history-item';
    
    let hostname = 'unknown';
    try { hostname = new URL(item.url).hostname; } catch(e) {}
    
    const favicon = `https://www.google.com/s2/favicons?domain=${hostname}`;
    const visitDate = item.lastVisitTime ? new Date(item.lastVisitTime) : null;
    const visitTime = visitDate ? visitDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';
    
    const lang = settings.language || 'vi';
    const dict = translations[lang] || translations.vi;

    div.innerHTML = `
        <img src="${favicon}" class="history-icon" onerror="this.src='icons/extension.png'">
        <div class="history-info">
            <div class="history-top-line">
                <span class="history-title" title="${item.title || item.url}">${item.title || 'No Title'}</span>
                ${visitTime ? `<span class="history-time">${visitTime}</span>` : ''}
            </div>
            <span class="history-url">${item.url}</span>
        </div>
        <div class="history-item-actions">
            <button class="history-play-btn" title="${dict.openInPrivacyPlayer || 'Open in Privacy Player'}">🛡️</button>
            <button class="history-copy-btn" title="Copy Link">🔗</button>
            <button class="history-delete-btn" title="Delete">🗑️</button>
        </div>
    `;

    // Gán sự kiện sau khi innerHTML được tạo
    div.querySelector('.history-play-btn').onclick = (e) => {
        e.stopPropagation();
        elements.stealthUrl.value = item.url;
        toggleSection('player');
        elements.loadStealth.click();
    };

    div.querySelector('.history-copy-btn').onclick = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(item.url);
        notify('Link copied to clipboard', 'success');
    };

    div.querySelector('.history-delete-btn').onclick = (e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this item?')) {
            if (type === 'history') {
                chrome.history.deleteUrl({ url: item.url }, () => {
                    div.remove();
                    notify('Deleted from history', 'success');
                });
            } else if (type === 'bookmark') {
                chrome.bookmarks.remove(item.id, () => {
                    div.remove();
                    notify('Deleted from bookmarks', 'success');
                });
            } else if (type === 'readingList') {
                chrome.readingList.removeEntry({ url: item.url }).then(() => {
                    div.remove();
                    notify('Deleted from reading list', 'success');
                });
            }
        }
    };

    div.onclick = () => {
        if (settings.historyIncognito) {
            chrome.windows.create({ url: item.url, incognito: true, type: 'normal' });
            notify('Opening in Incognito window...', 'success');
        } else {
            chrome.tabs.create({ url: item.url });
        }
    };
    
    return div;
}

/**
 * Load History and Remote Sessions
 */
async function loadHistoryAndSessions(query = '') {
    const { historyList, deviceList, historyRestrictedOverlay } = elements;
    
    historyList.innerHTML = '';
    deviceList.innerHTML = '';
    historyRestrictedOverlay.classList.add('hidden');
    
    // Reset lazy load state
    historyItemsBuffer = [];
    currentHistoryIndex = 0;
    lastRenderedDate = '';
    
    if (!chrome.history) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-container';
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'empty-msg';
        emptyMsg.textContent = 'History API not available.';
        const hintText = document.createElement('p');
        hintText.className = 'hint-text';
        hintText.innerHTML = 'Vui lòng vào <b>chrome://extensions</b> và nhấn nút <b>Reload</b> (🔄) của extension này để cấp quyền truy cập lịch sử.';
        errorContainer.appendChild(emptyMsg);
        errorContainer.appendChild(hintText);
        historyList.appendChild(errorContainer);
        return;
    }

    const loadingHistory = document.createElement('p');
    loadingHistory.className = 'loading';
    const lang = settings.language || 'vi';
    const dict = translations[lang] || translations.vi;
    loadingHistory.textContent = dict.loadingHistory || 'Loading history...';
    historyList.appendChild(loadingHistory);

    chrome.history.search({ text: query, maxResults: 5000, startTime: 0 }, (items) => {
        historyList.innerHTML = ''; // Clear loading message
        if (items.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.className = 'empty-msg';
            emptyMsg.textContent = dict.noHistory || 'No history found.';
            historyList.appendChild(emptyMsg);
            return;
        }
        
        historyItemsBuffer = items;
        renderNextHistoryChunk();
    });

    const loadingDevices = document.createElement('p');
    loadingDevices.className = 'loading';
    loadingDevices.textContent = dict.loadingDevices || 'Loading devices...';
    deviceList.appendChild(loadingDevices);

    if (chrome.sessions) {
        chrome.sessions.getDevices({ maxResults: 10 }, (devices) => {
            deviceList.innerHTML = ''; // Clear loading message
            if (devices.length === 0) {
                const emptyMsg = document.createElement('p');
                emptyMsg.className = 'empty-msg';
                emptyMsg.textContent = dict.noDevices || 'No other devices found or sync is disabled.';
                deviceList.appendChild(emptyMsg);
                return;
            }
            devices.forEach(device => {
                const deviceDiv = document.createElement('div');
                deviceDiv.className = 'device-group';
                const deviceHeader = document.createElement('h4');
                deviceHeader.className = 'device-header';
                
                // Add icons based on device name
                const deviceName = device.deviceName.toLowerCase();
                let icon = '📱';
                if (deviceName.includes('pc') || deviceName.includes('desktop') || deviceName.includes('mac') || deviceName.includes('windows')) icon = '💻';
                if (deviceName.includes('tablet') || deviceName.includes('ipad')) icon = '📠';
                
                deviceHeader.innerHTML = `<span class="device-type-icon">${icon}</span> ${device.deviceName}`;
                deviceDiv.appendChild(deviceHeader);
                
                device.sessions.forEach(session => {
                    let tabs = [];
                    if (session.tab) {
                        tabs.push(session.tab);
                    } else if (session.window && session.window.tabs) {
                        tabs = session.window.tabs;
                    }

                    tabs.forEach(tab => {
                        const item = document.createElement('div');
                        item.className = 'device-item';
                        
                        let hostname = 'unknown';
                        try { hostname = new URL(tab.url).hostname; } catch(e) {}

                        const favicon = `https://www.google.com/s2/favicons?domain=${hostname}`;
                        const img = document.createElement('img');
                        img.src = favicon;
                        img.className = 'device-icon';
                        img.onerror = function() { this.src = 'icons/extension.png'; };
                        item.appendChild(img);

                        const infoDiv = document.createElement('div');
                        infoDiv.className = 'history-info'; // Reusing history-info styles

                        const nameSpan = document.createElement('span');
                        nameSpan.className = 'device-name';
                        nameSpan.title = tab.title || tab.url;
                        nameSpan.textContent = tab.title || 'No Title';
                        infoDiv.appendChild(nameSpan);

                        const urlSpan = document.createElement('span');
                        urlSpan.className = 'device-details';
                        urlSpan.textContent = tab.url;
                        infoDiv.appendChild(urlSpan);
                        item.appendChild(infoDiv);

                        item.addEventListener('click', () => {
                            if (settings.historyIncognito) {
                                chrome.windows.create({
                                    url: tab.url,
                                    incognito: true,
                                    type: 'normal'
                                });
                                notify('Opening in Incognito window...', 'success');
                            } else {
                                chrome.tabs.create({ url: tab.url });
                            }
                        });
                        deviceDiv.appendChild(item);
                    });
                });
                deviceList.appendChild(deviceDiv);
            });
        });
    } else {
        const errorMsg = document.createElement('p');
        errorMsg.className = 'empty-msg';
        errorMsg.textContent = 'Sessions API not available.';
        deviceList.appendChild(errorMsg);
    }
}

/**
 * Render next chunk of history items for smooth lazy load
 */
function renderNextHistoryChunk() {
    if (isLoadingHistoryChunks || currentHistoryIndex >= historyItemsBuffer.length) return;
    
    isLoadingHistoryChunks = true;
    const { historyList } = elements;
    
    // Remove previous loader if exists
    const oldLoader = document.getElementById('historyLoadMore');
    if (oldLoader) oldLoader.remove();

    const itemsToRender = historyItemsBuffer.slice(currentHistoryIndex, currentHistoryIndex + historyChunkSize);
    
    const fragment = document.createDocumentFragment();
    
    itemsToRender.forEach((item, index) => {
        const date = new Date(item.lastVisitTime);
        const dateKey = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        
        let displayDate = dateKey;
        const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        
        if (dateKey === today) displayDate = 'Today';
        else if (dateKey === yesterday) displayDate = 'Yesterday';

        // Add date header if date changed
        if (displayDate !== lastRenderedDate) {
            const dateHeader = document.createElement('div');
            dateHeader.className = 'history-date-header';
            dateHeader.textContent = displayDate;
            fragment.appendChild(dateHeader);
            lastRenderedDate = displayDate;
        }

        const div = createHistoryItemUI(item, 'history');
        div.style.animationDelay = `${(index % historyChunkSize) * 0.02}s`; // Staggered animation
        fragment.appendChild(div);
    });
    
    historyList.appendChild(fragment);
    currentHistoryIndex += historyChunkSize;
    isLoadingHistoryChunks = false;
    
    // Show a small loader at the bottom if more items exist
    if (currentHistoryIndex < historyItemsBuffer.length) {
        const loadMoreIndicator = document.createElement('div');
        loadMoreIndicator.id = 'historyLoadMore';
        loadMoreIndicator.className = 'loading-small';
        historyList.appendChild(loadMoreIndicator);
    }
    
    // Check if we need more items immediately (if list is short)
    if (historyList.scrollHeight <= historyList.clientHeight && currentHistoryIndex < historyItemsBuffer.length) {
        renderNextHistoryChunk();
    }
}

// Settings Toggles Logic
elements.darkModeToggle.addEventListener('change', (e) => {
    settings.darkMode = e.target.checked;
    applySettings();
    saveSettings();
    notify(`Dark mode ${settings.darkMode ? 'enabled' : 'disabled'}`, 'success');
});

elements.autoClearToggle.addEventListener('change', (e) => {
    settings.autoClear = e.target.checked;
    saveSettings();
    notify(`Auto-clear history ${settings.autoClear ? 'on' : 'off'}`, 'success');
});

elements.showNotifyToggle.addEventListener('change', (e) => {
    settings.showNotifications = e.target.checked;
    saveSettings();
    // No notification here since user might have just turned them off!
});

elements.cookieDestroyerToggle.addEventListener('change', (e) => {
    settings.cookieDestroyer = e.target.checked;
    elements.autoCleanupRulesSection.style.display = settings.cookieDestroyer ? 'block' : 'none';
    saveSettings();
    notify(`Auto-Cookie Destroyer ${settings.cookieDestroyer ? 'enabled' : 'disabled'}`, 'success');
});

elements.addWhitelistBtn.addEventListener('click', () => {
    const input = elements.whitelistInput;
    const domain = input.value.trim().toLowerCase();
    
    if (!domain) return;
    
    if (!settings.whitelist) settings.whitelist = [];
    if (settings.whitelist.includes(domain)) {
        notify('Domain already in whitelist', 'warning');
        return;
    }
    
    settings.whitelist.push(domain);
    saveSettings();
    input.value = '';
    renderWhitelist();
    notify(`Added ${domain} to whitelist`, 'success');
});

elements.historyIncognitoToggle.addEventListener('change', (e) => {
    settings.historyIncognito = e.target.checked;
    saveSettings();
    notify(`History Incognito mode ${settings.historyIncognito ? 'enabled' : 'disabled'}`, 'success');
});

// Side Panel behavior toggle
elements.useSidePanelToggle.addEventListener('change', (e) => {
    settings.useSidePanel = e.target.checked;
    saveSettings();
    
    // Cập nhật Panel behavior ngay lập tức
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: settings.useSidePanel })
        .catch((error) => console.error(error));
        
    notify(`Side Panel default ${settings.useSidePanel ? 'enabled' : 'disabled'}`, 'success');
});

elements.realTimeProtectionToggle.addEventListener('change', (e) => {
    settings.realTimeProtection = e.target.checked;
    saveSettings();
    chrome.runtime.sendMessage({ type: 'updateSecurityRules' });
    notify(`Real-time Protection ${settings.realTimeProtection ? 'enabled' : 'disabled'}`, 'success');
});

elements.telegramDownloaderToggle.addEventListener('change', (e) => {
    settings.telegramDownloaderEnabled = e.target.checked;
    saveSettings();
    elements.telegramDownloaderBtn.classList.toggle('hidden', !settings.telegramDownloaderEnabled);
    notify(`Telegram Downloader ${settings.telegramDownloaderEnabled ? 'enabled' : 'disabled'}`, 'success');
});

elements.videoDownloaderToggle.addEventListener('change', (e) => {
    settings.videoDownloaderEnabled = e.target.checked;
    saveSettings();
    elements.videoDownloaderBtn.classList.toggle('hidden', !settings.videoDownloaderEnabled);
    chrome.runtime.sendMessage({ type: 'toggleVideoDetection', enabled: settings.videoDownloaderEnabled });
    notify(`Video Downloader ${settings.videoDownloaderEnabled ? 'enabled' : 'disabled'}`, 'success');
});

elements.multiAccountToggle.addEventListener('change', (e) => {
    settings.multiAccountEnabled = e.target.checked;
    saveSettings();
    elements.multiAccountBtn.classList.toggle('hidden', !settings.multiAccountEnabled);
    
    if (settings.multiAccountEnabled) {
        notify('Multi-Account Containers enabled! Check the main menu.', 'success');
        // Removed automatic tab switch as requested by user
    } else {
        notify('Multi-Account Containers disabled.', 'warning');
        // If currently in multi-account section, go home
        if (elements.multiAccountSection.style.display === 'block') {
            elements.appSettingsBtn.click(); // Go back to settings
        }
    }
});

elements.hibernationToggle.addEventListener('change', (e) => {
    settings.hibernationEnabled = e.target.checked;
    elements.hibernationTimeoutRow.style.display = settings.hibernationEnabled ? 'flex' : 'none';
    saveSettings();
    
    // Gửi tin nhắn đến background để cập nhật logic hibernation
    chrome.runtime.sendMessage({ 
        type: 'updateHibernation', 
        enabled: settings.hibernationEnabled, 
        timeout: settings.hibernationTimeout 
    });
    
    notify(`Tab Hibernation ${settings.hibernationEnabled ? 'enabled' : 'disabled'}`, 'success');
});

elements.hibernationTimeoutSelect.addEventListener('change', (e) => {
    const isCustom = e.target.value === 'custom';
    elements.hibernationCustomTimeout.classList.toggle('hidden', !isCustom);
    
    if (!isCustom) {
        settings.hibernationTimeout = parseInt(e.target.value);
        saveSettings();
        
        chrome.runtime.sendMessage({ 
            type: 'updateHibernation', 
            enabled: settings.hibernationEnabled, 
            timeout: settings.hibernationTimeout 
        });
        
        notify(`Hibernation timeout set to ${settings.hibernationTimeout} minutes`, 'success');
    }
});

elements.hibernationCustomTimeout.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    if (value && value >= 10) {
        settings.hibernationTimeout = value;
        saveSettings();
        
        chrome.runtime.sendMessage({ 
            type: 'updateHibernation', 
            enabled: settings.hibernationEnabled, 
            timeout: settings.hibernationTimeout,
            isSeconds: true // Signal background it's in seconds
        });
    }
});

elements.vaultSyncToggle.addEventListener('change', async (e) => {
    settings.vaultSyncEnabled = e.target.checked;
    elements.masterSyncSection.style.display = settings.vaultSyncEnabled ? 'block' : 'none';
    
    if (settings.vaultSyncEnabled) {
        // If no Master Key exists, generate one
        if (!settings.masterSyncKey) {
            const newKey = await generateMasterKey();
            const encryptedKey = await encryptData(newKey, secretCode);
            settings.masterSyncKey = encryptedKey;
            elements.masterSyncKeyInput.value = newKey;
        } else {
            // Decrypt and show
            const decryptedKey = await decryptData(settings.masterSyncKey, secretCode);
            elements.masterSyncKeyInput.value = decryptedKey || '********';
        }
        notify('Vault Sync enabled!', 'success');
        syncVaultToCloud();
    } else {
        notify('Vault Sync disabled.', 'warning');
    }
    saveSettings();
});

elements.copyMasterKeyBtn.addEventListener('click', () => {
    const key = elements.masterSyncKeyInput.value;
    if (key && key !== '********') {
        navigator.clipboard.writeText(key);
        notify('Master Key copied to clipboard!', 'success');
    }
});

elements.saveMasterKeyBtn.addEventListener('click', async () => {
    const inputKey = elements.manualMasterKeyInput.value.trim();
    if (inputKey.length < 32) {
        notify('Invalid Master Key!', 'error');
        return;
    }
    
    const encryptedKey = await encryptData(inputKey, secretCode);
    settings.masterSyncKey = encryptedKey;
    elements.masterSyncKeyInput.value = inputKey;
    elements.manualMasterKeyInput.value = '';
    
    saveSettings();
    notify('Master Key saved! Syncing...', 'success');
    pullVaultFromCloud().then(() => {
        loadVault();
    });
});

elements.blockClickjackingToggle.addEventListener('change', (e) => {
    settings.blockClickjacking = e.target.checked;
    saveSettings();
    chrome.runtime.sendMessage({ type: 'updateSecurityRules' });
    notify(`Clickjacking protection ${settings.blockClickjacking ? 'enabled' : 'disabled'}`, 'success');
});

elements.blockCryptoMiningToggle.addEventListener('change', (e) => {
    settings.blockCryptoMining = e.target.checked;
    saveSettings();
    notify(`Crypto Mining protection ${settings.blockCryptoMining ? 'enabled' : 'disabled'}`, 'success');
});

elements.protectionLevelSelect.addEventListener('change', (e) => {
    settings.protectionLevel = e.target.value;
    saveSettings();
    chrome.runtime.sendMessage({ type: 'updateSecurityRules' });
    notify(`Protection level set to ${settings.protectionLevel.toUpperCase()}`, 'success');
});

elements.languageSelect.addEventListener('change', (e) => {
    settings.language = e.target.value;
    saveSettings();
    updateUILanguage();
    notify(`Language set to ${e.target.options[e.target.selectedIndex].text}`, 'success');
});

elements.playerBackgroundType.addEventListener('change', (e) => {
    settings.playerBackgroundType = e.target.value;
    saveSettings();
    toggleCustomBgUrlRow();
    applyPlayerBackground();
    notify(`Background type set to ${settings.playerBackgroundType}`, 'success');
});

elements.playerLinkBehavior.addEventListener('change', (e) => {
    settings.playerLinkBehavior = e.target.value;
    saveSettings();
    updatePlayerSandbox(); // Cập nhật sandbox ngay lập tức
    
    let notifyMsg = `Link behavior: ${e.target.options[e.target.selectedIndex].text}`;
    notify(notifyMsg, 'success');
});

elements.playerLinkFilter.addEventListener('change', (e) => {
    settings.playerLinkFilter = e.target.value;
    saveSettings();
    notify(`Link filter: ${e.target.options[e.target.selectedIndex].text}`, 'success');
});

elements.addCustomBgBtn.addEventListener('click', () => {
    const url = elements.customBgUrlInput.value.trim();
    if (!url || !isValidUrl(url)) {
        notify('Please enter a valid image URL.', 'warning');
        return;
    }
    
    if (!settings.customBgList) settings.customBgList = [];
    if (settings.customBgList.includes(url)) {
        notify('URL already in list.', 'warning');
        return;
    }
    
    settings.customBgList.unshift(url);
    settings.customBgUrl = url;
    saveSettings();
    elements.customBgUrlInput.value = '';
    renderCustomBgList();
    applyPlayerBackground();
    updateBgPreview(url);
    notify('Background added and selected!', 'success');
});

elements.customBgUrlInput.addEventListener('input', (e) => {
    const url = e.target.value.trim();
    if (url && isValidUrl(url)) {
        updateBgPreview(url);
    }
});

// Chuyển đổi giữa Popup và Side Panel ngay lập tức
elements.switchViewBtn.addEventListener('click', () => {
    chrome.windows.getCurrent((currentWindow) => {
        // Mở Side Panel cho cửa sổ hiện tại
        chrome.sidePanel.open({ windowId: currentWindow.id }).then(() => {
            // Sau khi mở panel thành công, đóng popup hiện tại
            window.close();
        }).catch((error) => {
            console.error('Error switching view:', error);
            // Nếu không thể mở (có thể do đã ở trong Side Panel), thử đóng cửa sổ
            window.close();
        });
    });
});

// Stealth Player Security Logic
elements.unlockStealth.addEventListener('click', async () => {
    const code = elements.stealthPassInput.value;
    
    chrome.storage.local.get(['stealthPasswordHash', 'stealthSalt'], async (result) => {
        const storedHash = result.stealthPasswordHash || await hashPassword('1234', 'default_salt');
        const salt = result.stealthSalt || 'default_salt';
        const enteredHash = await hashPassword(code, salt);

        if (enteredHash === storedHash) {
            secretCode = code; // Set session password
            if (chrome.storage.session) {
                chrome.storage.session.set({ sessionPassword: code });
            }
            isStealthUnlocked = true;
            elements.stealthLockScreen.classList.remove('show');
            notify('Stealth Mode Unlocked!', 'success');
            
            // Restore last URL upon unlocking if currently empty
            if (elements.stealthPlayer.src === 'about:blank' || elements.stealthPlayer.src === '') {
                chrome.storage.local.get(['lastPlayerUrl'], (result) => {
                    if (result.lastPlayerUrl) {
                        elements.stealthPlayer.src = result.lastPlayerUrl;
                        elements.stealthUrl.value = result.lastPlayerUrl;

                        // Populate history with restored URL
                        if (!playerHistory.includes(result.lastPlayerUrl)) {
                            playerHistory.push(result.lastPlayerUrl);
                            currentUrlIndex = playerHistory.length - 1;
                            updatePlayerNavState();
                        }
                        
                        notify('Restoring your last content...', 'success');
                    }
                });
            }
        } else {
            notify('Incorrect Secret Code!', 'error');
            elements.stealthPassInput.value = '';
        }
    });
});

/**
 * Kiểm tra độ mạnh của mật khẩu
 */
function isStrongPassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
}

/**
 * Hiển thị/Ẩn các nút mắt dựa trên cài đặt
 */
function togglePasswordEyes() {
    const isVisible = elements.showPasswordToggle.checked;
    const eyes = document.querySelectorAll('.pass-eye');
    eyes.forEach(eye => {
        eye.classList.toggle('hidden', !isVisible);
    });
}

/**
 * Xử lý sự kiện ẩn/hiện mật khẩu cho một input cụ thể
 */
function setupPasswordToggle(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    if (input && toggle) {
        toggle.addEventListener('click', () => {
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            toggle.textContent = isPassword ? '🙈' : '👁️';
        });
    }
}

// App Settings & Password Change Logic
elements.strongPasswordToggle.addEventListener('click', async (e) => {
    // Ngăn chặn việc thay đổi trạng thái ngay lập tức
    e.preventDefault();
    
    const intendedState = !settings.requireStrongPassword;
    const action = intendedState ? 'bật' : 'tắt';
    
    // Yêu cầu nhập mật khẩu hiện tại
    const currentPass = prompt(`Vui lòng nhập mật khẩu hiện tại để ${action} ràng buộc mật khẩu mạnh:`);
    
    if (currentPass === null) return; // Người dùng nhấn Cancel

    chrome.storage.local.get(['stealthPasswordHash', 'stealthSalt'], async (result) => {
        const storedHash = result.stealthPasswordHash || await hashPassword('1234', 'default_salt');
        const salt = result.stealthSalt || 'default_salt';
        const enteredHash = await hashPassword(currentPass, salt);

        if (enteredHash === storedHash) {
            secretCode = currentPass; // Update session password
            settings.requireStrongPassword = intendedState;
            elements.strongPasswordToggle.checked = intendedState;
            elements.passwordRequirementText.classList.toggle('hidden', !intendedState);
            saveSettings();
            notify(`Đã ${action} ràng buộc mật khẩu mạnh thành công!`, 'success');
        } else {
            notify('Mật khẩu không chính xác!', 'error');
        }
    });
});

elements.alwaysRequirePasswordToggle.addEventListener('change', (e) => {
    settings.alwaysRequirePassword = e.target.checked;
    saveSettings();
    notify(`Always require password ${settings.alwaysRequirePassword ? 'enabled' : 'disabled'}`, 'success');
});

elements.showPasswordToggle.addEventListener('change', (e) => {
    settings.showPasswordInSettings = e.target.checked;
    togglePasswordEyes();
    saveSettings();
});

    // Setup password eyes
    setupPasswordToggle('oldPassInput', 'toggleOldPass');
    setupPasswordToggle('newPassInput', 'toggleNewPass');
    setupPasswordToggle('confirmNewPassInput', 'toggleConfirmPass');
    setupPasswordToggle('stealthPassInput', 'toggleStealthPass');
    setupPasswordToggle('vaultPassInput', 'toggleVaultPass'); // Added for Vault

elements.verifyOldPass.addEventListener('click', async () => {
    const oldPass = elements.oldPassInput.value;
    
    chrome.storage.local.get(['stealthPasswordHash', 'stealthSalt'], async (result) => {
        const storedHash = result.stealthPasswordHash || await hashPassword('1234', 'default_salt');
        const salt = result.stealthSalt || 'default_salt';
        const enteredHash = await hashPassword(oldPass, salt);

        if (enteredHash === storedHash) {
            secretCode = oldPass; // Update session password
            elements.newPassRow.classList.remove('hidden');
            elements.oldPassInput.disabled = true;
            elements.verifyOldPass.disabled = true;
            notify('Old password verified. Enter new one.', 'success');
            
            // Hiển thị yêu cầu nếu cài đặt đang bật
            if (settings.requireStrongPassword) {
                elements.passwordRequirementText.classList.remove('hidden');
            }
        } else {
            notify('Incorrect current password!', 'error');
            elements.oldPassInput.value = '';
        }
    });
});

elements.saveNewPass.addEventListener('click', async () => {
    const newPass = elements.newPassInput.value.trim();
    const confirmPass = elements.confirmNewPassInput.value.trim();
    
    if (newPass === '') {
        notify('Please enter a new password', 'warning');
        return;
    }

    if (newPass !== confirmPass) {
        notify('Passwords do not match!', 'error');
        return;
    }

    // Kiểm tra ràng buộc mật khẩu mạnh
    if (settings.requireStrongPassword && !isStrongPassword(newPass)) {
        notify('Password does not meet security standards!', 'error');
        return;
    }

    // Mặc định ít nhất 4 ký tự nếu không bật strong password
    if (!settings.requireStrongPassword && newPass.length < 4) {
        notify('Password must be at least 4 chars', 'warning');
        return;
    }

    // Generate new salt and hash
    const newSalt = await generateMasterKey();
    const newHash = await hashPassword(newPass, newSalt);

    // If Vault Sync is enabled, we need to re-encrypt the Master Sync Key with the NEW password
    if (settings.vaultSyncEnabled && settings.masterSyncKey) {
        const oldPass = secretCode; // Use session password
        const masterKey = await decryptData(settings.masterSyncKey, oldPass);
        if (masterKey) {
            const reEncryptedKey = await encryptData(masterKey, newPass);
            settings.masterSyncKey = reEncryptedKey;
        }
    }

    chrome.storage.local.set({ 
        stealthPasswordHash: newHash, 
        stealthSalt: newSalt 
    }, () => {
        // Remove old plain text password
        chrome.storage.local.remove('stealthPassword');
        
        secretCode = newPass; // Update session password
        saveSettings();
        notify('Password updated successfully!', 'success');
        // Reset UI
        elements.oldPassInput.value = '';
        elements.oldPassInput.disabled = false;
        elements.verifyOldPass.disabled = false;
        elements.newPassInput.value = '';
        elements.confirmNewPassInput.value = '';
        elements.newPassRow.classList.add('hidden');
        
        // Reset input types to password
        elements.oldPassInput.type = 'password';
        elements.newPassInput.type = 'password';
        elements.confirmNewPassInput.type = 'password';
        elements.toggleOldPass.textContent = '👁️';
        elements.toggleNewPass.textContent = '👁️';
        elements.toggleConfirmPass.textContent = '👁️';
    });
});

// Allow Enter key to unlock
elements.stealthPassInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') elements.unlockStealth.click();
});

// Allow Enter key to load URL
elements.stealthUrl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') elements.loadStealth.click();
});

elements.loadStealth.addEventListener('click', () => {
    const input = elements.stealthUrl.value.trim();
    if (!input) {
        notify('Please enter a URL or search query.', 'warning');
        return;
    }

    let targetUrl;
    if (isValidUrl(input)) {
        targetUrl = input.startsWith('http') ? input : `https://${input}`;
        
        // Smart YouTube Embed Conversion
        try {
            const url = new URL(targetUrl);
            if (url.hostname.includes('youtube.com') && url.pathname === '/watch') {
                const videoId = url.searchParams.get('v');
                if (videoId) {
                    targetUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
                    notify('Optimizing YouTube for Privacy Player...', 'success');
                }
            } else if (url.hostname.includes('youtu.be')) {
                const videoId = url.pathname.substring(1);
                if (videoId) {
                    targetUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
                    notify('Optimizing YouTube for Privacy Player...', 'success');
                }
            }
        } catch (e) {}
    } else {
        const encodedQuery = encodeURIComponent(input);
        switch (settings.searchEngine) {
            case 'duckduckgo':
                targetUrl = `https://duckduckgo.com/?q=${encodedQuery}`;
                break;
            case 'brave':
                targetUrl = `https://search.brave.com/search?q=${encodedQuery}`;
                break;
            case 'coccoc':
                targetUrl = `https://coccoc.com/search?query=${encodedQuery}`;
                break;
            case 'tor': // Using DuckDuckGo for Tor search simulation
                targetUrl = `https://duckduckgo.com/?q=${encodedQuery}`;
                break;
            case 'google':
            default:
                targetUrl = `https://www.google.com/search?q=${encodedQuery}`;
                break;
        }
        notify(`Searching "${input}" on ${settings.searchEngine}...`, 'success');
    }

    try {
        isNavigating = true;
        elements.stealthPlayer.src = targetUrl;
        elements.stealthUrl.value = targetUrl; // Cập nhật thanh địa chỉ ngay lập tức
        
        // Cập nhật History Stack nội bộ
        if (targetUrl !== playerHistory[currentUrlIndex]) {
            // Xóa phần Forward stack nếu có URL mới
            playerHistory = playerHistory.slice(0, currentUrlIndex + 1);
            playerHistory.push(targetUrl);
            currentUrlIndex = playerHistory.length - 1;
            updatePlayerNavState();
        }

        // Ẩn placeholder khi có URL
        elements.playerContainer.classList.add('has-content');

        // Save current player URL for persistence
        chrome.storage.local.set({ lastPlayerUrl: targetUrl });
        notify('Loading private player...', 'success');
    } catch (e) {
        isNavigating = false;
        notify('Failed to load content.', 'error');
    }
});

/**
 * Cập nhật thuộc tính sandbox của iframe Privacy Player dựa trên cài đặt
 */
function updatePlayerSandbox() {
    const { stealthPlayer } = elements;
    if (!stealthPlayer) return;

    // Các quyền cơ bản để trang web hoạt động bình thường
    // allow-popups: Quan trọng cho Cốc Cốc và nhiều trang khác khi click link
    // allow-popups-to-escape-sandbox: Hỗ trợ các link mở ra tab mới thực sự
    // allow-downloads: Nếu người dùng muốn tải gì đó
    let sandbox = [
        'allow-scripts', 
        'allow-same-origin', 
        'allow-forms', 
        'allow-popups', 
        'allow-popups-to-escape-sandbox',
        'allow-downloads'
    ];
    
    stealthPlayer.setAttribute('sandbox', sandbox.join(' '));
}

// Cập nhật sandbox khi load popup
updatePlayerSandbox();

// Listener để cập nhật trạng thái khi iframe load xong (chỉ dùng cho hiệu ứng UI, không cập nhật URL)
elements.stealthPlayer.addEventListener('load', () => {
    isNavigating = false;
    // Ẩn placeholder khi có nội dung
    if (elements.stealthPlayer.src !== 'about:blank' && elements.stealthPlayer.src !== '') {
        elements.playerContainer.classList.add('has-content');
    }
});

elements.openStealthWindow.addEventListener('click', async () => {
    const url = elements.stealthUrl.value.trim();
    if (url) {
        try {
            const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
            
            // Check if extension is allowed in incognito
            chrome.extension.isAllowedIncognitoAccess((isAllowed) => {
                chrome.windows.create({
                    url: formattedUrl,
                    type: 'popup',
                    width: 800,
                    height: 600,
                    incognito: isAllowed
                }, (window) => {
                    // Scrub history if not incognito
                    if (!isAllowed) {
                        setTimeout(() => {
                            chrome.history.deleteUrl({ url: formattedUrl });
                            notify('Stealth Window opened & History scrubbed!', 'success');
                        }, 2000); // Wait for page to load before deleting from history
                    } else {
                        notify('Incognito Stealth Window opened!', 'success');
                    }
                });
            });
        } catch (e) {
            notify('Failed to open window', 'error');
        }
    } else {
        notify('Please enter a URL first', 'warning');
    }
});

/**
 * Cập nhật kích thước của Privacy Player và mở rộng popup extension
 */
function updatePlayerSize() {
    const { playerContainer } = elements;
    playerContainer.style.width = `${playerScale}%`;
    playerContainer.style.marginLeft = `${(100 - playerScale) / 2}%`;
    playerContainer.style.height = `${playerHeight}px`;

    // Tự động mở rộng kích thước popup của extension (tối đa 800x600 theo giới hạn của Chrome)
    // Tính toán dựa trên độ tăng của playerScale và playerHeight
    const extraWidth = Math.max(0, (playerScale - 100) * 5); // Tăng 5px cho mỗi 1% vượt quá 100%
    const extraHeight = Math.max(0, (playerHeight - 400)); // Tăng 1px cho mỗi 1px vượt quá 400px

    const targetWidth = Math.min(800, 800 + extraWidth);
    const targetHeight = Math.min(600, 500 + extraHeight);

    document.body.style.width = `${targetWidth}px`;
    document.body.style.height = `${targetHeight}px`;
}

// Player Resize Logic
elements.enlargePlayer.addEventListener('click', () => {
    let changed = false;
    if (playerScale < 150) {
        playerScale += 10;
        changed = true;
    }
    if (playerHeight < 800) {
        playerHeight += 40;
        changed = true;
    }
    
    if (changed) {
        updatePlayerSize();
        // Save current player size if not following default
        if (!settings.followDefaultPlayerSize) {
            settings.defaultPlayerWidth = playerScale;
            settings.defaultPlayerHeight = playerHeight;
            saveSettings();
        }
        notify(`Player enlarged (W:${playerScale}%, H:${playerHeight}px)`, 'success');
    } else {
        notify('Maximum size reached', 'warning');
    }
});

elements.shrinkPlayer.addEventListener('click', () => {
    let changed = false;
    if (playerScale > 50) {
        playerScale -= 10;
        changed = true;
    }
    if (playerHeight > 300) {
        playerHeight -= 40;
        changed = true;
    }

    if (changed) {
        updatePlayerSize();
        // Save current player size if not following default
        if (!settings.followDefaultPlayerSize) {
            settings.defaultPlayerWidth = playerScale;
            settings.defaultPlayerHeight = playerHeight;
            saveSettings();
        }
        notify(`Player shrunk (W:${playerScale}%, H:${playerHeight}px)`, 'success');
    } else {
        notify('Minimum size reached', 'warning');
    }
});

elements.clearCookies.addEventListener('click', clearAllCookies);
elements.clearSiteData.addEventListener('click', clearSiteData);
elements.copyCurrentCookies.addEventListener('click', copyCurrentTabCookies);
elements.pasteCookies.addEventListener('click', pasteCookies);
elements.toggleTracking.addEventListener('click', toggleTrackingProtection);
elements.resetPlayer.addEventListener('click', () => {
    elements.stealthPlayer.src = 'about:blank';
    elements.stealthUrl.value = '';
    elements.playerContainer.classList.remove('has-content'); // Hiện lại placeholder
    playerHistory = [];
    currentUrlIndex = -1;
    updatePlayerNavState();
    chrome.storage.local.remove('lastPlayerUrl'); // Clear last URL from storage
    notify('Player reset!', 'success');
});

function updatePlayerNavState() {
    const { goBackPlayer, goForwardPlayer } = elements;
    if (goBackPlayer) goBackPlayer.disabled = currentUrlIndex <= 0;
    if (goForwardPlayer) goForwardPlayer.disabled = currentUrlIndex >= playerHistory.length - 1;
}

elements.goBackPlayer.addEventListener('click', () => {
    if (currentUrlIndex > 0) {
        isNavigating = true;
        currentUrlIndex--;
        const prevUrl = playerHistory[currentUrlIndex];
        elements.stealthPlayer.src = prevUrl;
        elements.stealthUrl.value = prevUrl;
        updatePlayerNavState();
        notify('Going back...', 'success');
        // Reset flag after a short delay to allow iframe to start loading
        setTimeout(() => { isNavigating = false; }, 500);
    } else {
        notify('No more history to go back', 'warning');
    }
});

elements.goForwardPlayer.addEventListener('click', () => {
    if (currentUrlIndex < playerHistory.length - 1) {
        isNavigating = true;
        currentUrlIndex++;
        const nextUrl = playerHistory[currentUrlIndex];
        elements.stealthPlayer.src = nextUrl;
        elements.stealthUrl.value = nextUrl;
        updatePlayerNavState();
        notify('Going forward...', 'success');
        setTimeout(() => { isNavigating = false; }, 500);
    } else {
        notify('No more history to go forward', 'warning');
    }
});

elements.reloadPlayer.addEventListener('click', () => {
    // Lấy URL từ thanh địa chỉ thay vì iframe.src để đảm bảo reload trang đang hiển thị
    const currentUrl = elements.stealthUrl.value.trim();
    if (currentUrl && currentUrl !== 'about:blank') {
        elements.stealthPlayer.src = currentUrl;
        notify('Reloading player...', 'success');
    }
});

elements.toggleTheaterMode.addEventListener('click', () => {
     // Send message to the iframe
     // Use both postMessage (direct) and chrome.tabs.sendMessage (via content script)
     try {
         elements.stealthPlayer.contentWindow.postMessage({ type: 'toggleTheaterMode' }, '*');
         
         // Try also via extension API (may fail if frameId is not 0 or not yet ready)
         chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
             if (tabs[0]) {
                 chrome.tabs.sendMessage(tabs[0].id, { type: 'toggleTheaterMode' }, (response) => {
                     if (chrome.runtime.lastError) {
                         // Ignore errors from other tabs
                     }
                 });
             }
         });
     } catch (e) {
         console.error('Error sending theater mode message:', e);
     }
     
     // Toggle active class on button
     elements.toggleTheaterMode.classList.toggle('active');
     notify('Toggling Theater Mode...', 'success');
 });

 elements.togglePip.addEventListener('click', () => {
    try {
        elements.stealthPlayer.contentWindow.postMessage({ type: 'togglePip' }, '*');
        
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'togglePip' }, (response) => {
                    if (chrome.runtime.lastError) {
                        // Ignore errors from other tabs
                    }
                });
            }
        });
        
        notify('Requesting Picture-in-Picture...', 'success');
    } catch (e) {
        console.error('Error sending PiP message:', e);
    }
});

elements.filterInput.addEventListener('input', (e) => loadCookies(e.target.value));
document.getElementById('clearInputFillter').addEventListener('click', () => {
    if (elements.filterInput.value !== '') {
        elements.filterInput.value = '';
        loadCookies('');
    }
});
elements.notification.addEventListener('dblclick', () => {
    navigator.clipboard.writeText(elements.notification.textContent);
    notify('Notification copied to clipboard', 'success');
});

// Search Engine & Favorite Websites Logic
elements.searchEngineSelect.addEventListener('change', (e) => {
    settings.searchEngine = e.target.value;
    saveSettings();
    notify(`Default search engine set to ${settings.searchEngine}`, 'success');
});

elements.addFavoriteBtn.addEventListener('click', () => {
    const name = elements.newFavoriteName.value.trim();
    const url = elements.newFavoriteUrl.value.trim();

    if (!name || !url) {
        notify('Please enter both name and URL for the favorite website.', 'warning');
        return;
    }
    if (!isValidUrl(url)) {
        notify('Please enter a valid URL (e.g., https://example.com).', 'error');
        return;
    }

    settings.favoriteWebsites.push({ name, url });
    saveSettings();
    renderFavoriteWebsites();
    elements.newFavoriteName.value = '';
    elements.newFavoriteUrl.value = '';
    notify(`Added "${name}" to favorite websites.`, 'success');
});

function renderFavoriteWebsites() {
    const { favoriteWebsitesList } = elements;
    const lang = settings.language || 'vi';
    const dict = translations[lang] || translations.vi;
    favoriteWebsitesList.innerHTML = '';

    if (settings.favoriteWebsites.length === 0) {
        favoriteWebsitesList.innerHTML = `<p class="empty-msg">${dict.noFavorites || 'No favorite websites added yet.'}</p>`;
        return;
    }

    settings.favoriteWebsites.forEach((fav, index) => {
        const div = document.createElement('div');
        div.className = 'favorite-item';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'favorite-name';
        nameSpan.title = fav.url;
        nameSpan.textContent = fav.name;
        div.appendChild(nameSpan);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'favorite-actions';

        const goButton = document.createElement('button');
        goButton.className = 'favorite-go-btn';
        goButton.dataset.url = fav.url;
        goButton.title = `Go to ${fav.name}`;
        goButton.textContent = '🚀';
        actionsDiv.appendChild(goButton);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'favorite-delete-btn';
        deleteButton.dataset.index = index;
        deleteButton.title = `Remove ${fav.name}`;
        deleteButton.textContent = '🗑️';
        actionsDiv.appendChild(deleteButton);

        div.appendChild(actionsDiv);
        favoriteWebsitesList.appendChild(div);
    });

    favoriteWebsitesList.querySelectorAll('.favorite-go-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const url = e.target.dataset.url;
            elements.stealthUrl.value = url;
            elements.loadStealth.click();
        });
    });

    favoriteWebsitesList.querySelectorAll('.favorite-delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            if (confirm(`Are you sure you want to remove "${settings.favoriteWebsites[index].name}"?`)) {
                settings.favoriteWebsites.splice(index, 1);
                saveSettings();
                renderFavoriteWebsites();
                notify('Favorite website removed.', 'warning');
            }
        });
    });
}

// Panic Button Logic
elements.mainPanicBtn.addEventListener('click', () => {
    const action = settings.panicAction;
    
    // Lấy ngẫu nhiên một URL từ danh sách an toàn, nếu không có thì dùng mặc định
    let safeUrl = 'https://www.google.com';
    if (settings.safeUrls && settings.safeUrls.length > 0) {
        const randomIndex = Math.floor(Math.random() * settings.safeUrls.length);
        safeUrl = settings.safeUrls[randomIndex];
    } else if (settings.safeRedirectUrl) {
        safeUrl = settings.safeRedirectUrl;
    }

    if (confirm('🚨 KÍCH HOẠT CHẾ ĐỘ PANIC?')) {
        switch (action) {
            case 'closeIncognito':
                chrome.windows.getAll({ populate: true }, (windows) => {
                    let closedCount = 0;
                    windows.forEach(win => {
                        if (win.incognito) {
                            chrome.windows.remove(win.id);
                            closedCount++;
                        }
                    });
                    
                    // Luôn mở Safe Redirect URL trên tab bình thường sau khi xử lý ẩn danh
                    chrome.tabs.create({ url: safeUrl });
                    notify(`Đã đóng ${closedCount} cửa sổ ẩn danh và mở trang an toàn!`, 'warning');
                });
                break;
            case 'redirectAll':
                chrome.tabs.query({}, (tabs) => {
                    tabs.forEach(tab => {
                        chrome.tabs.update(tab.id, { url: safeUrl });
                    });
                    notify('All tabs redirected to safe site!', 'success');
                });
                break;
            case 'closeAll':
                // Mở trang an toàn trong một cửa sổ mới TRƯỚC khi đóng tất cả
                chrome.windows.create({ url: safeUrl, focused: true }, () => {
                    chrome.windows.getAll({}, (windows) => {
                        windows.forEach(win => {
                            // Không đóng cửa sổ mới tạo (chứa safeUrl)
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
    }
});

elements.panicActionSelect.addEventListener('change', (e) => {
    settings.panicAction = e.target.value;
    saveSettings();
    updatePanicDescription(e.target.value);
    notify(`Panic action set to: ${e.target.value}`, 'success');
});

/**
 * Hiển thị danh sách Safe Redirect URLs
 */
function renderSafeUrls() {
    const { safeUrlsList } = elements;
    const lang = settings.language || 'vi';
    const dict = translations[lang] || translations.vi;
    safeUrlsList.innerHTML = '';
    
    if (!settings.safeUrls || settings.safeUrls.length === 0) {
        safeUrlsList.innerHTML = `<p class="empty-msg">${dict.noSafeUrls || 'No safe URLs added. Default: Google.'}</p>`;
        return;
    }

    settings.safeUrls.forEach((url, index) => {
        const item = document.createElement('div');
        item.className = 'favorite-item';
        
        const info = document.createElement('div');
        info.className = 'favorite-info';
        
        const urlSpan = document.createElement('span');
        urlSpan.className = 'favorite-url';
        urlSpan.textContent = url;
        urlSpan.style.fontSize = '0.8rem';
        info.appendChild(urlSpan);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'favorite-delete-btn';
        deleteBtn.innerHTML = '🗑';
        deleteBtn.onclick = () => {
            settings.safeUrls.splice(index, 1);
            saveSettings();
            renderSafeUrls();
            notify('Safe URL removed.', 'warning');
        };
        
        item.appendChild(info);
        item.appendChild(deleteBtn);
        safeUrlsList.appendChild(item);
    });
}

elements.addSafeUrlBtn.addEventListener('click', () => {
    let url = elements.newSafeUrlInput.value.trim();
    if (!url) {
        notify('Vui lòng nhập URL', 'warning');
        return;
    }

    if (!url.startsWith('http')) {
        url = 'https://' + url;
    }

    if (!isValidUrl(url)) {
        notify('URL không hợp lệ', 'error');
        return;
    }

    if (!settings.safeUrls) settings.safeUrls = [];
    if (settings.safeUrls.includes(url)) {
        notify('URL này đã có trong danh sách', 'warning');
        return;
    }

    settings.safeUrls.push(url);
    saveSettings();
    elements.newSafeUrlInput.value = '';
    renderSafeUrls();
    notify('Safe URL added!', 'success');
});

/**
 * Cập nhật mô tả chi tiết cho hành động Panic
 */
function updatePanicDescription(action) {
    const lang = settings.language || 'vi';
    const dict = translations[lang] || translations.vi;
    
    const descriptions = {
        'closeIncognito': dict.panicDesc_closeIncognito || '🛡️ Bảo vệ riêng tư: Đóng ngay lập tức tất cả các cửa sổ ẩn danh đang mở.',
        'redirectAll': dict.panicDesc_redirectAll || '🌐 Ngụy trang nhanh: Chuyển hướng toàn bộ các tab hiện có sang một trang web an toàn.',
        'closeAll': dict.panicDesc_closeAll || '🚫 Xóa dấu vết: Đóng toàn bộ trình duyệt ngay lập tức.'
    };
    if (elements.panicDescText) {
        elements.panicDescText.textContent = descriptions[action] || descriptions['closeIncognito'];
    }
}

/**
 * Lấy phím tắt hiện tại từ Chrome
 */
function updateCurrentShortcutDisplay() {
    if (chrome.commands && elements.currentPanicKey) {
        chrome.commands.getAll((commands) => {
            const panicCommand = commands.find(c => c.name === 'activate_panic');
            if (panicCommand && panicCommand.shortcut) {
                elements.currentPanicKey.textContent = panicCommand.shortcut;
            }
        });
    }
}

// Mở trang quản lý phím tắt của Chrome
if (elements.changeShortcutBtn) {
    elements.changeShortcutBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    });
}

elements.safeUrlsList.addEventListener('click', (e) => {
    // Không làm gì ở đây, logic xóa đã được gắn trực tiếp vào button
});

// Session Manager Logic
elements.saveSessionBtn.addEventListener('click', async () => {
    const sessionName = elements.sessionNameInput.value.trim();
    if (!sessionName) {
        notify('Vui lòng nhập tên phiên làm việc', 'warning');
        return;
    }

    try {
        const tabType = elements.sessionTabTypeSelect.value;
        let queryOptions = {};
        if (tabType === 'normal') queryOptions.incognito = false;
        else if (tabType === 'incognito') queryOptions.incognito = true;

        const tabs = await chrome.tabs.query(queryOptions);
        if (tabs.length === 0) {
            notify('Không tìm thấy tab nào để lưu!', 'warning');
            return;
        }

        const sessionData = {
            id: Date.now(),
            name: sessionName,
            date: new Date().toISOString(),
            tabType: tabType,
            tabs: tabs.map(t => ({
                url: t.url,
                title: t.title,
                incognito: t.incognito
            }))
        };

        if (!settings.savedSessions) settings.savedSessions = [];
        settings.savedSessions.unshift(sessionData);
        saveSettings();
        renderSessions();
        elements.sessionNameInput.value = '';
        
        if (confirm(`Đã lưu "${sessionName}" với ${tabs.length} tab. Bạn có muốn đóng tất cả các tab hiện tại không?`)) {
             // Mở một tab trống mới để tránh đóng trình duyệt hoàn toàn nếu là cửa sổ duy nhất
             chrome.tabs.create({}, () => {
                 tabs.forEach(t => {
                     chrome.tabs.remove(t.id);
                 });
             });
         }
        
        notify(`Đã lưu phiên: ${sessionName}`, 'success');
    } catch (error) {
        notify('Lỗi khi lưu phiên: ' + error.message, 'error');
    }
});

function renderSessions() {
    const { sessionsList } = elements;
    sessionsList.innerHTML = '';

    if (!settings.savedSessions || settings.savedSessions.length === 0) {
        const lang = settings.language || 'vi';
        const dict = translations[lang] || translations.vi;
        sessionsList.innerHTML = `<p class="empty-msg">${dict.noSessions || 'Chưa có phiên làm việc nào được lưu.'}</p>`;
        return;
    }

    settings.savedSessions.forEach((session, index) => {
        const div = document.createElement('div');
        div.className = 'favorite-item session-item'; // Reusing favorite-item style

        const infoDiv = document.createElement('div');
        infoDiv.className = 'favorite-name';
        infoDiv.style.flexDirection = 'column';
        infoDiv.style.alignItems = 'flex-start';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = session.name;
        nameSpan.style.fontWeight = 'bold';
        
        const detailsSpan = document.createElement('small');
        const typeLabels = {
            'all': 'Tất cả',
            'normal': 'Thường',
            'incognito': 'Ẩn danh'
        };
        const typeLabel = typeLabels[session.tabType || 'all'];
        detailsSpan.textContent = `${typeLabel} • ${session.tabs.length} tabs • ${new Date(session.date).toLocaleDateString()}`;
        detailsSpan.style.color = 'var(--text-secondary)';

        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(detailsSpan);
        div.appendChild(infoDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'favorite-actions';

        const restoreBtn = document.createElement('button');
        restoreBtn.className = 'favorite-go-btn';
        restoreBtn.title = 'Khôi phục phiên';
        restoreBtn.textContent = '📂';
        restoreBtn.onclick = () => restoreSession(session);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'favorite-delete-btn';
        deleteBtn.title = 'Xóa phiên';
        deleteBtn.textContent = '🗑️';
        deleteBtn.onclick = () => {
            if (confirm(`Xóa phiên "${session.name}"?`)) {
                settings.savedSessions.splice(index, 1);
                saveSettings();
                renderSessions();
                notify('Đã xóa phiên làm việc', 'warning');
            }
        };

        actionsDiv.appendChild(restoreBtn);
        actionsDiv.appendChild(deleteBtn);
        div.appendChild(actionsDiv);
        sessionsList.appendChild(div);
    });
}

async function restoreSession(session) {
    try {
        notify(`Đang khôi phục phiên "${session.name}"...`, 'success');
        
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
                    notify('Cần cấp quyền Incognito để mở tab ẩn danh', 'error');
                    // Mở ở cửa sổ thường nếu không được phép
                    chrome.windows.create({
                        url: incognitoTabs.map(t => t.url),
                        incognito: false
                    });
                }
            });
        }
    } catch (error) {
        notify('Lỗi khi khôi phục: ' + error.message, 'error');
    }
}

// Listen for link click messages from Privacy Player iframe
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'updateTrackerCount') {
        const { statTrackers, trackerModal } = elements;
        statTrackers.textContent = message.count;
        settings.trackerCount = message.count;
        settings.currentTrackers = message.list;

        // Nếu modal đang mở, cập nhật danh sách ngay lập tức
        if (!trackerModal.classList.contains('hidden')) {
            showTrackerDetails(message.list);
        }
    } else if (message.type === 'privacyPlayerLinkClicked') {
        const url = message.url;
        const action = message.action;
        
        if (action === 'block') {
            notify('Link click blocked by settings', 'warning');
            return;
        }

        if (action === 'newTab') {
            chrome.tabs.create({ url: url });
            notify('Opened in new tab!', 'success');
            return;
        }

        if (action === 'incognito') {
            chrome.extension.isAllowedIncognitoAccess((isAllowed) => {
                chrome.windows.create({
                    url: url,
                    type: 'popup',
                    width: 800,
                    height: 600,
                    incognito: isAllowed
                });
                if (!isAllowed) {
                    notify('Incognito access required. Opened in normal window.', 'warning');
                } else {
                    notify('Opened in Incognito Window!', 'success');
                }
            });
            return;
        }

        // Default / action === 'inside'
        elements.stealthPlayer.src = url;
        elements.stealthUrl.value = url;
        
        // Cập nhật History Stack nội bộ
        if (url !== playerHistory[currentUrlIndex]) {
            playerHistory = playerHistory.slice(0, currentUrlIndex + 1);
            playerHistory.push(url);
            currentUrlIndex = playerHistory.length - 1;
            updatePlayerNavState();
        }
        
        notify('Navigating inside player...', 'success');
    }
});

// Khởi tạo tracking protection
document.addEventListener('DOMContentLoaded', async () => {
    // Global tooltip element
    const tooltip = document.createElement('div');
    tooltip.id = 'infoTooltip';
    document.body.appendChild(tooltip);

    document.querySelectorAll('.info-icon').forEach(icon => {
        icon.addEventListener('mouseenter', (e) => {
            const infoText = e.target.dataset.info;
            tooltip.textContent = infoText;
            tooltip.style.display = 'block';
            
            const rect = e.target.getBoundingClientRect();
            const tooltipWidth = 250; // Khớp với CSS
            
            // Tính toán vị trí X (Căn giữa theo icon)
            let leftPos = rect.left + (rect.width / 2) - (tooltipWidth / 2);
            
            // Chống tràn lề phải
            if (leftPos + tooltipWidth > window.innerWidth - 10) {
                leftPos = window.innerWidth - tooltipWidth - 10;
            }
            
            // Chống tràn lề trái
            if (leftPos < 10) {
                leftPos = 10;
            }
            
            tooltip.style.left = `${leftPos}px`;
            
            // Tính toán vị trí Y (Ưu tiên hiện bên trên, nếu không đủ chỗ thì hiện bên dưới)
            const tooltipHeight = tooltip.offsetHeight;
            let topPos = rect.top - tooltipHeight - 10;
            
            if (topPos < 10) {
                topPos = rect.bottom + 10;
            }
            
            tooltip.style.top = `${topPos}px`;
        });

        icon.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
    });

    const { value } = await chrome.privacy.websites.doNotTrackEnabled.get({});
    setTrackStyle(elements.toggleTracking, value);

    // Initial calls to set up the UI
    updateDashboard();
    updatePlayerSize();
    
    // Mặc định hiển thị Dashboard khi mở popup
    toggleSection('home');
    updatePlayerNavState();
});
