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
            await toggleFilterSource('easylist_1', settings.easylistEnabled);
            await toggleFilterSource('easylist_2', settings.easylistEnabled);
            await toggleFilterSource('easyprivacy_1', settings.easylistEnabled); // Bật/tắt theo easylist
            await toggleFilterSource('easyprivacy_2', settings.easylistEnabled);
            
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
                // Change UI state to active
                zapperModeBtn.classList.add('pulse-anim');
                zapperModeBtn.style.background = 'linear-gradient(135deg, #00d2ff, #3a7bd5)';
                zapperModeBtn.style.boxShadow = '0 4px 15px rgba(0, 210, 255, 0.4)';
                const textSpan = zapperModeBtn.querySelector('.btn-text');
                if (textSpan) textSpan.innerText = getDict().zapperActive || 'Zapper Đang Bật...';
                
                await chrome.runtime.sendMessage({ type: 'ACTIVATE_ZAPPER', tabId: tab.id });
                notify(getDict().zapperActivatedNotify || 'Zapper đã sẵn sàng! Hãy click vào phần tử bạn muốn xóa trên trang.', 'success');
                
                // Do not close window, let user see the state change
                setTimeout(() => window.close(), 2000);
            } else {
                notify(getDict().zapperError || 'Không thể dùng Zapper trên trang này.', 'error');
            }
        };
    }

    renderZapperManager();

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
export async function updateAdblockStats() {
    const { adblockNetworkCount, adblockCssCount, adsBlockedCount, statAdsBlocked } = elements;
    
    // Đếm các ruleset tĩnh được bật (EasyList, EasyPrivacy)
    let staticRulesCount = 0;
    try {
        const enabledSets = await chrome.declarativeNetRequest.getEnabledRulesets();
        if (enabledSets.includes('easylist_1') || enabledSets.includes('easylist_2')) staticRulesCount += 55380;
        if (enabledSets.includes('easyprivacy_1') || enabledSets.includes('easyprivacy_2')) staticRulesCount += 46770;
    } catch(e) { console.error('Error getting rulesets:', e); }

    chrome.storage.local.get(['compiledAdblockRules', 'adblockCssRules', 'adsBlockedCount'], async (res) => {
        const networkRules = res.compiledAdblockRules || [];
        const cssRules = res.adblockCssRules || {};

        // Tổng rules mạng = rules tĩnh (EasyList) + rules động (Custom)
        const totalNetworkRules = networkRules.length + staticRulesCount;

        // Đếm tổng số CSS selector
        let cssTotalCount = 0;
        Object.keys(cssRules).forEach(domain => {
            if (Array.isArray(cssRules[domain])) {
                cssTotalCount += cssRules[domain].length;
            }
        });

        // Sum up last 7 days for blocked count
        let totalBlocked7Days = 0;
        const keys = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            keys.push(`stats_${d.toISOString().split('T')[0]}`);
        }
        const statsRes = await chrome.storage.local.get(keys);
        keys.forEach(k => {
            if (statsRes[k] && statsRes[k].trackersBlocked) {
                totalBlocked7Days += statsRes[k].trackersBlocked;
            }
        });

        if (adblockNetworkCount) adblockNetworkCount.textContent = totalNetworkRules;

        
        if (adblockCssCount) adblockCssCount.textContent = cssTotalCount;
        if (adsBlockedCount) adsBlockedCount.textContent = totalBlocked7Days;
        if (statAdsBlocked) statAdsBlocked.textContent = totalBlocked7Days;
        
        chrome.storage.local.set({ adsBlockedCount: totalBlocked7Days });
        
        renderAnalyticsChart();
    });
}

/**
 * Hiển thị biểu đồ thống kê Analytics
 */
async function renderAnalyticsChart() {
    const canvas = document.getElementById('adblockAnalyticsChart');
    if (!canvas || !window.Chart) return;
    
    // Lấy ngày hiện tại và 6 ngày trước
    const dates = [];
    const keys = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dates.push(dateStr.slice(5)); // Chỉ lấy MM-DD
        keys.push(`stats_${dateStr}`);
    }
    
    try {
        const result = await chrome.storage.local.get(keys);
        const dataPoints = keys.map(k => (result[k] && result[k].trackersBlocked) ? result[k].trackersBlocked : 0);
        
        if (window.adblockChartInstance) {
            window.adblockChartInstance.destroy();
        }
        
        window.adblockChartInstance = new Chart(canvas, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Trackers/Ads Blocked',
                    data: dataPoints,
                    borderColor: '#6c5ce7',
                    backgroundColor: 'rgba(108, 92, 231, 0.2)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: { color: '#888' }
                    },
                    x: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#888' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#888' }
                    }
                }
            }
        });
    } catch(e) {
        console.error("Error rendering chart:", e);
    }
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

async function renderZapperManager() {
    const container = document.getElementById('zapperListContainer');
    const badge = document.getElementById('zapperCountBadge');
    if (!container || !badge) return;

    const data = await chrome.storage.local.get(['userZappedCssRules']);
    let zappedRules = data.userZappedCssRules || {};
    
    // Tự động dọn dẹp nếu rules bị hỏng bởi lỗi migration (quá lớn)
    if (Object.keys(zappedRules).length > 500) {
        zappedRules = {};
        await chrome.storage.local.set({ userZappedCssRules: zappedRules });
    }
    
    let totalItems = 0;
    container.innerHTML = '';

    for (const [domain, selectors] of Object.entries(zappedRules)) {
        if (!selectors || selectors.length === 0) continue;
        
        selectors.forEach((selector, index) => {
            totalItems++;
            const itemDiv = document.createElement('div');
            itemDiv.className = 'zapper-item';
            itemDiv.style = 'display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.05); padding: 8px 12px; margin-bottom: 8px; border-radius: 8px; font-family: monospace; font-size: 12px;';
            
            const infoDiv = document.createElement('div');
            infoDiv.style = 'flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
            
            const domainSpan = document.createElement('span');
            domainSpan.innerText = domain + ': ';
            domainSpan.style.color = 'var(--secondary)';
            domainSpan.style.fontWeight = 'bold';
            
            const selectorSpan = document.createElement('span');
            selectorSpan.innerText = selector;
            selectorSpan.style.color = 'var(--text-muted)';
            
            infoDiv.appendChild(domainSpan);
            infoDiv.appendChild(selectorSpan);
            
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '&times;';
            removeBtn.title = getDict().unZapBtn || 'Xóa phần tử (Unzap)';
            removeBtn.style = 'background: rgba(255,71,87,0.2); color: #ff4757; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; margin-left: 10px; transition: all 0.2s;';
            removeBtn.onmouseover = () => removeBtn.style.background = '#ff4757';
            removeBtn.onmouseout = () => removeBtn.style.background = 'rgba(255,71,87,0.2)';
            
            removeBtn.onclick = async () => {
                // Remove selector from array
                const updatedSelectors = zappedRules[domain].filter((_, i) => i !== index);
                if (updatedSelectors.length === 0) {
                    delete zappedRules[domain];
                } else {
                    zappedRules[domain] = updatedSelectors;
                }
                
                await chrome.storage.local.set({ userZappedCssRules: zappedRules });
                if (window.notify) window.notify(getDict().unZapSuccess || 'Đã khôi phục phần tử.', 'success');
                renderZapperManager(); // re-render
                
                // Trình báo cho iframe_content_script hoặc reload lại trang nếu muốn (chỉ gửi message)
                chrome.runtime.sendMessage({ type: 'UPDATE_ADBLOCK_RULES' });
            };
            
            itemDiv.appendChild(infoDiv);
            itemDiv.appendChild(removeBtn);
            container.appendChild(itemDiv);
        });
    }

    badge.innerText = `${totalItems} items`;
    
    if (totalItems === 0) {
        container.innerHTML = `<div class="empty-state" style="text-align: center; color: var(--text-muted); padding: 20px; font-style: italic;">${getDict().zapperEmpty || 'Chưa có phần tử nào bị xóa bằng Zapper.'}</div>`;
    }
}
