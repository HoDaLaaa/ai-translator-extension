// Content script for AI Translator Extension
console.log('AI Translator Extension: Content script loaded');

// Test message to background
chrome.runtime.sendMessage({ action: 'test' }, (response) => {
  if (chrome.runtime.lastError) {
    console.error('Content script error:', chrome.runtime.lastError.message);
    return;
  }
  console.log('Content script received response:', response);
});
