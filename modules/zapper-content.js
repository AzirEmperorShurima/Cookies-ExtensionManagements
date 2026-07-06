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
            #pm-zapper-banner {
                position: fixed !important;
                top: 20px !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                background: linear-gradient(135deg, #ff4757, #ff6b81) !important;
                color: white !important;
                padding: 12px 24px !important;
                border-radius: 30px !important;
                font-family: sans-serif !important;
                font-weight: bold !important;
                font-size: 14px !important;
                box-shadow: 0 4px 15px rgba(255, 71, 87, 0.4) !important;
                z-index: 2147483647 !important;
                pointer-events: none !important;
                animation: pm-pulse 2s infinite !important;
            }
            @keyframes pm-pulse {
                0% { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.7) !important; }
                70% { box-shadow: 0 0 0 10px rgba(255, 71, 87, 0) !important; }
                100% { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0) !important; }
            }
        `;
        document.head.appendChild(style);
        
        // Add Banner
        const banner = document.createElement('div');
        banner.id = 'pm-zapper-banner';
        
        const textSpan = document.createElement('span');
        textSpan.innerText = 'Zapper Mode Active: Click element to Zap, Press ESC to Cancel ';
        banner.appendChild(textSpan);
        
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&#10006;'; // X character
        closeBtn.style.cssText = 'cursor:pointer; margin-left:10px; font-weight:bold; background:rgba(255,255,255,0.2); padding:2px 6px; border-radius:50%; transition:background 0.2s;';
        closeBtn.title = 'Thoát Zapper';
        closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(255,255,255,0.4)';
        closeBtn.onmouseout = () => closeBtn.style.background = 'rgba(255,255,255,0.2)';
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            e.preventDefault();
            exitZapper();
        };
        
        banner.appendChild(closeBtn);
        document.documentElement.appendChild(banner);
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

    function onKeyDown(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            exitZapper();
        }
    }

    function exitZapper() {
        document.removeEventListener('mouseover', onMouseOver, true);
        document.removeEventListener('mouseout', onMouseOut, true);
        document.removeEventListener('click', onClick, true);
        document.removeEventListener('keydown', onKeyDown, true);
        
        // Remove style
        const style = document.getElementById(styleId);
        if (style) style.remove();
        
        const banner = document.getElementById('pm-zapper-banner');
        if (banner) banner.remove();
        
        if (currentTarget) currentTarget.classList.remove('pm-zapper-highlight');
        window._zapperActive = false;
        
        // Notify background that we exited
        chrome.runtime.sendMessage({ type: 'ZAP_EXITED' });
    }

    // Attach events in capture phase
    document.addEventListener('mouseover', onMouseOver, true);
    document.addEventListener('mouseout', onMouseOut, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeyDown, true);
})();
