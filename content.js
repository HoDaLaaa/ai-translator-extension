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

function showFloatingWindow() {
  // Remove existing window
  removeFloatingWindow();

  // Create window element
  floatingWindow = document.createElement('div');
  floatingWindow.className = 'ai-translator-window';

  // Position near selection
  const rect = selectionRange.getBoundingClientRect();
  positionWindow(floatingWindow, rect);

  // Show loading state
  floatingWindow.innerHTML = `
    <div class="ai-translator-header">
      <span class="ai-translator-title">🌐 ${escapeHtml(selectedText.substring(0, 30))}${selectedText.length > 30 ? '...' : ''}</span>
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

  // TODO: Request translation from background script (Task 6)
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
