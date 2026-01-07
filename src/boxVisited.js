// General box visited state handling for all boxes

import { scaleTextToFit } from './textScaling.js';

// Map each box number to its specific advice text
const adviceTexts = {
  1: "Take one slow breath.",
  3: "Choose rest tonight.",
  4: "End your day earlier.",
  5: "Protect one silent hour.",
  9: "Eat one real meal.",
  12: "Give undivided minutes today.",
  13: "Reach out once today.",
  14: "Be here a moment."
};

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
      // Use the specific advice text for this box, or fallback if not found
      span.textContent = adviceTexts[boxNumber] || `Advice${boxNumber}`;

      // Scale Advice text with a debounced scheduler to avoid the quick double-pass
      const scheduleScale = (() => {
        let rafId = null;
        return (reason) => {
          if (box.dataset.animating === 'true' && reason !== 'anim-complete') {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/9b8b9d03-a71c-482b-80a1-522ea625e906',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'post-fix2',hypothesisId:'H6',location:'boxVisited.js:scheduleScale',message:'scale skipped while animating',data:{reason,boxNumber},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            return;
          }
          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/9b8b9d03-a71c-482b-80a1-522ea625e906',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'post-fix2',hypothesisId:'H1',location:'boxVisited.js:scheduleScale',message:'scale start',data:{reason,boxNumber,boxSize:{w:box.clientWidth,h:box.clientHeight}},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            scaleTextToFit(span, box, { minFontSize: 18, padding: 16, maxIterations: 60, debugReason: reason });
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/9b8b9d03-a71c-482b-80a1-522ea625e906',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'post-fix2',hypothesisId:'H1',location:'boxVisited.js:scheduleScale',message:'scale end',data:{reason,boxNumber,fontSize:parseFloat(window.getComputedStyle(span).fontSize)||null,spanSize:{w:span.scrollWidth,h:span.scrollHeight},boxSize:{w:box.clientWidth,h:box.clientHeight}},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            rafId = null;
          });
        };
      })();

      // Track animation state to defer resize-driven scaling until animation completes
      let needsScaleAfterAnim = false;
      let resizeTimer = null;

      // Single scheduled scale right after state change, then a second after layout settles
      scheduleScale('initial');
      requestAnimationFrame(() => {
        setTimeout(() => {
          scheduleScale('post-settle');
        }, 80);
      });

      // Listen for animation completion to run one clean scale if needed
      box.addEventListener('boxAnimationComplete', () => {
        needsScaleAfterAnim = false;
        scheduleScale('anim-complete');
        if (span) {
          span.style.opacity = '1';
        }
      });

      // Rescale on box size changes without double-firing
      const resizeObserver = new ResizeObserver(() => {
        const animating = box.dataset.animating === 'true';
        if (animating) {
          needsScaleAfterAnim = true;
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/9b8b9d03-a71c-482b-80a1-522ea625e906',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'post-fix2',hypothesisId:'H2',location:'boxVisited.js:resizeObserver',message:'resize skipped during anim',data:{boxNumber,boxSize:{w:box.clientWidth,h:box.clientHeight}},timestamp:Date.now()})}).catch(()=>{});
          // #endregion
          return;
        }
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/9b8b9d03-a71c-482b-80a1-522ea625e906',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'post-fix2',hypothesisId:'H2',location:'boxVisited.js:resizeObserver',message:'resize debounced',data:{boxNumber,boxSize:{w:box.clientWidth,h:box.clientHeight}},timestamp:Date.now()})}).catch(()=>{});
          // #endregion
          scheduleScale('resize-debounced');
        }, 80);
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

