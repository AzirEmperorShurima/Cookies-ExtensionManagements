// iframe_content_script.js
// This script runs inside all frames and handles Privacy Player navigation.

// Only run this script if it's inside an iframe (not the top-level document)
if (window.self !== window.top) {
    let settings = {
        playerLinkBehavior: 'inside' // Default
    };

    // Fetch extension settings from storage
    chrome.storage.local.get(['appSettings'], (result) => {
        if (result.appSettings) {
            settings.playerLinkBehavior = result.appSettings.playerLinkBehavior || 'inside';
        }
    });

    // Listen for setting changes
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local' && changes.appSettings) {
            settings.playerLinkBehavior = changes.appSettings.newValue.playerLinkBehavior || 'inside';
        }
    });

    document.addEventListener('click', (event) => {
        // If link behavior is 'newTab', we don't need to intercept
        if (settings.playerLinkBehavior === 'newTab') return;

        let target = event.target;

        // Traverse up the DOM tree to find an anchor tag
        while (target && target !== document) {
            if (target.tagName === 'A' && target.href) {
                // If it's a mailto or other non-http link, let it be
                if (!target.href.startsWith('http')) return;

                // Always force internal navigation if link behavior is 'inside'
                event.preventDefault();
                event.stopPropagation();

                try {
                    // Resolve relative URLs to absolute URLs
                    const absoluteUrl = new URL(target.href, window.location.href).toString();
                    
                    // Update the iframe's location to load the new URL
                    window.location.href = absoluteUrl;
                } catch (e) {
                    console.error('Privacy Player: Failed to navigate to URL:', target.href, e);
                    window.location.href = target.href; // Fallback
                }
                return; // Stop processing after handling the link click
            }
            target = target.parentNode;
        }
    }, true); // Use capture phase to ensure we catch clicks before they are handled by page scripts
}
