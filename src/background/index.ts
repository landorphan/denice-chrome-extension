// src/background/index.ts

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'login') {
        // Open a new tab for the login page
        chrome.tabs.create({ url: `${process.env.API_HOST}/my` }, (tab) => {
            console.log('Login page opened in new tab:', tab);
        });
    }
});
