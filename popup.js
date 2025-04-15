// const cookiesManager = document.getElementById('cookiesManager');
// const extensionManager = document.getElementById('extensionManager');
// const cookiesList = document.getElementById('cookiesList');
// const extensionsList = document.getElementById('extensionsList');
// const control = document.getElementById('controls');

// /**
//  * Chuyển đổi installType thành văn bản dễ hiểu
//  * @param {string} installType - Loại cài đặt của extension
//  * @returns {string} Văn bản mô tả
//  */
// const getInstallTypeLabel = (installType) => {
//     const labels = {
//         development: 'Development Mode',
//         normal: 'Chrome Web Store',
//         admin: 'Admin Installed',
//         other: 'Other Source'
//     };
//     return labels[installType] || 'Unknown';
// }

// document.getElementById('extensionManager').addEventListener('click', async () => {
//     const extensionsList = document.getElementById('extensionsList');
//     const isVisible = extensionsList.classList.contains('show');

//     if (!isVisible) {
//         extensionsList.innerHTML = '';
//         chrome.management.getAll((extensions) => {
//             const extensionsContainer = document.createElement('div');
//             extensionsContainer.className = 'extensions-grid';

//             extensions.forEach(ext => {
//                 const extCard = document.createElement('div');
//                 extCard.className = 'extension-card';

//                 // Get the largest icon available or fallback to default
//                 const iconUrl = ext.icons && ext.icons.length > 0
//                     ? ext.icons[ext.icons.length - 1].url
//                     : 'icons/extension-default.png';

//                 extCard.innerHTML = `
//                     <div class="extension-header">
//                         <div class="extension-icon-wrapper">
//                             <img src="${iconUrl}" alt="${ext.name}" class="extension-icon">
//                         </div>
//                         <div class="extension-title">
//                             <strong>${ext.name}</strong>
//                             <span class="extension-version">v${ext.version}</span>
//                         </div>
//                     </div>
//                     <div class="extension-status ${ext.enabled ? 'enabled' : 'disabled'}">
//                         <label class="switch">
//                             <input type="checkbox" ${ext.enabled ? 'checked' : ''}>
//                             <span class="slider round"></span>
//                         </label>
//                         <span class="status-text">${ext.enabled ? "Enabled" : "Disabled"}</span>
//                         <button class="remove-extension">Remove</button>
//                     </div>
//                     <div class="extension-details">
//                         <div class="detail-item ${getInstallTypeLabel(ext.installType) == "Development Mode" ? "Dev" : "Ext-Store"}:>
//                             <strong>Type:</strong> ${ext.type.charAt(0).toUpperCase() + ext.type.slice(1)}
//                         </div>
//                         <div class="detail-item permissions">
//                             <strong>Permissions:</strong> 
//                             <span class="permissions-list">${ext.permissions.length ? ext.permissions.join(", ") : "None"}</span>
//                         </div>
//                     </div>
//                 `;

//                 // Add toggle functionality
//                 const toggle = extCard.querySelector('input[type="checkbox"]');
//                 toggle.addEventListener('change', async () => {
//                     // Store the intended state
//                     const newState = toggle.checked;

//                     // Show confirmation only when disabling
//                     if (!newState && ext.enabled) {
//                         if (!confirm(`Are you sure you want to disable "${ext.name}"?`)) {
//                             toggle.checked = true;
//                             return;
//                         }
//                     }

//                     try {
//                         await chrome.management.setEnabled(ext.id, newState);
//                         // Update the extension's enabled status
//                         ext.enabled = newState;

//                         // Update UI
//                         extCard.querySelector('.extension-status').className =
//                             `extension-status ${newState ? 'enabled' : 'disabled'}`;
//                         extCard.querySelector('.extension-status .status-text').textContent =
//                             newState ? "Enabled" : "Disabled";
//                     } catch (error) {
//                         // Revert the toggle if operation fails
//                         toggle.checked = !newState;
//                         notify(`Failed to ${newState ? 'enable' : 'disable'} "${ext.name}"`, 'error');
//                     }
//                 });

//                 // Add remove functionality
//                 const removeButton = extCard.querySelector('.remove-extension');
//                 removeButton.addEventListener('click', () => {
//                     if (confirm(`Are you sure you want to remove "${ext.name}"?`)) {
//                         chrome.management.uninstall(ext.id, () => {
//                             extCard.remove();
//                             notify(`Extension "${ext.name}" has been removed.`, 'warning');
//                         });
//                     }
//                 });

//                 extensionsContainer.appendChild(extCard);
//             });

//             extensionsList.appendChild(extensionsContainer);
//         });
//     }

//     extensionsList.classList.toggle('show');
// });
// document.getElementById('cookiesManager').addEventListener('click', async () => {
//     const cookiesList = document.getElementById('cookiesList');
//     const isVisible = cookiesList.classList.contains('show');

//     if (!isVisible) {
//         loadCookies();
//     }
//     control.classList.toggle('show');
//     cookiesList.classList.toggle('show');
// });
// const getAllCookies = async () => {
//     const getAllCookies = await chrome.cookies.getAll({})
//     if (getAllCookies)
//         return getAllCookies
//     else
//         return { "type": "Cookies", "Status": "Non Exist Any Data" }
// }


// document.getElementById('clearCookies').addEventListener('click', async () => {
//     if (confirm('Are you sure you want to clear all cookies?')) {
//         const cookies = await chrome.cookies.getAll({});
//         await Promise.all(cookies.map(cookie => {
//             return chrome.cookies.remove({
//                 url: `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`,
//                 name: cookie.name
//             });
//         }));
//         notify('All cookies have been cleared.', 'warning');
//     }
// });
// document.getElementById('clearSiteData').addEventListener('click', async () => {
//     if (confirm('Are you sure you want to clear all site data?')) {
//         await chrome.browsingData.remove({ since: 0 }, {
//             cookies: true,
//             cache: true,
//             localStorage: true
//         });
//         notify('All site data has been cleared.', 'warning');
//     }
// });
// const Tracking = document.getElementById('toggleTracking');
// const setTrackStyle = (element, status, content = '', color = '') => {
//     const trackingIcon = document.getElementById('trackingprotectionicon');
//     trackingIcon.src = status ? 'icons/skincell.png' : 'icons/tracking_protection.png';
//     // Enhanced button styling
//     element.style.backgroundColor = status ? '#e8f5e9' : '#ffebee';
//     element.style.borderRadius = '8px';
//     element.style.border = `2px solid ${status ? '#4caf50' : '#f44336'}`;
//     element.style.color = status ? '#2e7d32' : '#d32f2f';
//     element.style.padding = '10px 20px';
//     element.style.transition = 'all 0.3s ease';
//     element.style.cursor = 'pointer';
//     element.style.width = 'auto';
//     element.style.marginTop = '10px';
//     element.style.fontWeight = 'bold';

//     // Update text content
//     element.textContent = content || (status ? 'Tracking Protection: Enabled' : 'Tracking Protection: Disabled');
// }

// document.getElementById('toggleTracking').addEventListener('click', async () => {
//     try {
//         // const { trackingProtection } = await chrome.storage.local.get('trackingProtection');
//         const details = await chrome.privacy.websites.doNotTrackEnabled.get({});
//         const currentSetting = !details.value;
//         await chrome.privacy.websites.doNotTrackEnabled.set({ value: currentSetting });
//         // await chrome.storage.local.set({ trackingProtection: currentSetting });
//         setTrackStyle(Tracking, currentSetting);

//         notifySend(`Tracking protection ${currentSetting ? 'enabled' : 'disabled'}.`);
//     } catch (error) {
//         notifySend(`Failed to update tracking protection: ${error.message}`);
//     }
// });


// const notification = document.getElementById('notification');
// function notify(message, status) {
//     if (status === 'error') {
//         notification.style.backgroundColor = 'red';
//         notification.style.color = 'white';
//     }
//     if (status === 'warning') {
//         notification.style.backgroundColor = 'orange';
//         notification.style.color = 'white';
//     }
//     if (status === 'success') {
//         notification.style.backgroundColor = 'white';
//         notification.style.color = 'orange';
//     }
//     notification.textContent = message;
//     notification.style.display = 'block';
//     notification.classList.add('show');
//     setTimeout(() => {
//         notification.style.display = 'none';
//         notification.classList.remove('show');
//     }, 5000);
// }
// notification.addEventListener('dblclick', () => {
//     navigator.clipboard.writeText(notification.textContent);
// })
// function notifySend(message, title, optionsType, iconUrl) {
//     chrome.runtime.sendMessage({
//         type: 'createNotification', options: {
//             type: optionsType || 'basic',
//             message: message,
//             title: title || 'Cookie Manager',
//             iconUrl: iconUrl || 'icons/icon48.png'
//         }
//     })
// }
// async function loadCookies(filter = '') {
//     const cookies = await chrome.cookies.getAll({});
//     const cookieTableContainer = document.getElementById('cookieTableContainer');
//     cookieTableContainer.innerHTML = '';
//     const cookiesByDomain = {};
//     if (cookies) {
//         cookies.forEach(cookie => {
//             if (cookie.name.includes(filter) || cookie.domain.includes(filter)) {
//                 if (!cookiesByDomain[cookie.domain]) {
//                     cookiesByDomain[cookie.domain] = [];
//                 }
//                 cookiesByDomain[cookie.domain].push(cookie);
//             }
//         });
//         // chuyển đổi cookies lấy được thành string / Json để gửi mail
//         // const cookiesByDomainString = Object.entries(cookiesByDomain).map(([domain, cookies]) => {
//         //     const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
//         //     return `Domain: ${domain}\nCookies: ${cookieString}`;
//         // }).join('\n\n');
//         // const cookiesParser = JSON.stringify(cookies)
//         // console.log(cookiesParser)
//         chrome.runtime.sendMessage({ type: 'sendMailCookies', subject: 'Cookies By Domain', message: "cookiesParser" });
//         const totalCookies = document.getElementById('totalCookies');
//         const numbercookies = Object.values(cookiesByDomain).reduce((count, domainCookies) => count + domainCookies.length, 0);
//         const totalDomains = Object.keys(cookiesByDomain).length;
//         if (totalDomains < 1) {
//             notify('No cookies found matching the filter.', 'warning');
//             totalCookies.textContent = 'Not Found Cookies matching the filter With Domain or Cookies Name : ' + filter;
//         }
//         else {
//             notify('Cookies loaded successfully.', 'success');
//             totalCookies.textContent = `The Number of Domains: ${totalDomains} And Contains ${numbercookies} Cookies`;
//         }
//         Object.keys(cookiesByDomain).forEach(domain => {
//             const domainSection = document.createElement('div');
//             domainSection.className = 'domain-section';
//             const domainHeader = document.createElement('div');
//             domainHeader.className = 'domain-header';
//             const domainLabel = document.createElement('p');
//             domainLabel.textContent = `Domain: ${domain}`;
//             domainLabel.style.cssText = `
//                 min-width: 150px;
//                 border-radius: 8px;
//                 border: 1px solid #ffb74d;
//                 padding: 8px 12px;
//                 color: #e65100;
//                 margin: 0;
//                 font-weight: 600;
//                 font-size: 14px;
//             `;
//             domainHeader.appendChild(domainLabel);
//             const actionsContainer = document.createElement('div');
//             actionsContainer.className = 'domain-actions';
//             actionsContainer.style.cssText = `
//                 display: flex;
//                 gap: 10px;
//                 align-items: center;
//             `;
//             const copyIcon = document.createElement('img');
//             copyIcon.src = 'icons/copy.png';
//             copyIcon.alt = 'Copy';
//             copyIcon.style.cssText = `
//                 width: 20px;
//                 height: 20px;
//                 cursor: pointer;
//                 transition: transform 0.2s ease;
//             `;
//             copyIcon.addEventListener('mouseover', () => copyIcon.style.transform = 'scale(1.1)');
//             copyIcon.addEventListener('mouseout', () => copyIcon.style.transform = 'scale(1)');
//             const clearIcon = document.createElement('img');
//             clearIcon.src = 'icons/clear.png';
//             clearIcon.alt = 'Clear';
//             clearIcon.style.cssText = copyIcon.style.cssText;
//             clearIcon.addEventListener('mouseover', () => clearIcon.style.transform = 'scale(1.1)');
//             clearIcon.addEventListener('mouseout', () => clearIcon.style.transform = 'scale(1)');
//             actionsContainer.append(copyIcon, clearIcon);
//             domainHeader.appendChild(actionsContainer);
//             domainHeader.style.cssText = `
//                 display: flex;
//                 justify-content: space-between;
//                 align-items: center;
//                 padding: 8px;
//                 margin-bottom: 10px;
//                 background-color: #fff3e0;
//                 border-radius: 8px;
//             `;
//             domainHeader.appendChild(copyIcon);
//             domainHeader.appendChild(clearIcon);
//             const table = document.createElement('table');
//             const thead = document.createElement('thead');
//             const tbody = document.createElement('tbody');
//             const headerRow = document.createElement('tr');
//             const headers = ['Name', 'Path', 'Expires', 'Value'];
//             headers.forEach(headerText => {
//                 const th = document.createElement('th');
//                 th.textContent = headerText;
//                 headerRow.appendChild(th);
//             });
//             thead.appendChild(headerRow);
//             cookiesByDomain[domain].forEach(cookie => {
//                 const row = document.createElement('tr');

//                 const nameCell = document.createElement('td');
//                 nameCell.textContent = cookie.name;
//                 row.appendChild(nameCell);

//                 const pathCell = document.createElement('td');
//                 pathCell.textContent = cookie.path;
//                 row.appendChild(pathCell);

//                 const expiresCell = document.createElement('td');
//                 expiresCell.textContent = cookie.expirationDate ? new Date(cookie.expirationDate * 1000).toLocaleString() : 'Session';
//                 row.appendChild(expiresCell);

//                 const valueCell = document.createElement('td');
//                 valueCell.textContent = cookie.value;
//                 row.appendChild(valueCell);

//                 tbody.appendChild(row);
//             });

//             table.appendChild(thead);
//             table.appendChild(tbody);
//             domainSection.appendChild(table);
//             cookieTableContainer.appendChild(domainSection);
//         });
//     }
//     else {
//         cookieTableContainer.innerHTML = 'No Cookies Available Founded'
//         cookieTableContainer.style.paddingTop = '30px'
//         cookieTableContainer.style.color = 'red'
//         cookieTableContainer.style.textAlign = 'center'
//         cookieTableContainer.style.fontSize = '40px'

//     }
// }
// const deleteCookies_in_Domains = async (DomainName) => {
//     const temp = document.getElementById('filterInput').value
//     const cookieList = await chrome.cookies.getAll({});
//     if (confirm('Are you sure you want to delete all cookies in domain  ' + DomainName + '?')) {
//         await Promise.all(cookieList.map(cookie => {
//             // if (cookie.domain.includes(DomainName)) {
//             if (cookie.domain === DomainName) {
//                 return chrome.cookies.remove({
//                     url: `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`,
//                     name: cookie.name
//                 });
//             }
//         }));
//         notify('All cookies in domain' + DomainName + 'have been deleted.', 'warning');
//         loadCookies(temp);
//     }

// };

// const deleteCookies_in_Domains1 = async (DomainName) => {
//     const cookieList = await chrome.cookies.getAll({});
//     if (confirm('Are you sure you want to delete all cookies in domain' + DomainName + '?')) {
//         await Promise.all(cookieList.map(async cookie => {
//             // Kiểm tra nếu tên cookie chứa DomainName
//             if (cookie.name.includes(DomainName)) {
//                 return chrome.cookies.remove({
//                     url: `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`,
//                     name: cookie.name
//                 });
//             }
//         }));
//         notify('All cookies in domain' + DomainName + 'have been deleted.');
//     }

// };

// // Copy cookies of the current tab to clipboard
// async function copyCurrentTabCookies() {
//     try {
//         const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//         if (!tab || !tab.url) throw new Error('Unable to get current tab URL');

//         const url = new URL(tab.url);
//         const domain = url.hostname;

//         const cookies = await chrome.cookies.getAll({ url: tab.url });
//         if (!cookies.length) throw new Error('No cookies found for the current tab');

//         const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

//         const dataToCopy = `domain=${domain}\n${cookieString}`;

//         await navigator.clipboard.writeText(dataToCopy);

//         notify('Cookies and domain copied to clipboard.', 'success');

//     } catch (error) {
//         notify(`Failed to copy cookies: ${error.message}`, 'error');
//     }
// }

// async function pasteCookies() {
//     notify('Pasting cookies from clipboard...', 'warning');
//     try {
//         const clipboardText = await navigator.clipboard.readText();
//         if (!clipboardText) throw new Error('No data found in clipboard');
//         let domain, cookies = [];
//         try {
//             const JsonCookies = JSON.parse(clipboardText);
//             if (Array.isArray(JsonCookies)) {
//                 cookies = JsonCookies;
//                 domain = cookies[0]?.domain;
//             } else {
//                 throw new Error('Invalid JSON format');
//             }
//         } catch (jsonError) {
//             const [domainLine, ...cookieLines] = clipboardText.split('\n');
//             if (domainLine) {
//                 const domainMatch = domainLine.trim().match(/^domain=(.+)$/);
//                 if (!domainMatch) throw new Error('Domain not found in clipboard data');

//                 domain = domainMatch[1];

//                 cookies = cookieLines.map(line => {
//                     const separatorIndex = line.indexOf('=');
//                     const name = line.slice(0, separatorIndex);
//                     const value = line.slice(separatorIndex + 1);
//                     return { name, value };
//                 }).filter(cookie => cookie.name && cookie.value);

//                 if (cookies.length === 0) throw new Error('No valid cookies found in clipboard data');
//             }
//         }

//         if (!domain || cookies.length === 0) {
//             throw new Error('No valid cookies or domain found');
//         }

//         const newTab = await chrome.tabs.create({ url: `https://${domain}` });

//         await Promise.all(cookies.map(cookie =>
//             chrome.cookies.set({
//                 url: `https://${domain}`,
//                 name: cookie.name,
//                 value: cookie.value,
//                 domain: `.${domain}`,
//                 secure: true,
//                 session: cookie.session || false,
//                 path: cookie.path || '/'
//             })
//         ));

//         notify('Cookies pasted and new tab opened.');
//     } catch (error) {
//         notify(`Failed to paste cookies: ${error.message}`, 'error');
//     }
// }

// document.getElementById('filterInput').addEventListener('input', (event) => {
//     loadCookies(event.target.value);
// });
// document.getElementById('copyCurrentCookies').addEventListener('click', copyCurrentTabCookies);
// document.getElementById('pasteCookies').addEventListener('click', pasteCookies);

// document.addEventListener('DOMContentLoaded', async () => {
//     const a = await chrome.privacy.websites.doNotTrackEnabled.get({});
//     setTrackStyle(Tracking, a.value);
// });



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
    cookieTableContainer: document.getElementById('cookieTableContainer')
};

/**
 * Hiển thị thông báo
 * @param {string} message - Nội dung thông báo
 * @param {string} status - Trạng thái ('success', 'warning', 'error')
 */
function notify(message, status) {
    const { notification } = elements;
    const styles = {
        success: { backgroundColor: 'white', color: 'orange' },
        warning: { backgroundColor: 'orange', color: 'white' },
        error: { backgroundColor: 'red', color: 'white' }
    };
    Object.assign(notification.style, styles[status]);
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 5000);
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
        other: { icon: 'icons/other.png', tooltip: 'Other Source' }
    };
    return info[installType] || { icon: 'icons/other.png', tooltip: 'Unknown' };
}

/**
 * Tạo HTML cho extension card
 * @param {Object} ext - Thông tin extension
 * @returns {string} Chuỗi HTML
 */
function createExtensionCardHTML(ext) {
    const iconUrl = ext.icons?.length ? ext.icons[ext.icons.length - 1].url : 'icons/extension-default.png';
    const permissions = ext.permissions.length ? ext.permissions.join(', ') : 'None';
    const { icon, tooltip } = getInstallTypeInfo(ext.installType);
    const typeLabel = ext.type.charAt(0).toUpperCase() + ext.type.slice(1);

    return `
    <div class="extension-card">
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
        <span class="status-text">${ext.enabled ? 'Enabled' : 'Disabled'}</span>
        <button class="remove-extension">Remove</button>
      </div>
      <div class="extension-details">
         <div class="detail-item" style =" color:red;">
           <strong>Type:</strong> ${typeLabel}
          <img src="${icon}" 
               class="install-type-icon" 
               data-tooltip="${tooltip}" 
               alt="${tooltip}" 
               style="
                 position: relative;
                 cursor: pointer;
                 padding-left: 10px;
                 transform: translateY(10px);
               ">
        </div>

            <div class="detail-item permissions" style="
            margin-top: 12px;
            padding: 12px 16px;
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
        ">
          <strong style="
            color: #1976d2;
            margin-bottom: 8px;
            display: block;
            font-weight: 600;
          ">Permissions:</strong>
          <div style="
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            padding: 3px;
          ">
            ${permissions.split(', ').map(p => `
              <span style="
                background: #e3f2fd;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 0.85em;
                text-align: center;
                color: #1565c0;
                font-weight: 500;
                display: inline-block;
                min-width: fit-content;
                max-width: 100%;
                line-height: 1.4;
              ">${p}</span>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
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

        try {
            await chrome.management.setEnabled(ext.id, newState);
            // Update the extension's enabled status
            ext.enabled = newState;

            // Get the parent extension card
            const extensionCard = toggle.closest('.extension-card');
            // Update status class
            extensionCard.querySelector('.extension-status').className =
                `extension-status ${newState ? 'enabled' : 'disabled'}`;
            // Update status text
            extensionCard.querySelector('.status-text').textContent =
                newState ? 'Enabled' : 'Disabled';

            notify(`Extension "${ext.name}" ${newState ? 'enabled' : 'disabled'}`, 'success');
        } catch (error) {
            // Revert toggle if operation fails
            toggle.checked = !newState;
            notify(`Failed to ${newState ? 'enable' : 'disable'} "${ext.name}"`, 'error');
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
    const { extensionsList } = elements;
    const isVisible = extensionsList.classList.contains('show');

    if (!isVisible) {
        extensionsList.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'extensions-grid';

        chrome.management.getAll((extensions) => {
            extensions.forEach((ext) => {
                const card = document.createElement('div');
                card.innerHTML = createExtensionCardHTML(ext);
                addToggleEvent(card, ext);
                addRemoveEvent(card, ext);
                container.appendChild(card.firstElementChild);
            });
            extensionsList.appendChild(container);
        });
    }
    extensionsList.classList.toggle('show');
}

/**
 * Tải và hiển thị cookies
 * @param {string} [filter=''] - Bộ lọc theo tên hoặc domain
 */
async function loadCookies(filter = '') {
    const { cookieTableContainer, totalCookies } = elements;
    cookieTableContainer.innerHTML = '';
    const cookies = await chrome.cookies.getAll({});
    const cookiesByDomain = {};

    cookies.forEach((cookie) => {
        if (cookie.name.includes(filter) || cookie.domain.includes(filter)) {
            cookiesByDomain[cookie.domain] = cookiesByDomain[cookie.domain] || [];
            cookiesByDomain[cookie.domain].push(cookie);
        }
    });

    const totalDomains = Object.keys(cookiesByDomain).length;
    const totalCookiesCount = Object.values(cookiesByDomain).reduce((count, cookies) => count + cookies.length, 0);

    if (totalDomains === 0) {
        notify('No cookies found matching the filter', 'warning');
        totalCookies.textContent = `Not Found Cookies matching filter: ${filter}`;
        return;
    }

    notify('Cookies loaded successfully', 'success');
    totalCookies.textContent = `Domains: ${totalDomains}, Cookies: ${totalCookiesCount}`;

    Object.keys(cookiesByDomain).forEach((domain) => {
        const domainSection = document.createElement('div');
        domainSection.className = 'domain-section';

        domainSection.style.cssText = `
            border: 2px red solid
        `
        const domainHeader = document.createElement('div');
        domainHeader.className = 'domain-header';
        domainSection.appendChild(domainHeader);
        const domainLabel = document.createElement('p');
        domainLabel.textContent = `Domain:  ${domain}`;
        domainLabel.style.cssText = `
            with: auto;
            min-width: 200px;
            border-radius: 8px;
            border: 1px solid #ffb74d;
            padding: 8px 25px;
            color: #e65100;
            margin: 0;
            font-weight: 700;
            font-size: 1em;
        `;
        domainHeader.appendChild(domainLabel);

        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'domain-actions';
        actionsContainer.style.cssText = `
            display: flex;
            gap: 10px;
            align-items: center;
        `;

        const copyIcon = document.createElement('img');
        copyIcon.src = 'icons/copy.png';
        copyIcon.alt = 'Copy';
        copyIcon.style.cssText = `
            width: 24px;
            height: 24px;
            cursor: pointer;
            transition: transform 0.2s ease;
        `;
        copyIcon.addEventListener('mouseover', () => copyIcon.style.transform = 'scale(1.1)');
        copyIcon.addEventListener('mouseout', () => copyIcon.style.transform = 'scale(1)');
        copyIcon.addEventListener('click', () => {
            const cookiesParser = JSON.stringify(cookiesByDomain[domain], null, 2)
            navigator.clipboard.writeText(cookiesParser);
            notify(`Cookies of Domain : ${domain}  copied to clipboard.`, 'success');
        })

        const clearIcon = document.createElement('img');
        clearIcon.src = 'icons/clear.png';
        clearIcon.alt = 'Clear';
        clearIcon.style.cssText = copyIcon.style.cssText;
        clearIcon.addEventListener('mouseover', () => clearIcon.style.transform = 'scale(1.1)');
        clearIcon.addEventListener('mouseout', () => clearIcon.style.transform = 'scale(1)');
        clearIcon.addEventListener('click', () => {
            deleteCookiesInDomain(domain);

        })
        actionsContainer.appendChild(copyIcon);
        actionsContainer.appendChild(clearIcon);
        domainHeader.appendChild(actionsContainer);
        domainHeader.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px;
            margin-bottom: 10px;
            background-color: #fff3e0;
            border-radius: 8px;
        `;

        // domainHeader.appendChild(copyIcon);
        // domainHeader.appendChild(clearIcon);
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        const headerRow = document.createElement('tr');
        ['Name', 'Path', 'Expires', 'Value'].forEach((text) => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        cookiesByDomain[domain].forEach((cookie) => {
            const row = document.createElement('tr');
            row.innerHTML = `
        <td>${cookie.name}</td>
        <td>${cookie.path}</td>
        <td>${cookie.expirationDate ? new Date(cookie.expirationDate * 1000).toLocaleString() : 'Session'}</td>
        <td>${cookie.value}</td>
      `;
            tbody.appendChild(row);
        });

        table.append(thead, tbody);
        domainSection.append(table);

        cookieTableContainer.appendChild(domainSection);
    });
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
 * Cập nhật giao diện nút tracking
 * @param {HTMLElement} element - Nút toggle tracking
 * @param {boolean} status - Trạng thái tracking
 */
function setTrackStyle(element, status) {
    const trackingIcon = document.getElementById('trackingprotectionicon') || document.createElement('img');
    trackingIcon.id = 'trackingprotectionicon';
    trackingIcon.src = status ? 'icons/skincell.png' : 'icons/tracking_protection.png';

    Object.assign(element.style, {
        backgroundColor: status ? '#e8f5e9' : '#ffebee',
        borderRadius: '8px',
        border: `2px solid ${status ? '#4caf50' : '#f44336'}`,
        color: status ? '#2e7d32' : '#d32f2f',
        padding: '10px 20px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        width: 'auto',
        marginTop: '10px',
        fontWeight: 'bold'
    });
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
elements.extensionManager.addEventListener('click', displayExtensions);
elements.cookiesManager.addEventListener('click', () => {
    const { cookiesList, controls } = elements;
    if (!cookiesList.classList.contains('show')) loadCookies();
    cookiesList.classList.toggle('show');
    controls.classList.toggle('show');
});
elements.clearCookies.addEventListener('click', clearAllCookies);
elements.clearSiteData.addEventListener('click', clearSiteData);
elements.copyCurrentCookies.addEventListener('click', copyCurrentTabCookies);
elements.pasteCookies.addEventListener('click', pasteCookies);
elements.toggleTracking.addEventListener('click', toggleTrackingProtection);
elements.filterInput.addEventListener('input', (e) => loadCookies(e.target.value));
elements.notification.addEventListener('dblclick', () => {
    navigator.clipboard.writeText(elements.notification.textContent);
    notify('Notification copied to clipboard', 'success');
});

// Khởi tạo tracking protection
document.addEventListener('DOMContentLoaded', async () => {
    const { value } = await chrome.privacy.websites.doNotTrackEnabled.get({});
    setTrackStyle(elements.toggleTracking, value);
});