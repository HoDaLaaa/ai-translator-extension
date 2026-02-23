// Content script for AI Translator Extension
console.log('AI Translator Extension: Content script loaded');

let selectedText = '';
let selectionRange = null;

// Listen for text selection (mouse and keyboard)
document.addEventListener('mouseup', handleTextSelection);
document.addEventListener('keyup', handleTextSelection);

function handleTextSelection(event) {
  try {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text.length > 0 && selection.rangeCount > 0) {
      selectedText = text;
      selectionRange = selection.getRangeAt(0);

      // Get surrounding context
      const context = getSelectionContext(selectionRange, text, 50);

      console.log('Selected text:', text);
      console.log('Context:', context);
      console.log('Selection position:', selectionRange.getBoundingClientRect());
    }
  } catch (error) {
    console.error('Error handling text selection:', error);
  }
}

function getSelectionContext(range, textContent, contextLength) {
  const container = range.commonAncestorContainer;
  const fullText = container.textContent || '';

  // Use range's actual start position instead of indexOf
  const startOffset = range.startOffset;

  const contextStart = Math.max(0, startOffset - contextLength);
  const contextEnd = Math.min(fullText.length, startOffset + textContent.length + contextLength);

  return fullText.substring(contextStart, contextEnd);
}
