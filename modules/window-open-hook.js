// modules/window-open-hook.js
// This script runs in the MAIN world to securely hook window.open without triggering CSP violations.

(function() {
    // Only apply the hook if we are inside a Privacy Player iframe
    const isExtensionFrame = location.ancestorOrigins && location.ancestorOrigins.length > 0 && Array.from(location.ancestorOrigins).some(origin => origin.startsWith('chrome-extension://'));
    if (window.self === window.top || !isExtensionFrame) return;

    const origin = window.location.origin;
    const url = window.location.href;

    // Safe pages (cloudflare, etc.) shouldn't be hooked aggressively
    const isSecurityPage = 
        url.includes('cloudflare.com') || 
        url.includes('hcaptcha.com') || 
        url.includes('google.com') ||
        url.includes('turnstile') ||
        document.getElementById('cf-turnstile-response') ||
        window._cf_chl_opt;
    if (isSecurityPage) return;

    const originalOpen = window.open;
    window.open = function(targetUrl, target, features) {
        if (!targetUrl || typeof targetUrl !== 'string') {
            return originalOpen.apply(this, arguments);
        }

        // Suspicious ad popunders
        const isSuspicious = (
            targetUrl.includes('tsyndicate') || 
            targetUrl.includes('tsyndicads') ||
            targetUrl.includes('/pop?') || 
            targetUrl.includes('adserver') ||
            targetUrl.includes('trafficstars') ||
            targetUrl.includes('exoclick')
        );
        if (isSuspicious) {
            console.log('[Privacy Player] Blocked suspicious popup:', targetUrl);
            return null;
        }

        // Forward to content script via postMessage
        window.postMessage({ type: 'WINDOW_OPEN_ATTEMPT', url: targetUrl }, '*');
        return null;
    };
})();
