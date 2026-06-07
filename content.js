// SVG Icon paths for the in-tab fullscreen button
const enterSvg = `
<svg width="100%" height="100%" viewBox="0 0 36 36" version="1.1">
  <path d="M10,11 H26 A2,2 0 0 1 28,13 V23 A2,2 0 0 1 26,25 H10 A2,2 0 0 1 8,23 V13 A2,2 0 0 1 10,11 Z" fill="none" stroke="#ffffff" stroke-width="2"/>
  <path d="M8,15 H28" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="11" y="17" width="14" height="6" fill="#ffffff"/>
</svg>
`;

const exitSvg = `
<svg width="100%" height="100%" viewBox="0 0 36 36" version="1.1">
  <path d="M10,11 H26 A2,2 0 0 1 28,13 V23 A2,2 0 0 1 26,25 H10 A2,2 0 0 1 8,23 V13 A2,2 0 0 1 10,11 Z" fill="none" stroke="#ffffff" stroke-width="2"/>
  <path d="M8,15 H28" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="11" y="17" width="7" height="4" fill="#ffffff"/>
  <line x1="20" y1="18" x2="25" y2="18" stroke="#ffffff" stroke-width="1.5"/>
  <line x1="20" y1="21" x2="25" y2="21" stroke="#ffffff" stroke-width="1.5"/>
  <line x1="11" y1="23" x2="25" y2="23" stroke="#ffffff" stroke-width="1" stroke-dasharray="1 1"/>
</svg>
`;

// Extension State
let isActive = false;
let lastVideoId = new URLSearchParams(location.search).get("v");

// Safe message sender to prevent errors when extension context is reloaded/invalidated
function safeSendMessage(message) {
  try {
    if (chrome.runtime && chrome.runtime.id) {
      chrome.runtime.sendMessage(message, () => {
        // Suppress warning about closed messaging channels
        if (chrome.runtime.lastError) {
          // No-op
        }
      });
    }
  } catch (e) {
    // Extension was reloaded, suppress error silently
  }
}

// Function to update the injected button UI
function updateButtonState() {
  const btn = document.querySelector(".yt-in-tab-fullscreen-btn");
  if (!btn) return;
  
  const svgContainer = btn.querySelector(".yt-svg-container");
  const tooltip = btn.querySelector(".yt-tooltip-custom");
  
  if (isActive) {
    if (svgContainer) svgContainer.innerHTML = exitSvg;
    if (tooltip) tooltip.textContent = "Exit in-tab fullscreen (Alt+Shift+T)";
  } else {
    if (svgContainer) svgContainer.innerHTML = enterSvg;
    if (tooltip) tooltip.textContent = "In-tab fullscreen (Alt+Shift+T)";
  }
}

// Core Toggle Function
function toggle(forcedState) {
  const newState = typeof forcedState === "boolean" ? forcedState : !isActive;
  
  if (newState === isActive) return;
  
  isActive = newState;
  
  // Toggle the custom class on body
  if (isActive) {
    document.body.classList.add("yt-in-tab-fullscreen");
  } else {
    document.body.classList.remove("yt-in-tab-fullscreen");
  }
  
  // Update UI visual representation
  updateButtonState();
  
  // Sync the extension action badge status safely
  safeSendMessage({ action: "update-badge-status", active: isActive });
  
  // Dispatch resize event instantly to trigger player size recalculations
  window.dispatchEvent(new Event("resize"));
  
  // Double-check resize inside a small timeout to make sure YouTube's player engine finishes resizing
  setTimeout(() => {
    window.dispatchEvent(new Event("resize"));
  }, 50);
}

// Button injection logic
function injectButton() {
  if (location.pathname !== "/watch") return;
  
  // Do not duplicate if button is already present
  if (document.querySelector(".yt-in-tab-fullscreen-btn")) {
    updateButtonState();
    return;
  }
  
  const rightControls = document.querySelector(".ytp-right-controls");
  if (!rightControls) return;
  
  const btn = document.createElement("button");
  btn.className = "ytp-button yt-in-tab-fullscreen-btn";
  btn.setAttribute("aria-label", "In-tab fullscreen");
  btn.innerHTML = `
    <span class="yt-svg-container">${isActive ? exitSvg : enterSvg}</span>
    <div class="yt-tooltip-custom">${isActive ? "Exit in-tab fullscreen (Alt+Shift+T)" : "In-tab fullscreen (Alt+Shift+T)"}</div>
  `;
  
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    toggle();
  });
  
  // Place it before theater mode button or fullscreen button
  const sizeBtn = rightControls.querySelector(".ytp-size-button");
  const fullscreenBtn = rightControls.querySelector(".ytp-fullscreen-button");
  
  if (sizeBtn) {
    try {
      sizeBtn.before(btn);
    } catch (err) {
      console.warn("YouTube In-Tab Fullscreen: Failed to insert before sizeBtn, falling back to append.", err);
      rightControls.appendChild(btn);
    }
  } else if (fullscreenBtn) {
    try {
      fullscreenBtn.before(btn);
    } catch (err) {
      console.warn("YouTube In-Tab Fullscreen: Failed to insert before fullscreenBtn, falling back to append.", err);
      rightControls.appendChild(btn);
    }
  } else {
    rightControls.appendChild(btn);
  }
}

// Monitor video page changes (YouTube uses client-side SPA navigation)
function checkNavigation() {
  const currentVideoId = new URLSearchParams(location.search).get("v");
  const isWatchPage = location.pathname === "/watch";
  
  if (!isWatchPage || currentVideoId !== lastVideoId) {
    // If we moved away from /watch or navigated to a different video, turn off fullscreen
    if (isActive) {
      toggle(false);
    }
    lastVideoId = isWatchPage ? currentVideoId : null;
  }
}

// Receive messages from the background service worker (toolbar clicks, shortcuts)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggle-in-tab-fullscreen") {
    if (location.pathname === "/watch") {
      toggle();
      sendResponse({ success: true, active: isActive });
    } else {
      sendResponse({ success: false, reason: "Not a watch page" });
    }
  }
  return true;
});

// Event Listeners for SPA navigation
window.addEventListener("yt-navigate-start", () => {
  if (isActive) {
    toggle(false);
  }
});

window.addEventListener("yt-navigate-finish", () => {
  checkNavigation();
  injectButton();
});

// Keyboard listener for Escape key (runs in capture phase to intercept ahead of page handlers)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isActive) {
    e.preventDefault();
    e.stopPropagation();
    toggle(false);
  }
}, true);

// Native fullscreen compatibility: exit in-tab fullscreen if entering native OS fullscreen
document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement && isActive) {
    toggle(false);
  }
});

// Initial run
checkNavigation();
injectButton();

// MutationObserver to detect controls rendering instantly
const observer = new MutationObserver(() => {
  if (location.pathname === "/watch") {
    const rightControls = document.querySelector(".ytp-right-controls");
    if (rightControls && !document.querySelector(".yt-in-tab-fullscreen-btn")) {
      injectButton();
    }
  }
});
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

// Periodic checks for dynamic DOM changes (e.g. ad resets, player reload) as backup
setInterval(() => {
  checkNavigation();
  if (location.pathname === "/watch") {
    injectButton();
  }
}, 1000);
