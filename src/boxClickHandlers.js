// Box click handlers - makes all boxes clickable

import gsap from 'gsap';
import { setupBoxVisited } from './boxVisited.js';
import { animateGridOnAdviceClick } from './gridAnimation.js';

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

export function setupBoxClickHandlers(textBoxes) {
  textBoxes.forEach((box) => {
    const boxNumber = getBoxNumber(box);
    if (!boxNumber) return;
    
    const storageKey = `box${boxNumber}Visited`;
    const visited = sessionStorage.getItem(storageKey);
    
    // Skip if already visited (non-interactive)
    if (visited === 'true') return;
    
    box.addEventListener('click', () => {
      const span = box.querySelector('span');

      // Mark box as visited in this session
      sessionStorage.setItem(storageKey, 'true');

      // Animate the transition from image card -> blue Advice card with GSAP
      const tl = gsap.timeline();

      // First, gently shrink and fade out the current text
      tl.to(box, {
        scale: 0.96,
        duration: 0.15,
        ease: 'power1.in'
      }, 0);

      if (span) {
        tl.to(span, {
          opacity: 0,
          duration: 0.15,
          ease: 'power1.in'
        }, 0);
      }

      // Switch to the visited/advice state while the box is "in transition"
      tl.add(() => {
        setupBoxVisited(box);          // adds .visited and sets AdviceN text
        box.style.backgroundImage = 'none'; // ensure image disappears immediately
      });

      // Then grow and fade in the new Advice text
      tl.to(box, {
        scale: 1.03,
        duration: 0.25,
        ease: 'power2.out'
      });

      if (span) {
        tl.to(span, {
          opacity: 1,
          duration: 0.25,
          ease: 'power2.out'
        }, '<');
      }

      // Run the complex grid / text resizing animation for this Advice box
      animateGridOnAdviceClick(box);
    });
  });
}

