# YouTube In-Tab Fullscreen Extension

A premium, dependency-free Manifest V3 Chrome/Chromium/Brave extension that maximizes the YouTube video player to fill the browser tab's viewport (in-tab fullscreen) instead of the entire OS screen. 

This is perfect for multitasking: it hides the masthead header, sidebar, comments, and scrollbars, letting you watch videos in full size while keeping other tabs, side-by-side applications, and your operating system's taskbar fully visible.

---

## Features

- **Viewport Fullscreen**: Forces the video player to fill 100% of the browser tab.
- **Multiple Triggers**:
  - **Player Button**: A custom browser-mockup button injected directly into the YouTube player controls.
  - **Keyboard Shortcut**: `Alt + Shift + T` (natively integrated; works even if document focus is temporarily lost).
  - **Toolbar Icon**: Clicking the extension icon in the browser toolbar toggles the mode.
- **Dynamic Controls**:
  - Injected button switches SVG icons (standard browser mockup vs shrunk window layout) and updates tooltips based on the active state.
  - Extension action icon shows a red **"ON"** badge in the toolbar when active in the current tab.
- **Auto-Reset on Navigation**: Automatically exits in-tab fullscreen when navigating to another video or leaving the watch page.
- **Browser-Standard Overrides**:
  - Pressing `Esc` immediately exits in-tab fullscreen.
  - Entering native OS fullscreen (by clicking the native player button or pressing `F`) automatically suspends in-tab fullscreen to prevent layout overlapping.
- **Instant Transitions**: Instantly recalculates player sizes without visual stuttering or blank black letterbox delays.
- **Premium Aesthetics**: Features a custom red-and-black glassmorphic mockup icon that blends seamlessly with YouTube's branding.

---

## File Structure

```
youtube-fullscreen/
├── manifest.json       # Manifest V3 extension configuration
├── background.js      # Service worker for shortcut commands & badges
├── content.js         # DOM manipulation & event listeners
├── content.css        # Layout overrides & player button styling
├── README.md          # Project documentation
└── icons/             # Extension toolbar and store icon assets
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Installation Guide (Chromium / Google Chrome / Brave)

1. **Download / Clone** the extension folder to your local computer (e.g., `C:\path\to\youtube-fullscreen`).
2. Open your browser and navigate to the Extensions page:
   - Chrome: `chrome://extensions`
   - Brave: `brave://extensions`
3. Toggle the **Developer mode** switch in the top-right corner to **ON**.
4. Click the **Load unpacked** button in the top-left corner.
5. In the file explorer, select the `youtube-fullscreen` root folder.
6. The extension is now loaded and active!

---

## How to Use

1. Go to any YouTube watch page (e.g., `https://www.youtube.com/watch?v=...`).
2. **To enter In-Tab Fullscreen**:
   - Click the custom browser-mockup button on the right side of the video controls bar (next to Theater Mode).
   - Or, press `Alt + Shift + T`.
   - Or, click the YouTube In-Tab Fullscreen logo in your browser extensions toolbar.
3. **To exit In-Tab Fullscreen**:
   - Repeat any of the entry actions.
   - Or, press `Esc` on your keyboard.
   - Or, press `F` (or click YouTube's native fullscreen button) to transition directly to native OS fullscreen.

---

## Built with AI

Built with Gemini / Antigravity.
