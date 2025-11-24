// General box visited state handling for all boxes

import { scaleTextToFit } from './textScaling.js';

function getBoxNumber(box) {
  // Extract box number from class name (e.g., "box-1" -> 1, "box-3" -> 3)
  const classList = Array.from(box.classList);
  const boxClass = classList.find(cls => cls.startsWith('box-'));
  if (boxClass) {
    const match = boxClass.match(/box-(\d+)/);
    return match ? parseInt(match[1]) : null;
  }
  return null;
}

export function setupBoxVisited(box) {
  if (!box) return;
  
  const boxNumber = getBoxNumber(box);
  if (!boxNumber) return;
  
  const storageKey = `box${boxNumber}Visited`;
  const visited = sessionStorage.getItem(storageKey);
  
  if (visited === 'true') {
    box.classList.add('visited');
    const span = box.querySelector('span');
    if (span) {
      span.textContent = `Advice${boxNumber}`;

      // Scale Advice text to fit the current box size
      const scaleText = () => {
        scaleTextToFit(span, box, { minFontSize: 20 });
      };

      // Initial scale shortly after layout / grid animation kicks in
      requestAnimationFrame(() => {
        setTimeout(() => {
          scaleText();
        }, 120);
      });

      // Whenever the Advice box changes size (grid animation, resize, etc.),
      // rescale the text so it always fits nicely.
      const resizeObserver = new ResizeObserver(() => {
        scaleText();
      });

      resizeObserver.observe(box);
    }
  }
}

export function setupAllBoxesVisited(textBoxes) {
  textBoxes.forEach((box) => {
    setupBoxVisited(box);
  });
}

