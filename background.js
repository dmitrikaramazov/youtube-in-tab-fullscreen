// Helper to check if a URL is a YouTube watch page
function isYouTubeWatchPage(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    // Matches youtube.com/watch
    return (
      (parsed.hostname.endsWith("youtube.com") || parsed.hostname === "youtube.com") &&
      parsed.pathname === "/watch"
    );
  } catch (e) {
    return false;
  }
}

// Function to send a toggle command to a specific tab
function sendToggleMessage(tab) {
  if (!tab || !tab.id) return;
  
  if (isYouTubeWatchPage(tab.url)) {
    chrome.tabs.sendMessage(tab.id, { action: "toggle-in-tab-fullscreen" }, (response) => {
      // Ignore errors if the content script hasn't loaded yet
      if (chrome.runtime.lastError) {
        console.warn("Could not toggle in-tab fullscreen: Content script not loaded or page not ready.");
      }
    });
  } else {
    console.log("Ignored: Not a YouTube watch page.");
  }
}

// Listen for extension icon click in the browser toolbar
chrome.action.onClicked.addListener((tab) => {
  sendToggleMessage(tab);
});

// Listen for keyboard command (Alt+Shift+T)
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-in-tab") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        sendToggleMessage(tabs[0]);
      }
    });
  }
});

// Listen for state status reports from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "update-badge-status" && sender.tab && sender.tab.id) {
    const tabId = sender.tab.id;
    if (message.active) {
      chrome.action.setBadgeText({ text: "ON", tabId: tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#FF0000", tabId: tabId });
    } else {
      chrome.action.setBadgeText({ text: "", tabId: tabId });
    }
  }
});

// Clear badge status when tab is updated or loaded anew
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading") {
    chrome.action.setBadgeText({ text: "", tabId: tabId });
  }
});
