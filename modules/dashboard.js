import { elements, settings, notify, saveSettings, updateUILanguage, toggleSection } from '../popup.js';

const translations = window.translations;
let dashboardUpdateTimeout = null;

export async function updateDashboard() {
    if (dashboardUpdateTimeout) clearTimeout(dashboardUpdateTimeout);

    dashboardUpdateTimeout = setTimeout(async () => {
        const { statCookies, statExtensions, statTrackers, permanentBar, sessionBar, permanentCount, sessionCount } = elements;

        chrome.cookies.getAll({}, (cookies) => {
            const total = cookies.length;
            if (statCookies) statCookies.textContent = total;

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

            if (permanentCount) permanentCount.textContent = permanent;
            if (sessionCount) sessionCount.textContent = session;

            if (total > 0) {
                const permanentPercent = (permanent / total) * 100;
                const sessionPercent = (session / total) * 100;
                if (permanentBar) permanentBar.style.width = `${permanentPercent}%`;
                if (sessionBar) sessionBar.style.width = `${sessionPercent}%`;
            } else {
                if (permanentBar) permanentBar.style.width = '0%';
                if (sessionBar) sessionBar.style.width = '0%';
            }

            renderInsights(total, permanent, settings.trackerCount || 0);
        });

        chrome.management.getAll((extensions) => {
            const activeExts = extensions.filter(ext => ext.enabled && ext.type === 'extension').length;
            if (statExtensions) statExtensions.textContent = activeExts;
        });

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.runtime.sendMessage({ type: 'getTrackerCount', tabId: tabs[0].id }, (response) => {
                    const count = response ? response.count : 0;
                    const list = response ? response.list : [];
                    if (statTrackers) statTrackers.textContent = count;
                    settings.trackerCount = count;
                    settings.currentTrackers = list;
                });
            }
        });

        calculatePrivacyGrade();
    }, 100);
}

export async function calculatePrivacyGrade() {
    const { statCookies, statExtensions, statTrackers, privacyGradeValue, healthScoreText, healthStatusText, healthBarFill, fixPrivacyBtn } = elements;

    const cookieCount = (statCookies ? parseInt(statCookies.textContent) : 0) || 0;
    const trackerCount = (statTrackers ? parseInt(statTrackers.textContent) : 0) || 0;

    let score = 100;
    const issues = [];

    if (cookieCount > 200) score -= 10;
    if (cookieCount > 800) score -= 15;
    if (trackerCount > 0) score -= Math.min(30, trackerCount * 5);

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

    try {
        const dnt = await chrome.privacy.websites.doNotTrackEnabled.get({});
        if (!dnt.value) {
            score -= 5;
            issues.push('enableDNT');
        }
    } catch {}

    score = Math.max(0, Math.min(100, score));

    let grade = 'F';
    let status = 'Critical';
    let color = '#ef4444';

    if (score >= 90) { grade = 'A+'; status = 'Excellent'; color = '#10b981'; }
    else if (score >= 80) { grade = 'A'; status = 'Very Good'; color = '#10b981'; }
    else if (score >= 70) { grade = 'B+'; status = 'Good'; color = '#3b82f6'; }
    else if (score >= 60) { grade = 'B'; status = 'Fair'; color = '#3b82f6'; }
    else if (score >= 50) { grade = 'C'; status = 'Average'; color = '#f59e0b'; }
    else if (score >= 40) { grade = 'D'; status = 'Poor'; color = '#ef4444'; }

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

    if (fixPrivacyBtn) {
        const lang = settings.language || 'vi';
        const dict = translations[lang] || translations.vi;

        if (score < 90 && issues.length > 0) {
            fixPrivacyBtn.classList.remove('hidden');

            let issuesContainer = elements.gradeCard.querySelector('.grade-issues-list');
            if (!issuesContainer) {
                issuesContainer = document.createElement('div');
                issuesContainer.className = 'grade-issues-list';
                elements.gradeCard.appendChild(issuesContainer);
            }

            issuesContainer.innerHTML = `<div class="fix-summary">${dict.fixSummary || 'Cần khắc phục'}:</div>`;
            issues.forEach(issue => {
                const item = document.createElement('div');
                item.className = 'issue-item';
                item.innerHTML = `<span class="issue-dot"></span> <span>${dict[issue] || issue}</span>`;
                issuesContainer.appendChild(item);
            });

            fixPrivacyBtn.onclick = () => fixPrivacyIssues(issues);
        } else {
            fixPrivacyBtn.classList.add('hidden');
            const issuesContainer = elements.gradeCard.querySelector('.grade-issues-list');
            if (issuesContainer) issuesContainer.remove();
        }
    }
}

export async function fixPrivacyIssues(issues) {
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
                } catch {}
                break;
        }
    }

    saveSettings();
    updateUILanguage();
    notify(dict.fixSuccess || 'Privacy upgraded successfully!', 'success');

    setTimeout(() => calculatePrivacyGrade(), 500);
}

export function renderInsights(totalCookies, permanentCookies, trackers) {
    const { privacyInsightsList } = elements;
    if (!privacyInsightsList) return;

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

export function showTrackerDetails(trackers) {
    const { trackerModal, trackerDetailsList } = elements;
    if (!trackerDetailsList) return;

    trackerDetailsList.innerHTML = '';

    if (!trackers || trackers.length === 0) {
        trackerDetailsList.innerHTML = '<p class="empty-msg">No trackers detected on this page.</p>';
    } else {
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

    if (trackerModal) trackerModal.classList.remove('hidden');
}

export function setTrackStyle(element, status) {
    const trackingIcon = document.getElementById('trackingprotectionicon');
    if (trackingIcon) {
        trackingIcon.src = status ? 'icons/skincell.png' : 'icons/tracking_protection.png';
    }
    if (element) {
        element.className = `tracking-button ${status ? 'enabled' : 'disabled'}`;
        element.textContent = `Tracking Protection: ${status ? 'Enabled' : 'Disabled'}`;
    }
}

export function init() {
    const {
        cardCookies, cardTrackers, cardExtensions, closeTrackerModal,
        quickFocusMode, quickClearAll
    } = elements;

    if (cardCookies) {
        cardCookies.addEventListener('click', () => toggleSection('cookies'));
    }

    if (cardTrackers) {
        cardTrackers.addEventListener('click', () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.runtime.sendMessage({ type: 'getTrackerCount', tabId: tabs[0].id }, (response) => {
                        showTrackerDetails(response ? response.list : []);
                    });
                }
            });
        });
    }

    if (cardExtensions) {
        cardExtensions.addEventListener('click', () => toggleSection('extensions'));
    }

    if (closeTrackerModal) {
        closeTrackerModal.addEventListener('click', () => {
            elements.trackerModal?.classList.add('hidden');
        });
    }

    if (quickFocusMode) {
        quickFocusMode.addEventListener('click', () => {
            chrome.management.getAll((extensions) => {
                const toDisable = extensions.filter(ext =>
                    ext.enabled &&
                    ext.type === 'extension' &&
                    ext.id !== chrome.runtime.id
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
                            if (elements.extensionsList?.classList.contains('show')) {
                                import('./extensions.js').then(m => m.renderExtensions());
                            }
                        }
                    });
                });
            });
        });
    }

    if (quickClearAll) {
        quickClearAll.addEventListener('click', async () => {
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (!tab?.url) throw new Error('Không thể xác định trang web hiện tại');

                const url = new URL(tab.url);
                const domain = url.hostname;

                if (confirm(`Bạn có chắc muốn xóa sạch Cookie và Lịch sử của trang "${domain}"?`)) {
                    const cookies = await chrome.cookies.getAll({ domain: domain });
                    await Promise.all(
                        cookies.map(c => {
                            const cookieUrl = `http${c.secure ? 's' : ''}://${c.domain}${c.path}`;
                            return chrome.cookies.remove({ url: cookieUrl, name: c.name });
                        })
                    );

                    chrome.history.search({ text: domain, maxResults: 1000, startTime: 0 }, (items) => {
                        items.forEach(item => {
                            if (item.url.includes(domain)) {
                                chrome.history.deleteUrl({ url: item.url });
                            }
                        });

                        notify(`Đã dọn dẹp sạch dữ liệu của "${domain}"`, 'success');
                        updateDashboard();

                        if (elements.historySection?.classList.contains('show')) {
                            import('./history.js').then(m => m.loadHistoryAndSessions());
                        }
                    });
                }
            } catch (error) {
                notify(`Lỗi: ${error.message}`, 'error');
            }
        });
    }

    updateDashboard();
}
