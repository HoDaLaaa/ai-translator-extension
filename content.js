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
