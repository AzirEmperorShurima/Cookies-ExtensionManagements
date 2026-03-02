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

    // Theater Mode Logic
    let isTheaterMode = false;
    let originalStyles = new Map();

    // Listen for messages from the extension popup or background
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'toggleTheaterMode') {
            toggleTheaterMode();
            sendResponse({ success: true, isTheaterMode });
        } else if (message.type === 'togglePip') {
            togglePip();
            sendResponse({ success: true });
        }
        return true; // Keep message channel open for async response
    });

    // Also listen for postMessage (for direct communication from popup iframe)
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'toggleTheaterMode') {
            toggleTheaterMode();
        } else if (event.data && event.data.type === 'togglePip') {
            togglePip();
        }
    });

    function togglePip() {
        const video = document.querySelector('video');
        if (!video) {
            console.log('Privacy Player: No video element found for PiP.');
            return;
        }

        if (document.pictureInPictureElement) {
            document.exitPictureInPicture();
        } else {
            if (document.pictureInPictureEnabled) {
                video.requestPictureInPicture().catch(error => {
                    console.error('Privacy Player: PiP failed', error);
                });
            }
        }
    }

    function toggleTheaterMode() {
        const video = findBestVideo();
        if (!video) {
            console.log('Privacy Player: No video found to expand.');
            return;
        }

        isTheaterMode = !isTheaterMode;

        if (isTheaterMode) {
            applyTheaterMode(video);
        } else {
            removeTheaterMode(video);
        }
    }

    function findBestVideo() {
        // 1. Specific Site Selectors (targeting the full player container)
        const sitePlayers = [
            '.html5-video-player', // YouTube Full Player
            '#movie_player',       // YouTube ID
            '.vimeo-video-player', // Vimeo
            '.jwplayer',           // JW Player
            '.vjs-tech',           // Video.js
            '.video-js',           // Video.js Container
            '.vjs-tech',           // Video.js internal
            '.plyr',               // Plyr
            '.mejs-container',     // MediaElement.js
            '.bitmovinplayer-container', // Bitmovin
            '.flowplayer',         // Flowplayer
            '.dplayer',            // DPlayer
            '.artplayer-container', // ArtPlayer
            '.video-player',       // Generic
            '#video-player',       // Generic ID
            '.player-wrapper',     // Generic
            '.video-container'     // Generic
        ];

        for (const selector of sitePlayers) {
            const el = document.querySelector(selector);
            if (el && el.offsetHeight > 100) return el;
        }

        // 2. Find the largest visible video element or iframe with video-like properties
        const mediaElements = Array.from(document.querySelectorAll('video, iframe')).filter(el => {
            const rect = el.getBoundingClientRect();
            const isVisible = rect.width > 50 && rect.height > 50 && window.getComputedStyle(el).display !== 'none';
            
            if (!isVisible) return false;
            
            if (el.tagName === 'IFRAME') {
                // If it's an iframe, check if it's likely a player
                const src = (el.src || '').toLowerCase();
                const isEmbed = src.includes('embed') || src.includes('player') || src.includes('stream') || src.includes('video');
                const hasFullScreen = el.hasAttribute('allowfullscreen') || el.hasAttribute('webkitallowfullscreen') || el.hasAttribute('mozallowfullscreen');
                return isEmbed || hasFullScreen;
            }
            
            return true;
        });

        if (mediaElements.length > 0) {
            // Pick the largest one
            const bestMedia = mediaElements.reduce((prev, curr) => {
                const prevArea = prev.offsetWidth * prev.offsetHeight;
                const currArea = curr.offsetWidth * curr.offsetHeight;
                return currArea > prevArea ? curr : prev;
            });

            // Check if it's wrapped in a player container that we should target instead
            let parent = bestMedia.parentElement;
            let depth = 0;
            while (parent && depth < 10 && parent !== document.body) {
                const className = (parent.className || '').toString().toLowerCase();
                const id = (parent.id || '').toString().toLowerCase();
                
                if (className.includes('player') || 
                    className.includes('video-container') ||
                    className.includes('movie') ||
                    className.includes('video-wrapper') ||
                    id.includes('player') ||
                    id.includes('video')) {
                    return parent;
                }
                parent = parent.parentElement;
                depth++;
            }
            return bestMedia;
        }

        // 3. Iframe Embeds (fallback with specific patterns)
        const embeds = [
            'iframe[src*="youtube.com/embed"]',
            'iframe[src*="vimeo.com"]',
            'iframe[src*="dailymotion.com"]',
            'iframe[src*="twitch.tv"]',
            'iframe[src*="facebook.com/plugins/video"]',
            'iframe[src*="vlstream.net"]',
            'iframe[src*="ok.ru/videoembed"]'
        ];
        for (const selector of embeds) {
            const el = document.querySelector(selector);
            if (el) return el;
        }

        return null;
    }

    function applyTheaterMode(video) {
        // Create style element for theater mode
        let style = document.getElementById('privacy-player-theater-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'privacy-player-theater-style';
            document.head.appendChild(style);
        }

        // 1. Hide all body children that don't contain our video
        let topParent = video;
        while (topParent.parentElement && topParent.parentElement.tagName !== 'BODY') {
            topParent = topParent.parentElement;
        }

        const bodyChildren = Array.from(document.body.children);
        bodyChildren.forEach(child => {
            if (child !== topParent && 
                !['SCRIPT', 'STYLE', 'LINK'].includes(child.tagName) && 
                child.id !== 'privacy-player-theater-style') {
                const currentDisplay = window.getComputedStyle(child).display;
                if (currentDisplay !== 'none') {
                    originalStyles.set(child, child.style.display);
                    child.style.setProperty('display', 'none', 'important');
                }
            }
        });

        // 2. Force all parents to show and fill screen
        let parent = video.parentElement;
        while (parent && parent !== document.body) {
            parent.classList.add('privacy-player-target-parent');
            parent = parent.parentElement;
        }

        // 3. Mark the video target
        video.classList.add('privacy-player-target');

        // 4. Force aggressive styles
        document.body.style.setProperty('background', 'black', 'important');
        document.body.style.setProperty('overflow', 'hidden', 'important');
        document.documentElement.style.setProperty('background', 'black', 'important');
        document.documentElement.style.setProperty('overflow', 'hidden', 'important');

        style.textContent = `
            body, html { 
                margin: 0 !important; 
                padding: 0 !important; 
                width: 100vw !important; 
                height: 100vh !important; 
                background: black !important;
                overflow: hidden !important;
            }
            
            /* Universal Player Target */
            .privacy-player-target {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                max-width: none !important;
                max-height: none !important;
                z-index: 2147483647 !important;
                background: black !important;
                margin: 0 !important;
                padding: 0 !important;
                transform: none !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }

            /* Parents must not clip or hide the target */
            .privacy-player-target-parent {
                display: block !important;
                visibility: visible !important;
                position: static !important;
                width: 100% !important;
                height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                transform: none !important;
                overflow: visible !important;
                z-index: auto !important;
                opacity: 1 !important;
                clip: auto !important;
                clip-path: none !important;
            }

            /* Force all internal elements to not restrict size */
            .privacy-player-target *, .privacy-player-target video {
                max-width: none !important;
                max-height: none !important;
            }

            /* Generic Video Element inside the target */
            .privacy-player-target video, 
            video.privacy-player-target {
                width: 100% !important;
                height: 100% !important;
                top: 0 !important;
                left: 0 !important;
                object-fit: contain !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                background: black !important;
            }

            /* YouTube Specific Overrides */
            .html5-video-container, .html5-main-video {
                width: 100% !important;
                height: 100% !important;
                top: 0 !important;
                left: 0 !important;
            }
            .ytp-chrome-top, .ytp-gradient-top, .ytp-pause-overlay, .ytp-ce-element { 
                display: none !important; 
            }

            /* Fix for players with aspect-ratio containers */
            [style*="padding-top"], [style*="padding-bottom"] {
                padding-top: 0 !important;
                padding-bottom: 0 !important;
            }
        `;
    }

    function removeTheaterMode(video) {
        const style = document.getElementById('privacy-player-theater-style');
        if (style) style.remove();

        if (video) {
            video.classList.remove('privacy-player-target');
            // Remove parent markers
            let parent = video.parentElement;
            while (parent && parent !== document.body) {
                parent.classList.remove('privacy-player-target-parent');
                parent = parent.parentElement;
            }
        }

        // Restore elements
        originalStyles.forEach((display, el) => {
            el.style.display = display;
        });
        originalStyles.clear();

        document.body.style.removeProperty('background');
        document.body.style.removeProperty('overflow');
        document.documentElement.style.removeProperty('background');
        document.documentElement.style.removeProperty('overflow');
    }
}
