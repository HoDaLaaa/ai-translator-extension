// Content script for AI Translator Extension
console.log('AI Translator Extension: Content script loaded');

let selectedText = '';
let selectionRange = null;
let iconElement = null;

// Listen for text selection
document.addEventListener('mouseup', handleTextSelection);
document.addEventListener('keyup', handleTextSelection);

// Remove icon when clicking elsewhere
document.addEventListener('mousedown', (event) => {
  if (iconElement && !iconElement.contains(event.target)) {
    removeIcon();
  }
});

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

  // Position icon at the end of selection
  const rect = selectionRange.getBoundingClientRect();
  iconElement.style.position = 'fixed';
  iconElement.style.left = `${rect.right + 5}px`;
  iconElement.style.top = `${rect.top}px`;

  // Add click handler
  iconElement.addEventListener('click', handleIconClick);

  // Add to page
  document.body.appendChild(iconElement);

  // Fade in animation
  setTimeout(() => {
    iconElement.classList.add('visible');
  }, 10);
}

function removeIcon() {
  if (iconElement) {
    iconElement.remove();
    iconElement = null;
  }
}

function handleIconClick(event) {
  event.stopPropagation();
  console.log('Icon clicked! Selected text:', selectedText);
  // TODO: Show floating window (Task 4)
}

// Keep the improved getSelectionContext from Task 2
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
