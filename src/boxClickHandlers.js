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
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/9b8b9d03-a71c-482b-80a1-522ea625e906',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'post-fix2',hypothesisId:'H3',location:'boxClickHandlers.js:click',message:'box click',data:{boxNumber,visitedBefore:visited},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      const span = box.querySelector('span');

      // Flag animation in progress so resize-driven scaling can be deferred
      box.dataset.animating = 'true';
      if (span) {
        span.style.opacity = '0';
      }

      // Mark box as visited in this session
      sessionStorage.setItem(storageKey, 'true');

      // Animate the transition from image card -> blue Advice card with GSAP
      const tl = gsap.timeline();

      // First, gently shrink and fade out the current text
      tl.to(box, {
        scale: 0.97,
        duration: 0.2,
        ease: 'power2.inOut'
      }, 0);

      if (span) {
        tl.to(span, {
          opacity: 0,
          duration: 0.18,
          ease: 'power2.inOut'
        }, 0);
      }

      // Switch to the visited/advice state while the box is "in transition"
      tl.add(() => {
        setupBoxVisited(box);          // adds .visited and sets AdviceN text
        box.style.backgroundImage = 'none'; // ensure image disappears immediately
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/9b8b9d03-a71c-482b-80a1-522ea625e906',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'post-fix2',hypothesisId:'H3',location:'boxClickHandlers.js:post-visited',message:'visited applied',data:{boxNumber,fontSize:span?parseFloat(window.getComputedStyle(span).fontSize):null},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      });

      tl.eventCallback('onComplete', () => {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/9b8b9d03-a71c-482b-80a1-522ea625e906',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'post-fix2',hypothesisId:'H5',location:'boxClickHandlers.js:timelineComplete',message:'timeline complete',data:{boxNumber,fontSize:span?parseFloat(window.getComputedStyle(span).fontSize):null,opacity:span?parseFloat(window.getComputedStyle(span).opacity):null},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        box.dataset.animating = 'false';
        box.dispatchEvent(new CustomEvent('boxAnimationComplete'));
      });

      // Then grow and fade in the new Advice text
      tl.to(box, {
        scale: 1,
        duration: 0.35,
        ease: 'power2.out'
      });

      if (span) {
        tl.to(span, {
          opacity: 1,
          duration: 0.35,
          ease: 'power2.out'
        }, '<');
      }

      // Run the complex grid / text resizing animation for this Advice box
      animateGridOnAdviceClick(box);
    });
  });
}

