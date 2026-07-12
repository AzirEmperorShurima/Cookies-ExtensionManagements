(function () {
  'use strict';

  // ============ 0. Bypass Bot Verifications ============
  try {
      const href = window.location.href || '';
      const isBotVerification = 
          href.includes('cloudflare.com') ||
          href.includes('challenges.cloudflare.com') ||
          href.includes('hcaptcha.com') ||
          href.includes('recaptcha.net') ||
          href.includes('google.com/recaptcha');
          
      if (isBotVerification) {
          console.log('[Privacy Player] Bypassed bridge for bot verification site:', href);
          return;
      }
  } catch (e) {}

  // Biến lưu trữ cấu hình
  let cachedSeed = null;
  let cachedGeoMode = 'us';

  // Khởi chạy: Lấy installSeed ngay khi script load để giảm độ trễ
  chrome.storage.local.get(['installSeed', 'privacyPlayerGeoMode'], (res) => {
    if (res.installSeed) {
      cachedSeed = res.installSeed;
    }
    if (res.privacyPlayerGeoMode) {
      cachedGeoMode = res.privacyPlayerGeoMode;
    }
  });

  chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.privacyPlayerGeoMode) {
          cachedGeoMode = changes.privacyPlayerGeoMode.newValue;
          window.postMessage({ type: '__NOISE_RESPONSE__', geoMode: cachedGeoMode }, '*');
      }
  });

  // Helper: Băm chuỗi (SHA-256 đơn giản hóa hoặc băm 32-bit nhanh)
  // Dùng thuật toán băm đủ tốt để không dễ đoán nhưng phải cực nhanh.
  function hashString(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
    }
    return hash.toString(16);
  }

  // Helper: Lấy eTLD+1 sử dụng tldts
  function getETLDPlus1(urlOrHostname) {
    if (!urlOrHostname) return '';
    try {
      // tldts được inject trước bridge qua manifest.json
      if (window.tldts && window.tldts.parse) {
        const parsed = window.tldts.parse(urlOrHostname);
        return parsed.domain || parsed.hostname || urlOrHostname;
      }
    } catch (e) {
      console.warn('[Spoof Bridge] tldts lỗi:', e);
    }
    // Fallback nếu tldts không hoạt động
    return urlOrHostname.replace(/^www\./, '');
  }

  // Lắng nghe yêu cầu từ MAIN world
  window.addEventListener('message', (e) => {
    if (e.source === window && e.data && e.data.type === '__REQUEST_NOISE__') {
      handleRequestNoise();
    }
  });

  function handleRequestNoise() {
    // Nếu chưa load xong seed thì đợi một chút rồi thử lại
    if (!cachedSeed) {
      setTimeout(handleRequestNoise, 5);
      return;
    }

    if (window === window.top) {
      // Nhánh 1: TOP FRAME - Tính toán trực tiếp đồng bộ, cực nhanh
      // Cứu được round-trip IPC cho 99% trường hợp duyệt web thông thường
      const hostname = window.location.hostname;
      const domain = getETLDPlus1(hostname);
      
      const noise = hashString(cachedSeed + '|' + domain);
      window.postMessage({ type: '__NOISE_RESPONSE__', domainNoise: noise, geoMode: cachedGeoMode }, '*');
    } else {
      // Nhánh 2: IFRAME - Chống cross-site tracking
      // Phải nhờ Background lấy eTLD+1 của Top-Level Tab (đã giải quyết opaque origins như data:/about:blank)
      chrome.runtime.sendMessage({ type: 'GET_TOP_LEVEL_DOMAIN' }, (response) => {
        if (chrome.runtime.lastError) {
           // Có thể extension context bị lỗi/reload, fallback dùng domain của chính nó
           const fallbackNoise = hashString(cachedSeed + '|' + getETLDPlus1(window.location.hostname));
           window.postMessage({ type: '__NOISE_RESPONSE__', domainNoise: fallbackNoise, geoMode: cachedGeoMode }, '*');
           return;
        }

        if (response && response.domain) {
          const noise = hashString(cachedSeed + '|' + response.domain);
          window.postMessage({ type: '__NOISE_RESPONSE__', domainNoise: noise, geoMode: cachedGeoMode }, '*');
        }
      });
    }
  }

})();
