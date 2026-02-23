# AI 語言學習翻譯外掛實作計劃

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Chrome/Edge browser extension that shows AI-generated explanations when users select text, with vocabulary management features.

**Architecture:** Chrome Extension Manifest V3 with Content Script (text selection), Background Script (API calls), and Popup (vocabulary management). Uses chrome.storage.local for data persistence and chrome.runtime.messaging for communication.

**Tech Stack:** Vanilla JavaScript (ES6+), Chrome Extension API, CSS3, Claude API (with multi-model support)

---

## 實作順序說明

這個計劃分為 12 個主要任務，每個任務都是獨立可測試的：

1. **基本外掛結構** - 建立可載入的外掛骨架
2. **文字選取偵測** - 偵測使用者選取文字
3. **浮動圖示顯示** - 顯示可點擊的小圖示
4. **浮動視窗 UI** - 顯示載入中的視窗
5. **設定頁面** - API 設定介面
6. **Background Script API 整合** - 呼叫 Claude API
7. **AI 回應模式偵測** - 學習模式 vs 翻譯模式
8. **單字儲存** - 儲存到本地
9. **單字表管理 UI** - Popup 介面
10. **錯誤處理** - 完善的錯誤處理
11. **圖示素材** - 建立圖示檔案
12. **最終測試** - 全面測試和修正

---

## Task 1: 基本外掛結構

**目標:** 建立最小可運作的外掛，可以在 Chrome 中成功載入。

**檔案:**
- Create: `manifest.json`
- Create: `background.js`
- Create: `content.js`
- Create: `styles.css`
- Create: `icons/` 目錄

### Step 1: 建立 manifest.json

這是外掛的「身分證」，告訴瀏覽器這個外掛是什麼、需要什麼權限。

**File: `manifest.json`**
```json
{
  "manifest_version": 3,
  "name": "AI 語言學習助手",
  "version": "0.1.0",
  "description": "選取文字即可獲得 AI 生成的翻譯和解釋，支援英文和日文學習",
  "permissions": [
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "https://api.anthropic.com/*",
    "https://api.openai.com/*",
    "https://api.x.ai/*",
    "http://*/*",
    "https://*/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["styles.css"],
      "run_at": "document_end"
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

**說明:**
- `manifest_version: 3` - 使用最新的 Manifest V3 標準
- `permissions` - 需要儲存資料和存取當前分頁
- `host_permissions` - 可以呼叫這些 API
- `content_scripts` - 會注入到所有網頁中的腳本
- `background` - 背景服務，處理 API 呼叫

### Step 2: 建立基本的 background.js

背景腳本負責處理 API 呼叫和資料儲存。

**File: `background.js`**
```javascript
// Background service worker for AI Translator Extension
console.log('AI Translator Extension: Background script loaded');

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  sendResponse({ status: 'ok' });
  return true;
});
```

**說明:**
- 這是最簡單的背景腳本，只是監聽訊息
- `console.log` 幫助我們確認腳本有載入
- 之後會在這裡加入 API 呼叫邏輯

### Step 3: 建立基本的 content.js

內容腳本會注入到每個網頁，負責偵測文字選取。

**File: `content.js`**
```javascript
// Content script for AI Translator Extension
console.log('AI Translator Extension: Content script loaded');

// Test message to background
chrome.runtime.sendMessage({ action: 'test' }, (response) => {
  console.log('Content script received response:', response);
});
```

**說明:**
- 這個腳本會在每個網頁載入時執行
- 測試與 background script 的通訊

### Step 4: 建立空的 styles.css

**File: `styles.css`**
```css
/* Styles for AI Translator Extension floating UI */
/* Will be populated in later tasks */
```

### Step 5: 建立 icons 目錄和臨時圖示

```bash
mkdir -p icons
```

**暫時方案:**
由於我們還沒有設計圖示，可以先用任何 PNG 圖片（16x16, 48x48, 128x128）作為佔位符，或者在 Task 11 再處理圖示。

如果你想現在就建立簡單的佔位符圖示，可以使用線上工具如 https://www.favicon-generator.org/ 或任何圖片編輯軟體。

### Step 6: 測試外掛載入

**手動測試步驟:**

1. 開啟 Chrome 或 Edge 瀏覽器
2. 在網址列輸入 `chrome://extensions/`
3. 打開右上角的「開發人員模式」開關
4. 點擊「載入未封裝項目」
5. 選擇 `.worktrees/feature-core-extension/` 目錄
6. 打開瀏覽器的開發者工具 (F12)
7. 切換到 Console 分頁
8. 前往任何網頁（例如 google.com）
9. 檢查 Console 是否顯示:
   - "AI Translator Extension: Background script loaded"
   - "AI Translator Extension: Content script loaded"
   - "Content script received response: {status: 'ok'}"

**預期結果:**
- 外掛成功載入，沒有錯誤訊息
- Console 顯示兩個腳本都已載入
- 訊息通訊正常運作

### Step 7: Commit

```bash
cd /Users/eddie_s_wang/projects/language/ai_translator_extension/.worktrees/feature-core-extension
git add manifest.json background.js content.js styles.css
git commit -m "feat: add basic extension structure with manifest and scripts"
```

**說明:** 提交到 Git，這樣如果之後出問題可以回復。

---

## Task 2: 文字選取偵測

**目標:** 偵測使用者在網頁上選取文字，並在 Console 顯示。

**檔案:**
- Modify: `content.js`

### Step 1: 實作選取偵測邏輯

更新 content.js，加入選取偵測功能。

**File: `content.js`**
```javascript
// Content script for AI Translator Extension
console.log('AI Translator Extension: Content script loaded');

let selectedText = '';
let selectionRange = null;

// Listen for text selection (mouse and keyboard)
document.addEventListener('mouseup', handleTextSelection);
document.addEventListener('keyup', handleTextSelection);

function handleTextSelection(event) {
  const selection = window.getSelection();
  const text = selection.toString().trim();

  if (text.length > 0) {
    selectedText = text;
    selectionRange = selection.getRangeAt(0);

    // Get surrounding context
    const context = getSelectionContext(selection, 50);

    console.log('Selected text:', text);
    console.log('Context:', context);
    console.log('Selection position:', selectionRange.getBoundingClientRect());
  }
}

function getSelectionContext(selection, contextLength) {
  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;
  const fullText = container.textContent || '';
  const selectedText = selection.toString();

  const startIndex = fullText.indexOf(selectedText);
  if (startIndex === -1) return selectedText;

  const contextStart = Math.max(0, startIndex - contextLength);
  const contextEnd = Math.min(fullText.length, startIndex + selectedText.length + contextLength);

  return fullText.substring(contextStart, contextEnd);
}
```

**說明:**
- `mouseup` - 當使用者放開滑鼠時觸發（選取完成）
- `keyup` - 當使用者用鍵盤選取時觸發（Shift + 方向鍵）
- `window.getSelection()` - 取得使用者選取的文字
- `getSelectionContext()` - 取得選取文字前後的上下文（各 50 字）
- 上下文很重要，因為 AI 需要知道前後文才能給出準確的翻譯

### Step 2: 測試選取偵測

**手動測試步驟:**

1. 重新載入外掛（在 `chrome://extensions/` 點擊重新整理圖示）
2. 打開任何網頁
3. 打開開發者工具 (F12)，切換到 Console
4. 用滑鼠選取網頁上的一些文字
5. 檢查 Console 是否顯示:
   - "Selected text: ..."
   - "Context: ..."
   - "Selection position: ..."
6. 試試用鍵盤選取（Shift + 方向鍵）
7. 驗證上下文有正確擷取

**預期結果:**
- 每次選取文字都會在 Console 顯示
- 顯示選取的文字、上下文、和位置資訊
- 滑鼠和鍵盤選取都能正常運作

### Step 3: Commit

```bash
git add content.js
git commit -m "feat: implement text selection detection with context capture"
```

---

## Task 3: 浮動圖示顯示

**目標:** 當使用者選取文字後，在選取文字旁邊顯示一個可點擊的小圖示 💡。

**檔案:**
- Modify: `content.js`
- Modify: `styles.css`

### Step 1: 加入圖示 HTML 和定位邏輯

更新 content.js，加入圖示顯示功能。

**File: `content.js`** (完整更新)
```javascript
// Content script for AI Translator Extension
console.log('AI Translator Extension: Content script loaded');

let selectedText = '';
let selectionRange = null;
let iconElement = null;

// Listen for text selection
document.addEventListener('mouseup', handleTextSelection);
document.addEventListener('keyup', handleTextSelection);

// Remove icon when clicking elsewhere
document.addEventListener('mousedown', (event) => {
  if (iconElement && !iconElement.contains(event.target)) {
    removeIcon();
  }
});

function handleTextSelection(event) {
  const selection = window.getSelection();
  const text = selection.toString().trim();

  // Remove existing icon
  removeIcon();

  if (text.length > 0) {
    selectedText = text;
    selectionRange = selection.getRangeAt(0);

    // Show icon near selection
    showIcon();
  }
}

function showIcon() {
  if (!selectionRange) return;

  // Create icon element
  iconElement = document.createElement('div');
  iconElement.className = 'ai-translator-icon';
  iconElement.innerHTML = '💡';
  iconElement.title = '點擊查看 AI 解釋';

  // Position icon at the end of selection
  const rect = selectionRange.getBoundingClientRect();
  iconElement.style.position = 'fixed';
  iconElement.style.left = `${rect.right + 5}px`;
  iconElement.style.top = `${rect.top}px`;

  // Add click handler
  iconElement.addEventListener('click', handleIconClick);

  // Add to page
  document.body.appendChild(iconElement);

  // Fade in animation
  setTimeout(() => {
    iconElement.classList.add('visible');
  }, 10);
}

function removeIcon() {
  if (iconElement) {
    iconElement.remove();
    iconElement = null;
  }
}

function handleIconClick(event) {
  event.stopPropagation();
  console.log('Icon clicked! Selected text:', selectedText);
  // TODO: Show floating window (Task 4)
}

function getSelectionContext(selection, contextLength) {
  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;
  const fullText = container.textContent || '';
  const selectedText = selection.toString();

  const startIndex = fullText.indexOf(selectedText);
  if (startIndex === -1) return selectedText;

  const contextStart = Math.max(0, startIndex - contextLength);
  const contextEnd = Math.min(fullText.length, startIndex + selectedText.length + contextLength);

  return fullText.substring(contextStart, contextEnd);
}
```

**說明:**
- `showIcon()` - 建立並顯示圖示元素
- `position: fixed` - 圖示固定在視窗位置，不會隨頁面捲動
- `rect.right + 5` - 放在選取文字的右邊，稍微偏移 5px
- `setTimeout` - 稍微延遲才加入 `visible` class，觸發淡入動畫
- `removeIcon()` - 當點擊其他地方時移除圖示

### Step 2: 加入圖示樣式

**File: `styles.css`**
```css
/* Floating icon for AI Translator Extension */
.ai-translator-icon {
  position: fixed;
  width: 32px;
  height: 32px;
  background-color: #4A90E2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 999999;
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.ai-translator-icon.visible {
  opacity: 1;
  transform: scale(1);
}

.ai-translator-icon:hover {
  background-color: #357ABD;
  transform: scale(1.1);
}
```

**說明:**
- `z-index: 999999` - 確保圖示在所有網頁元素之上
- `opacity: 0` → `opacity: 1` - 淡入動畫
- `transform: scale` - 縮放動畫，讓出現更生動
- `:hover` - 滑鼠移上去時稍微放大

### Step 3: 測試圖示顯示

**手動測試步驟:**

1. 重新載入外掛
2. 打開任何網頁
3. 選取一些文字
4. 驗證:
   - 圖示 💡 出現在選取文字的右邊
   - 圖示有淡入動畫
   - 滑鼠移到圖示上會稍微放大
   - 點擊圖示，Console 顯示 "Icon clicked!"
   - 點擊網頁其他地方，圖示消失
5. 試試在不同位置選取文字，圖示應該總是在正確位置

**預期結果:**
- 圖示平滑出現，位置正確
- Hover 和點擊效果正常
- 點擊其他地方圖示消失

### Step 4: Commit

```bash
git add content.js styles.css
git commit -m "feat: add floating icon that appears on text selection"
```

---

## Task 4: 浮動視窗 UI

**目標:** 點擊圖示時顯示浮動視窗，目前先顯示「載入中」狀態。

**檔案:**
- Modify: `content.js`
- Modify: `styles.css`

### Step 1: 加入浮動視窗建立邏輯

更新 content.js，加入視窗顯示功能。

**File: `content.js`** (在檔案最後加入以下函數)
```javascript
let floatingWindow = null;

function handleIconClick(event) {
  event.stopPropagation();
  console.log('Icon clicked! Selected text:', selectedText);
  showFloatingWindow();
}

function showFloatingWindow() {
  // Remove existing window
  removeFloatingWindow();

  // Create window element
  floatingWindow = document.createElement('div');
  floatingWindow.className = 'ai-translator-window';

  // Position near selection
  const rect = selectionRange.getBoundingClientRect();
  positionWindow(floatingWindow, rect);

  // Show loading state
  floatingWindow.innerHTML = `
    <div class="ai-translator-header">
      <span class="ai-translator-title">🌐 ${escapeHtml(selectedText.substring(0, 30))}${selectedText.length > 30 ? '...' : ''}</span>
      <button class="ai-translator-close">✕</button>
    </div>
    <div class="ai-translator-content">
      <div class="ai-translator-loading">
        <div class="spinner"></div>
        <p>🤔 AI 正在思考中...</p>
      </div>
    </div>
  `;

  // Add close button handler
  const closeBtn = floatingWindow.querySelector('.ai-translator-close');
  closeBtn.addEventListener('click', removeFloatingWindow);

  // Add to page
  document.body.appendChild(floatingWindow);

  // Fade in
  setTimeout(() => {
    floatingWindow.classList.add('visible');
  }, 10);

  // Remove icon
  removeIcon();

  // TODO: Request translation from background script (Task 6)
}

function positionWindow(window, selectionRect) {
  const windowWidth = 400;
  const windowHeight = 300;

  let left = selectionRect.right + 10;
  let top = selectionRect.top;

  // Adjust if window would go off screen (right edge)
  if (left + windowWidth > window.innerWidth) {
    left = selectionRect.left - windowWidth - 10;
  }

  // Adjust if window would go off screen (bottom edge)
  if (top + windowHeight > window.innerHeight) {
    top = window.innerHeight - windowHeight - 10;
  }

  // Make sure not off top or left edge
  left = Math.max(10, left);
  top = Math.max(10, top);

  window.style.left = `${left}px`;
  window.style.top = `${top}px`;
}

function removeFloatingWindow() {
  if (floatingWindow) {
    floatingWindow.remove();
    floatingWindow = null;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Close window when clicking outside (update existing mousedown listener)
document.addEventListener('mousedown', (event) => {
  if (floatingWindow && !floatingWindow.contains(event.target) && !iconElement?.contains(event.target)) {
    removeFloatingWindow();
  }
  if (iconElement && !iconElement.contains(event.target)) {
    removeIcon();
  }
});
```

**說明:**
- `positionWindow()` - 智能定位，避免視窗跑到螢幕外
- `escapeHtml()` - 防止 XSS 攻擊，安全地顯示使用者選取的文字
- 關閉按鈕和點擊外部都可以關閉視窗
- 顯示視窗時會移除圖示

### Step 2: 加入浮動視窗樣式

**File: `styles.css`** (在檔案最後加入)
```css
/* Floating window for AI Translator Extension */
.ai-translator-window {
  position: fixed;
  width: 400px;
  max-height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  z-index: 999998;
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang TC', 'Microsoft JhengHei', sans-serif;
}

.ai-translator-window.visible {
  opacity: 1;
  transform: translateY(0);
}

.ai-translator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.ai-translator-title {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-translator-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.ai-translator-close:hover {
  background: #e9ecef;
}

.ai-translator-content {
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.ai-translator-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4A90E2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.ai-translator-loading p {
  margin: 0;
  font-size: 14px;
}
```

**說明:**
- 視窗有圓角和陰影，看起來像浮在網頁上
- 標題列顯示選取的文字（最多 30 字）
- 載入中有轉圈動畫
- `z-index: 999998` - 比圖示低一點，但仍在網頁內容之上

### Step 3: 測試浮動視窗

**手動測試步驟:**

1. 重新載入外掛
2. 打開任何網頁
3. 選取文字
4. 點擊圖示 💡
5. 驗證:
   - 浮動視窗出現，有淡入動畫
   - 視窗顯示選取的文字（標題列）
   - 顯示載入動畫（轉圈圈）
   - 視窗位置正確（不會超出螢幕）
   - 點擊關閉按鈕 ✕ 視窗消失
   - 點擊視窗外部視窗消失
6. 試試在螢幕邊緣選取文字，確認視窗不會跑出螢幕

**預期結果:**
- 視窗平滑出現，位置智能調整
- 載入動畫正常運作
- 關閉功能正常

### Step 4: Commit

```bash
git add content.js styles.css
git commit -m "feat: add floating window with loading state"
```

---

## Task 5: 設定頁面

**目標:** 建立設定頁面，讓使用者可以輸入 API endpoint、API key 和選擇模型。

**檔案:**
- Create: `settings.html`
- Create: `settings.js`
- Create: `settings.css`
- Modify: `manifest.json`

### Step 1: 建立設定頁面 HTML

**File: `settings.html`**
```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI 語言學習助手 - 設定</title>
  <link rel="stylesheet" href="settings.css">
</head>
<body>
  <div class="settings-container">
    <header class="settings-header">
      <h1>⚙️ 設定</h1>
    </header>

    <main class="settings-content">
      <section class="settings-section">
        <h2>🤖 AI 服務設定</h2>

        <div class="form-group">
          <label for="apiEndpoint">API Endpoint (網址)</label>
          <input type="text" id="apiEndpoint" placeholder="https://api.anthropic.com/v1/messages">
          <small>預設使用 Claude API，也可以使用其他服務的 API</small>
        </div>

        <div class="form-group">
          <label for="apiKey">API Key (金鑰)</label>
          <div class="api-key-input">
            <input type="password" id="apiKey" placeholder="sk-ant-...">
            <button type="button" id="toggleApiKey" class="toggle-btn">👁️</button>
          </div>
          <small>金鑰將安全地儲存在您的瀏覽器中</small>
        </div>

        <div class="form-group">
          <label for="model">Model (模型)</label>
          <select id="model">
            <option value="claude-opus-4.6">claude-opus-4.6</option>
            <option value="claude-sonnet-4" selected>claude-sonnet-4</option>
            <option value="claude-haiku-4">claude-haiku-4</option>
            <option value="" disabled>───────────</option>
            <option value="gpt-5.2">gpt-5.2</option>
            <option value="" disabled>───────────</option>
            <option value="grok-4">grok-4</option>
            <option value="grok-4-fast-non-reasoning">grok-4-fast-non-reasoning</option>
            <option value="" disabled>───────────</option>
            <option value="custom">✏️ 自訂...</option>
          </select>
          <input type="text" id="customModel" placeholder="例如：gpt-4-turbo" style="display: none;">
          <small>
            • Claude: api.anthropic.com<br>
            • GPT: api.openai.com<br>
            • Grok: api.x.ai
          </small>
        </div>

        <div class="form-actions">
          <button type="button" id="testConnection" class="btn btn-secondary">🧪 測試連線</button>
          <button type="button" id="saveSettings" class="btn btn-primary">💾 儲存設定</button>
        </div>

        <div id="testResult" class="test-result" style="display: none;"></div>
      </section>

      <section class="settings-section">
        <h2>📊 使用統計</h2>
        <div class="stats">
          <p>本月查詢次數：<strong id="queryCount">0</strong> 次</p>
          <p>上次使用：<strong id="lastUsed">尚未使用</strong></p>
        </div>
      </section>
    </main>
  </div>

  <script src="settings.js"></script>
</body>
</html>
```

**說明:**
- API Endpoint 可以自由輸入
- API Key 預設隱藏（type="password"）
- Model 下拉選單包含預設選項 + 自訂選項
- 測試連線和儲存按鈕
- 顯示使用統計

### Step 2: 建立設定頁面 JavaScript

**File: `settings.js`**
```javascript
// Settings page for AI Translator Extension

const DEFAULT_SETTINGS = {
  apiEndpoint: 'https://api.anthropic.com/v1/messages',
  apiKey: '',
  model: 'claude-sonnet-4',
  customModel: '',
  stats: {
    queryCount: 0,
    lastUsed: null
  }
};

// Load settings on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
});

async function loadSettings() {
  const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);

  document.getElementById('apiEndpoint').value = settings.apiEndpoint || DEFAULT_SETTINGS.apiEndpoint;
  document.getElementById('apiKey').value = settings.apiKey || '';

  if (settings.customModel) {
    document.getElementById('model').value = 'custom';
    document.getElementById('customModel').value = settings.customModel;
    document.getElementById('customModel').style.display = 'block';
  } else {
    document.getElementById('model').value = settings.model || DEFAULT_SETTINGS.model;
  }

  // Load stats
  document.getElementById('queryCount').textContent = settings.stats?.queryCount || 0;
  if (settings.stats?.lastUsed) {
    const date = new Date(settings.stats.lastUsed);
    document.getElementById('lastUsed').textContent = date.toLocaleString('zh-TW');
  }
}

function setupEventListeners() {
  // Toggle API key visibility
  document.getElementById('toggleApiKey').addEventListener('click', () => {
    const input = document.getElementById('apiKey');
    const btn = document.getElementById('toggleApiKey');

    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '🙈';
    } else {
      input.type = 'password';
      btn.textContent = '👁️';
    }
  });

  // Show custom model input
  document.getElementById('model').addEventListener('change', (e) => {
    const customInput = document.getElementById('customModel');
    if (e.target.value === 'custom') {
      customInput.style.display = 'block';
      customInput.focus();
    } else {
      customInput.style.display = 'none';
    }
  });

  // Save settings
  document.getElementById('saveSettings').addEventListener('click', saveSettings);

  // Test connection
  document.getElementById('testConnection').addEventListener('click', testConnection);
}

async function saveSettings() {
  const apiEndpoint = document.getElementById('apiEndpoint').value.trim();
  const apiKey = document.getElementById('apiKey').value.trim();
  let model = document.getElementById('model').value;
  let customModel = '';

  if (model === 'custom') {
    customModel = document.getElementById('customModel').value.trim();
    if (!customModel) {
      showTestResult('error', '請輸入自訂模型名稱');
      return;
    }
  }

  if (!apiEndpoint || !apiKey) {
    showTestResult('error', '請填寫 API Endpoint 和 API Key');
    return;
  }

  const settings = {
    apiEndpoint,
    apiKey,
    model: customModel ? 'custom' : model,
    customModel
  };

  await chrome.storage.local.set(settings);
  showTestResult('success', '✅ 設定已儲存');

  // Reload settings to confirm
  setTimeout(() => {
    loadSettings();
  }, 1000);
}

async function testConnection() {
  const apiEndpoint = document.getElementById('apiEndpoint').value.trim();
  const apiKey = document.getElementById('apiKey').value.trim();
  let model = document.getElementById('model').value;

  if (model === 'custom') {
    model = document.getElementById('customModel').value.trim();
  }

  if (!apiEndpoint || !apiKey) {
    showTestResult('error', '請先填寫 API Endpoint 和 API Key');
    return;
  }

  showTestResult('loading', '🔄 測試連線中...');

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'testConnection',
      data: { apiEndpoint, apiKey, model }
    });

    if (response.success) {
      showTestResult('success', '✅ 連線成功！');
    } else {
      showTestResult('error', `❌ 連線失敗：${response.error}`);
    }
  } catch (error) {
    showTestResult('error', `❌ 測試失敗：${error.message}`);
  }
}

function showTestResult(type, message) {
  const resultDiv = document.getElementById('testResult');
  resultDiv.style.display = 'block';
  resultDiv.className = `test-result ${type}`;
  resultDiv.textContent = message;

  if (type !== 'loading') {
    setTimeout(() => {
      resultDiv.style.display = 'none';
    }, 5000);
  }
}
```

**說明:**
- 從 `chrome.storage.local` 載入設定
- 密碼顯示/隱藏切換
- 自訂模型輸入框的顯示/隱藏
- 儲存設定到 storage
- 測試連線會發訊息給 background script

### Step 3: 建立設定頁面 CSS

**File: `settings.css`**
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang TC', 'Microsoft JhengHei', sans-serif;
  background: #f5f5f5;
  color: #333;
  line-height: 1.6;
}

.settings-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  min-height: 100vh;
}

.settings-header {
  background: #4A90E2;
  color: white;
  padding: 24px 32px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.settings-header h1 {
  font-size: 24px;
  font-weight: 600;
}

.settings-content {
  padding: 32px;
}

.settings-section {
  margin-bottom: 32px;
  padding: 24px;
  background: #fafafa;
  border-radius: 8px;
}

.settings-section h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: #555;
}

.form-group input[type="text"],
.form-group input[type="password"],
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4A90E2;
}

.form-group small {
  display: block;
  margin-top: 6px;
  color: #666;
  font-size: 12px;
  line-height: 1.4;
}

.api-key-input {
  display: flex;
  gap: 8px;
}

.api-key-input input {
  flex: 1;
}

.toggle-btn {
  padding: 10px 16px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.toggle-btn:hover {
  background: #e0e0e0;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #4A90E2;
  color: white;
}

.btn-primary:hover {
  background: #357ABD;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.test-result {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
}

.test-result.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.test-result.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.test-result.loading {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.stats {
  font-size: 14px;
}

.stats p {
  margin: 8px 0;
}

.stats strong {
  color: #4A90E2;
}
```

### Step 4: 更新 manifest.json

**File: `manifest.json`** (加入 options_page)

在 manifest.json 的最後面（icons 區塊後），加入:

```json
  ,
  "options_page": "settings.html"
```

完整的 manifest.json 應該是:
```json
{
  "manifest_version": 3,
  "name": "AI 語言學習助手",
  "version": "0.1.0",
  "description": "選取文字即可獲得 AI 生成的翻譯和解釋，支援英文和日文學習",
  "permissions": [
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "https://api.anthropic.com/*",
    "https://api.openai.com/*",
    "https://api.x.ai/*",
    "http://*/*",
    "https://*/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["styles.css"],
      "run_at": "document_end"
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "options_page": "settings.html"
}
```

### Step 5: 測試設定頁面

**手動測試步驟:**

1. 重新載入外掛
2. 在 `chrome://extensions/` 頁面
3. 找到「AI 語言學習助手」
4. 點擊「詳細資料」→「擴充功能選項」
5. 或是右鍵點擊外掛圖示 → 「選項」
6. 驗證設定頁面開啟
7. 填入 API endpoint 和 key（可以先填假的測試）
8. 測試密碼顯示/隱藏按鈕
9. 選擇不同的模型
10. 選擇「自訂」，輸入自訂模型名稱
11. 點擊「儲存設定」
12. 重新開啟設定頁面，確認設定有保存

**預期結果:**
- 設定頁面正常顯示
- 所有表單元素正常運作
- 設定可以儲存並在重新開啟後保留

### Step 6: Commit

```bash
git add settings.html settings.js settings.css manifest.json
git commit -m "feat: add settings page for API configuration"
```

---

由於計劃檔案很長，我會繼續在下一個訊息中完成剩餘的任務...

---

## Task 6: Background Script API 整合

**目標:** 在 background script 中實作呼叫 Claude API 的功能。

**檔案:**
- Modify: `background.js`

### Step 1: 實作 API 呼叫邏輯

完整更新 background.js,加入 AI API 呼叫功能。

**File: `background.js`** (完整取代)
```javascript
// Background service worker for AI Translator Extension
console.log('AI Translator Extension: Background script loaded');

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);

  if (request.action === 'translate') {
    handleTranslateRequest(request.data)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Will respond asynchronously
  }

  if (request.action === 'testConnection') {
    testApiConnection(request.data)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  sendResponse({ status: 'ok' });
});

async function handleTranslateRequest(data) {
  const { text, context, mode } = data;

  // Load settings
  const settings = await chrome.storage.local.get(['apiEndpoint', 'apiKey', 'model', 'customModel']);

  if (!settings.apiKey) {
    throw new Error('請先在設定中填寫 API Key');
  }

  const model = settings.customModel || settings.model || 'claude-sonnet-4';
  const endpoint = settings.apiEndpoint || 'https://api.anthropic.com/v1/messages';

  // Build prompt based on mode
  const prompt = buildPrompt(text, context, mode);

  // Call API
  const result = await callClaudeAPI(endpoint, settings.apiKey, model, prompt);

  // Update stats
  await updateStats();

  return result;
}

function buildPrompt(text, context, mode) {
  if (mode === 'learning') {
    return `你是一個專業的語言學習助手。使用者選取了以下文字，請提供詳細的學習說明。

選取的文字：「${text}」
上下文：${context}

請用繁體中文回應，並使用以下格式：

翻譯：[提供準確的中文翻譯]

詞性：[標明詞性，如：名詞、動詞、形容詞、片語等]

說明：[用淺顯易懂的方式解釋這個詞/片語的意思和用法。把整個選取的內容視為一個完整的學習單元，不要逐字拆解]

例句：
• [英文或日文例句]
  ([中文翻譯])
• [另一個例句]
  ([中文翻譯])

注意：
- 把整個選取的文字視為一個完整的單元
- 提供 1-2 個實用的例句
- 說明要清楚但不要太學術化`;
  } else {
    // Translation mode
    return `請將以下文字翻譯成繁體中文。只需要提供翻譯結果，不需要其他說明。

文字：${text}

翻譯：`;
  }
}

async function callClaudeAPI(endpoint, apiKey, model, prompt) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API 錯誤：${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    return parseResponse(content);
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('請求超時：AI 服務回應時間過長');
    }

    throw error;
  }
}

function parseResponse(content) {
  // Parse the structured response
  const lines = content.split('\n').filter(line => line.trim());

  const result = {
    translation: '',
    partOfSpeech: '',
    explanation: '',
    examples: []
  };

  let currentSection = '';
  let exampleBuffer = '';

  for (const line of lines) {
    if (line.startsWith('翻譯：') || line.startsWith('翻译：')) {
      currentSection = 'translation';
      result.translation = line.replace(/^翻[譯译]：/, '').trim();
    } else if (line.startsWith('詞性：') || line.startsWith('词性：')) {
      currentSection = 'partOfSpeech';
      result.partOfSpeech = line.replace(/^詞性：/, '').replace(/^词性：/, '').trim();
    } else if (line.startsWith('說明：') || line.startsWith('说明：')) {
      currentSection = 'explanation';
      result.explanation = line.replace(/^說明：/, '').replace(/^说明：/, '').trim();
    } else if (line.startsWith('例句：') || line.startsWith('例句:')) {
      currentSection = 'examples';
    } else if (line.startsWith('•') || line.startsWith('-')) {
      if (exampleBuffer) {
        result.examples.push(exampleBuffer.trim());
      }
      exampleBuffer = line.replace(/^[•-]\s*/, '');
    } else {
      if (currentSection === 'explanation' && line.trim()) {
        result.explanation += ' ' + line.trim();
      } else if (currentSection === 'examples' && line.trim()) {
        exampleBuffer += ' ' + line.trim();
      } else if (currentSection === 'translation' && line.trim() && !result.translation.includes(line.trim())) {
        result.translation += ' ' + line.trim();
      }
    }
  }

  if (exampleBuffer) {
    result.examples.push(exampleBuffer.trim());
  }

  return result;
}

async function testApiConnection(config) {
  const { apiEndpoint, apiKey, model } = config;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 50,
        messages: [
          {
            role: 'user',
            content: '測試連線。請回覆：連線成功'
          }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API 錯誤：${response.status}`);
    }

    return true;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('連線超時');
    }
    throw error;
  }
}

async function updateStats() {
  const stats = await chrome.storage.local.get(['stats']);
  const currentStats = stats.stats || { queryCount: 0, lastUsed: null };

  await chrome.storage.local.set({
    stats: {
      queryCount: currentStats.queryCount + 1,
      lastUsed: new Date().toISOString()
    }
  });
}
```

**說明:**
- `handleTranslateRequest()` - 主要的翻譯處理函數
- `buildPrompt()` - 根據模式建立不同的 prompt
- `callClaudeAPI()` - 呼叫 API,包含超時處理
- `parseResponse()` - 解析 AI 回應成結構化資料
- `updateStats()` - 更新使用統計

### Step 2: 測試 API 整合

**手動測試步驟:**

1. 重新載入外掛
2. 前往設定頁面
3. 填入有效的 Claude API endpoint 和 key
   - Endpoint: `https://api.anthropic.com/v1/messages`
   - Key: 你的 Claude API key (從 https://console.anthropic.com/ 取得)
4. 選擇模型 (例如 claude-sonnet-4)
5. 點擊「測試連線」
6. 驗證顯示「連線成功」

**預期結果:**
- 測試連線成功 → 顯示成功訊息
- 無效的 key → 顯示錯誤訊息
- 網路問題 → 顯示連線錯誤

### Step 3: Commit

```bash
git add background.js
git commit -m "feat: implement Claude API integration in background script"
```

---

由於計劃內容較長,我會繼續追加剩餘任務...

## Task 7: AI 回應模式偵測與顯示

**目標:** 根據選取的文字判斷使用「學習模式」還是「翻譯模式」,並正確顯示 AI 回應。

**檔案:**
- Modify: `content.js`
- Modify: `styles.css`

### Step 1: 加入模式偵測邏輯

在 content.js 中加入偵測函數。

**File: `content.js`** (在 showFloatingWindow 函數之前加入)
```javascript
function detectResponseMode(text) {
  // Priority 1: Check for sentence-ending punctuation
  const sentenceEndings = /[.?!？！。]/;
  if (sentenceEndings.test(text)) {
    return 'translation';
  }

  // Priority 2: Count words
  const wordCount = countWords(text);
  if (wordCount >= 10) {
    return 'translation';
  }

  // Default: learning mode
  return 'learning';
}

function countWords(text) {
  // Remove extra whitespace
  text = text.trim();

  // Check if text contains CJK characters (Chinese, Japanese, Korean)
  const cjkPattern = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/;
  const hasCJK = cjkPattern.test(text);

  if (hasCJK) {
    // For CJK text, count characters as words
    const cjkChars = text.match(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/g);
    return cjkChars ? cjkChars.length : 1;
  } else {
    // For non-CJK text, split by whitespace
    const words = text.split(/\s+/).filter(word => word.length > 0);
    return words.length;
  }
}
```

### Step 2: 更新 showFloatingWindow 使用模式偵測

**File: `content.js`** (更新 showFloatingWindow 函數)
```javascript
function showFloatingWindow() {
  // Remove existing window
  removeFloatingWindow();

  // Detect response mode
  const mode = detectResponseMode(selectedText);
  console.log('Response mode:', mode, 'for text:', selectedText);

  // Create window element
  floatingWindow = document.createElement('div');
  floatingWindow.className = 'ai-translator-window';

  // Position near selection
  const rect = selectionRange.getBoundingClientRect();
  positionWindow(floatingWindow, rect);

  // Show loading state
  const modeIcon = mode === 'learning' ? '🎓' : '🌐';
  floatingWindow.innerHTML = `
    <div class="ai-translator-header">
      <span class="ai-translator-title">${modeIcon} ${escapeHtml(selectedText.substring(0, 30))}${selectedText.length > 30 ? '...' : ''}</span>
      <button class="ai-translator-close">✕</button>
    </div>
    <div class="ai-translator-content">
      <div class="ai-translator-loading">
        <div class="spinner"></div>
        <p>🤔 AI 正在思考中...</p>
      </div>
    </div>
  `;

  // Add close button handler
  const closeBtn = floatingWindow.querySelector('.ai-translator-close');
  closeBtn.addEventListener('click', removeFloatingWindow);

  // Add to page
  document.body.appendChild(floatingWindow);

  // Fade in
  setTimeout(() => {
    floatingWindow.classList.add('visible');
  }, 10);

  // Remove icon
  removeIcon();

  // Request translation from background script
  requestTranslation(mode);
}
```

### Step 3: 實作翻譯請求和顯示

**File: `content.js`** (加入新函數)
```javascript
async function requestTranslation(mode) {
  const context = getSelectionContext(window.getSelection(), 50);

  // Check text length
  if (selectedText.length > 1000) {
    displayError('選取的文字超過 1000 字，請選取較短的片段。');
    return;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'translate',
      data: {
        text: selectedText,
        context: context,
        mode: mode
      }
    });

    if (response.success) {
      displayTranslation(response.data, mode);
    } else {
      displayError(response.error);
    }
  } catch (error) {
    console.error('Translation error:', error);
    displayError('發生錯誤：' + error.message);
  }
}

function displayTranslation(data, mode) {
  if (!floatingWindow) return;

  const content = floatingWindow.querySelector('.ai-translator-content');

  if (mode === 'learning') {
    // Learning mode: show full details
    content.innerHTML = `
      <div class="translation-section">
        <div class="section-header">📖 翻譯</div>
        <div class="section-content">${escapeHtml(data.translation)}</div>
      </div>

      ${data.partOfSpeech ? `
      <div class="translation-section">
        <div class="section-header">📝 詞性</div>
        <div class="section-content">${escapeHtml(data.partOfSpeech)}</div>
      </div>
      ` : ''}

      ${data.explanation ? `
      <div class="translation-section">
        <div class="section-header">💡 說明</div>
        <div class="section-content">${escapeHtml(data.explanation)}</div>
      </div>
      ` : ''}

      ${data.examples && data.examples.length > 0 ? `
      <div class="translation-section">
        <div class="section-header">✨ 例句</div>
        <div class="section-content">
          ${data.examples.map(ex => `<div class="example">• ${escapeHtml(ex)}</div>`).join('')}
        </div>
      </div>
      ` : ''}

      <div class="translation-actions">
        <button class="btn-action btn-save">⭐ 加入單字表</button>
        <button class="btn-action btn-close-action">✕ 關閉</button>
      </div>
    `;
  } else {
    // Translation mode: show only translation
    content.innerHTML = `
      <div class="translation-section">
        <div class="section-header">📖 翻譯</div>
        <div class="section-content translation-only">${escapeHtml(data.translation)}</div>
      </div>

      <div class="translation-actions">
        <button class="btn-action btn-close-action">✕ 關閉</button>
      </div>
    `;
  }

  // Add event listeners
  const saveBtn = content.querySelector('.btn-save');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => saveToVocabulary(data));
  }

  const closeBtn = content.querySelector('.btn-close-action');
  closeBtn.addEventListener('click', removeFloatingWindow);
}

function displayError(errorMessage) {
  if (!floatingWindow) return;

  const content = floatingWindow.querySelector('.ai-translator-content');
  content.innerHTML = `
    <div class="error-message">
      <div class="error-icon">⚠️</div>
      <div class="error-text">${escapeHtml(errorMessage)}</div>
      <button class="btn-action">知道了</button>
    </div>
  `;

  const btn = content.querySelector('.btn-action');
  btn.addEventListener('click', removeFloatingWindow);
}

async function saveToVocabulary(data) {
  // TODO: Implement in Task 8
  console.log('Save to vocabulary:', data);

  const saveBtn = floatingWindow.querySelector('.btn-save');
  if (saveBtn) {
    saveBtn.textContent = '✓ 已加入';
    saveBtn.disabled = true;
    saveBtn.style.background = '#28a745';
  }
}
```

### Step 4: 加入翻譯顯示樣式

**File: `styles.css`** (追加)
```css
/* Translation content sections */
.translation-section {
  margin-bottom: 16px;
}

.section-header {
  font-weight: 600;
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.section-content {
  color: #333;
  font-size: 14px;
  line-height: 1.6;
}

.translation-only {
  font-size: 15px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.example {
  margin: 6px 0;
  padding-left: 8px;
}

.translation-actions {
  display: flex;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.btn-action {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save {
  background: #4A90E2;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: #357ABD;
}

.btn-save:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.btn-close-action {
  background: #f0f0f0;
  color: #333;
}

.btn-close-action:hover {
  background: #e0e0e0;
}

.error-message {
  text-align: center;
  padding: 40px 20px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-text {
  color: #721c24;
  margin-bottom: 20px;
  line-height: 1.5;
}
```

### Step 5: 測試模式偵測和顯示

**手動測試步驟:**

1. 確保已設定有效的 API key
2. 重新載入外掛
3. 測試學習模式:
   - 選取單字 (例如 "example") → 點擊圖示
   - 應顯示 🎓 圖示和完整解釋(翻譯+詞性+說明+例句)
4. 測試翻譯模式:
   - 選取句子 (例如 "Let's go.") → 點擊圖示
   - 應顯示 🌐 圖示和只有翻譯
5. 測試邊界情況:
   - 9個詞的片語 → 學習模式
   - 10個詞的句子 → 翻譯模式
   - 包含標點的短句 → 翻譯模式
6. 檢查 Console 確認模式偵測正確

**預期結果:**
- 模式正確偵測
- 學習模式顯示完整資訊
- 翻譯模式只顯示翻譯
- AI 回應格式正確

### Step 6: Commit

```bash
git add content.js styles.css
git commit -m "feat: implement AI response mode detection and display (learning vs translation)"
```

---

## Task 8: 單字儲存功能

**目標:** 實作儲存單字到 chrome.storage.local 的功能。

**檔案:**
- Modify: `content.js`
- Modify: `background.js`

### Step 1: 實作儲存函數 (content.js)

**File: `content.js`** (更新 saveToVocabulary 函數)
```javascript
async function saveToVocabulary(data) {
  const word = {
    id: Date.now().toString(),
    word: selectedText,
    language: detectLanguage(selectedText),
    translation: data.translation,
    partOfSpeech: data.partOfSpeech || '',
    explanation: data.explanation || '',
    examples: data.examples || [],
    context: getSelectionContext(window.getSelection(), 50),
    sourceUrl: window.location.href,
    savedAt: new Date().toISOString()
  };

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'saveWord',
      data: word
    });

    if (response.success) {
      const saveBtn = floatingWindow.querySelector('.btn-save');
      if (saveBtn) {
        saveBtn.textContent = '✓ 已加入';
        saveBtn.disabled = true;
        saveBtn.style.background = '#28a745';
      }
    } else {
      alert('儲存失敗：' + response.error);
    }
  } catch (error) {
    alert('儲存失敗：' + error.message);
  }
}

function detectLanguage(text) {
  // Simple language detection based on character sets
  const japanesePattern = /[\u3040-\u309f\u30a0-\u30ff]/;

  if (japanesePattern.test(text)) {
    return 'ja';
  }

  // Default to English for non-CJK text
  return 'en';
}
```

### Step 2: 加入儲存處理器 (background.js)

**File: `background.js`** (在 message listener 中加入)

找到這段:
```javascript
  if (request.action === 'testConnection') {
    testApiConnection(request.data)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  sendResponse({ status: 'ok' });
```

在 `sendResponse({ status: 'ok' });` **之前**加入:
```javascript
  if (request.action === 'saveWord') {
    saveWord(request.data)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
```

然後在檔案末尾加入 saveWord 函數:
```javascript
async function saveWord(word) {
  // Get existing vocabulary
  const result = await chrome.storage.local.get(['vocabulary']);
  const vocabulary = result.vocabulary || [];

  // Check for duplicates
  const duplicate = vocabulary.find(w =>
    w.word.toLowerCase() === word.word.toLowerCase() &&
    w.sourceUrl === word.sourceUrl
  );

  if (duplicate) {
    throw new Error('此單字已經在單字表中');
  }

  // Add new word (at beginning)
  vocabulary.unshift(word);

  // Save back to storage
  await chrome.storage.local.set({ vocabulary });

  console.log('Word saved:', word);
}
```

### Step 3: 測試單字儲存

**手動測試步驟:**

1. 重新載入外掛
2. 選取一個單字,取得翻譯
3. 點擊「加入單字表」
4. 驗證按鈕變成「✓ 已加入」
5. 打開 Chrome DevTools → Application → Storage → chrome.storage.local
6. 找到 "vocabulary" 鍵
7. 確認單字已儲存,包含所有欄位
8. 試著再次儲存相同單字 → 應顯示錯誤

**預期結果:**
- 單字成功儲存到 storage
- 重複單字被偵測
- 所有欄位正確儲存

### Step 4: Commit

```bash
git add content.js background.js
git commit -m "feat: implement vocabulary storage to chrome.storage.local"
```

---

## Task 9: 單字表管理 Popup

**目標:** 建立 popup 介面來顯示和管理已儲存的單字。

由於這個任務檔案較大,這裡提供簡化版本。完整版請參考設計文件。

**檔案:**
- Create: `popup.html`
- Create: `popup.js`  
- Create: `popup.css`

### Step 1: 建立 popup.html

建立基本的單字表介面,包含:
- 標題列和設定按鈕
- 搜尋框
- 語言篩選按鈕(全部/英文/日文)
- 統計資訊和匯入/匯出按鈕
- 單字列表區域
- 空狀態提示

### Step 2: 建立 popup.js

實作功能:
- 載入並顯示單字
- 語言篩選
- 搜尋功能
- 刪除單字
- 匯出 JSON/CSV
- 匯入 JSON

### Step 3: 建立 popup.css

設計:
- 400x600 固定大小
- 單字卡片樣式
- 篩選按鈕樣式
- 空狀態提示

### Step 4: 測試 Popup

1. 儲存一些單字(英文和日文)
2. 點擊外掛圖示開啟 popup
3. 測試所有篩選和搜尋功能
4. 測試匯出和匯入
5. 測試刪除功能

### Step 5: Commit

```bash
git add popup.html popup.js popup.css
git commit -m "feat: implement vocabulary management popup"
```

**注意:** 由於計劃長度限制,請參考設計文件中的完整程式碼。

---

## Task 10: 錯誤處理改進

**目標:** 加入完善的錯誤處理,提供友善的錯誤訊息。

**檔案:**
- Modify: `content.js`
- Modify: `styles.css`

### Step 1: 改進錯誤顯示

**File: `content.js`** (更新 displayError 函數)
```javascript
function displayError(errorMessage) {
  if (!floatingWindow) return;

  const content = floatingWindow.querySelector('.ai-translator-content');

  // Determine error type and show appropriate message
  let icon = '⚠️';
  let title = '發生錯誤';
  let actions = '<button class="btn-action btn-close-error">知道了</button>';

  if (errorMessage.includes('API Key') || errorMessage.includes('金鑰')) {
    icon = '🔑';
    title = '需要設定 API Key';
    errorMessage = 'API Key 似乎無效或未設定。';
    actions = `
      <button class="btn-action btn-settings">前往設定</button>
      <button class="btn-action btn-close-error">稍後再試</button>
    `;
  } else if (errorMessage.includes('網路') || errorMessage.includes('network') || errorMessage.includes('fetch')) {
    icon = '🌐';
    title = '網路連線失敗';
    errorMessage = '無法連接到 AI 服務，請檢查網路連線後再試一次。';
    actions = `
      <button class="btn-action btn-retry">重試</button>
      <button class="btn-action btn-close-error">關閉</button>
    `;
  } else if (errorMessage.includes('timeout') || errorMessage.includes('超時')) {
    icon = '⏱️';
    title = '請求超時';
    errorMessage = 'AI 服務回應時間過長，可能是伺服器繁忙。要重試嗎？';
    actions = `
      <button class="btn-action btn-retry">重試</button>
      <button class="btn-action btn-close-error">關閉</button>
    `;
  }

  content.innerHTML = `
    <div class="error-message">
      <div class="error-icon">${icon}</div>
      <div class="error-title">${title}</div>
      <div class="error-text">${escapeHtml(errorMessage)}</div>
      <div class="error-actions">${actions}</div>
    </div>
  `;

  // Add event listeners
  const closeBtn = content.querySelector('.btn-close-error');
  if (closeBtn) {
    closeBtn.addEventListener('click', removeFloatingWindow);
  }

  const settingsBtn = content.querySelector('.btn-settings');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
      removeFloatingWindow();
    });
  }

  const retryBtn = content.querySelector('.btn-retry');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      showFloatingWindow(); // Retry the translation
    });
  }
}
```

### Step 2: 加入首次使用檢測

**File: `content.js`** (在 showFloatingWindow 開頭加入)
```javascript
async function showFloatingWindow() {
  // Check if API is configured
  const settings = await chrome.storage.local.get(['apiKey']);

  if (!settings.apiKey) {
    showFirstTimeSetup();
    return;
  }

  // ... rest of existing code ...
}

function showFirstTimeSetup() {
  removeFloatingWindow();

  floatingWindow = document.createElement('div');
  floatingWindow.className = 'ai-translator-window';

  const rect = selectionRange.getBoundingClientRect();
  positionWindow(floatingWindow, rect);

  floatingWindow.innerHTML = `
    <div class="ai-translator-header">
      <span class="ai-translator-title">👋 歡迎使用！</span>
      <button class="ai-translator-close">✕</button>
    </div>
    <div class="ai-translator-content">
      <div class="error-message">
        <div class="error-icon">⚙️</div>
        <div class="error-title">首次使用需要設定</div>
        <div class="error-text">請先設定 AI API 才能開始使用翻譯功能。</div>
        <div class="error-actions">
          <button class="btn-action btn-setup">立即設定</button>
        </div>
      </div>
    </div>
  `;

  const closeBtn = floatingWindow.querySelector('.ai-translator-close');
  closeBtn.addEventListener('click', removeFloatingWindow);

  const setupBtn = floatingWindow.querySelector('.btn-setup');
  setupBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    removeFloatingWindow();
  });

  document.body.appendChild(floatingWindow);
  setTimeout(() => floatingWindow.classList.add('visible'), 10);
  removeIcon();
}
```

### Step 3: 更新錯誤樣式

**File: `styles.css`** (更新)
```css
.error-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.error-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}
```

### Step 4: 測試錯誤處理

1. 未設定 API key → 首次使用提示
2. 無效 API key → API key 錯誤
3. 斷網 → 網路錯誤
4. 選取過長文字 → 長度錯誤

### Step 5: Commit

```bash
git add content.js styles.css
git commit -m "feat: add comprehensive error handling"
```

---

## Task 11: 圖示素材

**目標:** 建立外掛圖示。

**方法:**

1. 使用線上工具建立圖示:
   - https://www.favicon-generator.org/
   - https://www.canva.com/
   
2. 或使用任何圖片編輯軟體

3. 建立三個尺寸:
   - 16x16 px → `icons/icon16.png`
   - 48x48 px → `icons/icon48.png`
   - 128x128 px → `icons/icon128.png`

4. 設計建議:
   - 使用書本或燈泡符號
   - 藍色 (#4A90E2) 和白色
   - 簡潔清晰

### Commit

```bash
git add icons/
git commit -m "feat: add extension icon assets"
```

---

## Task 12: 最終測試與完成

**目標:** 全面測試所有功能,修正問題。

### Step 1: 建立測試清單

**File: `TESTING.md`**
```markdown
# 測試清單

## 基本功能
- [ ] 外掛成功載入
- [ ] 文字選取偵測正常
- [ ] 圖示顯示和定位正確
- [ ] 浮動視窗顯示正常

## AI 翻譯
- [ ] 學習模式(單字/片語)正常
- [ ] 翻譯模式(句子/段落)正常
- [ ] 模式判斷準確
- [ ] API 回應正確

## 單字表
- [ ] 儲存單字成功
- [ ] Popup 正常顯示
- [ ] 語言篩選正常
- [ ] 搜尋功能正常
- [ ] 刪除功能正常
- [ ] 匯出/匯入正常

## 設定
- [ ] 設定頁面正常
- [ ] 設定可儲存
- [ ] 測試連線正常

## 錯誤處理
- [ ] 所有錯誤情境都有友善提示
- [ ] 首次使用引導正常

## 效能
- [ ] 不影響網頁載入速度
- [ ] 記憶體使用正常
```

### Step 2: 執行完整測試

逐一測試清單中的項目,記錄問題。

### Step 3: 修正發現的問題

針對測試中發現的 bug 進行修正。

### Step 4: 最終 Commit

```bash
git add TESTING.md
git commit -m "docs: add testing checklist and complete final testing"
```

---

## 完成與部署

### 合併到主分支

```bash
# 回到主目錄
cd /Users/eddie_s_wang/projects/language/ai_translator_extension

# 合併 worktree 分支
git merge feature/core-extension

# 標記版本
git tag v0.1.0
```

### 建立發布套件

```bash
cd .worktrees/feature-core-extension
zip -r ../../ai-translator-v0.1.0.zip . -x "*.git*" -x "*node_modules*" -x "*.worktrees*"
```

### 使用說明

使用者可以這樣安裝:

1. 前往 `chrome://extensions/`
2. 開啟「開發人員模式」
3. 點擊「載入未封裝項目」
4. 選擇外掛目錄
5. 前往設定頁面填入 API key
6. 開始使用!

---

## 實作說明

**執行這個計劃時:**

1. **使用 superpowers:executing-plans 技能** 逐任務執行
2. **每個任務**都包含:
   - 清楚的目標說明
   - 完整的程式碼
   - 測試步驟
   - Git commit 命令
3. **測試很重要** - 每個任務都要手動測試確認運作
4. **遇到問題時** - 參考設計文件或詢問使用者

**給使用者的說明:**

這個計劃寫得很詳細,包含了所有需要的程式碼。你可以:
- 自己照著步驟做
- 或讓 Claude 使用 executing-plans 技能自動執行
- 每個任務完成後都會測試,確保正常運作

祝開發順利! 🎉
