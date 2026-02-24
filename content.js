// Content script for AI Translator Extension
console.log('✅ AI Translator content.js loaded!');
console.log('✅ Window location:', window.location.href);

let selectedText = '';
let selectionRange = null;
let iconElement = null;
let floatingWindow = null;
let scrollTimeout;

// Listen for text selection
document.addEventListener('mouseup', handleTextSelection);
document.addEventListener('keyup', handleTextSelection);

// Remove icon and window when clicking elsewhere
document.addEventListener('mousedown', (event) => {
  if (floatingWindow && !floatingWindow.contains(event.target) && !iconElement?.contains(event.target)) {
    removeFloatingWindow();
  }
  if (iconElement && !iconElement.contains(event.target)) {
    removeIcon();
  }
});

// Remove icon when scrolling (icon position becomes incorrect after scroll)
window.addEventListener('scroll', () => {
  if (iconElement) {
    // Hide icon temporarily during scroll
    iconElement.style.opacity = '0';

    // Remove icon after scroll stops
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      removeIcon();
    }, 150);
  }
}, { passive: true });

function handleTextSelection(event) {
  try {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    // Remove existing icon
    removeIcon();

    if (text.length > 0 && selection.rangeCount > 0) {
      selectedText = text;
      selectionRange = selection.getRangeAt(0);

      // Show icon near selection
      showIcon();
    }
  } catch (error) {
    console.error('Error handling text selection:', error);
  }
}

function showIcon() {
  if (!selectionRange) return;

  // Create icon element
  iconElement = document.createElement('div');
  iconElement.className = 'ai-translator-icon';
  iconElement.innerHTML = '💡';
  iconElement.title = '點擊查看 AI 解釋';

  console.log('✅ Floating icon created');
  console.log('✅ Icon element:', iconElement);

  // Position icon with boundary detection
  const rect = selectionRange.getBoundingClientRect();
  const iconSize = 32; // Match CSS width/height
  const offset = 5;

  // Calculate position (prefer right, fallback to left if too close to edge)
  let left = rect.right + offset;
  let top = rect.top;

  // Check right boundary
  if (left + iconSize > window.innerWidth) {
    left = rect.left - iconSize - offset;
  }

  // Check left boundary (if both sides fail, use right anyway)
  if (left < 0) {
    left = rect.right + offset;
  }

  // Check top boundary
  if (top < 0) {
    top = 0;
  }

  // Check bottom boundary
  if (top + iconSize > window.innerHeight) {
    top = window.innerHeight - iconSize;
  }

  iconElement.style.left = `${left}px`;
  iconElement.style.top = `${top}px`;

  // Add click handler
  console.log('✅ About to bind click event to icon');

  // Use capture phase and stop propagation to prevent interference
  iconElement.addEventListener('click', (e) => {
    console.log('✅ CLICK EVENT FIRED!');
    e.stopPropagation();
    e.preventDefault();
    handleIconClick(e);
  }, true); // true = use capture phase

  // Backup: also listen to mousedown in case click is blocked
  iconElement.addEventListener('mousedown', (e) => {
    console.log('✅ MOUSEDOWN EVENT FIRED!');
    e.stopPropagation();
    e.preventDefault();
    handleIconClick(e);
  }, true);

  console.log('✅ Click event bound successfully');

  // Add to page
  document.body.appendChild(iconElement);
  console.log('✅ Icon appended to body');
  console.log('✅ Icon in DOM:', document.body.contains(iconElement));

  // Fade in animation
  requestAnimationFrame(() => {
    iconElement.classList.add('visible');
  });
}

function removeIcon() {
  if (iconElement) {
    // element.remove() automatically cleans up event listeners
    iconElement.remove();
    iconElement = null;
  }
}

function handleIconClick(e) {
  console.log('🔍 handleIconClick CALLED!');
  console.log('🔍 Event object:', e);
  e.stopPropagation();
  console.log('🔍 Icon clicked!');
  console.log('🔍 Selected text:', selectedText);
  showFloatingWindow();
}

// Keep the improved getSelectionContext from Task 2
// Will be used in Task 4 to send context to AI along with selected text
function getSelectionContext(range, textContent, contextLength) {
  const container = range.commonAncestorContainer;
  const fullText = container.textContent || '';

  // Calculate the actual position of selection start within the container's text
  // This handles cross-node selections correctly
  const preRange = document.createRange();
  preRange.selectNodeContents(container);
  preRange.setEnd(range.startContainer, range.startOffset);
  const startOffset = preRange.toString().length;

  const contextStart = Math.max(0, startOffset - contextLength);
  const contextEnd = Math.min(fullText.length, startOffset + textContent.length + contextLength);

  return fullText.substring(contextStart, contextEnd);
}

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

async function showFloatingWindow() {
  console.log('🔍 showFloatingWindow() called');

  // Check if API is configured
  console.log('🔍 Checking API key...');

  let hasApiKey = true; // Assume API key exists by default

  try {
    const settings = await chrome.storage.local.get(['apiKey']);
    hasApiKey = !!settings.apiKey;
    console.log('🔍 API key exists:', hasApiKey);
  } catch (error) {
    console.warn('🔍 Could not check API key (extension context issue), assuming it exists:', error);
    // If chrome.storage fails (extension context invalidated), assume API key exists
    // User will get error later if it's actually missing
    hasApiKey = true;
  }

  if (!hasApiKey) {
    console.log('🔍 No API key, showing first-time setup');
    showFirstTimeSetup();
    return;
  }

  console.log('🔍 API key found (or assumed), continuing...');

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
  console.log('🔍 Floating window HTML set');

  // Add close button handler
  const closeBtn = floatingWindow.querySelector('.ai-translator-close');
  closeBtn.addEventListener('click', removeFloatingWindow);

  // Add to page
  document.body.appendChild(floatingWindow);
  console.log('🔍 Floating window appended to body');

  // Fade in
  requestAnimationFrame(() => {
    floatingWindow.classList.add('visible');
    console.log('🔍 Floating window made visible');
  });

  // Remove icon
  removeIcon();

  // Request translation from background script
  console.log('🔍 About to call requestTranslation with mode:', mode);
  requestTranslation(mode);
  console.log('🔍 requestTranslation called');
}

function showFirstTimeSetup() {
  console.log('🔍 showFirstTimeSetup() called');
  console.log('🔍 selectionRange:', selectionRange);

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
  console.log('🔍 First-time setup window HTML set');

  const closeBtn = floatingWindow.querySelector('.ai-translator-close');
  closeBtn.addEventListener('click', removeFloatingWindow);

  const setupBtn = floatingWindow.querySelector('.btn-setup');
  setupBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    removeFloatingWindow();
  });

  document.body.appendChild(floatingWindow);
  console.log('🔍 First-time setup window appended to body');

  setTimeout(() => {
    floatingWindow.classList.add('visible');
    console.log('🔍 First-time setup window made visible');
  }, 10);
  removeIcon();
}

function positionWindow(windowElement, selectionRect) {
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

  windowElement.style.left = `${left}px`;
  windowElement.style.top = `${top}px`;
}

function removeFloatingWindow() {
  console.log('🔍 removeFloatingWindow() called, floatingWindow exists:', !!floatingWindow);
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

async function requestTranslation(mode) {
  console.log('🔍 requestTranslation() called, mode:', mode);
  console.log('🔍 selectedText:', selectedText);
  console.log('🔍 selectedText.length:', selectedText.length);

  const context = getSelectionContext(selectionRange, selectedText, 50);
  console.log('🔍 context retrieved:', context);

  // Check text length
  if (selectedText.length > 1000) {
    console.log('🔍 Text too long, showing error');
    displayError('選取的文字超過 1000 字，請選取較短的片段。');
    return;
  }

  console.log('🔍 About to send message to background script');
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'translate',
      data: {
        text: selectedText,
        context: context,
        mode: mode
      }
    });

    console.log('🔍 Response received:', response);

    if (response.success) {
      console.log('🔍 Response success, calling displayTranslation');
      console.log('🔍 Response data:', response.data);
      displayTranslation(response.data, mode);
    } else {
      console.log('🔍 Response failed:', response.error);
      displayError(response.error);
    }
  } catch (error) {
    console.error('🔍 Translation error caught:', error);
    displayError('發生錯誤：' + error.message);
  }
}

function displayTranslation(data, mode) {
  console.log('🔍 displayTranslation() called');
  console.log('🔍 mode:', mode);
  console.log('🔍 data:', data);
  console.log('🔍 floatingWindow exists:', !!floatingWindow);

  if (!floatingWindow) return;

  const content = floatingWindow.querySelector('.ai-translator-content');
  console.log('🔍 content element:', content);

  // C1 FIX: Capture values at display time to prevent race conditions
  // If user selects different text before clicking "Add to vocabulary",
  // we want to save the text that was actually translated, not the new selection
  const wordToSave = selectedText;
  const rangeToSave = selectionRange;
  const currentUrl = window.location.href;

  if (mode === 'learning') {
    // Learning mode: show full details
    console.log('🔍 Setting learning mode HTML');
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
    console.log('🔍 Learning mode HTML set');
  } else {
    // Translation mode: show only translation
    console.log('🔍 Setting translation mode HTML');
    content.innerHTML = `
      <div class="translation-section">
        <div class="section-header">📖 翻譯</div>
        <div class="section-content translation-only">${escapeHtml(data.translation)}</div>
      </div>

      <div class="translation-actions">
        <button class="btn-action btn-close-action">✕ 關閉</button>
      </div>
    `;
    console.log('🔍 Translation mode HTML set');
  }

  // Add event listeners
  const saveBtn = content.querySelector('.btn-save');
  console.log('🔍 Save button found:', !!saveBtn);
  if (saveBtn) {
    // Pass captured values to prevent race conditions
    saveBtn.addEventListener('click', () => saveToVocabulary(data, wordToSave, rangeToSave, currentUrl));
    console.log('🔍 Save button event bound');
  }

  const closeBtn = content.querySelector('.btn-close-action');
  console.log('🔍 Close button found:', !!closeBtn);
  if (closeBtn) {
    closeBtn.addEventListener('click', removeFloatingWindow);
    console.log('🔍 Close button event bound');
  }
}

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

// C1 FIX: Accept parameters instead of relying on global variables
// This prevents race conditions when user selects different text before saving
async function saveToVocabulary(data, word, range, url) {
  const wordData = {
    // I1 FIX: Add random suffix to prevent ID collisions when saving multiple words in same millisecond
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    word: word,
    language: detectLanguage(word),
    translation: data.translation,
    partOfSpeech: data.partOfSpeech || '',
    explanation: data.explanation || '',
    examples: data.examples || [],
    context: getSelectionContext(range, word, 50),
    sourceUrl: url,
    savedAt: new Date().toISOString()
  };

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'saveWord',
      data: wordData
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

// C2 FIX: Improved language detection to support Chinese, Japanese, Korean, and English
function detectLanguage(text) {
  // Chinese (Traditional/Simplified) - CJK Unified Ideographs
  const chinesePattern = /[\u4e00-\u9fff]/;
  // Japanese Hiragana/Katakana
  const japaneseKanaPattern = /[\u3040-\u309f\u30a0-\u30ff]/;
  // Korean Hangul
  const koreanPattern = /[\uac00-\ud7af]/;

  // Priority 1: Japanese Kana indicates Japanese (even if mixed with Kanji)
  // This is important because Japanese text often contains Kanji (Chinese characters)
  // but the presence of Hiragana/Katakana is a definitive indicator of Japanese
  if (japaneseKanaPattern.test(text)) {
    return 'ja';
  }

  // Priority 2: Korean Hangul
  if (koreanPattern.test(text)) {
    return 'ko';
  }

  // Priority 3: Chinese (has CJK characters but no Kana/Hangul)
  if (chinesePattern.test(text)) {
    return 'zh';
  }

  // Default: English for non-CJK text
  return 'en';
}
