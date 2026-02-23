// Content script for AI Translator Extension
console.log('AI Translator Extension: Content script loaded');

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
  iconElement.addEventListener('click', handleIconClick);

  // Add to page
  document.body.appendChild(iconElement);

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

function handleIconClick(event) {
  event.stopPropagation();
  console.log('Icon clicked! Selected text:', selectedText);
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
  requestAnimationFrame(() => {
    floatingWindow.classList.add('visible');
  });

  // Remove icon
  removeIcon();

  // Request translation from background script
  requestTranslation(mode);
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
  const context = getSelectionContext(selectionRange, selectedText, 50);

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

  // C1 FIX: Capture values at display time to prevent race conditions
  // If user selects different text before clicking "Add to vocabulary",
  // we want to save the text that was actually translated, not the new selection
  const wordToSave = selectedText;
  const rangeToSave = selectionRange;
  const currentUrl = window.location.href;

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
    // Pass captured values to prevent race conditions
    saveBtn.addEventListener('click', () => saveToVocabulary(data, wordToSave, rangeToSave, currentUrl));
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
