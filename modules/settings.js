import { elements, settings, notify, saveSettings, updateUILanguage, applySettings, state } from '../popup.js';
import { isValidUrl, hashPassword, generateMasterKey, decryptData, encryptData } from './utils.js';

const translations = window.translations;
let currentTabsToSave = [];

export function toggleCustomBgUrlRow() {
    const { customBgUrlRow } = elements;
    if (!customBgUrlRow) return;

    if (settings.playerBackgroundType === 'custom') {
        customBgUrlRow.classList.remove('hidden');
    } else {
        customBgUrlRow.classList.add('hidden');
    }
}

export function renderCustomBgList() {
    const { customBgList } = elements;
    if (!customBgList) return;

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
        preview.onerror = () => { preview.onerror = null; preview.src = 'icons/extension.png'; };

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

export function updateBgPreview(url) {
    const { bgPreviewImg, bgPreviewPlaceholder } = elements;
    if (!bgPreviewImg || !bgPreviewPlaceholder) return;

    if (url && isValidUrl(url)) {
        bgPreviewImg.src = url;
        bgPreviewImg.classList.remove('hidden');
        bgPreviewPlaceholder.classList.add('hidden');
        bgPreviewImg.onerror = () => {
            bgPreviewImg.onerror = null;
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

export function applyPlayerBackground() {
    const { playerContainer } = elements;
    if (!playerContainer) return;

    const gradient = "linear-gradient(135deg, rgba(26, 26, 46, 0.4) 0%, rgba(22, 33, 62, 0.4) 100%)";
    let bgImage;
    if (settings.playerBackgroundType === 'custom' && settings.customBgUrl) {
        bgImage = `url('${settings.customBgUrl}')`;
    } else {
        bgImage = "url('images/anh-phong-canh-66-1.jpg')";
    }

    playerContainer.style.backgroundImage = `${gradient}, ${bgImage}`;
}

export function updatePanicDescription(action) {
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

export function updateCurrentShortcutDisplay() {
    if (chrome.commands && elements.currentPanicKey) {
        chrome.commands.getAll((commands) => {
            const panicCommand = commands.find(c => c.name === 'activate_panic');
            if (panicCommand && panicCommand.shortcut) {
                elements.currentPanicKey.textContent = panicCommand.shortcut;
            }
        });
    }
}

export function renderTabSelection() {
    const { tabListContainer } = elements;
    if (!tabListContainer) return;
    tabListContainer.innerHTML = '';

    currentTabsToSave.forEach((tab, index) => {
        const div = document.createElement('div');
        div.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 4px; border-bottom: 1px solid rgba(0,0,0,0.05);';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `tab-chk-${index}`;
        checkbox.checked = true;
        checkbox.dataset.index = index;
        checkbox.className = 'tab-selection-checkbox';

        const label = document.createElement('label');
        label.htmlFor = `tab-chk-${index}`;
        label.style.cssText = 'font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; flex: 1;';
        label.title = tab.url;

        const icon = tab.favIconUrl ? `<img src="${tab.favIconUrl}" width="12" height="12" style="margin-right: 5px; vertical-align: middle;">` : '🌐 ';
        label.innerHTML = `${icon}${tab.incognito ? '🔒 ' : ''}${tab.title || tab.url}`;

        div.appendChild(checkbox);
        div.appendChild(label);
        tabListContainer.appendChild(div);
    });
}

export function renderSessions() {
    const { sessionsList } = elements;
    if (!sessionsList) return;
    sessionsList.innerHTML = '';

    if (!settings.savedSessions || settings.savedSessions.length === 0) {
        const lang = settings.language || 'vi';
        const dict = translations[lang] || translations.vi;
        sessionsList.innerHTML = `<p class="empty-msg">${dict.noSessions || 'Chưa có phiên làm việc nào được lưu.'}</p>`;
        return;
    }

    settings.savedSessions.forEach((session, index) => {
        const sessionContainer = document.createElement('div');
        sessionContainer.className = 'session-container-wrapper';
        sessionContainer.style.marginBottom = '8px';

        const div = document.createElement('div');
        div.className = 'favorite-item session-item';

        const infoDiv = document.createElement('div');
        infoDiv.className = 'favorite-name';
        infoDiv.style.flexDirection = 'column';
        infoDiv.style.alignItems = 'flex-start';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = session.name;
        nameSpan.style.fontWeight = 'bold';

        const detailsSpan = document.createElement('small');
        const typeLabels = { 'all': 'Tất cả', 'normal': 'Thường', 'incognito': 'Ẩn danh' };
        const typeLabel = typeLabels[session.tabType || 'all'];
        detailsSpan.textContent = `${typeLabel} • ${session.tabs.length} tabs • ${new Date(session.date).toLocaleDateString()}`;
        detailsSpan.style.color = 'var(--text-secondary)';

        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(detailsSpan);
        div.appendChild(infoDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'favorite-actions';

        const expandBtn = document.createElement('button');
        expandBtn.className = 'favorite-go-btn';
        expandBtn.title = 'Xem danh sách tab';
        expandBtn.textContent = '🔽';
        expandBtn.style.fontSize = '10px';

        const restoreBtn = document.createElement('button');
        restoreBtn.className = 'favorite-go-btn';
        restoreBtn.title = 'Khôi phục phiên';
        restoreBtn.textContent = '📂';
        restoreBtn.onclick = (e) => {
            e.stopPropagation();
            restoreSession(session);
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'favorite-delete-btn';
        deleteBtn.title = 'Xóa phiên';
        deleteBtn.textContent = '🗑️';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            if (confirm(`Xóa phiên "${session.name}"?`)) {
                settings.savedSessions.splice(index, 1);
                saveSettings();
                renderSessions();
                notify('Đã xóa phiên làm việc', 'warning');
            }
        };

        const tabsListDiv = document.createElement('div');
        tabsListDiv.className = 'session-tabs-list hidden';
        tabsListDiv.style.cssText = 'padding: 8px; background: rgba(0,0,0,0.02); border-radius: 0 0 8px 8px; border: 1px solid var(--border-color); border-top: none; font-size: 10px; max-height: 200px; overflow-y: auto;';

        const restoreSelectedBtn = document.createElement('button');
        restoreSelectedBtn.className = 'action-btn primary-btn';
        restoreSelectedBtn.style.cssText = 'width: 100%; padding: 4px; font-size: 10px; margin-bottom: 8px;';
        restoreSelectedBtn.textContent = 'Khôi phục các tab đã chọn';
        restoreSelectedBtn.onclick = () => {
            const selectedItems = tabsListDiv.querySelectorAll('.session-tab-checkbox:checked');
            if (selectedItems.length === 0) {
                notify('Vui lòng chọn ít nhất một tab!', 'warning');
                return;
            }
            const tabsToRestore = Array.from(selectedItems).map(cb => session.tabs[parseInt(cb.dataset.tabIndex)]);
            restoreSession({ ...session, tabs: tabsToRestore });
        };
        tabsListDiv.appendChild(restoreSelectedBtn);

        session.tabs.forEach((tab, tabIndex) => {
            const tabItem = document.createElement('div');
            tabItem.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-bottom: 5px; padding: 2px 0; border-bottom: 1px dashed rgba(0,0,0,0.05);';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'session-tab-checkbox';
            checkbox.dataset.tabIndex = tabIndex;
            checkbox.checked = true;

            const tabTitleSpan = document.createElement('span');
            tabTitleSpan.style.cssText = 'flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
            tabTitleSpan.title = tab.url;
            const tabIcon = tab.incognito ? '🔒 ' : '🌐 ';
            tabTitleSpan.textContent = `${tabIcon}${tab.title || tab.url}`;

            const tabActions = document.createElement('div');
            tabActions.style.cssText = 'display: flex; gap: 4px;';

            const restoreNormalBtn = document.createElement('button');
            restoreNormalBtn.title = 'Mở trong cửa sổ thường';
            restoreNormalBtn.textContent = '🌐';
            restoreNormalBtn.style.cssText = 'background: none; border: none; cursor: pointer; font-size: 12px;';
            restoreNormalBtn.onclick = () => {
                chrome.windows.create({ url: tab.url, incognito: false });
            };

            const restoreIncognitoBtn = document.createElement('button');
            restoreIncognitoBtn.title = 'Mở trong cửa sổ ẩn danh';
            restoreIncognitoBtn.textContent = '🔒';
            restoreIncognitoBtn.style.cssText = 'background: none; border: none; cursor: pointer; font-size: 12px;';
            restoreIncognitoBtn.onclick = () => {
                chrome.extension.isAllowedIncognitoAccess((isAllowed) => {
                    if (isAllowed) {
                        chrome.windows.create({ url: tab.url, incognito: true });
                    } else {
                        notify('Cần cấp quyền Incognito', 'error');
                    }
                });
            };

            tabActions.append(restoreNormalBtn, restoreIncognitoBtn);
            tabItem.append(checkbox, tabTitleSpan, tabActions);
            tabsListDiv.appendChild(tabItem);
        });

        expandBtn.onclick = () => {
            const isHidden = tabsListDiv.classList.toggle('hidden');
            expandBtn.textContent = isHidden ? '🔽' : '🔼';
            div.style.borderRadius = isHidden ? 'var(--radius-md)' : '8px 8px 0 0';
        };

        actionsDiv.append(expandBtn, restoreBtn, deleteBtn);
        div.appendChild(actionsDiv);

        sessionContainer.append(div, tabsListDiv);
        sessionsList.appendChild(sessionContainer);
    });
}

export async function restoreSession(session) {
    try {
        notify(`Đang khôi phục phiên "${session.name}"...`, 'success');
        const normalTabs = session.tabs.filter(t => !t.incognito);
        const incognitoTabs = session.tabs.filter(t => t.incognito);

        if (normalTabs.length > 0) {
            chrome.windows.create({ url: normalTabs.map(t => t.url), incognito: false });
        }

        if (incognitoTabs.length > 0) {
            chrome.extension.isAllowedIncognitoAccess((isAllowed) => {
                chrome.windows.create({
                    url: incognitoTabs.map(t => t.url),
                    incognito: isAllowed
                });
                if (!isAllowed) {
                    notify('Cần cấp quyền Incognito để mở tab ẩn danh', 'error');
                }
            });
        }
    } catch (error) {
        notify('Lỗi khi khôi phục: ' + error.message, 'error');
    }
}

function isStrongPassword(password) {
    return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password);
}

function togglePasswordEyes() {
    const isVisible = elements.showPasswordToggle?.checked;
    document.querySelectorAll('.pass-eye').forEach(eye => {
        eye.classList.toggle('hidden', !isVisible);
    });
}

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

export function init() {
    const {
        darkModeToggle, autoClearToggle, showNotifyToggle, useSidePanelToggle,
        realTimeProtectionToggle, blockClickjackingToggle, blockCryptoMiningToggle,
        strongPasswordToggle, passwordRequirementText, alwaysRequirePasswordToggle,
        showPasswordToggle, verifyOldPass, oldPassInput, newPassRow, saveNewPass,
        newPassInput, confirmNewPassInput, searchEngineSelect, addSafeUrlBtn,
        newSafeUrlInput, panicActionSelect, changeShortcutBtn, saveSessionBtn,
        sessionNameInput, sessionTabTypeSelect, selectAllTabsBtn, deselectAllTabsBtn,
        cancelSaveSessionBtn, confirmSaveSessionBtn, tabSelectionArea, settingsSearchInput,
        clearSettingsSearch, playerBackgroundType, customBgUrlInput, addCustomBgBtn
    } = elements;

    // Load initial listings
    renderSessions();
    renderSafeUrls();
    renderCustomBgList();
    toggleCustomBgUrlRow();
    updateCurrentShortcutDisplay();
    updatePanicDescription(settings.panicAction || 'closeIncognito');

    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => {
            settings.darkMode = e.target.checked;
            applySettings();
            saveSettings();
            notify(`Dark mode ${settings.darkMode ? 'enabled' : 'disabled'}`, 'success');
        });
    }

    if (autoClearToggle) {
        autoClearToggle.addEventListener('change', (e) => {
            settings.autoClearStealth = e.target.checked;
            saveSettings();
            if (settings.autoClearStealth) {
                chrome.storage.local.remove(['stealthHistory', 'lastPlayerUrl']);
                if (elements.stealthPlayer) elements.stealthPlayer.src = '';
                notify('Đã bật Auto-clear Stealth History.', 'warning');
            } else {
                notify('Đã tắt Auto-clear.', 'success');
            }
        });
    }

    if (showNotifyToggle) {
        showNotifyToggle.addEventListener('change', (e) => {
            settings.showNotifications = e.target.checked;
            saveSettings();
        });
    }

    if (useSidePanelToggle) {
        useSidePanelToggle.addEventListener('change', (e) => {
            settings.useSidePanel = e.target.checked;
            saveSettings();
            notify(`Default to side panel ${settings.useSidePanel ? 'enabled' : 'disabled'}`, 'success');
        });
    }

    if (realTimeProtectionToggle) {
        realTimeProtectionToggle.addEventListener('change', (e) => {
            settings.realTimeProtection = e.target.checked;
            saveSettings();
            notify(`Real-time protection ${settings.realTimeProtection ? 'enabled' : 'disabled'}`, 'success');
        });
    }

    if (blockClickjackingToggle) {
        blockClickjackingToggle.addEventListener('change', (e) => {
            settings.blockClickjacking = e.target.checked;
            saveSettings();
            notify(`Clickjacking protection ${settings.blockClickjacking ? 'enabled' : 'disabled'}`, 'success');
        });
    }

    if (blockCryptoMiningToggle) {
        blockCryptoMiningToggle.addEventListener('change', (e) => {
            settings.blockCryptoMining = e.target.checked;
            saveSettings();
            notify(`Cryptomining protection ${settings.blockCryptoMining ? 'enabled' : 'disabled'}`, 'success');
        });
    }

    if (strongPasswordToggle) {
        strongPasswordToggle.addEventListener('click', async (e) => {
            e.preventDefault();
            const intendedState = !settings.requireStrongPassword;
            const action = intendedState ? 'bật' : 'tắt';
            const currentPass = prompt(`Vui lòng nhập mật khẩu hiện tại để ${action} ràng buộc mật khẩu mạnh:`);
            if (currentPass === null) return;

            chrome.storage.local.get(['stealthPasswordHash', 'stealthSalt'], async (result) => {
                const storedHash = result.stealthPasswordHash || await hashPassword('1234', 'default_salt');
                const salt = result.stealthSalt || 'default_salt';
                const enteredHash = await hashPassword(currentPass, salt);

                if (enteredHash === storedHash) {
                    state.secretCode = currentPass;
                    settings.requireStrongPassword = intendedState;
                    strongPasswordToggle.checked = intendedState;
                    if (passwordRequirementText) passwordRequirementText.classList.toggle('hidden', !intendedState);
                    saveSettings();
                    notify(`Đã ${action} ràng buộc mật khẩu mạnh thành công!`, 'success');
                } else {
                    notify('Mật khẩu không chính xác!', 'error');
                }
            });
        });
    }

    if (alwaysRequirePasswordToggle) {
        alwaysRequirePasswordToggle.addEventListener('change', (e) => {
            settings.alwaysRequirePassword = e.target.checked;
            saveSettings();
            notify(`Always require password ${settings.alwaysRequirePassword ? 'enabled' : 'disabled'}`, 'success');
        });
    }

    if (showPasswordToggle) {
        showPasswordToggle.addEventListener('change', (e) => {
            settings.showPasswordInSettings = e.target.checked;
            togglePasswordEyes();
            saveSettings();
        });
    }

    setupPasswordToggle('oldPassInput', 'toggleOldPass');
    setupPasswordToggle('newPassInput', 'toggleNewPass');
    setupPasswordToggle('confirmNewPassInput', 'toggleConfirmPass');
    setupPasswordToggle('stealthPassInput', 'toggleStealthPass');
    setupPasswordToggle('vaultPassInput', 'toggleVaultPass');

    if (verifyOldPass) {
        verifyOldPass.addEventListener('click', async () => {
            const oldPass = oldPassInput.value;
            chrome.storage.local.get(['stealthPasswordHash', 'stealthSalt'], async (result) => {
                const storedHash = result.stealthPasswordHash || await hashPassword('1234', 'default_salt');
                const salt = result.stealthSalt || 'default_salt';
                const enteredHash = await hashPassword(oldPass, salt);

                if (enteredHash === storedHash) {
                    state.secretCode = oldPass;
                    if (newPassRow) newPassRow.classList.remove('hidden');
                    oldPassInput.disabled = true;
                    verifyOldPass.disabled = true;
                    notify('Old password verified. Enter new one.', 'success');
                    if (settings.requireStrongPassword && passwordRequirementText) {
                        passwordRequirementText.classList.remove('hidden');
                    }
                } else {
                    notify('Incorrect current password!', 'error');
                    oldPassInput.value = '';
                }
            });
        });
    }

    if (saveNewPass) {
        saveNewPass.addEventListener('click', async () => {
            if (!newPassInput || !confirmNewPassInput) return;
            const newPass = newPassInput.value.trim();
            const confirmPass = confirmNewPassInput.value.trim();

            if (newPass === '') {
                notify('Please enter a new password', 'warning');
                return;
            }
            if (newPass !== confirmPass) {
                notify('Passwords do not match!', 'error');
                return;
            }
            if (settings.requireStrongPassword && !isStrongPassword(newPass)) {
                notify('Password does not meet security standards!', 'error');
                return;
            }
            if (!settings.requireStrongPassword && newPass.length < 4) {
                notify('Password must be at least 4 chars', 'warning');
                return;
            }

            const newSalt = await generateMasterKey();
            const newHash = await hashPassword(newPass, newSalt);

            if (settings.vaultSyncEnabled && settings.masterSyncKey) {
                const oldPass = state.secretCode;
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
                chrome.storage.local.remove('stealthPassword');
                state.secretCode = newPass;
                saveSettings();
                notify('Password updated successfully!', 'success');

                oldPassInput.value = '';
                oldPassInput.disabled = false;
                if (verifyOldPass) verifyOldPass.disabled = false;
                newPassInput.value = '';
                confirmNewPassInput.value = '';
                if (newPassRow) newPassRow.classList.add('hidden');

                oldPassInput.type = 'password';
                newPassInput.type = 'password';
                confirmNewPassInput.type = 'password';
                const eyeOld = document.getElementById('toggleOldPass');
                if (eyeOld) eyeOld.textContent = '👁️';
            });
        });
    }

    if (searchEngineSelect) {
        searchEngineSelect.addEventListener('change', (e) => {
            settings.searchEngine = e.target.value;
            saveSettings();
            notify(`Default search engine set to ${settings.searchEngine}`, 'success');
        });
    }

    if (addSafeUrlBtn) {
        addSafeUrlBtn.addEventListener('click', () => {
            if (!newSafeUrlInput) return;
            let url = newSafeUrlInput.value.trim();
            if (!url) {
                notify('Vui lòng nhập URL', 'warning');
                return;
            }
            if (!url.startsWith('http')) url = 'https://' + url;
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
            newSafeUrlInput.value = '';
            renderSafeUrls();
            notify('Safe URL added!', 'success');
        });
    }

    if (panicActionSelect) {
        panicActionSelect.addEventListener('change', (e) => {
            settings.panicAction = e.target.value;
            saveSettings();
            updatePanicDescription(e.target.value);
            notify(`Panic action set to: ${e.target.value}`, 'success');
        });
    }

    if (changeShortcutBtn) {
        changeShortcutBtn.addEventListener('click', () => {
            chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
        });
    }

    if (saveSessionBtn) {
        saveSessionBtn.addEventListener('click', async () => {
            if (!sessionNameInput || !sessionTabTypeSelect) return;
            const sessionName = sessionNameInput.value.trim();
            if (!sessionName) {
                notify('Vui lòng nhập tên phiên làm việc', 'warning');
                return;
            }

            try {
                const tabType = sessionTabTypeSelect.value;
                const allTabs = await chrome.tabs.query({});
                currentTabsToSave = allTabs.filter(tab => {
                    if (tabType === 'normal') return !tab.incognito;
                    if (tabType === 'incognito') return tab.incognito;
                    return true;
                });

                if (currentTabsToSave.length === 0) {
                    notify('Không tìm thấy tab nào để lưu!', 'warning');
                    return;
                }

                renderTabSelection();
                if (tabSelectionArea) tabSelectionArea.classList.remove('hidden');
                saveSessionBtn.disabled = true;
                notify('Vui lòng chọn các tab bạn muốn lưu', 'success');
            } catch (error) {
                notify('Lỗi khi lấy danh sách tab: ' + error.message, 'error');
            }
        });
    }

    if (selectAllTabsBtn) {
        selectAllTabsBtn.addEventListener('click', () => {
            document.querySelectorAll('.tab-selection-checkbox').forEach(cb => cb.checked = true);
        });
    }

    if (deselectAllTabsBtn) {
        deselectAllTabsBtn.addEventListener('click', () => {
            document.querySelectorAll('.tab-selection-checkbox').forEach(cb => cb.checked = false);
        });
    }

    if (cancelSaveSessionBtn) {
        cancelSaveSessionBtn.addEventListener('click', () => {
            if (tabSelectionArea) tabSelectionArea.classList.add('hidden');
            if (saveSessionBtn) saveSessionBtn.disabled = false;
            currentTabsToSave = [];
            notify('Đã hủy thao tác lưu phiên', 'warning');
        });
    }

    if (confirmSaveSessionBtn) {
        confirmSaveSessionBtn.addEventListener('click', () => {
            if (!sessionNameInput || !sessionTabTypeSelect) return;
            const sessionName = sessionNameInput.value.trim();
            const selectedCheckboxes = document.querySelectorAll('.tab-selection-checkbox:checked');

            if (selectedCheckboxes.length === 0) {
                notify('Vui lòng chọn ít nhất một tab để lưu!', 'warning');
                return;
            }

            const selectedTabs = Array.from(selectedCheckboxes).map(cb => currentTabsToSave[parseInt(cb.dataset.index)]);

            const sessionData = {
                id: Date.now(),
                name: sessionName,
                date: new Date().toISOString(),
                tabType: sessionTabTypeSelect.value,
                tabs: selectedTabs.map(t => ({
                    url: t.url,
                    title: t.title,
                    incognito: t.incognito
                }))
            };

            if (!settings.savedSessions) settings.savedSessions = [];
            settings.savedSessions.unshift(sessionData);
            saveSettings();
            renderSessions();

            sessionNameInput.value = '';
            if (tabSelectionArea) tabSelectionArea.classList.add('hidden');
            if (saveSessionBtn) saveSessionBtn.disabled = false;

            if (confirm(`Đã lưu "${sessionName}" với ${selectedTabs.length} tab. Bạn có muốn đóng các tab đã chọn không?`)) {
                selectedTabs.forEach(t => {
                    chrome.tabs.remove(t.id).catch(() => {});
                });
            }

            notify(`Đã lưu phiên: ${sessionName}`, 'success');
        });
    }

    if (settingsSearchInput) {
        settingsSearchInput.addEventListener('input', (e) => {
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
    }

    if (clearSettingsSearch) {
        clearSettingsSearch.addEventListener('click', () => {
            if (settingsSearchInput) {
                settingsSearchInput.value = '';
                settingsSearchInput.dispatchEvent(new Event('input'));
            }
        });
    }

    if (elements.languageSelect) {
        elements.languageSelect.addEventListener('change', (e) => {
            settings.language = e.target.value;
            saveSettings();
            updateUILanguage();
            notify('Language updated!', 'success');
        });
    }

    if (playerBackgroundType) {
        playerBackgroundType.addEventListener('change', (e) => {
            settings.playerBackgroundType = e.target.value;
            saveSettings();
            toggleCustomBgUrlRow();
            applyPlayerBackground();
            notify('Background type updated!', 'success');
        });
    }

    if (addCustomBgBtn) {
        addCustomBgBtn.addEventListener('click', () => {
            if (!customBgUrlInput) return;
            const url = customBgUrlInput.value.trim();
            if (!url) return;
            if (!isValidUrl(url)) {
                notify('Invalid Image URL', 'error');
                return;
            }

            if (!settings.customBgList) settings.customBgList = [];
            if (settings.customBgList.includes(url)) {
                notify('Background URL already exists', 'warning');
                return;
            }

            settings.customBgList.push(url);
            settings.customBgUrl = url;
            saveSettings();
            customBgUrlInput.value = '';
            renderCustomBgList();
            applyPlayerBackground();
            notify('Custom background added!', 'success');
        });
    }

    if (elements.vaultSyncToggle) {
        elements.vaultSyncToggle.addEventListener('change', async (e) => {
            settings.vaultSyncEnabled = e.target.checked;
            if (elements.masterSyncSection) {
                elements.masterSyncSection.style.display = settings.vaultSyncEnabled ? 'block' : 'none';
            }
            if (settings.vaultSyncEnabled && !settings.masterSyncKey) {
                const masterKey = await generateMasterKey();
                const encryptedKey = await encryptData(masterKey, state.secretCode);
                settings.masterSyncKey = encryptedKey;
                if (elements.masterSyncKeyInput) elements.masterSyncKeyInput.value = masterKey;
            }
            saveSettings();
            notify(`Vault sync ${settings.vaultSyncEnabled ? 'enabled' : 'disabled'}`, 'success');
        });
    }

    if (elements.copyMasterKeyBtn) {
        elements.copyMasterKeyBtn.addEventListener('click', async () => {
            if (settings.masterSyncKey) {
                const masterKey = await decryptData(settings.masterSyncKey, state.secretCode);
                if (masterKey) {
                    navigator.clipboard.writeText(masterKey);
                    notify('Master Key copied!', 'success');
                }
            }
        });
    }

    if (elements.saveMasterKeyBtn) {
        elements.saveMasterKeyBtn.addEventListener('click', async () => {
            if (!elements.manualMasterKeyInput) return;
            const inputKey = elements.manualMasterKeyInput.value.trim();
            if (inputKey.length !== 64) {
                notify('Master Key must be 64 characters!', 'error');
                return;
            }

            const encryptedKey = await encryptData(inputKey, state.secretCode);
            settings.masterSyncKey = encryptedKey;
            saveSettings();
            elements.manualMasterKeyInput.value = '';
            if (elements.masterSyncKeyInput) elements.masterSyncKeyInput.value = '********';
            notify('Master Key saved! Merging vault items...', 'success');

            // Pull items using the new key
            await import('./vault.js').then(m => m.pullVaultFromCloud());
            await import('./vault.js').then(m => m.loadVault());
        });
    }
}

export function renderSafeUrls() {
    const { safeUrlsList } = elements;
    if (!safeUrlsList) return;

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

        item.append(info, deleteBtn);
        safeUrlsList.appendChild(item);
    });
}
