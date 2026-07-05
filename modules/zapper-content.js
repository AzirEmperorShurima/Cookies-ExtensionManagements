// zapper-content.js
(function() {
    if (window._zapperActive) return; // Prevent multiple injections
    window._zapperActive = true;

    // Inject Zapper CSS
    const styleId = 'privacy-manager-zapper-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .pm-zapper-highlight {
                outline: 3px solid #ff4757 !important;
                background-color: rgba(255, 71, 87, 0.2) !important;
                cursor: crosshair !important;
                transition: outline 0.1s, background-color 0.1s;
            }
        `;
        document.head.appendChild(style);
    }

    let currentTarget = null;

    function getCssSelector(el) {
        if (!(el instanceof Element)) return;
        const path = [];
        while (el.nodeType === Node.ELEMENT_NODE) {
            let selector = el.nodeName.toLowerCase();
            if (el.id) {
                selector += '#' + el.id;
                path.unshift(selector);
                break;
            } else {
                let sib = el, nth = 1;
                while (sib = sib.previousElementSibling) {
                    if (sib.nodeName.toLowerCase() === selector) nth++;
                }
                if (nth !== 1) selector += ":nth-of-type(" + nth + ")";
            }
            path.unshift(selector);
            el = el.parentNode;
            // Stop at body to avoid overly long selectors
            if (el && el.nodeName.toLowerCase() === 'body') {
                path.unshift('body');
                break;
            }
        }
        return path.join(' > ');
    }

    function onMouseOver(e) {
        if (currentTarget) currentTarget.classList.remove('pm-zapper-highlight');
        currentTarget = e.target;
        currentTarget.classList.add('pm-zapper-highlight');
    }

    function onMouseOut(e) {
        if (currentTarget) currentTarget.classList.remove('pm-zapper-highlight');
        currentTarget = null;
    }

    function onClick(e) {
        e.preventDefault();
        e.stopPropagation();

        if (currentTarget) {
            currentTarget.classList.remove('pm-zapper-highlight');
            const selector = getCssSelector(currentTarget);
            
            // Immediately hide it for UX
            currentTarget.style.display = 'none';

            // Send to background to save
            chrome.runtime.sendMessage({
                type: 'ZAP_ELEMENT',
                selector: selector,
                domain: window.location.hostname
            });

            // Exit Zap Mode
            exitZapper();
        }
    }

    function exitZapper() {
        document.removeEventListener('mouseover', onMouseOver, true);
        document.removeEventListener('mouseout', onMouseOut, true);
        document.removeEventListener('click', onClick, true);
        
        // Remove style
        const style = document.getElementById(styleId);
        if (style) style.remove();
        
        if (currentTarget) currentTarget.classList.remove('pm-zapper-highlight');
        window._zapperActive = false;
        
        // Notify background that we exited
        chrome.runtime.sendMessage({ type: 'ZAP_EXITED' });
    }

    // Attach listeners in capture phase to ensure we intercept them
    document.addEventListener('mouseover', onMouseOver, true);
    document.addEventListener('mouseout', onMouseOut, true);
    document.addEventListener('click', onClick, true);
    
    // Allow pressing Escape to cancel
    document.addEventListener('keydown', function onKeyDown(e) {
        if (e.key === 'Escape') {
            document.removeEventListener('keydown', onKeyDown, true);
            exitZapper();
        }
    }, true);

})();
