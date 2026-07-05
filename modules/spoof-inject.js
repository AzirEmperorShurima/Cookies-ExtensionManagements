(function () {
  'use strict';

  // ============ 1. Cấu hình Two-Tier Seed ============
  let activeNoise = 'DEFAULT_FALLBACK_SEED_186626EB39E9A89A';
  let isNoiseReal = false;

  // Lắng nghe phản hồi từ bridge
  window.addEventListener('message', (e) => {
    // Lưu ý: Không kiểm tra e.origin vì script chạy trong nhiều context (data:, about:blank)
    if (e.source === window && e.data && e.data.type === '__NOISE_RESPONSE__') {
      if (e.data.domainNoise && !isNoiseReal) {
        activeNoise = e.data.domainNoise;
        isNoiseReal = true;
      }
    }
  });

  // Gửi yêu cầu lấy noise với cơ chế retry để đợi IPC hops
  function requestNoise() {
    if (isNoiseReal) return;
    window.postMessage({ type: '__REQUEST_NOISE__' }, '*');
    setTimeout(requestNoise, 10); // Thử lại sau 10ms nếu chưa có phản hồi
  }
  requestNoise();

  // ============ 2. Helper: Hàm băm tạo noise ổn định ============
  function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  // ============ 3. Helper: Tạo Proxy giả lập native ============
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

    spoofRegistry.set(toStringProxy, 'function toString() { [native code] }');

    Object.defineProperty(Function.prototype, 'toString', {
      value: toStringProxy,
      writable: true,
      configurable: true,
      enumerable: false
    });
  }

  patchGlobalToString();

  function createNativeProxy(originalFn, handlerTraps, fakeName) {
    const proxy = new Proxy(originalFn, handlerTraps);
    registerSpoofedFunction(proxy, fakeName || originalFn.name);
    return proxy;
  }

  // ============ 4. Áp dụng Spoofing cho Canvas ============
  function applyCanvasSpoof() {
    if (!window.CanvasRenderingContext2D) return;
    const proto = CanvasRenderingContext2D.prototype;
    const originalGetImageData = proto.getImageData;

    const spoofedGetImageData = createNativeProxy(
      originalGetImageData,
      {
        apply(target, thisArg, args) {
          const imageData = Reflect.apply(target, thisArg, args);
          if (imageData && imageData.data) {
            const hash = Math.abs(simpleHash(activeNoise));
            const rShift = hash % 5;
            const gShift = (hash >> 2) % 5;
            const bShift = (hash >> 4) % 5;
            const skip = (hash % 7) + 1;

            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
              if (i % skip === 0) {
                data[i] = (data[i] + rShift) % 256;
                data[i + 1] = (data[i + 1] + gShift) % 256;
                data[i + 2] = (data[i + 2] + bShift) % 256;
              }
            }
          }
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

  // ============ 5. Áp dụng Spoofing cho WebGL ============
  function applyWebGLSpoof() {
    const webglContexts = [window.WebGLRenderingContext, window.WebGL2RenderingContext];
    
    webglContexts.forEach((ctor) => {
      if (!ctor) return;
      const proto = ctor.prototype;
      const originalGetParameter = proto.getParameter;

      const spoofedGetParameter = createNativeProxy(
        originalGetParameter,
        {
          apply(target, thisArg, args) {
            const [param] = args;
            // 37445 = UNMASKED_VENDOR_WEBGL, 37446 = UNMASKED_RENDERER_WEBGL
            if (param === 37445) return "Google Inc. (Intel)";
            if (param === 37446) {
                return "ANGLE (Intel, Intel(R) UHD Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)";
            }
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

  // ============ 6. Áp dụng Spoofing cho Navigator ============
  function applyNavigatorSpoof() {
    if (!window.navigator) return;

    // Giả lập RAM thành giá trị chẵn phổ biến (VD: 8GB)
    if ('deviceMemory' in navigator) {
      const originalDeviceMemory = Object.getOwnPropertyDescriptor(Navigator.prototype, 'deviceMemory');
      if (originalDeviceMemory && originalDeviceMemory.get) {
        const spoofedGet = createNativeProxy(originalDeviceMemory.get, {
          apply() { return 8; }
        }, 'get deviceMemory');
        Object.defineProperty(Navigator.prototype, 'deviceMemory', {
          get: spoofedGet,
          enumerable: true,
          configurable: true
        });
      }
    }

    // Giả lập CPU Cores (VD: 4 cores)
    if ('hardwareConcurrency' in navigator) {
      const originalHardwareConcurrency = Object.getOwnPropertyDescriptor(Navigator.prototype, 'hardwareConcurrency');
      if (originalHardwareConcurrency && originalHardwareConcurrency.get) {
        const spoofedGet = createNativeProxy(originalHardwareConcurrency.get, {
          apply() { return 4; }
        }, 'get hardwareConcurrency');
        Object.defineProperty(Navigator.prototype, 'hardwareConcurrency', {
          get: spoofedGet,
          enumerable: true,
          configurable: true
        });
      }
    }
  }

  // ============ Thực thi ngay ============
  try {
    applyCanvasSpoof();
    applyWebGLSpoof();
    applyNavigatorSpoof();
  } catch (e) {
    // Im lặng bỏ qua lỗi nếu API không tồn tại trên môi trường hiện tại
  }

})();
