// Main initialization file

import { setupAllBoxesVisited } from './boxVisited.js';
import { setupBoxClickHandlers } from './boxClickHandlers.js';

const hoverImages = [
  'A.png',
  'B.png',
  'C.png',
  'D.png',
  'E.png',
  'F.png',
  'G.png',
  'H.png',
  'I.png',
  'Y.png',
  'Z.png'
];

const FALLBACK_IMAGE = 'E.png';

function assignHoverImages(textBoxes) {
  textBoxes.forEach((box, index) => {
    const imageName = hoverImages[index] || FALLBACK_IMAGE;
    box.style.setProperty('--hover-image', `url('/public/images/${imageName}')`);
  });
}

// Function to initialize main content
function initMainContent() {
  const container = document.getElementById('container');
  const gridWrapper = document.querySelector('.grid-wrapper');
  const textBoxes = document.querySelectorAll('.text-box');
  
  if (!container || !gridWrapper || textBoxes.length === 0) {
    return;
  }

  // Ensure grid layout is reset to default
  gridWrapper.style.gridTemplateColumns = 'repeat(12, 1fr)';
  gridWrapper.style.gridTemplateRows = 'repeat(8, 1fr)';
  
  // Setup visited state handling for all boxes FIRST (so visited class is added)
  setupAllBoxesVisited(textBoxes);
  
  // Setup click handlers for all boxes
  setupBoxClickHandlers(textBoxes);
}

// Export for use in transition
window.initMainContent = initMainContent;

// Initialize on load (container might be hidden but layout will be calculated)
window.addEventListener('load', () => {
  // Clear session storage to reset visited state on reload
  sessionStorage.clear();

  // Wait a bit to ensure DOM is ready
  setTimeout(() => {
    initMainContent();
  }, 100);
});
