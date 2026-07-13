import { elements, ASSETS, settings, notify, saveSettings, showConfirm } from '../popup.js';
import { debounce, createElement } from './utils.js';

let currentCookiesByDomain = {};
let cachedCookies = [];

export async function loadCookies(filter = '', forceRefresh = false) {
    const { cookieTableContainer, totalCookies } = elements;
    if (!cookieTableContainer) return;

    if (forceRefresh || cachedCookies.length === 0) {
        cachedCookies = await chrome.cookies.getAll({});
    }

    const cookiesByDomain = {};
    const lowerFilter = filter.toLowerCase();

    cachedCookies.forEach((cookie) => {
        if (cookie.name.toLowerCase().includes(lowerFilter) ||
            cookie.domain.toLowerCase().includes(lowerFilter)) {
            cookiesByDomain[cookie.domain] = cookiesByDomain[cookie.domain] || [];
            cookiesByDomain[cookie.domain].push(cookie);
        }
    });

    currentCookiesByDomain = cookiesByDomain;

    const totalDomains = Object.keys(cookiesByDomain).length;
    const totalCookiesCount = Object.values(cookiesByDomain).reduce((count, list) => count + list.length, 0);

    if (totalDomains === 0) {
        cookieTableContainer.textContent = '';
        if (totalCookies) totalCookies.textContent = `No results found for "${filter}"`;
        return;
    }

    if (totalCookies) {
        totalCookies.textContent = `${totalDomains} Domains · ${totalCookiesCount} Cookies`;
    }

    const fragment = document.createDocumentFragment();

    Object.keys(cookiesByDomain).forEach((domain) => {
        const domainSection = document.createElement('div');
        domainSection.className = 'domain-section';

        const domainHeader = document.createElement('div');
        domainHeader.className = 'domain-header';

        const domainLabel = document.createElement('span');
        domainLabel.className = 'domain-label';
        domainLabel.textContent = domain;
        domainHeader.appendChild(domainLabel);

        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'domain-actions';

        const copyIcon = document.createElement('img');
        copyIcon.src = ASSETS.icons.copy;
        copyIcon.title = 'Copy Domain Cookies';
        copyIcon.className = 'copy-domain-btn';
        copyIcon.dataset.domain = domain;

        const clearIcon = document.createElement('img');
        clearIcon.src = ASSETS.icons.clear;
        clearIcon.title = 'Clear Domain Cookies';
        clearIcon.className = 'clear-domain-btn';
        clearIcon.dataset.domain = domain;

        actionsContainer.appendChild(copyIcon);
        actionsContainer.appendChild(clearIcon);
        domainHeader.appendChild(actionsContainer);
        domainSection.appendChild(domainHeader);

        const tableContainer = document.createElement('div');
        tableContainer.style.overflowX = 'auto';

        const table = createElement('table', {},
            createElement('thead', {},
                createElement('tr', {},
                    createElement('th', {}, 'Name'),
                    createElement('th', {}, 'Value'),
                    createElement('th', {}, 'Path'),
                    createElement('th', {}, 'Expires'),
                    createElement('th', {}, 'Expand')
                )
            )
        );
        const tbody = createElement('tbody');
        cookiesByDomain[domain].forEach(cookie => {
            const expiresText = cookie.expirationDate ? new Date(cookie.expirationDate * 1000).toLocaleString() : 'Session';
            const isLongValue = cookie.value.length > 30 || cookie.name.length > 20 || cookie.path.length > 15;

            const tr = createElement('tr', { className: 'cookie-row' },
                createElement('td', {}, createElement('span', { className: 'cookie-text-container', title: cookie.name }, cookie.name)),
                createElement('td', {}, createElement('span', { className: 'cookie-text-container', title: cookie.value }, cookie.value)),
                createElement('td', {}, createElement('span', { className: 'cookie-text-container', title: cookie.path }, cookie.path)),
                createElement('td', {}, createElement('span', { className: 'cookie-text-container', title: expiresText }, expiresText)),
                createElement('td', {}, isLongValue ? createElement('button', { className: 'row-expand-btn', title: 'Expand Row' }, '...') : null)
            );
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        tableContainer.appendChild(table);
        domainSection.appendChild(tableContainer);
        fragment.appendChild(domainSection);
    });

    cookieTableContainer.textContent = '';
    cookieTableContainer.appendChild(fragment);
}

export async function deleteCookiesInDomain(domain, filter) {
    if (!(await showConfirm(`Are you sure you want to delete all cookies in ${domain}?`))) return;

    const cookies = await chrome.cookies.getAll({ domain: domain });
    await Promise.all(
        cookies.map((cookie) =>
            chrome.cookies.remove({
                url: `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`,
                name: cookie.name
            })
        )
    );
    notify(`All cookies in ${domain} deleted`, 'warning');
    loadCookies(filter, true);

    // Refresh current tab cookies if open
    const currentTabCookiesContainer = document.getElementById('currentTabCookiesContainer');
    if (currentTabCookiesContainer && currentTabCookiesContainer.style.display === 'block') {
        const currentTabDomainName = document.getElementById('currentTabDomainName');
        if (currentTabDomainName && currentTabDomainName.textContent === domain) {
            renderCurrentTabCookies(domain);
        }
    }
}

export async function clearAllCookies() {
    if (!(await showConfirm('Are you sure you want to clear all cookies?'))) return;

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
    loadCookies('', true);
}

export async function clearSiteData() {
    if (!(await showConfirm('Are you sure you want to clear all site data?'))) return;

    await chrome.browsingData.remove(
        { since: 0 },
        { cookies: true, cache: true, localStorage: true }
    );
    notify('All site data cleared', 'warning');
    loadCookies('', true);
}

export async function copyCurrentTabCookies() {
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

export async function pasteCookies() {
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
            const [domainLine, ...cookieLines] = text.split('\n');
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

export function renderWhitelist() {
    const { whitelistList } = elements;
    if (!whitelistList) return;

    whitelistList.textContent = '';
    const whitelist = settings.whitelist || [];

    whitelist.forEach(domain => {
        const tag = createElement('div', { className: 'whitelist-tag' },
            createElement('span', {}, domain),
            createElement('span', { className: 'whitelist-remove', dataset: { domain: domain } }, '×')
        );
        whitelistList.appendChild(tag);
    });

    whitelistList.querySelectorAll('.whitelist-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const domain = e.target.dataset.domain;
            settings.whitelist = settings.whitelist.filter(d => d !== domain);
            saveSettings();
            renderWhitelist();
            notify(`Removed ${domain} from whitelist`, 'success');
        });
    });
}
export async function renderCurrentTabCookies(host) {
    const currentTabCookieTable = document.getElementById('currentTabCookieTable');
    const currentTabDomainName = document.getElementById('currentTabDomainName');
    if (!currentTabCookieTable) return;

    try {
        const cookies = await chrome.cookies.getAll({ domain: host });
        if (currentTabDomainName) currentTabDomainName.textContent = host;

        if (cookies.length === 0) {
            currentTabCookieTable.textContent = '';
            currentTabCookieTable.appendChild(createElement('p', { className: 'empty-msg', style: { margin: '10px 0', color: 'var(--text-muted)' } }, 'No cookies found for this domain.'));
            return;
        }

        const table = createElement('table', { className: 'cookies-table', style: { width: '100%', borderCollapse: 'collapse' } },
            createElement('thead', {},
                createElement('tr', {},
                    createElement('th', {}, 'Name'),
                    createElement('th', {}, 'Value'),
                    createElement('th', {}, 'Path'),
                    createElement('th', {}, 'Expires'),
                    createElement('th', {}, 'Expand')
                )
            )
        );
        const tbody = createElement('tbody');
        cookies.forEach(cookie => {
            const expiresText = cookie.expirationDate ? new Date(cookie.expirationDate * 1000).toLocaleString() : 'Session';
            const isLongValue = cookie.value.length > 30 || cookie.name.length > 20 || cookie.path.length > 15;

            const tr = createElement('tr', { className: 'cookie-row' },
                createElement('td', {}, createElement('span', { className: 'cookie-text-container', title: cookie.name }, cookie.name)),
                createElement('td', {}, createElement('span', { className: 'cookie-text-container', title: cookie.value }, cookie.value)),
                createElement('td', {}, createElement('span', { className: 'cookie-text-container', title: cookie.path }, cookie.path)),
                createElement('td', {}, createElement('span', { className: 'cookie-text-container', title: expiresText }, expiresText)),
                createElement('td', {}, isLongValue ? createElement('button', { className: 'row-expand-btn', title: 'Expand Row' }, '...') : null)
            );
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        currentTabCookieTable.textContent = '';
        currentTabCookieTable.appendChild(table);
        // Event delegation for row-expand-btn is handled globally in init()
    } catch (err) {
        console.error(err);
        currentTabCookieTable.textContent = '';
        currentTabCookieTable.appendChild(createElement('p', { className: 'empty-msg', style: { color: 'var(--danger-color, #ef4444)' } }, 'Failed to load cookies.'));
    }
}

export function init() {
    const {
        cookieTableContainer, filterInput, clearCookies, clearSiteData: clearSiteDataBtn,
        copyCurrentCookies, pasteCookies: pasteCookiesBtn, cookieDestroyerToggle,
        addWhitelistBtn, whitelistInput, autoCleanupRulesSection
    } = elements;

    if (cookieTableContainer) {
        // Shared logic for both tables
        const handleExpandClick = (e) => {
            const expandBtn = e.target.closest('.row-expand-btn');
            if (expandBtn) {
                const targetRow = expandBtn.closest('.cookie-row');
                if (targetRow) {
                    targetRow.classList.toggle('expanded');
                    expandBtn.classList.toggle('active');
                }
            }
        };

        const currentTabCookieTable = document.getElementById('currentTabCookieTable');
        if (currentTabCookieTable) {
            currentTabCookieTable.addEventListener('click', handleExpandClick);
        }

        cookieTableContainer.addEventListener('click', (e) => {
            handleExpandClick(e);
            
            const copyBtn = e.target.closest('.copy-domain-btn');
            if (copyBtn) {
                const domain = copyBtn.dataset.domain;
                const domainCookies = currentCookiesByDomain[domain];
                if (domainCookies) {
                    const cookiesParser = JSON.stringify(domainCookies, null, 2);
                    navigator.clipboard.writeText(cookiesParser);
                    notify(`Copied ${domain} cookies`, 'success');
                }
                return;
            }

            const clearBtn = e.target.closest('.clear-domain-btn');
            if (clearBtn) {
                const domain = clearBtn.dataset.domain;
                deleteCookiesInDomain(domain, filterInput?.value || '');
                return;
            }
        });
    }

    if (filterInput) {
        filterInput.addEventListener('input', debounce((e) => {
            loadCookies(e.target.value);
        }, 200));
    }

    if (clearCookies) clearCookies.addEventListener('click', () => clearAllCookies());
    if (clearSiteDataBtn) clearSiteDataBtn.addEventListener('click', () => clearSiteData());
    if (copyCurrentCookies) copyCurrentCookies.addEventListener('click', () => copyCurrentTabCookies());
    if (pasteCookiesBtn) pasteCookiesBtn.addEventListener('click', () => pasteCookies());

    if (cookieDestroyerToggle) {
        cookieDestroyerToggle.addEventListener('change', (e) => {
            settings.cookieDestroyer = e.target.checked;
            if (autoCleanupRulesSection) {
                autoCleanupRulesSection.style.display = settings.cookieDestroyer ? 'block' : 'none';
            }
            saveSettings();
            notify(`Auto-Cookie Destroyer ${settings.cookieDestroyer ? 'enabled' : 'disabled'}`, 'success');
        });
    }

    if (addWhitelistBtn) {
        addWhitelistBtn.addEventListener('click', () => {
            if (!whitelistInput) return;
            const domain = whitelistInput.value.trim().toLowerCase();
            if (!domain) return;

            if (!settings.whitelist) settings.whitelist = [];
            if (settings.whitelist.includes(domain)) {
                notify('Domain already in whitelist', 'warning');
                return;
            }

            settings.whitelist.push(domain);
            saveSettings();
            whitelistInput.value = '';
            renderWhitelist();
            notify(`Added ${domain} to whitelist`, 'success');
        });
    }

    const getCurrentDomainCookies = document.getElementById('getCurrentDomainCookies');
    const currentTabCookiesContainer = document.getElementById('currentTabCookiesContainer');
    const closeCurrentTabCookiesBtn = document.getElementById('closeCurrentTabCookiesBtn');

    if (getCurrentDomainCookies && currentTabCookiesContainer) {
        getCurrentDomainCookies.addEventListener('click', async () => {
            const isVisible = currentTabCookiesContainer.style.display === 'block';
            if (isVisible) {
                currentTabCookiesContainer.style.display = 'none';
                getCurrentDomainCookies.classList.remove('active-filter');
                getCurrentDomainCookies.style.background = '';
            } else {
                try {
                    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                    if (!tab || !tab.url) {
                        notify('No active tab detected or permission denied', 'warning');
                        return;
                    }
                    if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
                        notify('Cannot query cookies on browser internal pages', 'warning');
                        return;
                    }
                    const urlObj = new URL(tab.url);
                    let host = urlObj.hostname;
                    if (host.startsWith('www.')) {
                        host = host.substring(4);
                    }
                    
                    currentTabCookiesContainer.style.display = 'block';
                    getCurrentDomainCookies.classList.add('active-filter');
                    getCurrentDomainCookies.style.background = 'var(--success-color, #10b981)';
                    
                    await renderCurrentTabCookies(host);
                } catch (err) {
                    console.error(err);
                    notify('Failed to get current tab domain', 'error');
                }
            }
        });
    }

    if (closeCurrentTabCookiesBtn && currentTabCookiesContainer) {
        closeCurrentTabCookiesBtn.addEventListener('click', () => {
            currentTabCookiesContainer.style.display = 'none';
            if (getCurrentDomainCookies) {
                getCurrentDomainCookies.classList.remove('active-filter');
                getCurrentDomainCookies.style.background = '';
            }
        });
    }

    const backToTopCookiesBtn = document.getElementById('backToTopCookiesBtn');
    if (backToTopCookiesBtn) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            if (scrollTop > 200) {
                backToTopCookiesBtn.classList.remove('hidden');
            } else {
                backToTopCookiesBtn.classList.add('hidden');
            }
        });

        backToTopCookiesBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    renderWhitelist();
    loadCookies();
}
