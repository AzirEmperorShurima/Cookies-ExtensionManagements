import { elements, settings, notify, saveSettings } from '../popup.js';
import { createElement } from './utils.js';
import { toggleFilterSource } from './adblock/adblock-manager.js';

const translations = window.translations;
const getDict = () => translations[settings.language || 'vi'] || translations.vi;
let isFetchingEasyList = false;

/**
 * Khởi tạo giao diện và nạp dữ liệu cũ cho Adblock Manager
 */
export async function initAdblockUI() {
    const dict = getDict();
    const {
        adblockEnabledToggle,
        easylistToggle,
        customAdblockRules,
        customAdblockCssRules,
        adblockNetworkCount,
        adblockCssCount,
        adsBlockedCount,
        fetchEasyListBtn,
        saveAdblockSettingsBtn
    } = elements;

    if (!adblockEnabledToggle) return;

    // Nạp cấu hình từ settings
    adblockEnabledToggle.checked = settings.adblockEnabled !== false;
    easylistToggle.checked = settings.easylistEnabled !== false;
    customAdblockRules.value = settings.customAdblockRules || '';
    customAdblockCssRules.value = settings.customAdblockCssRules || '';

    // Cập nhật thống kê từ bộ nhớ
    updateAdblockStats();

    // Bind sự kiện lưu cài đặt nhanh khi thay đổi switch
    adblockEnabledToggle.onchange = () => {
        settings.adblockEnabled = adblockEnabledToggle.checked;
        saveSettings();
        chrome.runtime.sendMessage({ type: 'updateSecurityRules' });
        notify(dict.adblockSaved || 'Đã lưu cấu hình chặn quảng cáo!');
    };

    easylistToggle.onchange = async () => {
        settings.easylistEnabled = easylistToggle.checked;
        saveSettings();
        
        try {
            await toggleFilterSource('easylist', settings.easylistEnabled);
            await toggleFilterSource('easyprivacy', settings.easylistEnabled); // Bật/tắt theo easylist
            
            // Thông báo background cập nhật lại quy tắc bảo vệ và custom rules
            chrome.runtime.sendMessage({ type: 'updateSecurityRules' });
            
            notify(dict.adblockSaved || 'Đã cập nhật trạng thái bộ lọc!');
        } catch(e) {
            console.error(e);
            notify('Lỗi khi bật/tắt bộ lọc tĩnh.');
        }
    };

    // Nạp & Cập nhật EasyList
    fetchEasyListBtn.onclick = async () => {
        if (isFetchingEasyList) return;
        await fetchEasyList();
    };

    const zapperModeBtn = document.getElementById('zapperModeBtn');
    if (zapperModeBtn) {
        zapperModeBtn.onclick = async () => {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && !tab.url.startsWith('chrome://')) {
                await chrome.runtime.sendMessage({ type: 'ACTIVATE_ZAPPER', tabId: tab.id });
                window.close();
            } else {
                notify('Không thể dùng Zapper trên trang này.', 'error');
            }
        };
    }

    // Lưu cấu hình thủ công cho quy tắc tự viết
    saveAdblockSettingsBtn.onclick = async () => {
        settings.customAdblockRules = customAdblockRules.value;
        settings.customAdblockCssRules = customAdblockCssRules.value;
        saveSettings();
        
        await compileAllRules();
        notify(dict.adblockSaved || 'Đã lưu cấu hình chặn quảng cáo!');
    };
}

/**
 * Cập nhật số lượng quy tắc hiển thị trên giao diện
 */
export function updateAdblockStats() {
    const { adblockNetworkCount, adblockCssCount, adsBlockedCount, statAdsBlocked } = elements;
    
    chrome.storage.local.get(['compiledAdblockRules', 'adblockCssRules', 'adsBlockedCount'], (res) => {
        const networkRules = res.compiledAdblockRules || [];
        const cssRules = res.adblockCssRules || {};
        const blockedCount = res.adsBlockedCount || 0;

        // Đếm tổng số CSS selector
        let cssTotalCount = 0;
        Object.keys(cssRules).forEach(domain => {
            if (Array.isArray(cssRules[domain])) {
                cssTotalCount += cssRules[domain].length;
            }
        });

        if (adblockNetworkCount) adblockNetworkCount.textContent = networkRules.length;
        if (adblockCssCount) adblockCssCount.textContent = cssTotalCount;
        if (adsBlockedCount) adsBlockedCount.textContent = blockedCount;
        if (statAdsBlocked) statAdsBlocked.textContent = blockedCount;
    });
}

/**
 * Tải EasyList từ Internet và phân tích
 */
async function fetchEasyList() {
    const dict = getDict();
    const { fetchEasyListBtn } = elements;
    
    isFetchingEasyList = true;
    const fetchOverlay = document.getElementById('adblockFetchOverlay');
    if (fetchOverlay) fetchOverlay.classList.remove('hidden');
    
    const startTime = Date.now();

    if (fetchEasyListBtn) {
        fetchEasyListBtn.disabled = true;
        const fetchIcon = fetchEasyListBtn.querySelector('.fetch-icon');
        const spinnerIcon = fetchEasyListBtn.querySelector('.spinner-icon');
        
        if (fetchIcon) fetchIcon.classList.add('hidden');
        if (spinnerIcon) spinnerIcon.classList.remove('hidden');
    }

    // URL dự phòng ổn định của EasyList
    const easyListUrl = 'https://easylist.to/easylist/easylist.txt';

    try {
        const response = await fetch(easyListUrl);
        if (!response.ok) throw new Error('HTTP error ' + response.status);
        
        const text = await response.text();
        const lines = text.split('\n');
        
        const easyListCssRules = {};

        // Parse EasyList theo từng dòng
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith('!')) continue; // Bỏ qua comment

            // 1. Phân tích quy tắc CSS Element Hiding
            if (line.includes('##')) {
                const parts = line.split('##');
                const domainsPart = parts[0].trim();
                const selector = parts[1].trim();

                if (selector) {
                    if (domainsPart) {
                        const domains = domainsPart.split(',');
                        domains.forEach(domain => {
                            domain = domain.trim();
                            if (domain.startsWith('~')) return; // Bỏ qua các domain phủ định để tăng tốc
                            easyListCssRules[domain] = easyListCssRules[domain] || [];
                            easyListCssRules[domain].push(selector);
                        });
                    } else {
                        easyListCssRules['global'] = easyListCssRules['global'] || [];
                        easyListCssRules['global'].push(selector);
                    }
                }
            }
        }
        // Lưu EasyList đã parse vào storage
        await chrome.storage.local.set({
            easyListParsedCssRules: easyListCssRules
        });

        notify(dict.easyListSuccess || 'Đã nạp thành công EasyList!');
        await compileAllRules();

    } catch (error) {
        console.error('[Adblock] Failed to fetch EasyList:', error);
        notify(dict.easyListFail || 'Lỗi khi tải EasyList. Vui lòng kiểm tra kết nối mạng.');
    } finally {
        const elapsed = Date.now() - startTime;
        const minDuration = 4500; // 4.5 seconds
        if (elapsed < minDuration) {
            await new Promise(resolve => setTimeout(resolve, minDuration - elapsed));
        }

        isFetchingEasyList = false;
        const fetchOverlay = document.getElementById('adblockFetchOverlay');
        if (fetchOverlay) fetchOverlay.classList.add('hidden');

        if (fetchEasyListBtn) {
            fetchEasyListBtn.disabled = false;
            const fetchIcon = fetchEasyListBtn.querySelector('.fetch-icon');
            const spinnerIcon = fetchEasyListBtn.querySelector('.spinner-icon');
            
            if (fetchIcon) fetchIcon.classList.remove('hidden');
            if (spinnerIcon) spinnerIcon.classList.add('hidden');
        }
    }
}

/**
 * Tổng hợp các quy tắc (EasyList + Quy tắc tùy chỉnh) và tạo cấu trúc quy tắc hoàn chỉnh
 */
async function compileAllRules() {
    const dict = getDict();
    
    // 1. Lấy dữ liệu EasyList và cấu hình tùy chỉnh
    const storage = await chrome.storage.local.get([
        'easyListParsedCssRules'
    ]);

    const easyListCss = settings.easylistEnabled ? (storage.easyListParsedCssRules || {}) : {};

    // 2. Phân tích quy tắc mạng tùy chỉnh của người dùng
    const customNetRules = [];
    if (settings.customAdblockRules) {
        const lines = settings.customAdblockRules.split('\n');
        let warned = false;
        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('!')) {
                if (customNetRules.length < 2000) {
                    customNetRules.push(trimmed);
                } else if (!warned) {
                    notify(dict.customRulesLimitExceeded || 'Quy tắc mạng tuỳ chỉnh vượt quá 2000 dòng. Đã cắt bớt để tránh lỗi.', 'error');
                    warned = true;
                }
            }
        });
    }

    // 3. Phân tích quy tắc CSS tùy chỉnh của người dùng
    const customCssRules = {};
    if (settings.customAdblockCssRules) {
        const lines = settings.customAdblockCssRules.split('\n');
        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed && trimmed.includes('##')) {
                const parts = trimmed.split('##');
                const domainsPart = parts[0].trim();
                const selector = parts[1].trim();

                if (selector) {
                    if (domainsPart) {
                        const domains = domainsPart.split(',');
                        domains.forEach(domain => {
                            domain = domain.trim();
                            customCssRules[domain] = customCssRules[domain] || [];
                            customCssRules[domain].push(selector);
                        });
                    } else {
                        customCssRules['global'] = customCssRules['global'] || [];
                        customCssRules['global'].push(selector);
                    }
                }
            }
        });
    }

    // 4. Biên dịch quy tắc mạng sang Chrome Declarative Net Request (DNR) format
    // Gom tất cả urlFilter và gán ID bắt đầu từ 3000
    const compiledDnrRules = [];
    let ruleId = 3000;

    // Ưu tiên nạp quy tắc tùy chỉnh trước
    customNetRules.forEach(filter => {
        compiledDnrRules.push({
            id: ruleId++,
            priority: 2, // Quy tắc tùy chỉnh có độ ưu tiên cao hơn
            action: { type: 'block' },
            condition: {
                urlFilter: filter,
                resourceTypes: ['main_frame', 'sub_frame', 'script', 'xmlhttprequest', 'image', 'other']
            }
        });
    });



    // 5. Kết hợp quy tắc ẩn CSS
    const compiledCssRules = { ...easyListCss };
    Object.keys(customCssRules).forEach(domain => {
        compiledCssRules[domain] = compiledCssRules[domain] || [];
        // Gộp selectors không trùng lặp
        customCssRules[domain].forEach(sel => {
            if (!compiledCssRules[domain].includes(sel)) {
                compiledCssRules[domain].push(sel);
            }
        });
    });

    // 6. Lưu tất cả vào chrome.storage.local
    await chrome.storage.local.set({
        compiledAdblockRules: compiledDnrRules,
        adblockCssRules: compiledCssRules
    });

    // 7. Yêu cầu background service worker nạp lại quy tắc mới
    chrome.runtime.sendMessage({ type: 'updateSecurityRules' });
    
    // Cập nhật lại số liệu hiển thị
    updateAdblockStats();
}
