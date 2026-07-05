# Tài liệu Phân tích Kiến trúc và Thuật toán: Privacy & Cookies Manager Extension

## 1. Tổng quan Kiến trúc (Architecture Overview)

**Privacy & Cookies Manager** là một tiện ích mở rộng (web extension) dành cho trình duyệt sử dụng Manifest V3 (MV3). Mục tiêu chính của extension này là quản lý quyền riêng tư, quản lý cookie, theo dõi (tracking) và bảo vệ dữ liệu người dùng.

### Các thành phần chính:
- **`manifest.json`**: Khai báo quyền (permissions) rất rộng bao gồm `cookies`, `tabs`, `storage`, `webRequest`, `declarativeNetRequest`, và quyền truy cập vào mọi URL (`<all_urls>`).
- **`background.js` (Service Worker)**: Trái tim của extension, xử lý các sự kiện ngầm như tạo Context Menus, quản lý trạng thái các tab, theo dõi network request (để phát hiện video/tracker), đóng/mở tab (hibernation), và tự động xóa cookie.
- **`popup.html` & `popup.js`**: Giao diện người dùng chính (hoạt động như một Side Panel hoặc Popup), nơi người dùng xem cookie, thay đổi cài đặt, quản lý phiên (session), và xem danh sách tracker/video.
- **Thư mục `modules/`**: Cấu trúc mã nguồn UI được chia nhỏ thành các module chức năng (ES6 modules) như `cookies.js`, `settings.js`, `dashboard.js`, `spoof.js`, `player.js`,...
- **Content Scripts (`iframe_content_script.js`, `telegram_content.js`, `videoDetector.js`, `modules/spoof.js`)**: Các script được nhúng trực tiếp vào trang web để lấy dữ liệu, chặn các hành vi, hoặc thay đổi (spoof) các API của trình duyệt.
- **Declarative Net Request (`rules.json`)**: Chứa các quy tắc chặn quảng cáo (Adblock) ở cấp độ mạng, tận dụng engine MV3.

---

## 2. Các tính năng chính và Thuật toán hoạt động

### 2.1. Quản lý và Tiêu hủy Cookie (Cookie Management & Auto-Destroyer)
- **Quản lý thủ công (`cookies.js`)**: Cho phép lấy toàn bộ cookie của trình duyệt bằng `chrome.cookies.getAll`, nhóm chúng theo Domain, hiển thị trên UI. Người dùng có thể sao chép, dán (import/export), và xóa từng cookie hoặc toàn bộ.
- **Thuật toán Auto Cookie Destroyer (`background.js`)**: 
  - Extension theo dõi sự kiện đóng tab `chrome.tabs.onRemoved`.
  - Khi một tab bị đóng, nó kiểm tra URL cuối cùng của tab đó thông qua state in-memory `tabUrls`.
  - Nếu tính năng "Auto-Cookie Destroyer" được bật và domain của tab **không nằm trong danh sách trắng (Whitelist)**, thuật toán sẽ gọi API lấy toàn bộ cookie của domain đó và tiến hành xóa sạch (gọi `chrome.cookies.remove` cho từng cookie).

### 2.2. Chống nhận diện trình duyệt (Anti-Fingerprinting / Spoofing)
- **Module `spoof.js`** được nhúng vào tất cả các trang web (`<all_urls>`) thông qua `web_accessible_resources` hoặc content script.
- **Thuật toán Spoofing:**
  - **Canvas Spoofing**: Ghi đè phương thức `getImageData` của `CanvasRenderingContext2D`. Thuật toán thêm nhiễu (noise) siêu nhỏ: với mỗi pixel ảnh (R, G, B), nó cộng hoặc trừ đi `1` dựa trên một hàm random giả (pseudo-random) sinh ra từ giá trị mã ASCII của chuỗi tên miền (domain). Điều này khiến mã băm (hash) của canvas thay đổi trên mỗi thiết bị nhưng ổn định trên cùng một domain.
  - **WebGL Spoofing**: Ghi đè phương thức `getParameter` của `WebGLRenderingContext` và `WebGL2RenderingContext` để giả mạo thông tin Card đồ họa (Vendor và Renderer) thành `Google Inc. (Intel)` và `ANGLE (Intel...)`.
  - **Audio Spoofing**: Ghi đè `getChannelData` của `AudioBuffer` để chèn thêm tín hiệu nhiễu cực nhỏ `(pseudoRandom() - 0.5) * 1e-7` vào dữ liệu âm thanh, phá vỡ các kỹ thuật Audio Fingerprinting.
  - **Navigator Spoofing**: Sử dụng `Object.defineProperty` để ghi đè các thuộc tính phần cứng như `deviceMemory`, `hardwareConcurrency`, `platform`.

### 2.3. Phát hiện Video và Luồng dữ liệu (Video/Stream Detector)
- **Bắt qua URL (`webRequest.onBeforeRequest`)**: Lọc mọi yêu cầu mạng ngầm. Nếu URL chứa các đuôi file video phổ biến (`.mp4`, `.m3u8`, `.ts`, `.mpd`) hoặc chứa các từ khóa đặc trưng (như `googlevideo.com`), URL sẽ được lưu vào danh sách video phát hiện của tab đó.
- **Bắt qua Headers (`webRequest.onHeadersReceived`)**: Kiểm tra `Content-Type` của phản hồi trả về. Nếu là `video/*` hoặc các định dạng stream như `application/x-mpegurl`, nó sẽ phân tích thêm dung lượng qua `Content-Length`.
- **Telegram Stream Detector**: Bắt riêng các network request tới `web.telegram.org/stream/*`, sau đó giải mã JSON từ URI component để trích xuất tên file gốc và kích thước.

### 2.4. Tiết kiệm RAM (Tab Hibernation)
- **Thuật toán Hibernation**:
  - Mỗi khi người dùng chuyển đổi tab (`tabs.onActivated`), thời điểm đó được ghi lại bằng timestamp (lưu vào biến `tabLastActive[tabId]`).
  - Một `chrome.alarms` được thiết lập để chạy lặp lại mỗi phút (`hibernationCheck`).
  - Khi alarm kích hoạt, nó lướt qua toàn bộ các tab không ở trạng thái "active", tính toán thời gian `Now - tabLastActive`. Nếu vượt quá thời gian Timeout (ví dụ 30 phút), nó sẽ gọi `chrome.tabs.discard(tabId)` để giải phóng bộ nhớ (RAM) của tab đó mà không đóng hẳn tab.

### 2.5. Trình Quản lý Phiên (Session Management) & Privacy Player
- **Session Management**: Cho phép lưu trữ hàng loạt tab đang mở (đóng gói dưới dạng mảng JSON chứa các `url` và trạng thái `incognito`) vào `storage.local`. Khi người dùng muốn khôi phục, extension tạo lại các cửa sổ tương ứng (`chrome.windows.create`).
- **Privacy Player**: Khi người dùng muốn xem video một cách riêng tư, extension sẽ điều hướng video đó vào một iframe cách ly, hoặc tự động mở nó trong chế độ ẩn danh (Incognito Window) tuỳ vào cài đặt, đảm bảo không lưu lại lịch sử chính.

### 2.6. Theo dõi & Chặn Trình theo dõi (Tracker Management)
- Dựa vào danh sách đen tĩnh các tên miền tracker phổ biến (như `google-analytics.com`, `facebook.net`, `doubleclick.net`).
- Trong `background.js`, event `onBeforeRequest` sẽ đếm số lượng truy vấn tới các tên miền này và cập nhật bộ đếm TrackerCount lên giao diện Badge (`chrome.action.setBadgeText`) theo thời gian thực.
- Quy tắc Adblock mạnh mẽ được áp dụng song song thông qua `rules.json` (DNR - Declarative Net Request).

---

## 3. Rà soát & Đánh giá (Code Review & Assessment)

### Điểm mạnh:
1. **Kiến trúc MV3 Tiêu chuẩn**: Extension tuân thủ rất tốt Manifest V3, không sử dụng background pages liên tục mà chuyển sang service worker.
2. **Quản lý state thông minh**: Dữ liệu như `trackerCount`, `detectedVideos` được lưu trữ trên bộ nhớ đệm (in-memory) và liên tục đồng bộ xuống `chrome.storage.session`. Điều này giúp Service Worker khởi động lại mà không mất dữ liệu của các tab đang hoạt động.
3. **Thuật toán Spoofing sâu**: Việc can thiệp trực tiếp vào WebGL, Canvas và AudioBuffer ở mức độ Prototype là phương pháp vượt mặt Fingerprinting cực kỳ hiệu quả mà hiếm extension cơ bản nào làm chi tiết.

### Điểm cần lưu ý / Rủi ro:
1. **Hiệu suất (Performance)**: Các API ghi đè prototype (như Canvas `getImageData` và AudioBuffer `getChannelData`) phải chạy vòng lặp lặp qua từng phần tử (pixels hoặc byte). Với các tác vụ đồ họa nặng hoặc game trên web, việc này có thể gây giảm hiệu năng (frame drops) vì nó xảy ra trên luồng giao diện chính (main thread).
2. **Quyền riêng tư (Permissions)**: Extension yêu cầu một lượng quyền rất khổng lồ (`<all_urls>`, `webRequest`, `cookies`, `history`, v.v.). Mặc dù là tính năng cốt lõi, nhưng nếu bị tấn công chuỗi cung ứng, đây sẽ là rủi ro bảo mật lớn.
3. **Auto-Cleanup rủi ro**: Chức năng "Cookie Destroyer" dọn dẹp cookie ngay khi đóng tab. Tuy nhiên, nếu luồng đóng trình duyệt (tất cả các tab tắt cùng lúc) diễn ra, hệ thống sự kiện bất đồng bộ có thể sẽ không kịp xóa sạch do Service Worker bị đình chỉ.

**Kết luận:** Mã nguồn rất vững chắc, có cấu trúc module rõ ràng. Thuật toán xử lý Anti-tracking và Spoofing được đầu tư tỉ mỉ, phù hợp với định hướng phát triển công cụ về Quyền Riêng Tư (Privacy) sâu.
