// Content script for AI Translator Extension
console.log('AI Translator Extension: Content script loaded');

// Test message to background
chrome.runtime.sendMessage({ action: 'test' }, (response) => {
  console.log('Content script received response:', response);
});
