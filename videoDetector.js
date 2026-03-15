(function() {
    let videoDetectionEnabled = false;

    // Vô hiệu hóa Privacy Sandbox (Topics API, v.v.) để tránh lỗi Console và tăng bảo mật
    try {
        if (typeof document.browsingTopics === 'function') {
            document.browsingTopics = () => Promise.resolve([]);
        }
        // Vô hiệu hóa Shared Storage and Attribution Reporting if possible
        if (typeof window.attributionReporting === 'object') {
            delete window.attributionReporting;
        }
    } catch (e) {}

    // Lấy cài đặt ban đầu
    chrome.storage.local.get(['appSettings'], (result) => {
        const settings = result.appSettings || {};
        videoDetectionEnabled = settings.videoDownloaderEnabled || false;
        
        // Luôn báo cáo URL hiện tại để đồng bộ thanh địa chỉ Privacy Player
        reportNavigation();

        if (videoDetectionEnabled) {
            scanForVideos();
            startObserver();
        }

        // Kiểm tra xem có đang ở trong Privacy Player không
        if (window.location.href.includes('privacy_player.html')) {
            chrome.runtime.sendMessage({ type: 'setPrivacyPlayerTabId' });
            setupLinkInterception(settings);
        }
    });

    function setupLinkInterception(settings) {
        if (settings.linkClickBehavior !== 'player' && settings.linkClickBehavior !== 'block') return;

        // TIÊM SCRIPT VÀO MAIN WORLD ĐỂ HOOK WINDOW.OPEN VÀ CLICK TRỰC TIẾP
        const script = document.createElement('script');
        script.textContent = `
            (function() {
                const behavior = '${settings.linkClickBehavior}';
                const origin = window.location.origin;
                const url = window.location.href;

                // 0. Kiểm tra an toàn: Nếu là trang Cloudflare, hcaptcha hoặc bot-check
                const isSecurityPage = 
                    url.includes('cloudflare.com') || 
                    url.includes('hcaptcha.com') || 
                    url.includes('turnstile') ||
                    url.includes('__cf_chl_tk') ||
                    document.getElementById('cf-turnstile-response') ||
                    document.querySelector('.ch-title-zone') ||
                    window._cf_chl_opt;

                if (isSecurityPage) {
                    console.log('[Privacy Player] Bot verification detected, disabling AdBlock to allow verification');
                    return;
                }
                
                // 1. Hook window.open (Bắt quảng cáo popup bằng JS)
                const originalOpen = window.open;
                window.open = function(url, target, features) {
                    // console.log('[Privacy Player] Intercepted window.open:', url);
                    
                    // Kiểm tra URL đáng ngờ (quảng cáo popunder)
                    const isSuspicious = url && typeof url === 'string' && (
                        url.includes('tsyndicate') || 
                        url.includes('tsyndicads') ||
                        url.includes('/pop?') || 
                        url.includes('adserver') ||
                        url.includes('trafficstars') ||
                        url.includes('exoclick') ||
                        (url.includes('missav') && url.includes('ad')) ||
                        (!url.startsWith('about:') && !url.startsWith(origin) && !url.startsWith('http'))
                    );

                    if (isSuspicious || behavior === 'block') {
                        console.log('[Privacy Player] Blocked suspicious/all popup:', url);
                        return null;
                    }

                    if (behavior === 'player' && url && !url.startsWith('about:') && !url.startsWith(origin)) {
                        // Gửi URL về iframe cha (Privacy Player)
                        window.parent.postMessage({ type: 'loadUrlInPlayer', url: url }, '*');
                        return null;
                    }
                    
                    return originalOpen.apply(this, arguments);
                };

                // 2. Hook click (Bắt các thẻ <a> có target="_blank" hoặc click nặc danh)
                document.addEventListener('click', (e) => {
                    const link = e.target.closest('a');
                    
                    // Chặn click nặc danh vào body/document (kỹ thuật mở popunder)
                    if (!link && !e.target.closest('button, video, input, [role="button"], label, summary, .btn, .button, .cf-turnstile')) {
                        // Kiểm tra xem đây có phải click của người dùng thật không (isTrusted)
                        if (!e.isTrusted) return;

                        console.log('[Privacy Player] Blocked document-level click popunder attempt');
                        e.stopPropagation();
                        e.preventDefault();
                        return;
                    }

                    if (link && link.href && !link.href.startsWith('javascript:')) {
                        const target = link.getAttribute('target');
                        const isExternal = !link.href.startsWith(origin) && link.href.startsWith('http');

                        if (target === '_blank' || e.ctrlKey || e.metaKey || isExternal) {
                            if (behavior === 'player') {
                                e.preventDefault();
                                e.stopPropagation();
                                window.parent.postMessage({ type: 'loadUrlInPlayer', url: link.href }, '*');
                            } else if (behavior === 'block') {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('[Privacy Player] Blocked link click:', link.href);
                            }
                        }
                    }
                }, true); // Capture phase để chặn sớm nhất

                // 4. Triệt tiêu các sự kiện popup đặc thù (Dựa trên MissAV AdBlocker)
                function neutralizePopups() {
                    // Nếu là trang bảo mật, không can thiệp DOM nữa
                    if (window._cf_chl_opt || document.getElementById('cf-turnstile-response')) return;

                    const popElements = document.querySelectorAll('[\\\\@click*="pop()"], [\\\\@keyup.space.window*="pop()"]');
                    popElements.forEach(el => {
                        el.removeAttribute('@click');
                        el.removeAttribute('@keyup.space.window');
                        el.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }, true);
                    });

                    if (typeof window.pop === 'function') {
                        window.pop = function() { return false; };
                    }

                    // 5. Chặn popunder bằng cách override beforeunload (ngăn redirect chain)
                    window.addEventListener('beforeunload', function(e) {
                        if (document.referrer.includes('tsyndicate') || location.href.includes('/pop?url=')) {
                            e.preventDefault();
                            e.returnValue = '';
                        }
                    });
                }

                neutralizePopups();
                const observer = new MutationObserver(neutralizePopups);
                observer.observe(document.documentElement, { childList: true, subtree: true });
            })();
        `;
        (document.head || document.documentElement).appendChild(script);
        script.remove();
    }

    // Theo dõi thay đổi URL trong SPA (YouTube, v.v.)
    window.addEventListener('popstate', reportNavigation);
    window.addEventListener('hashchange', reportNavigation);
    // Hook vào pushState để bắt kịp các thay đổi URL ngay lập tức
    const originalPushState = history.pushState;
    history.pushState = function() {
        originalPushState.apply(this, arguments);
        reportNavigation();
    };

    /**
     * Báo cáo URL hiện tại của frame
     */
    function reportNavigation() {
        // Kiểm tra chrome.runtime và chrome.runtime.id để tránh lỗi context invalidated
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id && window.parent === window.top) {
            chrome.runtime.sendMessage({
                type: 'pageNavigatedInFrame',
                url: window.location.href,
                title: document.title
            }).catch(() => {});
        }
    }

    // Lắng nghe thay đổi cài đặt
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === 'local' && changes.appSettings) {
                const newSettings = changes.appSettings.newValue || {};
                videoDetectionEnabled = newSettings.videoDownloaderEnabled || false;
                if (videoDetectionEnabled) {
                    scanForVideos();
                    startObserver();
                } else if (observer) {
                    observer.disconnect();
                }
            }
        });
    }

    /**
     * Quét các thẻ video hiện có
     */
    function scanForVideos() {
        if (!videoDetectionEnabled) return;

        const videos = document.querySelectorAll('video');
        videos.forEach((video, index) => {
            processVideoElement(video, `Auto Video #${index + 1}`);
        });

        // Hỗ trợ JW Player và các trình phát khác qua iframes
        if (window.jwplayer) {
            try {
                for (let i = 0; i < 10; i++) {
                    const player = window.jwplayer(i);
                    if (player && player.getPlaylist) {
                        const playlist = player.getPlaylist();
                        if (playlist && playlist[0] && playlist[0].sources) {
                            playlist[0].sources.forEach((source, si) => {
                                reportVideo(source.file, source.type || 'JWPlayer Stream', `JWPlayer Video #${i+1}`);
                            });
                        }
                    }
                }
            } catch (e) {}
        }

        function scanTelegramStreamVideos_ADDITION() {
            // Telegram Web dùng src dạng: stream/{JSON encoded}
            // Cần resolve relative URL thành absolute
            const allVideos = document.querySelectorAll('video[src]');
            allVideos.forEach((video, idx) => {
                const rawSrc = video.src; // Đã được browser resolve thành absolute
                // Kiểm tra nếu là Telegram stream URL
                if (rawSrc && (rawSrc.includes('/stream/') || rawSrc.includes('stream/%7B'))) {
                    try {
                        // Decode URL để lấy JSON metadata
                        const encoded = rawSrc.split('/stream/')[1];
                        const meta = JSON.parse(decodeURIComponent(encoded));
                        const name = meta.fileName || document.title || `Telegram Video ${idx+1}`;
                        const thumb = video.poster || '';
                        // Báo cáo với full absolute URL
                        reportVideo(rawSrc, 'Telegram Stream', name, false, thumb);
                    } catch(e) {
                        // Báo cáo bình thường nếu parse thất bại
                        processVideoElement(video, `Telegram Video #${idx+1}`);
                    }
                }
            });
        }
    }

    /**
     * Xử lý một thẻ video cụ thể
     */
    function processVideoElement(video, defaultName) {
        const src = video.src || video.currentSrc;
        if (src) {
            const isBlob = src.startsWith('blob:');
            const type = isBlob ? 'Blob/HLS Stream' : 'HTML5 Video';
            
            // Lấy tên phim từ title của trang hoặc thuộc tính title của video
            let name = video.title || document.title || defaultName;
            if (name.includes(' - ')) name = name.split(' - ')[0]; // Rút gọn tên nếu có " - "
            
            const thumb = video.poster || ''; // Lấy ảnh đại diện của video nếu có

            reportVideo(src, type, name, isBlob, thumb);
        }

        // Kiểm tra các thẻ <source> bên trong
        video.querySelectorAll('source').forEach((s, si) => {
            if (s.src) {
                const name = document.title || `Source #${si + 1}`;
                reportVideo(s.src, 'Video Source', name, false, video.poster || '');
            }
        });
    }

    /**
     * Gửi thông tin video về background
     */
    function reportVideo(url, type, filename, isBlob = false, thumb = '') {
        if (!url || url.startsWith('data:')) return;

        // Kiểm tra Extension Context trước khi gửi tin nhắn
        if (!chrome.runtime?.id) {
            console.warn('[VideoDetector] Extension context invalidated. Skipping report.');
            return;
        }

        chrome.runtime.sendMessage({
            type: 'newVideoDetectedFromContent',
            video: {
                url: url,
                type: type,
                filename: filename,
                size: isBlob ? 'Streaming Data' : 'Detected',
                isBlob: isBlob,
                baseURI: document.baseURI,
                thumbnail: thumb,
                // Báo cáo URL hiện tại của frame để hỗ trợ đồng bộ thanh địa chỉ
                currentFrameUrl: window.location.href
            }
        }).catch(() => {
            // Im lặng nếu context bị hủy
        });
    }

    let observer = null;
    function startObserver() {
        if (observer) return;

        // Đảm bảo document.body đã sẵn sàng
        if (!document.body) {
            window.addEventListener('DOMContentLoaded', startObserver);
            return;
        }

        observer = new MutationObserver((mutations) => {
            if (!videoDetectionEnabled) return;
            
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeName === 'VIDEO') {
                        processVideoElement(node, 'New Video');
                    } else if (node.querySelectorAll) {
                        node.querySelectorAll('video').forEach((v, idx) => {
                            processVideoElement(v, `New Video #${idx + 1}`);
                        });
                    }
                });

                // Theo dõi sự thay đổi thuộc tính src (quan trọng cho blob)
                if (mutation.type === 'attributes' && mutation.attributeName === 'src' && mutation.target.nodeName === 'VIDEO') {
                    processVideoElement(mutation.target, 'Updated Video');
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src']
        });
    }
})();
