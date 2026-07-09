# Architecture Documentation

This document outlines the architecture and module structure of the Privacy & Cookies Manager extension.

## 🏗️ Overall Architecture

The extension follows the standard Chrome Extension Manifest V3 architecture, utilizing a background service worker, a popup UI, content scripts, and various specialized modules to keep the codebase maintainable and organized.

### 1. Background Service Worker (`background.js`)
The `background.js` file serves as the central brain of the extension. It runs persistently (or is awoken by events) in the background and handles:
- **Declarative Net Request (DNR)** rules for ad and tracker blocking.
- **Context Menus** creation and handling (e.g., Quick Panic, Vault Additions, Player isolation).
- **Alarms** and timer management (e.g., Zen Mode).
- **Cross-module communication** via `chrome.runtime.onMessage`.
- Central state management and persistent storage using `chrome.storage.local`.

### 2. Popup UI (`popup.html` & `popup.js`)
The popup is the primary user interface. It is built using vanilla HTML/JS/CSS for maximum performance and minimum footprint. 
- `popup.html` contains the structural layout, grouped into functional "cards" (Player, Vault, Adblock, Settings, etc.).
- `popup.js` acts as the entry point for the UI logic, initializing various UI components and importing specialized modules from the `modules/` directory.

### 3. Modular System (`modules/`)
To avoid a monolithic codebase, specific domain logic is separated into standalone modules. `popup.js` dynamically imports or calls upon these modules based on user interaction.

#### Core Modules:
- **`adblock.js`**: Manages the Adblock Manager UI, Analytics charts, fetching EasyList updates, and triggering Zapper Mode.
- **`cookies.js`**: Handles the reading, filtering, parsing, and modification of browser cookies.
- **`player.js`**: Manages the Privacy Player feature, enabling isolated Picture-in-Picture (PiP) video playback and handling media extraction via `videoDetector.js`.
- **`vault.js`**: Handles the secure Vault feature, managing password authentication and encrypted storage of sensitive URLs.
- **`settings.js`**: Manages user preferences, Panic Button configuration, UI language (i18n via `translations.js`), and theme toggling.
- **`multiAccount.js`**: Manages account containers for isolating cookie sessions.
- **`history.js` & `sync.js`**: Manage browsing history cleanup and cross-device settings synchronization.
- **`tempmail.js`**: Interfaces with external temporary email APIs to provide quick throwaway email addresses.

### 4. Content Scripts
Content scripts are injected directly into webpages to modify behavior or extract data.
- **`spoof-inject.js` & `spoof-bridge.js`**: Injected into pages to override standard browser APIs (like User-Agent, Canvas, WebGL) to prevent fingerprinting.
- **`zapper-content.js`**: Injected when the user activates "Zapper Mode", allowing them to point and click to visually hide annoying DOM elements, which are then saved to local rules.
- **`iframe_content_script.js`**: Injected into isolated video frames for the Privacy Player.
- **`videoDetector.js`**: Scans the DOM for video elements and media streams to feed into the Privacy Player.

### 5. Translation System (`translations.js`)
The extension supports robust internationalization (i18n). The `translations.js` file contains dictionaries for multiple languages. The UI dynamically updates text content based on `data-i18n` attributes.

## 💾 Storage Strategy

The extension relies heavily on `chrome.storage.local` to persist data across sessions. Key storage entities include:
- `appSettings`: General configurations (theme, language, panic mode action).
- `vaultData` & `vaultPassword`: Encrypted links and hashed master password.
- `adblockStats`: Daily analytics for ads and trackers blocked.
- `easyListParsedCssRules`: Parsed CSS rules fetched from EasyList for element hiding.
- `userRules`: Custom user-defined blocking or hiding rules (e.g., from Zapper Mode).
- `cookieContainers`: Isolated cookie states for Multi-Account support.

## 🔄 Data Flow Example (Zapper Mode)
1. **User Action**: User clicks "Activate Zapper" in `popup.html`.
2. **UI Logic (`adblock.js`)**: Sends `ACTIVATE_ZAPPER` message to `background.js`.
3. **Background (`background.js`)**: Injects `zapper-content.js` into the active tab.
4. **Content Script (`zapper-content.js`)**: Overlays a UI, listens for mouse clicks, highlights elements, and sends the selected CSS selector back to `background.js` via `ZAP_ELEMENT`.
5. **Background (`background.js`)**: Saves the rule to `userRules` and applies it dynamically via `chrome.declarativeNetRequest` or injected CSS.
