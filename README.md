# AI 語言學習助手 / AI Language Learning Assistant

<div align="center">

![Extension Icon](icons/icon128.png)

**一個智慧的瀏覽器外掛，幫助你在閱讀網頁時輕鬆學習新語言**

[繁體中文](#繁體中文) | [English](#english)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green.svg)](https://www.google.com/chrome/)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-orange.svg)](https://developer.chrome.com/docs/extensions/mv3/)

</div>

---

## 繁體中文

### ✨ 功能特色

#### 📖 智慧翻譯與學習
- **一鍵翻譯**：選取網頁上的任何文字，點擊浮動圖示即可獲得 AI 翻譯
- **學習模式**：自動識別單字/片語，顯示詳細的詞性、說明和例句
- **翻譯模式**：識別完整句子，提供簡潔的翻譯結果
- **上下文理解**：AI 會根據文字的上下文提供更準確的翻譯

#### 📚 單字表管理
- **一鍵儲存**：將學習過的單字加入個人單字表
- **多語言支援**：自動識別並分類英文、日文、中文、韓文單字
- **智慧搜尋**：快速搜尋單字或翻譯內容
- **語言篩選**：依語言分類瀏覽單字
- **資料匯出/匯入**：支援 JSON 格式，方便備份和轉移資料

#### ⚙️ 彈性設定
- **API 自由度**：支援任何 OpenAI-compatible API endpoint
- **模型選擇**：可自訂使用的 AI 模型（如 GPT-4, Claude, Gemini 等）
- **測試連線**：一鍵測試 API 連線狀態

### 🚀 快速開始

#### 安裝方式

1. **下載專案**
   ```bash
   git clone https://github.com/HoDaLaaa/ai-translator-extension.git
   cd ai-translator-extension
   ```

2. **載入到 Chrome/Edge**
   - 開啟瀏覽器，前往 `chrome://extensions/`（Chrome）或 `edge://extensions/`（Edge）
   - 啟用右上角的「開發人員模式」
   - 點擊「載入未封裝項目」
   - 選擇專案資料夾

3. **設定 API**
   - 點擊外掛圖示，選擇「設定」（⚙️）
   - 輸入你的 API Endpoint（例如：`https://api.openai.com/v1`）
   - 輸入 API Key
   - 選擇要使用的模型
   - 點擊「測試連線」確認設定正確

#### 使用方式

1. **翻譯文字**
   - 在任何網頁上選取文字
   - 點擊出現的 💡 浮動圖示
   - 查看 AI 翻譯結果

2. **儲存單字**
   - 翻譯結果顯示後，點擊「加入單字表」按鈕
   - 單字會自動儲存到你的個人單字表

3. **管理單字表**
   - 點擊瀏覽器工具列的外掛圖示
   - 使用搜尋、篩選功能瀏覽單字
   - 可匯出或刪除不需要的單字

### 🛠️ 技術架構

- **Manifest V3**：使用最新的 Chrome Extension 標準
- **Service Worker**：背景處理 API 請求和資料管理
- **Content Script**：網頁文字選取和 UI 顯示
- **Chrome Storage API**：本地儲存單字資料
- **OpenAI-compatible API**：支援各種 AI 服務商

### 📋 系統需求

- Chrome 88+ 或 Edge 88+ 瀏覽器
- 有效的 OpenAI-compatible API endpoint 和 key
- 網路連線

### 🔒 隱私保護

- ✅ 所有單字資料儲存在本地（chrome.storage.local）
- ✅ 不會上傳或分享你的單字表
- ✅ API Key 安全儲存在瀏覽器中
- ✅ 僅在你主動翻譯時才會發送 API 請求

### 🎯 支援的語言

- 🇬🇧 英文 (English)
- 🇯🇵 日文 (Japanese)
- 🇹🇼 中文 (Chinese)
- 🇰🇷 韓文 (Korean)

### 📝 開發相關

#### 專案結構
```
ai-translator-extension/
├── manifest.json          # 外掛配置檔
├── background.js          # Service Worker（API 處理）
├── content.js             # Content Script（UI 互動）
├── styles.css             # 浮動視窗樣式
├── popup.html/js/css      # 單字表管理介面
├── settings.html/js/css   # 設定頁面
├── icons/                 # 圖示資源
└── docs/                  # 文件資料
```

#### 開發指令
```bash
# 無需建置步驟，直接載入即可使用
# 修改程式碼後，在 chrome://extensions/ 點擊「重新載入」
```

### 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

1. Fork 這個專案
2. 建立你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'feat: add some amazing feature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

### 📄 授權

本專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 檔案

### 🙏 致謝

- 感謝所有 AI 服務提供者（OpenAI, Anthropic, Google 等）
- 圖示設計靈感來自學習和科技的結合

---

## English

### ✨ Features

#### 📖 Smart Translation & Learning
- **One-Click Translation**: Select any text on a webpage and click the floating icon for AI translation
- **Learning Mode**: Automatically recognizes words/phrases and displays detailed part of speech, explanations, and examples
- **Translation Mode**: Recognizes complete sentences and provides concise translations
- **Context Understanding**: AI provides more accurate translations based on text context

#### 📚 Vocabulary Management
- **One-Click Save**: Add learned words to your personal vocabulary list
- **Multi-Language Support**: Automatically detects and categorizes English, Japanese, Chinese, and Korean words
- **Smart Search**: Quickly search for words or translations
- **Language Filter**: Browse words by language category
- **Export/Import**: Supports JSON format for easy backup and data transfer

#### ⚙️ Flexible Settings
- **API Freedom**: Supports any OpenAI-compatible API endpoint
- **Model Selection**: Choose your preferred AI model (e.g., GPT-4, Claude, Gemini)
- **Connection Test**: One-click API connection testing

### 🚀 Quick Start

#### Installation

1. **Download the Project**
   ```bash
   git clone https://github.com/HoDaLaaa/ai-translator-extension.git
   cd ai-translator-extension
   ```

2. **Load into Chrome/Edge**
   - Open your browser and go to `chrome://extensions/` (Chrome) or `edge://extensions/` (Edge)
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the project folder

3. **Configure API**
   - Click the extension icon and select "Settings" (⚙️)
   - Enter your API Endpoint (e.g., `https://api.openai.com/v1`)
   - Enter your API Key
   - Select the model you want to use
   - Click "Test Connection" to verify settings

#### Usage

1. **Translate Text**
   - Select text on any webpage
   - Click the 💡 floating icon that appears
   - View the AI translation results

2. **Save Words**
   - After translation results are displayed, click the "Add to Vocabulary" button
   - The word will be automatically saved to your personal vocabulary list

3. **Manage Vocabulary**
   - Click the extension icon in the browser toolbar
   - Use search and filter features to browse words
   - Export or delete unwanted words

### 🛠️ Technical Architecture

- **Manifest V3**: Uses the latest Chrome Extension standard
- **Service Worker**: Background processing for API requests and data management
- **Content Script**: Webpage text selection and UI display
- **Chrome Storage API**: Local storage for vocabulary data
- **OpenAI-compatible API**: Supports various AI service providers

### 📋 System Requirements

- Chrome 88+ or Edge 88+ browser
- Valid OpenAI-compatible API endpoint and key
- Internet connection

### 🔒 Privacy Protection

- ✅ All vocabulary data is stored locally (chrome.storage.local)
- ✅ Your vocabulary list is never uploaded or shared
- ✅ API Key is securely stored in the browser
- ✅ API requests are only sent when you actively translate

### 🎯 Supported Languages

- 🇬🇧 English
- 🇯🇵 Japanese
- 🇹🇼 Chinese
- 🇰🇷 Korean

### 📝 Development

#### Project Structure
```
ai-translator-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service Worker (API handling)
├── content.js             # Content Script (UI interaction)
├── styles.css             # Floating window styles
├── popup.html/js/css      # Vocabulary management interface
├── settings.html/js/css   # Settings page
├── icons/                 # Icon resources
└── docs/                  # Documentation
```

#### Development
```bash
# No build steps required, just load directly
# After modifying code, click "Reload" in chrome://extensions/
```

### 🤝 Contributing

Issues and Pull Requests are welcome!

1. Fork this project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

### 🙏 Acknowledgments

- Thanks to all AI service providers (OpenAI, Anthropic, Google, etc.)
- Icon design inspired by the combination of learning and technology

---

<div align="center">

**Made with ❤️ for language learners**

[Report Bug](https://github.com/HoDaLaaa/ai-translator-extension/issues) · [Request Feature](https://github.com/HoDaLaaa/ai-translator-extension/issues)

</div>
