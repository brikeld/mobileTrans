// Text scaling utilities

import gsap from 'gsap';

export function scaleTextToFit(span, box, options = {}) {
  const {
    minFontSize = 20,
    padding = 40,
    maxIterations = 30
  } = options;
  
  const boxWidth = box.clientWidth - padding;
  const boxHeight = box.clientHeight - padding;
  
  if (boxWidth <= 0 || boxHeight <= 0) return;
  
  span.style.maxWidth = boxWidth + 'px';
  
  // Start with a large font size and reduce until it fits
  let fontSize = Math.min(boxWidth, boxHeight) * 0.8;
  span.style.fontSize = fontSize + 'px';
  
  // Binary search for optimal size
  let minSize = minFontSize;
  let maxSize = fontSize * 2;
  let iterations = 0;
  
  while (iterations < maxIterations) {
    const fitsWidth = span.scrollWidth <= boxWidth;
    const fitsHeight = span.scrollHeight <= boxHeight;
    
    if (fitsWidth && fitsHeight) {
      // Text fits, try to make it bigger
      minSize = fontSize;
      fontSize = (fontSize + maxSize) / 2;
    } else {
      // Text doesn't fit, make it smaller
      maxSize = fontSize;
      fontSize = (minSize + fontSize) / 2;
    }
    
    // Ensure fontSize never goes below minimum
    fontSize = Math.max(fontSize, minFontSize);
    span.style.fontSize = fontSize + 'px';
    iterations++;
    
    // Stop if we're close enough
    if (Math.abs(maxSize - minSize) < 0.5) break;
  }
  
  // Final check: ensure we never go below minimum
  const finalFontSize = parseFloat(span.style.fontSize);
  if (finalFontSize < minFontSize) {
    span.style.fontSize = minFontSize + 'px';
  }
}

export function scaleTextAfterGridAnimation(span, box, originalFontSize, originalBoxWidth, originalBoxHeight) {
  const newBoxWidth = box.clientWidth;
  const newBoxHeight = box.clientHeight;
  const containerWidth = newBoxWidth - 40;
  const containerHeight = newBoxHeight - 40;
  
  // Calculate size ratio to determine starting font size
  const widthRatio = newBoxWidth / originalBoxWidth;
  const heightRatio = newBoxHeight / originalBoxHeight;
  const sizeRatio = Math.min(widthRatio, heightRatio);
  
  span.style.maxWidth = containerWidth + 'px';
  
  // Start with a font size proportional to how much bigger the box got
  let optimalSize = originalFontSize * sizeRatio * 2.5;
  
  // Binary search approach: increase if too small, decrease if too big
  let minSize = originalFontSize;
  let maxSize = optimalSize * 3;
  let iterations = 0;
  const maxIterations = 20;
  
  // Temporarily set font size to calculate optimal size (hidden from view)
  const tempFontSize = span.style.fontSize;
  span.style.visibility = 'hidden';
  span.style.fontSize = optimalSize + 'px';
  
  while (iterations < maxIterations) {
    const fitsWidth = span.scrollWidth <= containerWidth;
    const fitsHeight = span.scrollHeight <= containerHeight;
    
    if (fitsWidth && fitsHeight) {
      // Text fits, try to make it bigger
      minSize = optimalSize;
      optimalSize = (optimalSize + maxSize) / 2;
    } else {
      // Text doesn't fit, make it smaller
      maxSize = optimalSize;
      optimalSize = (minSize + optimalSize) / 2;
    }
    
    span.style.fontSize = optimalSize + 'px';
    iterations++;
    
    // Stop if we're close enough
    if (Math.abs(maxSize - minSize) < 1) break;
  }
  
  // Restore visibility and animate to optimal size smoothly
  span.style.visibility = 'visible';
  span.style.fontSize = originalFontSize + 'px';
  
  // Animate with GSAP for smooth effect - no scale transform, just fontSize
  gsap.to(span, {
    fontSize: optimalSize + 'px',
    duration: 0.5,
    ease: 'power2.out',
    onUpdate: function() {
      // Ensure text never exceeds optimal size during animation
      const currentSize = parseFloat(span.style.fontSize);
      if (currentSize > optimalSize) {
        gsap.set(span, { fontSize: optimalSize + 'px' });
      }
    }
  });
}

