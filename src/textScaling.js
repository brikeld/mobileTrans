// Text scaling utilities

import gsap from 'gsap';

export function scaleTextToFit(span, box, options = {}) {
  const {
    minFontSize = 18,
    padding = 16,
    maxIterations = 50,
    apply = true,
    lineHeight = 1.05,
    debugReason = 'unknown'
  } = options;

  if (!span || !box) return;

  const availableWidth = Math.max(0, box.clientWidth - padding);
  const availableHeight = Math.max(0, box.clientHeight - padding);

  if (availableWidth === 0 || availableHeight === 0) return;

  const previousFontSize = span.style.fontSize;
  const previousLineHeight = span.style.lineHeight;

  // Keep text wrapping only at natural word boundaries to avoid single-letter lines
  span.style.whiteSpace = 'normal';
  span.style.wordBreak = 'keep-all';
  span.style.overflowWrap = 'normal';
  span.style.hyphens = 'none';
  span.style.textAlign = 'center';
  span.style.maxWidth = `${availableWidth}px`;
  span.style.lineHeight = `${lineHeight}`;

  const currentComputedSize = parseFloat(window.getComputedStyle(span).fontSize) || minFontSize;
  let low = minFontSize;
  // Allow plenty of headroom so short texts can get large
  let high = Math.max(currentComputedSize, Math.min(availableWidth, availableHeight) * 1.9);
  if (high < low) high = low;

  let bestFit = low;
  let iterations = 0;

  while (iterations < maxIterations && high - low > 0.5) {
    const mid = (low + high) / 2;
    span.style.fontSize = `${mid}px`;

    const fitsWidth = span.scrollWidth <= availableWidth;
    const fitsHeight = span.scrollHeight <= availableHeight;

    if (fitsWidth && fitsHeight) {
      bestFit = mid;
      low = mid;
    } else {
      high = mid;
    }

    iterations++;
  }

  bestFit = Math.max(bestFit, minFontSize);

  if (apply) {
    // Apply a small safety margin to avoid layout ripple on neighbors
    const adjusted = bestFit * 0.9; // reduce shrink to avoid visible jump
    span.style.fontSize = `${adjusted}px`;
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/9b8b9d03-a71c-482b-80a1-522ea625e906',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'post-fix2',hypothesisId:'H4',location:'textScaling.js:scaleTextToFit',message:'apply size',data:{reason:debugReason,bestFit,adjusted,appliedFont:adjusted,boxSize:{w:box.clientWidth,h:box.clientHeight},spanSize:{w:span.scrollWidth,h:span.scrollHeight}},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  } else {
    // Restore original inline styles when we're only measuring
    span.style.fontSize = previousFontSize;
    span.style.lineHeight = previousLineHeight;
  }

  return bestFit;
}
export function scaleTextAfterGridAnimation(span, box, originalFontSize) {
  if (!span || !box) return;

  const currentSize = parseFloat(window.getComputedStyle(span).fontSize) || originalFontSize || 18;

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/9b8b9d03-a71c-482b-80a1-522ea625e906',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'post-fix2',hypothesisId:'H7',location:'textScaling.js:scaleTextAfterGridAnimation',message:'start grid scale',data:{currentSize,boxSize:{w:box.clientWidth,h:box.clientHeight}},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  // Find the largest size that fits the new box, but do not apply it yet
  const targetSize = scaleTextToFit(span, box, {
    minFontSize: Math.max(18, currentSize * 0.9),
    padding: 16,
    maxIterations: 60,
    apply: false
  });

  const finalSize = targetSize ? targetSize * 0.95 : currentSize;

  // Animate up to the fitted size, then lock it in precisely
  gsap.to(span, {
    fontSize: `${finalSize}px`,
    duration: 0.45,
    ease: 'power2.out',
    onComplete: () => {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/9b8b9d03-a71c-482b-80a1-522ea625e906',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'post-fix2',hypothesisId:'H8',location:'textScaling.js:scaleTextAfterGridAnimation',message:'grid scale complete',data:{finalSize,boxSize:{w:box.clientWidth,h:box.clientHeight}},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      if (targetSize) {
        scaleTextToFit(span, box, {
          minFontSize: 18,
          padding: 16,
          maxIterations: 10
        });
      }
    }
  });
}


