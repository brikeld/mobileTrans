// --- DATA ---------------------------------------------------
const brownPhrases = [
  "YOUR COLLEAGUES ARE MUCH BETTER",
  "IT'S REALLY TOO SLOW",
  "YOU NEED TO WORK FASTER",
  "CAN YOU COME IN THIS WEEKEND?",
  "WE ARE A FAMILY HERE",
  "YOU NEED TO FINISH IT ON TIME",
  "CONSISTENCY IS KEY"
];

const bluePhrases = [
  "DO YOU WANT TO GO OUT TONIGHT",
  "LET'S SEE GRANDMA SUNDAY",
  "THE MATCH IS NEXT WEEK",
  "WHERE ARE WE GOING ON HOLIDAY THIS YEAR",
  "LET'S EAT OUTSIDE",
  "YOU COMING FOR CHRISTMAS?",
  "DO YOU HAVE DAYS OFF?"
];

const GAP = 8; // gap between tokens (must match CSS .row-track gap)

const wrapper = document.getElementById("wrapper");
const rowConfigs = [];

// --- HELPER FUNCTIONS ---------------------------------------

function createToken(text, className) {
  const span = document.createElement("span");
  span.className = "token " + className;
  span.textContent = text;
  return span;
}

function measureWidth(tokens) {
  return tokens.reduce((acc, el, idx) => {
    const w = el.offsetWidth;
    const gap = idx === tokens.length - 1 ? 0 : GAP;
    return acc + w + gap;
  }, 0);
}

// Track when the brown loop starts
let brownLoopStarted = false;
let brownLoopStartTime = null;

// Infinite brown stream after the push animation
function startBrownLoop(track) {
  // stop any previous tweens on this track
  gsap.killTweensOf(track);

  // duplicate content for seamless loop
  const originalHTML = track.innerHTML;
  track.innerHTML = originalHTML + originalHTML;

  const halfWidth = track.scrollWidth / 2; // width of one copy

  // start everyone from x = 0 so direction is consistent
  gsap.set(track, { x: 0 });

  gsap.to(track, {
    x: -halfWidth,          // always move LEFT
    duration: 20,           // adjust speed here
    ease: "none",
    repeat: -1,
    modifiers: {
      // when we've shifted by one full copy, jump back
      x: gsap.utils.unitize(x => {
        let v = parseFloat(x);
        if (v <= -halfWidth) {
          v += halfWidth;
        }
        return v;
      })
    }
  });

  // Mark the start of brown loop (only once)
  if (!brownLoopStarted) {
    brownLoopStarted = true;
    brownLoopStartTime = Date.now();
    scheduleOverloadSystem();
  }
}

// --- BUILD ROWS ---------------------------------------------

function buildRows() {
  const approxRowHeight = 22; // tweak to pack rows more/less tightly
  const rowCount = Math.ceil(window.innerHeight / approxRowHeight) + 1;

  for (let r = 0; r < rowCount; r++) {
    const row = document.createElement("div");
    row.className = "row";

    const track = document.createElement("div");
    track.className = "row-track";
    row.appendChild(track);

    const cfg = {
      row,
      track,
      leftBrowns: [], // segment 2 (far left browns)
      midBrowns: [],  // segment 0 (browns that start visible)
      blues: [],      // segment 1 (all blues at the right end)
      xStart: 0,
      xEnd: 0
    };

    // Seed some browns on the far left (these are the "new" pushing ones).
    const leftCount = 5 + Math.floor(Math.random() * 8); // 5–12
    for (let i = 0; i < leftCount; i++) {
      const t = createToken(
        brownPhrases[(i + r * 3) % brownPhrases.length],
        "brown"
      );
      cfg.leftBrowns.push(t);
      track.appendChild(t);
    }

    // Seed mid browns (start visible, left half-ish).
    const midCount = 4 + Math.floor(Math.random() * 6); // 4–9
    for (let i = 0; i < midCount; i++) {
      const t = createToken(
        brownPhrases[(i + r) % brownPhrases.length],
        "brown"
      );
      cfg.midBrowns.push(t);
      track.appendChild(t);
    }

    // Seed blue section (right half-ish).
    const blueCount = 2 + Math.floor(Math.random() * 3); // 2–4
    for (let i = 0; i < blueCount; i++) {
      const t = createToken(
        bluePhrases[(i + r) % bluePhrases.length],
        "blue"
      );
      cfg.blues.push(t);
      track.appendChild(t);
    }

    wrapper.appendChild(row);
    rowConfigs.push(cfg);
  }
}

// --- PREPARE ROWS & ANIMATION -------------------------------

function prepareRows() {
  rowConfigs.forEach((cfg, index) => {
    const { row, track, leftBrowns, midBrowns, blues } = cfg;

    const rowWidth = row.offsetWidth;

    // Helper: add tokens to specific segments.
    function addMidBrown() {
      const t = createToken(
        brownPhrases[(midBrowns.length + index * 2) % brownPhrases.length],
        "brown"
      );
      midBrowns.push(t);
      track.appendChild(t);
    }

    function addLeftBrown() {
      const t = createToken(
        brownPhrases[(leftBrowns.length + index * 5) % brownPhrases.length],
        "brown"
      );
      leftBrowns.push(t);
      // insert at the very start so left segment stays on the far left
      track.insertBefore(t, track.firstChild);
    }

    function addBlue() {
      const t = createToken(
        bluePhrases[(blues.length + index * 3) % bluePhrases.length],
        "blue"
      );
      blues.push(t);
      track.appendChild(t);
    }

    // First measurement
    let wLeft = measureWidth(leftBrowns);
    let wMid = measureWidth(midBrowns);
    let wBlue = measureWidth(blues);

    // Target distribution: ~45–55% browns at start.
    const brownShare = 0.45 + (Math.random() * 0.2 - 0.1); // 0.35–0.55
    let brownVisible = rowWidth * brownShare;

    // Avoid crazy extremes.
    brownVisible = Math.max(rowWidth * 0.3, Math.min(rowWidth * 0.7, brownVisible));

    // Ensure mid browns are wide enough to cover the start brown area.
    while (wMid < brownVisible) {
      addMidBrown();
      wMid = measureWidth(midBrowns);
    }

    // Ensure blues are wide enough to fill the rest of the row + a bit of slack.
    const targetBlue = rowWidth - brownVisible + 80;
    while (wBlue < targetBlue) {
      addBlue();
      wBlue = measureWidth(blues);
    }

    // Ensure (left + mid) browns combined can fully cover the row at the end with extra margin.
    while (wLeft + wMid < rowWidth + 300) {
      addLeftBrown();
      wLeft = measureWidth(leftBrowns);
    }

    // Re-measure after all additions.
    wLeft = measureWidth(leftBrowns);
    wMid = measureWidth(midBrowns);
    wBlue = measureWidth(blues);

    const totalWidth = wLeft + wMid + wBlue;

    // START POSITION:
    // Visible range = [a, a + rowWidth] in track coordinates.
    // We want last brownVisible part of midBrowns on the left, then blues on the right.
    const a = wLeft + (wMid - brownVisible);
    const xStart = -a; // because trackX + x = screenX

    // END POSITION:
    // We want only browns visible and all blue tokens off to the RIGHT.
    const buffer = 400; // extra push to ensure blues are fully off-screen
    let xEnd = rowWidth - (wLeft + wMid) + buffer;

    cfg.xStart = xStart;
    cfg.xEnd = xEnd;

    // Set initial position
    gsap.set(track, { x: xStart });

    // --- Row animation with push / push-back / final push ---
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" }
    });

    const xMid1 = xStart + (xEnd - xStart) * 0.6; // strong brown push
    const xMid2 = xMid1 - (xMid1 - xStart) * 0.25; // blue push-back

    tl.to(track, {
      duration: 2.5,
      x: xMid1
    });

    tl.to(track, {
      duration: 1.4,
      x: xMid2,
      ease: "power1.out"
    });

    tl.to(track, {
      duration: 2.5,
      x: xEnd,
      ease: "power3.in"
    });

    // After the push is done: remove blues and start infinite brown stream
    tl.call(() => {
      blues.forEach(el => el.remove());
      startBrownLoop(track); // <— NEW, no xEnd, all rows scroll left
    });

    // Stagger rows slightly for a more organic feel.
    tl.delay(index * 0.06);
  });
}

// --- OVERLOAD SYSTEM OVERLAY ---------------------------------

function scheduleOverloadSystem() {
  // Show the overload overlay after 4 seconds of brown stream
  setTimeout(() => {
    const overlay = document.getElementById('overload-overlay');
    const box = overlay.querySelector('.overload-box');
    const text = overlay.querySelector('.overload-text');
    
    // Set initial states
    gsap.set(box, { scale: 0, rotation: -5 });
    gsap.set(text, { opacity: 0, y: 30 });
    
    // Create animation timeline
    const tl = gsap.timeline();
    
    tl.to(overlay, {
      opacity: 1,
      duration: 0.2,
      ease: "power1.in"
    });
    
    tl.to(box, {
      scale: 1,
      rotation: 0,
      duration: 0.8,
      ease: "elastic.out(1, 0.6)"
    }, "-=0.1");
    
    tl.to(text, {
      opacity: 1,
      y: 0,
      duration: 0.2,
      ease: "power1.out"
    }, "-=0.3");

    // Make overlay clickable
    overlay.style.pointerEvents = 'auto';
    overlay.style.cursor = 'pointer';
    
    // Add click handler to transition to main content
    overlay.addEventListener('click', transitionToMainContent);
  }, 4000); // 4 seconds
}

// --- TRANSITION TO MAIN CONTENT -----------------------------

function transitionToMainContent() {
  const introductionSection = document.getElementById('introduction-section');
  const mainContent = document.getElementById('container');
  
  // Mark introduction as shown in sessionStorage (for this session only)
  sessionStorage.setItem('introductionShown', 'true');
  
  // Fade out introduction
  gsap.to(introductionSection, {
    opacity: 0,
    duration: 0.5,
    ease: "power2.in",
    onComplete: () => {
      introductionSection.style.display = 'none';
      // Show and fade in main content
      mainContent.style.pointerEvents = 'auto';
      
      // Force a reflow to ensure layout is calculated
      mainContent.offsetHeight;
      
      // Re-initialize main content if needed (with a small delay to ensure layout)
      if (window.initMainContent) {
        setTimeout(() => {
          window.initMainContent();
        }, 50);
      }
      
      gsap.to(mainContent, {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  });
}

// --- INITIALIZE ---------------------------------------------

window.addEventListener("load", () => {
  // Check navigation type to determine if this is a back/forward navigation
  const navigationType = performance.getEntriesByType('navigation')[0]?.type || 
                         (performance.navigation ? 
                           (performance.navigation.type === 2 ? 'back_forward' : 'navigate') : 
                           'navigate');
  
  // Check if introduction has already been shown in this session
  const introductionShown = sessionStorage.getItem('introductionShown');
  
  // Skip introduction only if:
  // 1. It was already shown in this session AND
  // 2. We're navigating back/forward (not a fresh load or refresh)
  if (introductionShown === 'true' && navigationType === 'back_forward') {
    // Skip introduction, show main content directly
    const introductionSection = document.getElementById('introduction-section');
    const mainContent = document.getElementById('container');
    
    if (introductionSection) {
      introductionSection.style.display = 'none';
    }
    
    if (mainContent) {
      mainContent.style.opacity = '1';
      mainContent.style.pointerEvents = 'auto';
      
      // Initialize main content
      if (window.initMainContent) {
        setTimeout(() => {
          window.initMainContent();
        }, 100);
      }
    }
  } else {
    // Show introduction for fresh loads and refreshes
    // Clear the flag on refresh/fresh load so introduction shows again
    if (navigationType === 'reload' || navigationType === 'navigate') {
      sessionStorage.removeItem('introductionShown');
    }
    
    buildRows();
    // let the browser lay out everything before measuring
    requestAnimationFrame(prepareRows);
  }
});

