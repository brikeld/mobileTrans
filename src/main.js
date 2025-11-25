// Main initialization file

import gsap from 'gsap';
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

function setupAccordionMenu() {
  const headers = document.querySelectorAll('.accordion-header');
  
  headers.forEach(header => {
    const content = header.nextElementSibling;
    const inner = content.querySelector('.accordion-inner');
    let isOpen = false;
    
    // Initialize all content panels as closed
    gsap.set(content, { height: 0, opacity: 0, overflow: 'hidden' });
    
    header.addEventListener('click', () => {
      if (isOpen) {
        // Close: get current height and animate to 0
        const currentHeight = content.offsetHeight || content.scrollHeight;
        gsap.to(content, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: 'power1.inOut',
          onComplete: () => {
            isOpen = false;
          }
        });
      } else {
        // Open: temporarily set height to auto to measure actual content height
        // This ensures scrollHeight is calculated correctly even for the last item
        gsap.set(content, { height: 'auto', opacity: 0 });
        const targetHeight = content.scrollHeight;
        gsap.set(content, { height: 0 });
        
        isOpen = true;
        
        gsap.to(content, {
          height: targetHeight,
          opacity: 1,
          duration: 0.3,
          ease: 'power1.inOut'
        });
      }
    });
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
  
  // Setup accordion menu with GSAP animations
  setupAccordionMenu();
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
