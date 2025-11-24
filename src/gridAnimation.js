// Grid animation logic for hover effects

import gsap from 'gsap';
import { randomSize, getGridPosition } from './utils.js';
import { scaleTextAfterGridAnimation } from './textScaling.js';

// Reuse the old "complex" grid resizing logic, but trigger it on click
// instead of hover. This is mobile‑friendly and only runs for the box
// that was just turned into an "Advice" card.
export function animateGridOnAdviceClick(box) {
  const container = document.querySelector('.grid-wrapper');
  if (!container || !box) return;

  const span = box.querySelector('span');
  if (!span) return;

  // Store original font size and box dimensions before the grid stretch
  const originalFontSize = parseFloat(window.getComputedStyle(span).fontSize);
  const originalBoxWidth = box.clientWidth;
  const originalBoxHeight = box.clientHeight;

  const gridPos = getGridPosition(box);
  if (!gridPos) return;

  // Create column sizes (same idea as before: clicked area grows, others shrink)
  const cols = [];
  for (let i = 1; i <= 12; i++) {
    if (i >= gridPos.colStart && i < gridPos.colEnd) {
      cols.push(randomSize(2, 4) + 'fr');
    } else {
      cols.push(randomSize(0.5, 1.2) + 'fr');
    }
  }

  // Create row sizes
  const rows = [];
  for (let i = 1; i <= 8; i++) {
    if (i >= gridPos.rowStart && i < gridPos.rowEnd) {
      rows.push(randomSize(1.8, 3.5) + 'fr');
    } else {
      rows.push(randomSize(0.4, 1.1) + 'fr');
    }
  }

  // Animate grid template properties so the clicked box area expands
  container.style.transition = 'grid-template-columns 0.6s ease, grid-template-rows 0.6s ease';
  container.style.gridTemplateColumns = cols.join(' ');
  container.style.gridTemplateRows = rows.join(' ');

  // After the grid transition completes, animate the Advice text size nicely
  const handleTransitionEnd = () => {
    container.removeEventListener('transitionend', handleTransitionEnd);
    scaleTextAfterGridAnimation(span, box, originalFontSize, originalBoxWidth, originalBoxHeight);
  };

  container.addEventListener('transitionend', handleTransitionEnd);
}

