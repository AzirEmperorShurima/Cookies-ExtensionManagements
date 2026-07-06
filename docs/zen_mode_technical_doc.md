# Zen Mode - Technical Documentation

Tài liệu này trình bày chi tiết về mặt kỹ thuật và kiến trúc code đằng sau tính năng phát âm thanh (Soundscapes bằng SoundCloud) và phát video (YouTube) trong chế độ Zen Mode.

## 1. Cơ chế phát nhạc SoundCloud (Soundscapes)

SoundCloud không hỗ trợ thư viện API chính thức hoạt động trơn tru bên trong một môi trường Extension (có origin là `chrome-extension://...`). Vì vậy, chúng ta phải can thiệp trực tiếp vào file API của họ (`soundcloud_api.js`) và nạp nó cục bộ.

### Sửa đổi API cục bộ (`soundcloud_api.js`)
Để tránh lỗi CORS (Cross-Origin) `Failed to execute 'postMessage' on 'DOMWindow'`, hàm gửi lệnh `postMessage` tới iframe của SoundCloud được can thiệp để đặt `targetOrigin` thành `*` thay vì domain cụ thể.

```javascript
// Trích xuất từ soundcloud_api.js đã được custom
function y(e,t,n){
    var r,o,i=v(n);
    if(!i.postMessage)return!1;
    r=n.getAttribute("src").split("?")[0],
    o=JSON.stringify({method:e,value:t}),
    "//"===r.substr(0,2)&&(r=window.location.protocol+r),
    r=r.replace(/http:\/\/(w|wt).soundcloud.com/,"https://$1.soundcloud.com"),
    
    // Sửa chữa cốt lõi: Gửi postMessage với targetOrigin là '*'
    i.postMessage(o,"*")
}
```

### Hàm khởi tạo SoundCloud Player (`playlist.js`)
Khi người dùng chọn một "Soundscape", ứng dụng gọi SC Widget API, truyền vào URL của bài nhạc và kích hoạt `scWidget.load()`. Đặc biệt lưu ý việc ép `scWidget.play()` chạy trong callback để vượt qua lỗi không tự phát.

```javascript
function initSoundCloudPlayer(url, title) {
    activeSourceType = 'sc';
    scIframe.style.display = 'block';
    
    if (!scWidget) {
        scWidget = SC.Widget(scIframe); // SC iframe element
        scWidget.bind(SC.Widget.Events.READY, () => {
            scWidget.setVolume(volumeSlider.value);
            scWidget.bind(SC.Widget.Events.PLAY, () => updatePlayPauseUI(true));
            scWidget.bind(SC.Widget.Events.PAUSE, () => updatePlayPauseUI(false));
            scWidget.bind(SC.Widget.Events.FINISH, () => playNext());
        });
    }
    
    scWidget.load(url, {
        auto_play: true,
        hide_related: true,
        show_comments: false,
        show_user: false,
        show_reposts: false,
        show_teaser: false,
        visual: true,
        callback: () => {
            scWidget.setVolume(volumeSlider.value);
            scWidget.play(); // Bắt buộc phát ngay khi load xong
        }
    });
}
```

---

## 2. Cơ chế phát Video YouTube 

Youtube cực kỳ khắt khe với việc nhúng Video (đặc biệt là Music Video) bên ngoài nền tảng của họ. Lỗi 153 xảy ra vì domain `chrome-extension://` không nằm trong danh sách whitelist của chủ sở hữu video.

### Giải pháp Declarative Net Request (DNR) Spoofing
Để vượt mặt kiểm duyệt này, chúng ta sử dụng `chrome.declarativeNetRequest` ngay khi script khởi chạy để chèn động một luật (rule), thay đổi header `Referer` thành `https://www.youtube.com/`. Điều này đánh lừa iframe của YouTube rằng nó đang được load từ chính trang chủ Youtube.

```javascript
// Nằm ở đầu file playlist.js
if (chrome.declarativeNetRequest) {
    chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [9999],
        addRules: [{
            id: 9999,
            priority: 1,
            action: {
                type: "modifyHeaders",
                requestHeaders: [
                    { header: "Referer", operation: "set", value: "https://www.youtube.com/" }
                ]
            },
            condition: {
                urlFilter: "||youtube.com/embed/*",
                resourceTypes: ["sub_frame"]
            }
        }]
    }).catch(e => console.error("DNR rule error:", e));
}
```

### Class YoutubePostMessagePlayer (`playlist.js`)
Vì Chrome Extension sử dụng CSP chặt chẽ, việc nạp Youtube Iframe API (`https://www.youtube.com/iframe_api`) từ bên thứ 3 có thể bị chặn. Vì thế, một class tùy chỉnh được viết để trực tiếp nói chuyện với YouTube IFrame thông qua `postMessage`.

```javascript
class YoutubePostMessagePlayer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.iframe = document.createElement('iframe');
        this.iframe.style.width = '100%';
        this.iframe.style.height = '100%';
        this.iframe.style.border = 'none';
        this.iframe.allow = 'autoplay';
        this.container.appendChild(this.iframe);
        this.volume = 50;

        // Lắng nghe sự kiện từ Youtube iframe trả về
        window.addEventListener('message', (e) => {
            // Hỗ trợ cả youtube.com và youtube-nocookie.com
            if (e.origin !== 'https://www.youtube.com' && e.origin !== 'https://www.youtube-nocookie.com') return;
            try {
                const data = JSON.parse(e.data);
                if (data.event === 'onStateChange') {
                    if (data.info === 1) updatePlayPauseUI(true); // Đang phát
                    else if (data.info === 2) updatePlayPauseUI(false); // Tạm dừng
                    else if (data.info === 0) playNext(); // Đã hết
                } else if (data.event === 'initialDelivery') {
                    // Sẵn sàng
                    this.setVolume(this.volume);
                    this.playVideo();
                }
            } catch (err) {}
        });
    }
    
    // Sinh URL kèm enablejsapi và origin
    loadVideoById(videoId) {
        const origin = encodeURIComponent(window.location.origin || 'chrome-extension://' + chrome.runtime.id);
        this.iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&autoplay=1&controls=1&origin=${origin}`;
    }
    
    // Gửi lệnh điều khiển sang IFrame
    playVideo() {
        if (this.iframe.contentWindow) {
            this.iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'playVideo'}), '*');
        }
    }
    
    pauseVideo() {
        if (this.iframe.contentWindow) {
            this.iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'pauseVideo'}), '*');
        }
    }
    
    setVolume(vol) {
        this.volume = vol;
        if (this.iframe.contentWindow) {
            this.iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'setVolume', args: [vol]}), '*');
        }
    }
}
```

---

## 3. Kiến trúc HTML (`playlist.html`)
Ba nguồn phát nhạc (SoundCloud, YouTube, HTML5 Audio) được gộp chung trong một layout, và Javascript sẽ chịu trách nhiệm bật/tắt (ẩn/hiện) element tương ứng thông qua CSS `display: block` hoặc `display: none`.

```html
<div id="player-container">
    <div class="player-visualizer">
        <!-- Vùng chứa Youtube -->
        <div id="yt-widget-container" style="display: none; width: 100%; height: 100%;">
            <div id="yt-widget" style="width: 100%; height: 100%;"></div>
        </div>
        
        <!-- Vùng chứa SoundCloud -->
        <iframe id="sc-widget" style="display:block; width: 100%; height: 100%;" scrolling="no" frameborder="no" allow="autoplay" src="..."></iframe>
        
        <!-- Vùng chứa âm thanh nội bộ / trực tiếp -->
        <div id="html5-audio-container" class="audio-wave">
            <!-- Hiệu ứng sóng nhạc bằng CSS Bar -->
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <audio id="html5-audio" style="display: none;"></audio>
        </div>
    </div>
</div>
```
