import { elements, settings, notify, state } from '../popup.js';
import { encryptData, decryptData } from './utils.js';

const translations = window.translations;

export async function syncVaultToCloud() {
    if (!settings.vaultSyncEnabled || !settings.masterSyncKey) return;

    chrome.storage.local.get(['privacyVault'], async (result) => {
        const vault = result.privacyVault || [];
        if (vault.length === 0) return;

        const masterKey = await decryptData(settings.masterSyncKey, state.secretCode);
        if (!masterKey) return;

        const encrypted = await encryptData(vault, masterKey);
        if (encrypted) {
            chrome.storage.sync.set({ encryptedVault: encrypted }, () => {
                console.log('Vault synced to cloud');
            });
        }
    });
}

export async function pullVaultFromCloud() {
    if (!settings.vaultSyncEnabled || !settings.masterSyncKey) return;

    return new Promise((resolve) => {
        chrome.storage.sync.get(['encryptedVault'], async (result) => {
            if (result.encryptedVault) {
                const masterKey = await decryptData(settings.masterSyncKey, state.secretCode);
                if (!masterKey) return resolve(null);

                const decrypted = await decryptData(result.encryptedVault, masterKey);
                if (decrypted) {
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

export function loadVault() {
    const lang = settings.language || 'vi';
    const dict = translations[lang] || translations.vi;

    const proceedLoad = () => {
        state.isVaultUnlocked = true;
        if (elements.vaultLockScreen) elements.vaultLockScreen.classList.remove('show');
        performVaultLoad(dict);
    };

    if (!state.secretCode) {
        if (!settings.alwaysRequirePassword && chrome.storage.session) {
            chrome.storage.session.get(['sessionPassword'], (result) => {
                if (result.sessionPassword) {
                    state.secretCode = result.sessionPassword;
                    proceedLoad();
                } else {
                    if (elements.vaultLockScreen) elements.vaultLockScreen.classList.add('show');
                    import('../popup.js').then(popup => {
                        popup.setupUnifiedLockScreen(elements.vaultLockScreen, elements.vaultPassInput, elements.unlockVault, proceedLoad);
                    });
                }
            });
        } else {
            if (elements.vaultLockScreen) elements.vaultLockScreen.classList.add('show');
            import('../popup.js').then(popup => {
                popup.setupUnifiedLockScreen(elements.vaultLockScreen, elements.vaultPassInput, elements.unlockVault, proceedLoad);
            });
        }
    } else {
        proceedLoad();
    }
}

export function performVaultLoad(dict) {
    if (settings.vaultSyncEnabled && settings.masterSyncKey) {
        pullVaultFromCloud().then(() => {
            renderVaultItems(dict);
        });
    } else {
        renderVaultItems(dict);
    }
}

export function renderVaultItems(dict) {
    const { vaultList } = elements;
    if (!vaultList) return;

    chrome.storage.local.get(['privacyVault'], (result) => {
        const vault = result.privacyVault || [];
        vaultList.innerHTML = vault.length ? '' : `<p class="empty-msg">${dict.noVault || 'Your vault is empty. Right-click on pages or add notes here.'}</p>`;

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
                        syncVaultToCloud();
                    });
                }
            });

            vaultList.appendChild(div);
        });
    });
}

export function init() {
    const { vaultAddBtn, vaultInput } = elements;

    if (vaultAddBtn) {
        vaultAddBtn.addEventListener('click', () => {
            if (!vaultInput) return;
            const note = vaultInput.value.trim();
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
                        vaultInput.value = '';
                        loadVault();
                        syncVaultToCloud();
                        notify('Added to Vault', 'success');
                    });
                });
            } else {
                notify('Please enter a note or link', 'warning');
            }
        });
    }

    if (vaultInput) {
        vaultInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && vaultAddBtn) vaultAddBtn.click();
        });
    }

    loadVault();
}
