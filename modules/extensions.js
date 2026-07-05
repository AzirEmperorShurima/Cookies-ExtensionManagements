import { elements, notify, showConfirm } from '../popup.js';
import { updateDashboard } from './dashboard.js';
import { createElement } from './utils.js';

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

    const visiblePerms = ext.permissions.slice(0, 3);
    const hiddenPerms = ext.permissions.slice(3);
    const hasManyPermissions = ext.permissions.length > 3;

    const permissionsBox = createElement('div', { className: 'extension-permissions-box' },
        createElement('strong', {}, 'Permissions:')
    );

    const tagContainer = createElement('div', { 
        className: 'permissions-tag-container', 
        style: { display: 'flex', flexWrap: 'wrap', gap: '4px' } 
    });

    if (ext.permissions.length === 0) {
        tagContainer.textContent = 'None';
    } else {
        visiblePerms.forEach(p => {
            tagContainer.appendChild(createElement('span', { className: 'permission-tag' }, p));
        });
        if (hasManyPermissions) {
            const extraDiv = createElement('div', { 
                className: 'extra-permissions', 
                style: { display: 'none', marginTop: '4px', flexWrap: 'wrap', gap: '4px', width: '100%' } 
            });
            hiddenPerms.forEach(p => {
                extraDiv.appendChild(createElement('span', { className: 'permission-tag' }, p));
            });
            const expandBtn = createElement('button', { 
                className: 'permissions-expand-btn', 
                style: { background: 'none', border: 'none', color: '#7928ca', cursor: 'pointer', fontSize: '0.8rem', padding: '2px 0', marginTop: '4px', fontWeight: '600', display: 'block', width: '100%', textAlign: 'left' } 
            }, '[+ Expand]');
            
            tagContainer.appendChild(extraDiv);
            tagContainer.appendChild(expandBtn);
        }
    }
    permissionsBox.appendChild(tagContainer);

    const iconImg = createElement('img', { src: iconUrl, alt: ext.name, className: 'extension-large-icon' });
    iconImg.onerror = () => { iconImg.onerror = null; iconImg.src = 'icons/extension.png'; };

    const checkbox = createElement('input', { type: 'checkbox' });
    if (ext.enabled) checkbox.checked = true;

    card.textContent = '';
    card.appendChild(
        createElement('div', { className: 'extension-top' },
            createElement('div', { className: 'extension-large-icon-container' }, iconImg),
            createElement('div', { className: 'extension-info' },
                createElement('h3', { className: 'extension-name' }, ext.name),
                createElement('span', { className: 'extension-version' }, `v${ext.version}`)
            )
        )
    );
    card.appendChild(
        createElement('div', { className: 'extension-status-bar ' + (ext.enabled ? 'enabled' : 'disabled') },
            createElement('label', { className: 'switch' },
                checkbox,
                createElement('span', { className: 'slider round' })
            ),
            createElement('span', { className: 'status-text' }, ext.enabled ? 'Enabled' : 'Disabled'),
            createElement('button', { className: 'remove-extension' }, 'Remove')
        )
    );
    card.appendChild(
        createElement('div', { className: 'extension-meta' },
            createElement('strong', {}, 'Type: '),
            typeLabel + ' ',
            createElement('img', { src: icon, title: tooltip, alt: tooltip, className: 'type-mini-icon' })
        )
    );
    card.appendChild(permissionsBox);

    return card;
}

function addToggleEvent(card, ext) {
    const toggle = card.querySelector('input[type="checkbox"]');
    toggle.addEventListener('change', async () => {
        const newState = toggle.checked;

        if (!newState && ext.enabled) {
            if (!(await showConfirm(`Are you sure you want to disable "${ext.name}"?`))) {
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
    removeButton.addEventListener('click', async () => {
        if (await showConfirm(`Are you sure you want to remove "${ext.name}"?`)) {
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

    extensionsList.textContent = '';
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
