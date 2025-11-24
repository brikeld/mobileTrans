// Box-1 visited state handling

import { scaleTextToFit } from './textScaling.js';

export function setupBox1Visited(box1) {
  if (!box1) return;
  
  // Check if coming back from page2
  const visited = sessionStorage.getItem('box1Visited');
  if (visited === 'true') {
    box1.classList.add('visited');
    const span = box1.querySelector('span');
    if (span) {
      span.textContent = 'Advice1';
      
      // Scale text to fill the box as much as possible
      const scaleText = () => {
        scaleTextToFit(span, box1, { minFontSize: 20 });
      };
      
      // Initial scale after layout is ready
      requestAnimationFrame(() => {
        setTimeout(() => {
          scaleText();
        }, 100);
      });
      
      // Continuously watch for box size changes and rescale
      const resizeObserver = new ResizeObserver(() => {
        scaleText();
      });
      
      resizeObserver.observe(box1);
    }
  } else {
    // Only add click listener if not visited
    box1.addEventListener('click', () => {
      sessionStorage.setItem('box1Visited', 'true');
      const span = box1.querySelector('span');
      if (span) {
        const text = span.textContent.trim();
        const filename = text.toLowerCase()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, '') + '.html';
        window.location.href = `/${filename}`;
      } else {
        window.location.href = '/page2.html';
      }
    });
  }
}

