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

  if (request.action === 'saveWord') {
    saveWord(request.data)
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

  const model = settings.customModel || settings.model || 'gpt-4o';
  const endpoint = settings.apiEndpoint || 'https://api.openai.com/v1';

  // Build prompt based on mode
  const prompt = buildPrompt(text, context, mode);

  // Call API
  const result = await callAPI(endpoint, settings.apiKey, model, prompt);

  // Update stats
  await updateStats();

  return result;
}

function buildPrompt(text, context, mode) {
  if (mode === 'learning') {
    return `你是一個專業的語言學習助手。使用者選取了以下文字,請提供詳細的學習說明。

選取的文字:「${text}」
上下文:${context}

請用繁體中文回應,並使用以下格式:

翻譯:[提供準確的中文翻譯]

詞性:[標明詞性,如:名詞、動詞、形容詞、片語等]

說明:[用淺顯易懂的方式解釋這個詞/片語的意思和用法。把整個選取的內容視為一個完整的學習單元,不要逐字拆解]

例句:
• [英文或日文例句]
  ([中文翻譯])
• [另一個例句]
  ([中文翻譯])

注意:
- 把整個選取的文字視為一個完整的單元
- 提供 1-2 個實用的例句
- 說明要清楚但不要太學術化`;
  } else {
    // Translation mode
    return `請將以下文字翻譯成繁體中文。只需要提供翻譯結果,不需要其他說明。

文字:${text}

翻譯:`;
  }
}

async function callAPI(endpoint, apiKey, model, prompt) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    // Build OpenAI-compatible endpoint
    const apiUrl = endpoint.endsWith('/')
      ? endpoint + 'chat/completions'
      : endpoint + '/chat/completions';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1024,
        temperature: 0.8,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API 錯誤: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch {
        errorMessage += ` - ${errorText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    // OpenAI format: choices[0].message.content
    const content = data.choices[0].message.content;

    return parseResponse(content);
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('請求超時:AI 服務回應時間過長');
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
    if (line.startsWith('翻譯:') || line.startsWith('翻译:')) {
      currentSection = 'translation';
      result.translation = line.replace(/^翻[譯译]:/, '').trim();
    } else if (line.startsWith('詞性:') || line.startsWith('词性:')) {
      currentSection = 'partOfSpeech';
      result.partOfSpeech = line.replace(/^詞性:/, '').replace(/^词性:/, '').trim();
    } else if (line.startsWith('說明:') || line.startsWith('说明:')) {
      currentSection = 'explanation';
      result.explanation = line.replace(/^說明:/, '').replace(/^说明:/, '').trim();
    } else if (line.startsWith('例句:') || line.startsWith('例句:')) {
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
    // Build OpenAI-compatible endpoint
    const endpoint = apiEndpoint.endsWith('/')
      ? apiEndpoint + 'chat/completions'
      : apiEndpoint + '/chat/completions';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'gpt-4o',
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Test connection'
          }
        ],
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API 錯誤: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch {
        errorMessage += ` - ${errorText}`;
      }
      throw new Error(errorMessage);
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

async function saveWord(word) {
  // I4 FIX: Validate required fields and sanitize data before saving
  if (!word.word || !word.translation || !word.language) {
    throw new Error('資料格式錯誤：缺少必要欄位');
  }

  // Sanitize data to prevent XSS and ensure data integrity
  const sanitizedWord = {
    id: word.id,
    word: String(word.word).trim(),
    language: String(word.language),
    translation: String(word.translation),
    partOfSpeech: String(word.partOfSpeech || ''),
    explanation: String(word.explanation || ''),
    examples: Array.isArray(word.examples) ? word.examples : [],
    context: String(word.context || ''),
    sourceUrl: String(word.sourceUrl || ''),
    savedAt: word.savedAt
  };

  // Validate that sanitized word is not empty
  if (!sanitizedWord.word) {
    throw new Error('資料格式錯誤：單字不能為空');
  }

  // Get existing vocabulary
  const result = await chrome.storage.local.get(['vocabulary']);
  const vocabulary = result.vocabulary || [];

  // Check for duplicates using sanitized word
  const duplicate = vocabulary.find(w =>
    w.word.toLowerCase() === sanitizedWord.word.toLowerCase() &&
    w.sourceUrl === sanitizedWord.sourceUrl
  );

  if (duplicate) {
    throw new Error('此單字已經在單字表中');
  }

  // Add new word (at beginning)
  vocabulary.unshift(sanitizedWord);

  // Save back to storage
  await chrome.storage.local.set({ vocabulary });

  console.log('Word saved:', sanitizedWord);
}
