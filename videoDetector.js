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
    });

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
        // Trong context của Extension Popup:
        // window.top là cửa sổ popup
        // window.parent là cửa sổ cha trực tiếp
        // Đối với trang web chính trong Privacy Player, window.parent === window.top
        // Đối với các iframe con (như quảng cáo), window.parent !== window.top
        if (window.parent === window.top) {
            chrome.runtime.sendMessage({
                type: 'pageNavigatedInFrame',
                url: window.location.href,
                title: document.title
            }).catch(() => {});
        }
    }

    // Lắng nghe thay đổi cài đặt
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
        }).catch(() => {});
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
