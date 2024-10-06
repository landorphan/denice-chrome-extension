// src/background/index.ts

const offText = '';

chrome.runtime.onInstalled.addListener(async () => {
    await chrome.action.setBadgeText({
      text: offText,
    });
});

chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "popup") {
        port.onDisconnect.addListener(async function() {
            const activeTab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
            await chrome.action.setBadgeText({
                tabId: activeTab.id,
                text: offText,
            });
        });
    }
});

// chrome.action.onClicked.addListener(async (tab) => {
//     if (tab && tab.id) {
//         const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
//         console.log('Previous state:', prevState);
//         const nextState = prevState === 'ON' ? offText : 'ON';
//         await chrome.action.setBadgeText({
//             tabId: tab.id,
//             text: nextState,
//         });
//         const activeTab = await chrome.tabs.query({ active: true, currentWindow: true });
//         console.log('Active tab:', activeTab);
    
//         await chrome.scripting.executeScript({
//           target : { tabId : tab.id },
//           files : [ "activeTab.js" ],
//         })
//         if (activeTab[0]?.id) {
//             chrome.tabs.sendMessage(activeTab[0].id, { action: "openPopup" });
//         }
//     }
// });

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'login') {
        // Open a new tab for the login page
        chrome.tabs.create({ url: `${process.env.API_HOST}/my` }, (tab) => {
            console.log('Login page opened in new tab:', tab);
        });
    }
});
