// ===================================
// 全域變數與狀態管理
// ===================================

// 儲存所有單字資料（從 chrome.storage.local 載入）
let allWords = [];

// 當前篩選狀態
let currentFilter = {
  language: 'all',  // 'all', 'en', 'ja', 'zh', 'ko'
  searchQuery: ''   // 搜尋關鍵字
};

// ===================================
// 初始化：當 popup 開啟時執行
// ===================================

document.addEventListener('DOMContentLoaded', async () => {
  // 載入單字資料
  await loadVocabulary();

  // 綁定事件監聽器
  initializeEventListeners();

  // 顯示單字列表
  displayWords(allWords);

  // 更新統計資訊
  updateStats(allWords);
});

// ===================================
// 核心功能：載入單字資料
// ===================================

/**
 * 從 chrome.storage.local 載入單字表
 * 單字資料儲存在 key "vocabulary" 下
 */
async function loadVocabulary() {
  try {
    const result = await chrome.storage.local.get('vocabulary');
    allWords = result.vocabulary || [];
    console.log('Loaded vocabulary:', allWords.length, 'words');
  } catch (error) {
    console.error('Failed to load vocabulary:', error);
    allWords = [];
  }
}

// ===================================
// 核心功能：顯示單字卡片
// ===================================

/**
 * 在 UI 上顯示單字卡片
 * @param {Array} words - 要顯示的單字陣列
 */
function displayWords(words) {
  const wordList = document.getElementById('word-list');
  const emptyState = document.getElementById('empty-state');

  // 如果沒有單字，顯示空狀態
  if (!words || words.length === 0) {
    wordList.innerHTML = '';
    emptyState.style.display = 'flex';
    return;
  }

  // 隱藏空狀態，顯示單字列表
  emptyState.style.display = 'none';

  // 產生所有單字卡片的 HTML
  wordList.innerHTML = words.map(word => createWordCard(word)).join('');

  // 綁定刪除按鈕的事件（必須在 HTML 插入後才能綁定）
  bindDeleteButtons();
}

/**
 * 建立單一單字卡片的 HTML
 * @param {Object} word - 單字物件
 * @returns {string} HTML 字串
 */
function createWordCard(word) {
  // 格式化日期顯示（例如：2024-02-23 → 02/23）
  const date = new Date(word.savedAt);
  const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;

  // 從 URL 取得網域名稱（例如：https://nytimes.com/... → nytimes.com）
  const domain = word.sourceUrl ? new URL(word.sourceUrl).hostname.replace('www.', '') : '未知來源';

  // 建立範例句子列表
  const examplesHtml = word.examples && word.examples.length > 0
    ? `<div class="word-examples">
        ${word.examples.map(ex => `<div class="example-item">${escapeHtml(ex)}</div>`).join('')}
       </div>`
    : '';

  return `
    <div class="word-card" data-word-id="${word.id}">
      <div class="word-header">
        <div class="word-title">
          <span class="word-text">${escapeHtml(word.word)}</span>
          <span class="language-tag ${word.language}">${getLanguageLabel(word.language)}</span>
        </div>
        <button class="delete-btn" data-word-id="${word.id}" title="刪除單字">🗑️</button>
      </div>

      <div class="word-translation">${escapeHtml(word.translation)}</div>

      ${word.partOfSpeech ? `<div class="word-part-of-speech">${escapeHtml(word.partOfSpeech)}</div>` : ''}

      ${word.explanation ? `<div class="word-explanation">${escapeHtml(word.explanation)}</div>` : ''}

      ${examplesHtml}

      <div class="word-meta">
        <span class="word-source">
          ${word.sourceUrl
            ? `來自: <a href="${escapeHtml(word.sourceUrl)}" target="_blank">${escapeHtml(domain)}</a>`
            : '來自: 未知'
          }
        </span>
        <span class="word-date">${formattedDate}</span>
      </div>
    </div>
  `;
}

/**
 * 將語言代碼轉換為顯示文字
 * @param {string} lang - 語言代碼 ('en', 'ja', 'zh', 'ko')
 * @returns {string} 語言標籤文字
 */
function getLanguageLabel(lang) {
  const labels = {
    'en': 'EN',
    'ja': 'JA',
    'zh': 'ZH',
    'ko': 'KO'
  };
  return labels[lang] || lang.toUpperCase();
}

/**
 * 跳脫 HTML 特殊字元，避免 XSS 攻擊
 * @param {string} str - 要跳脫的字串
 * @returns {string} 跳脫後的字串
 */
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===================================
// 核心功能：篩選與搜尋
// ===================================

/**
 * 根據語言篩選單字
 * @param {string} lang - 語言代碼或 'all'
 */
function filterByLanguage(lang) {
  currentFilter.language = lang;
  applyFilters();
}

/**
 * 根據搜尋關鍵字篩選單字
 * @param {string} query - 搜尋關鍵字
 */
function searchWords(query) {
  currentFilter.searchQuery = query.toLowerCase().trim();
  applyFilters();
}

/**
 * 套用所有篩選條件（語言 + 搜尋）
 */
function applyFilters() {
  let filteredWords = allWords;

  // 1. 語言篩選
  if (currentFilter.language !== 'all') {
    filteredWords = filteredWords.filter(word => word.language === currentFilter.language);
  }

  // 2. 搜尋篩選（搜尋單字本身或翻譯）
  if (currentFilter.searchQuery) {
    filteredWords = filteredWords.filter(word => {
      const wordText = word.word.toLowerCase();
      const translation = word.translation.toLowerCase();
      return wordText.includes(currentFilter.searchQuery) ||
             translation.includes(currentFilter.searchQuery);
    });
  }

  // 顯示篩選後的單字
  displayWords(filteredWords);

  // 更新統計資訊（顯示篩選結果數量）
  updateFilteredCount(filteredWords.length);
}

/**
 * 更新篩選結果數量顯示
 * @param {number} count - 篩選後的單字數量
 */
function updateFilteredCount(count) {
  const filteredCountEl = document.getElementById('filtered-count');

  // 如果有篩選條件且結果少於總數，顯示篩選數量
  if ((currentFilter.language !== 'all' || currentFilter.searchQuery) && count < allWords.length) {
    filteredCountEl.textContent = `(顯示 ${count} 個)`;
    filteredCountEl.style.display = 'inline';
  } else {
    filteredCountEl.style.display = 'none';
  }
}

// ===================================
// 核心功能：刪除單字
// ===================================

/**
 * 綁定所有刪除按鈕的點擊事件
 */
function bindDeleteButtons() {
  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const wordId = e.target.dataset.wordId;
      await deleteWord(wordId);
    });
  });
}

/**
 * 刪除指定的單字
 * @param {string} id - 要刪除的單字 ID
 */
async function deleteWord(id) {
  // 確認是否要刪除
  const word = allWords.find(w => w.id === id);
  if (!word) return;

  const confirmed = confirm(`確定要刪除「${word.word}」嗎？`);
  if (!confirmed) return;

  try {
    // 從陣列中移除
    allWords = allWords.filter(w => w.id !== id);

    // 儲存到 chrome.storage
    await chrome.storage.local.set({ vocabulary: allWords });

    // 重新顯示單字列表
    applyFilters();

    // 更新統計資訊
    updateStats(allWords);

    console.log('Word deleted:', id);
  } catch (error) {
    console.error('Failed to delete word:', error);
    alert('刪除失敗，請稍後再試');
  }
}

// ===================================
// 核心功能：統計資訊
// ===================================

/**
 * 更新統計資訊顯示（總單字數、各語言數量）
 * @param {Array} words - 單字陣列
 */
function updateStats(words) {
  // 更新總數
  const totalCountEl = document.getElementById('total-count');
  totalCountEl.textContent = `共 ${words.length} 個單字`;

  // 計算各語言的數量，並更新篩選按鈕上的標籤
  const counts = {
    en: words.filter(w => w.language === 'en').length,
    ja: words.filter(w => w.language === 'ja').length,
    zh: words.filter(w => w.language === 'zh').length,
    ko: words.filter(w => w.language === 'ko').length
  };

  // 更新按鈕文字（顯示數量）
  document.querySelector('[data-lang="all"]').textContent = `全部`;
  document.querySelector('[data-lang="en"]').textContent = `英文 (${counts.en})`;
  document.querySelector('[data-lang="ja"]').textContent = `日文 (${counts.ja})`;
  document.querySelector('[data-lang="zh"]').textContent = `中文 (${counts.zh})`;
  document.querySelector('[data-lang="ko"]').textContent = `韓文 (${counts.ko})`;
}

// ===================================
// 核心功能：匯出/匯入
// ===================================

/**
 * 匯出單字表為 JSON 檔案
 */
function exportVocabulary() {
  if (allWords.length === 0) {
    alert('沒有單字可以匯出！');
    return;
  }

  // 建立 JSON 檔案內容
  const dataStr = JSON.stringify(allWords, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });

  // 建立下載連結
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;

  // 檔案名稱：vocabulary_2024-02-23.json
  const today = new Date().toISOString().split('T')[0];
  a.download = `vocabulary_${today}.json`;

  // 觸發下載
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('Exported', allWords.length, 'words');
}

/**
 * 匯入單字表從 JSON 檔案
 * @param {File} file - 使用者選擇的檔案
 */
async function importVocabulary(file) {
  try {
    // 讀取檔案內容
    const text = await file.text();
    const importedWords = JSON.parse(text);

    // 驗證資料格式
    if (!Array.isArray(importedWords)) {
      throw new Error('檔案格式錯誤：必須是陣列');
    }

    // 驗證每個單字物件的必要欄位
    const isValid = importedWords.every(word =>
      word.id && word.word && word.language && word.translation && word.savedAt
    );

    if (!isValid) {
      throw new Error('檔案格式錯誤：單字資料不完整');
    }

    // 詢問使用者是覆蓋還是合併
    const shouldReplace = confirm(
      `即將匯入 ${importedWords.length} 個單字。\n\n` +
      `點擊「確定」將覆蓋現有單字表\n` +
      `點擊「取消」將合併到現有單字表`
    );

    if (shouldReplace) {
      // 覆蓋模式
      allWords = importedWords;
    } else {
      // 合併模式：去除重複的 ID
      const existingIds = new Set(allWords.map(w => w.id));
      const newWords = importedWords.filter(w => !existingIds.has(w.id));
      allWords = [...allWords, ...newWords];

      // 依照儲存時間排序（最新的在前面）
      allWords.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    }

    // 儲存到 chrome.storage
    await chrome.storage.local.set({ vocabulary: allWords });

    // 重新載入與顯示
    await loadVocabulary();
    applyFilters();
    updateStats(allWords);

    alert(`成功匯入 ${importedWords.length} 個單字！`);
    console.log('Imported', importedWords.length, 'words');

  } catch (error) {
    console.error('Failed to import vocabulary:', error);
    alert(`匯入失敗：${error.message}`);
  }
}

// ===================================
// 事件監聽器綁定
// ===================================

/**
 * 初始化所有事件監聽器
 */
function initializeEventListeners() {
  // 1. 設定連結（開啟設定頁面）
  document.getElementById('settings-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  // 2. 搜尋輸入框（即時搜尋）
  document.getElementById('search-input').addEventListener('input', (e) => {
    searchWords(e.target.value);
  });

  // 3. 語言篩選按鈕
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // 移除所有按鈕的 active 狀態
      filterButtons.forEach(b => b.classList.remove('active'));

      // 為點擊的按鈕加上 active 狀態
      e.target.classList.add('active');

      // 套用語言篩選
      const lang = e.target.dataset.lang;
      filterByLanguage(lang);
    });
  });

  // 4. 匯出按鈕
  document.getElementById('export-btn').addEventListener('click', exportVocabulary);

  // 5. 匯入按鈕（觸發檔案選擇器）
  document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });

  // 6. 檔案選擇器（使用者選擇檔案後）
  document.getElementById('import-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      importVocabulary(file);
      // 清空檔案選擇器，讓使用者可以重複匯入同一個檔案
      e.target.value = '';
    }
  });
}
