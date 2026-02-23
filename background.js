// Background service worker for AI Translator Extension
console.log('AI Translator Extension: Background script loaded');

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  sendResponse({ status: 'ok' });
  return true;
});
