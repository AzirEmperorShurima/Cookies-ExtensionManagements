/**
 * Initialize extension state from storage
 */
//Replace callback with Promise-based API
chrome.storage.local.get(['appSettings']).then((result) => {
    const settings = result.appSettings ? { ...DEFAULT_SETTINGS, ...result.appSettings } : DEFAULT_SETTINGS;
    videoDetectionEnabled = settings.videoDownloaderEnabled || false;
    hibernationEnabled = settings.hibernationEnabled || false;
    hibernationTimeout = settings.hibernationTimeout || 30;
    updateHibernationAlarm(hibernationEnabled, hibernationTimeout);
});

// Common tracker domains for detection
const TRACKER_DOMAINS = [
    'google-analytics.com', 'doubleclick.net', 'facebook.net', 'googlesyndication.com',
    'adnxs.com', 'quantserve.com', 'scorecardresearch.com', 'amazon-adsystem.com',
    'casalemedia.com', 'criteo.com', 'rubiconproject.com', 'pubmatic.com'
];

// Video file extensions and patterns to monitor
const VIDEO_EXTENSIONS = ['mp4', 'mkv', 'webm', 'avi', 'mov', 'flv', 'wmv', 'm3u8', 'ts', 'mpd', 'm4v', '3gp', 'ogv', 'm4s'];
const TELEGRAM_STREAM_PATTERN = [
    'https://web.telegram.org/stream/*',
    'https://webk.telegram.org/stream/*',
    'https://webz.telegram.org/stream/*'
];

