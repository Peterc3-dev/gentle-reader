// background.js
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "gentle-reader-read",
        title: "Gentle Reader: Read Aloud",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "gentle-reader-read") {
        const selectedText = info.selectionText.trim();
        if (!selectedText) return;

        // Get API key securely
        const { apiKey } = await chrome.storage.local.get("apiKey");
        if (!apiKey) {
            chrome.tabs.sendMessage(tab.id, { action: "showApiKeyPrompt" });
            return;
        }

        // Send to content script to process
        chrome.tabs.sendMessage(tab.id, {
            action: "startReading",
            text: selectedText,
            apiKey
        });
    }
});
