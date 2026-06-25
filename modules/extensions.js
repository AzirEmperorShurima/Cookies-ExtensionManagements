import { elements, notify } from '../popup.js';
import { updateDashboard } from './dashboard.js';

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

    const card = document.createElement('div');
    card.className = 'extension-card';

    const hasManyPermissions = ext.permissions.length > 3;
    let permissionsTagsHTML = '';
    
    if (ext.permissions.length === 0) {
        permissionsTagsHTML = '<span class="permission-tag">None</span>';
    } else {
        const visiblePerms = ext.permissions.slice(0, 3);
        const hiddenPerms = ext.permissions.slice(3);
        
        permissionsTagsHTML = visiblePerms.map(p => `<span class="permission-tag">${p}</span>`).join('');
        if (hasManyPermissions) {
            permissionsTagsHTML += `
                <div class="extra-permissions" style="display: none; margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px; width: 100%;">
                    ${hiddenPerms.map(p => `<span class="permission-tag">${p}</span>`).join('')}
                </div>
                <button class="permissions-expand-btn" style="background: none; border: none; color: var(--primary-color, #7928ca); cursor: pointer; font-size: 0.8rem; padding: 2px 0; margin-top: 4px; font-weight: 600; display: block; width: 100%; text-align: left;">[+ Expand]</button>
            `;
        }
    }

    card.innerHTML = `
        <div class="extension-top">
            <div class="extension-large-icon-container">
                <img src="${iconUrl}" alt="${ext.name}" class="extension-large-icon" onerror="this.onerror=null; this.src='icons/extension.png';">
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
        <div class="extension-meta">
            <strong>Type: </strong>${typeLabel}
            <img src="${icon}" title="${tooltip}" alt="${tooltip}" class="type-mini-icon">
        </div>
        <div class="extension-permissions-box">
            <strong>Permissions:</strong>
            <div class="permissions-tag-container" style="display: flex; flex-wrap: wrap; gap: 4px;">${permissionsTagsHTML}</div>
        </div>
    `;

    return card;
}

function addToggleEvent(card, ext) {
    const toggle = card.querySelector('input[type="checkbox"]');
    toggle.addEventListener('change', async () => {
        const newState = toggle.checked;

        if (!newState && ext.enabled) {
            if (!confirm(`Are you sure you want to disable "${ext.name}"?`)) {
                toggle.checked = true;
                return;
            }
        }

        toggle.disabled = true;

        try {
            await new Promise((resolve, reject) => {
                chrome.management.setEnabled(ext.id, newState, () => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve();
                    }
                });
            });

            ext.enabled = newState;

            const statusBox = card.querySelector('.extension-status-bar');
            statusBox.className = `extension-status-bar ${newState ? 'enabled' : 'disabled'}`;
            card.querySelector('.status-text').textContent = newState ? 'Enabled' : 'Disabled';

            notify(`Extension "${ext.name}" ${newState ? 'enabled' : 'disabled'}`, 'success');
            updateDashboard();
        } catch (error) {
            toggle.checked = !newState;
            notify(`Failed to change state: ${error.message}`, 'error');
        } finally {
            toggle.disabled = false;
        }
    });
}

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

function addPermissionsToggleEvent(card) {
    const expandBtn = card.querySelector('.permissions-expand-btn');
    const extraPerms = card.querySelector('.extra-permissions');
    if (expandBtn && extraPerms) {
        expandBtn.addEventListener('click', () => {
            const isHidden = extraPerms.style.display === 'none';
            if (isHidden) {
                extraPerms.style.display = 'flex';
                expandBtn.textContent = '[- Collapse]';
            } else {
                extraPerms.style.display = 'none';
                expandBtn.textContent = '[+ Expand]';
            }
        });
    }
}

export function displayExtensions() {
    const { extensionsList, cookiesList, controls, extensionManager, cookiesManager } = elements;
    const isVisible = extensionsList.classList.contains('show');

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

export function renderExtensions() {
    const { extensionsList, extensionManager } = elements;
    if (!extensionsList || !extensionManager) return;

    extensionsList.innerHTML = '';
    extensionManager.classList.add('active');
    
    const container = document.createElement('div');
    container.className = 'extensions-grid';

    chrome.management.getAll((extensions) => {
        extensions.forEach((ext) => {
            const actualCard = createExtensionCardHTML(ext);
            addToggleEvent(actualCard, ext);
            addRemoveEvent(actualCard, ext);
            addPermissionsToggleEvent(actualCard);
            container.appendChild(actualCard);
        });
        extensionsList.appendChild(container);
        extensionsList.classList.add('show');
    });
}

export function init() {
    renderExtensions();
}
