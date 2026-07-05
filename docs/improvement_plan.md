# Tài liệu Cải thiện Kỹ thuật: Privacy & Cookies Manager Extension

> Tài liệu này bổ sung cho bản phân tích kiến trúc gốc, tập trung vào 3 hạng mục:
> 1. Chống phát hiện spoofing qua `Proxy` + giả `toString` native
> 2. Pattern queue-persist cho Auto Cookie Destroyer (chống mất dữ liệu khi Service Worker bị kill)
> 3. Module AdBlock mới (mở rộng từ `rules.json` tĩnh sang hệ thống linh hoạt hơn)

---

## 1. Proxy + Giả `toString` Native cho Anti-Fingerprinting

### 1.1. Vấn đề gốc

Khi override trực tiếp một hàm prototype (ví dụ `CanvasRenderingContext2D.prototype.getImageData = function(...) {...}`), hàm mới sẽ:
- Trả về source code thật khi gọi `Function.prototype.toString()`, thay vì chuỗi native code chuẩn.
- Đây là bước kiểm tra đầu tiên mà mọi thư viện fingerprinting (FingerprintJS, CreepJS...) thực hiện để phát hiện extension đang can thiệp.
- Ngoài ra, nếu trang web đã lưu tham chiếu hàm gốc **trước** khi script của bạn chạy, việc override sẽ vô nghĩa với trang đó.

### 1.2. Giải pháp: Proxy + `toString` giả + injection ở `document_start`, world `MAIN`

**File: `manifest.json`** (đăng ký content script đúng world và đúng thời điểm)

```json
{
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["modules/spoof-inject.js"],
      "run_at": "document_start",
      "world": "MAIN",
      "all_frames": true
    }
  ]
}
```

> Lưu ý: `"world": "MAIN"` chỉ hỗ trợ từ Chrome 111+. Đây là cách khai báo chuẩn MV3 để chạy trực tiếp trong ngữ cảnh JS của trang mà không cần `chrome.scripting.executeScript` với `world: "MAIN"` lúc runtime — cách khai báo tĩnh này đảm bảo script chạy **trước cả script đầu tiên của trang**, giải quyết vấn đề "trang lưu tham chiếu gốc trước".

**File: `modules/spoof-inject.js`**

```js
(function () {
  'use strict';

  // ============ 1. Helper: tạo hàm giả mạo "trông như native" ============
  function createNativeProxy(originalFn, handlerTraps, fakeName) {
    const proxy = new Proxy(originalFn, handlerTraps);

    // Giả toString trả về đúng format native code
    const toStringHandler = {
      apply(target, thisArg, args) {
        // Nếu đối tượng gọi toString chính là proxy của ta -> trả về chuỗi giả
        if (thisArg === proxy) {
          return `function ${fakeName || originalFn.name}() { [native code] }`;
        }
        return Reflect.apply(target, thisArg, args);
      }
    };

    // Ghi đè Function.prototype.toString MỘT LẦN DUY NHẤT ở scope global
    // (xem mục 1.3 - patchGlobalToString) thay vì patch riêng từng hàm,
    // để tránh việc nhiều lớp override chồng lên nhau bị lộ.
    registerSpoofedFunction(proxy, fakeName || originalFn.name);

    return proxy;
  }

  // ============ 2. Registry toàn cục cho toString ============
  const spoofRegistry = new WeakMap();

  function registerSpoofedFunction(proxyFn, fakeName) {
    spoofRegistry.set(proxyFn, `function ${fakeName}() { [native code] }`);
  }

  function patchGlobalToString() {
    const originalToString = Function.prototype.toString;

    const toStringProxy = new Proxy(originalToString, {
      apply(target, thisArg, args) {
        if (spoofRegistry.has(thisArg)) {
          return spoofRegistry.get(thisArg);
        }
        return Reflect.apply(target, thisArg, args);
      }
    });

    // Bản thân toStringProxy cũng phải "giả trang" chính nó
    spoofRegistry.set(toStringProxy, 'function toString() { [native code] }');

    Object.defineProperty(Function.prototype, 'toString', {
      value: toStringProxy,
      writable: true,
      configurable: true,
      enumerable: false
    });
  }

  patchGlobalToString();

  // ============ 3. Áp dụng cho Canvas getImageData ============
  function applyCanvasSpoof() {
    const proto = CanvasRenderingContext2D.prototype;
    const originalGetImageData = proto.getImageData;

    const noiseSeed = getOrCreateInstallSeed(); // xem mục 1.4

    const spoofedGetImageData = createNativeProxy(
      originalGetImageData,
      {
        apply(target, thisArg, args) {
          const imageData = Reflect.apply(target, thisArg, args);
          addCanvasNoise(imageData, noiseSeed, location.hostname);
          return imageData;
        }
      },
      'getImageData'
    );

    Object.defineProperty(proto, 'getImageData', {
      value: spoofedGetImageData,
      writable: true,
      configurable: true
    });
  }

  // ============ 4. Áp dụng cho WebGL getParameter ============
  function applyWebGLSpoof() {
    [WebGLRenderingContext, WebGL2RenderingContext].forEach((ctor) => {
      if (!ctor) return;
      const proto = ctor.prototype;
      const originalGetParameter = proto.getParameter;

      const spoofedGetParameter = createNativeProxy(
        originalGetParameter,
        {
          apply(target, thisArg, args) {
            const [param] = args;
            const spoofedValue = getSpoofedGPUValue(param, thisArg, target, args);
            if (spoofedValue !== undefined) return spoofedValue;
            return Reflect.apply(target, thisArg, args);
          }
        },
        'getParameter'
      );

      Object.defineProperty(proto, 'getParameter', {
        value: spoofedGetParameter,
        writable: true,
        configurable: true
      });
    });
  }

  // ============ 5. Chạy càng sớm càng tốt ============
  applyCanvasSpoof();
  applyWebGLSpoof();
  // applyAudioSpoof(), applyNavigatorSpoof() theo cùng pattern...

})();
```

### 1.3. Vì sao patch `Function.prototype.toString` toàn cục thay vì patch từng hàm?

Nếu mỗi hàm tự override `toString` riêng lẻ, script kiểm tra fingerprinting có thể phát hiện bất nhất: gọi `getImageData.toString.toString()` (tức lấy toString của chính hàm toString) sẽ lộ ra nó không phải hàm gốc. Bằng cách patch **một lần duy nhất** ở `Function.prototype.toString` và dùng `WeakMap` để tra cứu "hàm nào cần giả, giả thành gì", mọi lớp truy vấn (kể cả truy vấn đệ quy) đều nhất quán.

### 1.4. Seed ngẫu nhiên theo máy — vá lỗ hổng "noise có thể đảo ngược"

```js
// Chạy trong background service worker, không phải content script,
// vì cần chrome.storage (content script world MAIN không có quyền truy cập).
async function getOrCreateInstallSeed() {
  const { installSeed } = await chrome.storage.local.get('installSeed');
  if (installSeed) return installSeed;

  const newSeed = crypto.getRandomValues(new Uint32Array(4)).join('-');
  await chrome.storage.local.set({ installSeed: newSeed });
  return newSeed;
}
```

Sau đó truyền `installSeed` xuống content script qua `chrome.storage` (content script world MAIN đọc gián tiếp qua message passing với isolated-world content script, vì world MAIN không có `chrome.*` API):

```js
// isolated-world bridge script (content_scripts world mặc định, KHÔNG phải MAIN)
chrome.storage.local.get('installSeed', ({ installSeed }) => {
  window.postMessage({ type: '__PRIVACY_EXT_SEED__', seed: installSeed }, '*');
});
```

```js
// trong spoof-inject.js (world MAIN), nhận seed qua postMessage
let noiseSeed = null;
window.addEventListener('message', (e) => {
  if (e.source === window && e.data?.type === '__PRIVACY_EXT_SEED__') {
    noiseSeed = e.data.seed;
  }
});
```

> Công thức nhiễu nên là: `seed = hash(installSeed + domain)` — vừa khác nhau giữa các máy (chống đảo ngược hàng loạt), vừa ổn định trên cùng 1 domain + 1 máy (tránh gây lỗi hiển thị do canvas hash đổi liên tục).

---

## 2. Pattern Queue-Persist cho Auto Cookie Destroyer

### 2.1. Vấn đề gốc

Code hiện tại (suy đoán từ tài liệu):

```js
// ❌ Cách làm hiện tại - dễ mất dữ liệu khi SW bị kill giữa chừng
chrome.tabs.onRemoved.addListener(async (tabId) => {
  const url = tabUrls[tabId];
  if (!url || isWhitelisted(url)) return;

  const domain = new URL(url).hostname;
  const cookies = await chrome.cookies.getAll({ domain });
  for (const cookie of cookies) {
    await chrome.cookies.remove({ url, name: cookie.name });
  }
});
```

Nếu SW bị Chrome terminate giữa lúc đang `await` (ví dụ do đóng cả cửa sổ 10 tab cùng lúc, event loop bận), vòng lặp xóa cookie dừng nửa chừng, **không có cách nào biết được domain nào đã xóa xong, domain nào chưa**.

### 2.2. Giải pháp: Ghi ý định (intent) vào storage TRƯỚC khi thực thi

```js
// ============ Bước 1: Ghi nhận domain cần xóa NGAY khi tab đóng ============
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  const url = tabUrls[tabId];
  delete tabUrls[tabId];
  if (!url) return;

  const settings = await getSettings();
  if (!settings.autoCookieDestroyer) return;

  const domain = safeGetDomain(url); // dùng thư viện eTLD+1, không tự parse chuỗi
  if (!domain || isWhitelisted(domain, settings.whitelist)) return;

  await enqueuePendingDeletion(domain);
  // Sau khi ghi xong vào storage mới bắt đầu xử lý - nếu SW chết ngay đây,
  // dữ liệu "cần xóa domain X" vẫn còn nguyên trong storage.
  await processPendingDeletions();
});

// ============ Bước 2: Hàng đợi bền vững trong chrome.storage.local ============
const QUEUE_KEY = 'pendingCookieDeletions';

async function enqueuePendingDeletion(domain) {
  const { [QUEUE_KEY]: queue = {} } = await chrome.storage.local.get(QUEUE_KEY);
  queue[domain] = { queuedAt: Date.now(), status: 'pending' };
  await chrome.storage.local.set({ [QUEUE_KEY]: queue });
}

async function markDeletionDone(domain) {
  const { [QUEUE_KEY]: queue = {} } = await chrome.storage.local.get(QUEUE_KEY);
  delete queue[domain];
  await chrome.storage.local.set({ [QUEUE_KEY]: queue });
}

// ============ Bước 3: Xử lý hàng đợi (idempotent - chạy lại vô hại) ============
let isProcessing = false;

async function processPendingDeletions() {
  if (isProcessing) return; // tránh chạy chồng lấn
  isProcessing = true;

  try {
    const { [QUEUE_KEY]: queue = {} } = await chrome.storage.local.get(QUEUE_KEY);
    const domains = Object.keys(queue);
    if (domains.length === 0) return;

    // Giữ SW "sống" thêm trong lúc xử lý hàng loạt bằng alarm ping nhẹ
    await keepAlivePing();

    for (const domain of domains) {
      try {
        const cookies = await chrome.cookies.getAll({ domain });
        // Xóa từng cookie - dùng Promise.allSettled để 1 lỗi không chặn cả loạt
        await Promise.allSettled(
          cookies.map((cookie) =>
            chrome.cookies.remove({
              url: (cookie.secure ? 'https://' : 'http://') + cookie.domain.replace(/^\./, '') + cookie.path,
              name: cookie.name
            })
          )
        );
        // Chỉ đánh dấu "done" SAU KHI xóa xong - đây là điểm mấu chốt
        await markDeletionDone(domain);
      } catch (err) {
        console.error(`[CookieDestroyer] Lỗi khi xóa domain ${domain}:`, err);
        // Không markDone -> lần sau SW khởi động sẽ retry domain này
      }
    }
  } finally {
    isProcessing = false;
  }
}

// ============ Bước 4: Retry hàng đợi còn sót mỗi khi SW khởi động lại ============
// Đây là phần quan trọng nhất - "tự chữa lành" sau khi SW bị kill giữa chừng
chrome.runtime.onStartup.addListener(processPendingDeletions);
self.addEventListener('activate', processPendingDeletions); // SW lifecycle

// Đồng thời đặt alarm định kỳ để dọn nốt các domain bị "treo" quá lâu
chrome.alarms.create('retryPendingCookieDeletions', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'retryPendingCookieDeletions') {
    processPendingDeletions();
  }
});

// ============ Bước 5: Keepalive ping nhẹ trong lúc xử lý hàng loạt ============
function keepAlivePing() {
  return new Promise((resolve) => {
    // Gọi 1 API bất kỳ có callback để giữ event loop "bận" hợp lệ,
    // giảm khả năng Chrome coi SW là idle và terminate giữa chừng
    chrome.storage.local.get('__keepalive__', () => resolve());
  });
}
```

### 2.3. Xử lý riêng trường hợp "đóng cả cửa sổ" (nhiều tab cùng lúc)

```js
// Gom nhóm theo windowId thay vì xử lý tab đơn lẻ, giảm số lần race
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  const url = tabUrls[tabId];
  delete tabUrls[tabId];
  if (!url) return;

  if (removeInfo.isWindowClosing) {
    // Cả cửa sổ đang đóng - gom vào batch queue, xử lý 1 lần thay vì N lần
    await enqueuePendingDeletion(safeGetDomain(url));
    scheduleDebouncedBatchProcess(); // debounce ~500ms để gom hết các tab cùng window
  } else {
    await enqueuePendingDeletion(safeGetDomain(url));
    await processPendingDeletions();
  }
});

let batchTimer = null;
function scheduleDebouncedBatchProcess() {
  clearTimeout(batchTimer);
  batchTimer = setTimeout(processPendingDeletions, 500);
}
```

### 2.4. Domain matching đúng chuẩn (tránh lỗi whitelist eTLD+1)

```js
// KHÔNG dùng: url.hostname.includes(whitelistDomain) -> dễ match sai
// (ví dụ "evil-example.com" chứa "example.com")

// NÊN dùng thư viện chuẩn, ví dụ tldts hoặc parse-domain (bundle vào extension)
import { parse } from 'tldts';

function safeGetDomain(url) {
  const parsed = parse(url);
  return parsed.domain; // trả về eTLD+1 chuẩn, vd "example.co.uk"
}

function isWhitelisted(domain, whitelist) {
  return whitelist.some((w) => domain === w || domain.endsWith('.' + w));
}
```

---

## 3. Module AdBlock mới — mở rộng từ `rules.json` tĩnh

### 3.1. Giới hạn của cách làm hiện tại

`rules.json` tĩnh khai báo trong `manifest.json` (`declarative_net_request.rule_resources`) có các giới hạn:
- Chrome giới hạn **30.000 rule tĩnh** (static rules) và **5.000 rule động** (dynamic rules) cho session/enabled rules (số liệu có thể thay đổi theo phiên bản Chrome — cần kiểm tra `chrome.declarativeNetRequest.MAX_NUMBER_OF_DYNAMIC_AND_SESSION_RULES` tại runtime).
- Rule tĩnh chỉ cập nhật được khi **extension được update qua Store**, không thể refresh filter list theo thời gian thực như uBlock Origin.
- Không có cơ chế người dùng tự bật/tắt từng filter list (EasyList, EasyPrivacy, danh sách riêng theo vùng...).

### 3.2. Kiến trúc đề xuất: Hybrid Static + Dynamic Rules

```
modules/adblock/
├── adblock-manager.js       # Điều phối chính
├── filter-list-registry.js  # Danh sách các nguồn filter (EasyList, EasyPrivacy...)
├── filter-parser.js         # Convert filter list (ABP syntax) -> DNR rule JSON
├── rule-quota-manager.js    # Theo dõi & phân bổ quota rule động
└── custom-rules.js          # Rule tùy chỉnh do người dùng tự thêm
```

**`filter-list-registry.js`** — khai báo nguồn filter có thể cập nhật độc lập với bản extension:

```js
export const FILTER_SOURCES = [
  {
    id: 'easylist',
    name: 'EasyList (Ads)',
    url: 'https://easylist.to/easylist/easylist.txt',
    enabledByDefault: true,
    updateIntervalHours: 24
  },
  {
    id: 'easyprivacy',
    name: 'EasyPrivacy (Trackers)',
    url: 'https://easylist.to/easylist/easyprivacy.txt',
    enabledByDefault: true,
    updateIntervalHours: 24
  }
];
```

> Lưu ý quan trọng: việc fetch danh sách filter từ URL bên ngoài cần khai báo domain đó trong `host_permissions`, và Chrome Web Store có chính sách xét duyệt riêng cho hành vi tải rule động — nên đọc kỹ [chính sách CWS về Remote Code / DNR](https://developer.chrome.com/docs/webstore/program-policies/) trước khi submit, để tránh bị từ chối duyệt.

**`adblock-manager.js`** — cập nhật rule động theo lịch, tôn trọng quota:

```js
import { FILTER_SOURCES } from './filter-list-registry.js';
import { parseFilterListToDNRRules } from './filter-parser.js';

const DYNAMIC_RULE_ID_OFFSET = 100000; // tách vùng ID với custom-rules.js để tránh đụng độ

export async function updateFilterList(sourceId) {
  const source = FILTER_SOURCES.find((s) => s.id === sourceId);
  if (!source) throw new Error(`Không tìm thấy filter source: ${sourceId}`);

  const settings = await getAdblockSettings();
  if (!settings.enabledSources.includes(sourceId)) return;

  const response = await fetch(source.url);
  const rawText = await response.text();

  const newRules = parseFilterListToDNRRules(rawText, {
    idOffset: DYNAMIC_RULE_ID_OFFSET,
    sourceTag: sourceId
  });

  await applyRulesWithQuotaCheck(sourceId, newRules);
  await chrome.storage.local.set({
    [`filterListMeta:${sourceId}`]: { lastUpdated: Date.now(), ruleCount: newRules.length }
  });
}

async function applyRulesWithQuotaCheck(sourceId, newRules) {
  const maxRules = chrome.declarativeNetRequest.MAX_NUMBER_OF_DYNAMIC_AND_SESSION_RULES ?? 5000;

  if (newRules.length > maxRules) {
    console.warn(
      `[AdBlock] Filter "${sourceId}" có ${newRules.length} rule, vượt quota ${maxRules}. ` +
      `Sẽ ưu tiên giữ các rule quan trọng nhất (xem prioritizeRules).`
    );
    newRules = prioritizeRules(newRules, maxRules);
  }

  // Lấy các rule ID cũ thuộc source này để xóa trước khi thêm mới
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const oldIdsForSource = existingRules
    .filter((r) => r.id >= DYNAMIC_RULE_ID_OFFSET && r.id < DYNAMIC_RULE_ID_OFFSET + 100000)
    .map((r) => r.id);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: oldIdsForSource,
    addRules: newRules
  });
}

// Ưu tiên rule chặn domain phổ biến / high-confidence trước khi cắt bớt do vượt quota
function prioritizeRules(rules, maxRules) {
  return rules
    .sort((a, b) => (b.priority ?? 1) - (a.priority ?? 1))
    .slice(0, maxRules);
}

// Đặt lịch cập nhật filter list định kỳ
export function scheduleFilterListUpdates() {
  FILTER_SOURCES.forEach((source) => {
    chrome.alarms.create(`updateFilter:${source.id}`, {
      periodInMinutes: source.updateIntervalHours * 60
    });
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith('updateFilter:')) {
    const sourceId = alarm.name.replace('updateFilter:', '');
    updateFilterList(sourceId).catch((err) =>
      console.error(`[AdBlock] Lỗi cập nhật filter ${sourceId}:`, err)
    );
  }
});
```

**`filter-parser.js`** — chuyển filter list dạng ABP/uBO syntax sang DNR rule JSON (bản rút gọn, xử lý các pattern phổ biến nhất):

```js
export function parseFilterListToDNRRules(rawText, { idOffset, sourceTag }) {
  const lines = rawText.split('\n').filter((line) => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith('!') && !trimmed.startsWith('[');
  });

  const rules = [];
  let id = idOffset;

  for (const line of lines) {
    const rule = convertLineToDNRRule(line.trim(), id);
    if (rule) {
      rules.push(rule);
      id++;
    }
  }
  return rules;
}

function convertLineToDNRRule(line, id) {
  // Bỏ qua cosmetic filters (##, #@#, #?#) - DNR không xử lý được, cần CSS injection riêng
  if (line.includes('##') || line.includes('#@#')) return null;

  // Exception rule: @@||domain.com^
  const isException = line.startsWith('@@');
  const pattern = isException ? line.slice(2) : line;

  // Chỉ xử lý pattern dạng network filter cơ bản (||domain^, domain thuần)
  const domainMatch = pattern.match(/^\|\|([a-zA-Z0-9.-]+)\^?(\$.*)?$/);
  if (!domainMatch) return null; // pattern phức tạp hơn (regex, wildcard lồng) cần parser riêng

  const domain = domainMatch[1];
  const options = domainMatch[2] || '';

  const resourceTypes = parseResourceTypeOptions(options);

  return {
    id,
    priority: isException ? 2 : 1,
    action: { type: isException ? 'allow' : 'block' },
    condition: {
      urlFilter: `||${domain}^`,
      resourceTypes: resourceTypes.length ? resourceTypes : undefined
    }
  };
}

function parseResourceTypeOptions(optionsStr) {
  const map = {
    script: 'script', image: 'image', stylesheet: 'stylesheet',
    xmlhttprequest: 'xmlhttprequest', subdocument: 'sub_frame', font: 'font'
  };
  const types = [];
  for (const [key, val] of Object.entries(map)) {
    if (optionsStr.includes(`$${key}`)) types.push(val);
  }
  return types;
}
```

> **Giới hạn thực tế cần lưu ý:** parser này chỉ xử lý được các pattern network filter cơ bản của ABP syntax (`||domain^`, `@@` exception, một số `$` option phổ biến). Các cú pháp phức tạp hơn (regex filter, cosmetic filter `##`, scriptlet injection `+js()`, procedural cosmetic filter) **không thể** biểu diễn bằng DNR JSON schema — DNR chỉ hỗ trợ network-level blocking. Muốn hỗ trợ cosmetic filtering đầy đủ (ẩn phần tử quảng cáo bằng CSS) cần thêm một content-script riêng đọc rule dạng `##` và inject CSS `display:none` tương ứng — đây là hướng mở rộng tiếp theo nếu cần độ phủ tương đương uBlock Origin.

### 3.3. UI cho phép người dùng bật/tắt filter list (tích hợp vào `modules/settings.js`)

```js
// modules/settings.js (bổ sung)
export async function toggleFilterSource(sourceId, enabled) {
  const settings = await getAdblockSettings();
  const enabledSources = new Set(settings.enabledSources);
  enabled ? enabledSources.add(sourceId) : enabledSources.delete(sourceId);

  await chrome.storage.local.set({
    adblockSettings: { ...settings, enabledSources: [...enabledSources] }
  });

  if (enabled) {
    await updateFilterList(sourceId); // apply ngay khi bật
  } else {
    await removeRulesForSource(sourceId); // xóa rule khi tắt
  }
}
```

### 3.4. Badge hiển thị số request đã chặn (tận dụng hạ tầng có sẵn)

DNR có sự kiện `onRuleMatchedDebug` (chỉ hoạt động khi extension ở chế độ unpacked/dev, **không dùng được trên production build**). Để đếm số request bị chặn trên bản chính thức, cần dùng cách khác:

```js
// Đếm qua chrome.declarativeNetRequest.getMatchedRules (yêu cầu quyền "declarativeNetRequestFeedback")
async function updateBlockedCountBadge(tabId) {
  try {
    const { rulesMatchedInfo } = await chrome.declarativeNetRequest.getMatchedRules({ tabId });
    chrome.action.setBadgeText({
      tabId,
      text: rulesMatchedInfo.length > 0 ? String(rulesMatchedInfo.length) : ''
    });
  } catch (err) {
    // getMatchedRules có giới hạn số lần gọi (quota) - cần throttle
    console.warn('[AdBlock] getMatchedRules quota hoặc lỗi:', err);
  }
}
```

> Cần khai báo thêm permission `"declarativeNetRequestFeedback"` trong `manifest.json`, và lưu ý API này có **giới hạn tần suất gọi** (rate limit) — nên throttle, ví dụ chỉ cập nhật badge mỗi khi tab hoàn tất load (`webNavigation.onCompleted`) thay vì gọi liên tục.

---

## 4. Tổng hợp checklist triển khai

| # | Hạng mục | File cần sửa/thêm | Ưu tiên |
|---|---|---|---|
| 1 | Proxy + toString giả cho Canvas/WebGL/Audio | `modules/spoof-inject.js` (mới), `manifest.json` (world: MAIN) | 🔴 Cao |
| 2 | Seed ngẫu nhiên theo máy cho noise | `background.js`, bridge script isolated↔MAIN world | 🔴 Cao |
| 3 | Queue-persist cho cookie destroyer | `background.js`, thêm `pendingCookieDeletions` trong storage | 🔴 Cao |
| 4 | Domain matching chuẩn eTLD+1 | thêm thư viện `tldts`, sửa `isWhitelisted()` | 🟠 Trung bình |
| 5 | Module AdBlock động (EasyList/EasyPrivacy) | `modules/adblock/*` (mới), cập nhật `manifest.json` permissions | 🟠 Trung bình |
| 6 | Badge đếm request bị chặn | `modules/adblock/adblock-manager.js`, permission mới | 🟡 Thấp |
| 7 | Cosmetic filter (ẩn phần tử quảng cáo bằng CSS) | content script mới, ngoài phạm vi DNR | 🟡 Thấp (mở rộng sau) |

**Gợi ý thứ tự làm:** (2) seed → (1) Proxy/toString → (3)+(4) cookie queue → (5) adblock cơ bản (chỉ network blocking) → (6) badge → (7) cosmetic filter nếu cần độ phủ cao hơn.
