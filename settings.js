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
