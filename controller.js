import { triggerCompletionWave } from "./display.js";
import { renderStep } from "./display.js";
import { generateBubbleSortHistory, generateRandomArray, generateOptimizedBubbleSortHistory } from "./algorithms.js";
import { audioManager } from "./audio.js";
/**
 *  =============================================================================
 *   CONTROLLER.JS
 *  =============================================================================
 *  
 *  Purpose: 
 *  This file is the "Manager". It coordinates the Workers (Algorithms), 
 *  the Painters (Display), and the Musicians (Audio). It handles User Input
 *  (clicks) and the flow of Time (animation loop).
 */

// =============================================================================
//  1. APPLICATION STATE (MEMORY)
// =============================================================================

// Default settings
let ARRAY_SIZE = 20;

// The raw numbers (e.g., [10, 5, 8])
let array = [];

// THE SCRIPT: A recorded list of every step needed to sort the array.
let sortingHistory = [];

// Where are we in the movie? Frame 0, Frame 10, etc.
let currentStep = 0;

// Are we currently running the animation loop?
let isPlaying = false;

// The ID of the timer (setTimeout) so we can cancel it (Stop)
let timeoutId = null;


// =============================================================================
//  2. DOM ELEMENT REFERENCES (Interface)
// =============================================================================

// We grabbing HTML elements by ID so we can talk to them
const generateBtn = document.getElementById('generate-array-btn'); // "New Array"
const arraySizeInput = document.getElementById('array-size');      // Input Box
const speedSlider = document.getElementById('speed-slider');       // Slider

const stepBackBtn = document.getElementById('step-back-btn');      // << Prev
const playPauseBtn = document.getElementById('play-pause-btn');    // > Play
const stepFwdBtn = document.getElementById('step-fwd-btn');        // >> Next
const resetBtn = document.getElementById('reset-btn');             // Reset
const optimizedCheckbox = document.getElementById('optimized-checkbox'); // Optimized toggle
const stepCounter = document.getElementById('step-counter'); // Steps: 0 / 100




/**
 *  -------------------------------------------------------------------------
 *   init()
 *  -------------------------------------------------------------------------
 *  
 *  Goal: Boot up the machine.
 *  1. Read settings.
 *  2. Generate new data.
 *  3. Prepare the movie script (History).
 *  4. Draw the first frame.
 */
function init() {


  // 1. INPUT: Get size from user input
  let size = parseInt(arraySizeInput.value, 10);

  // VALIDATION: Clamp values (Keep between 5 and 100)
  if (size > 100) size = 100;
  if (size < 5) size = 5;

  // Update State
  ARRAY_SIZE = size;
  // Update Input (in case we clamped it)
  arraySizeInput.value = size;

  // 2. SAFETY: Stop any running interactions
  pause();

  // 3. GENERATE: Ask algorithms.js for random numbers
  array = generateRandomArray(ARRAY_SIZE);

  // 4. PLAN: Calculate the sorting steps
  calculateHistory();
}


/**
 *  -------------------------------------------------------------------------
 *   calculateHistory()
 *  -------------------------------------------------------------------------
 *  Goal: Look at the current array and the checkbox, and decide the path.
 *  This allows us to switch algorithms without losing the data!
 */
function calculateHistory() {
  // 1. SAFETY: Stop running
  pause();

  // 2. CHECK: Should we use the optimized version?
  const useOptimized = optimizedCheckbox.checked;

  // 3. GENERATE SCRIPT
  // [...array] passes a copy so we don't destroy our master data
  if (useOptimized) {
    sortingHistory = generateOptimizedBubbleSortHistory([...array]);
  } else {
    sortingHistory = generateBubbleSortHistory([...array]);
  }

  // 4. RESET: Rewind to start
  currentStep = 0;
  updateControls();

  // 5. DRAW: Show Frame 0
  if (sortingHistory.length > 0) {
    renderStep(sortingHistory[0]);
  }
}

// ... existing code ...


/**
 *  -------------------------------------------------------------------------
 *   Playback Controls
 *  -------------------------------------------------------------------------
 */

// Toggle: The Play Button acts as a switch
function togglePlay() {
  if (isPlaying) {
    pause(); // If ON, turn OFF
  } else {
    play();  // If OFF, turn ON
  }
}

// Function: Start the loop
function play() {
  // REQUIREMENT: Browsers need a user interaction to start Audio Context
  if (typeof audioManager !== 'undefined') audioManager.init();

  // EDGE CASE: If we are at the end, restart from beginning
  if (currentStep >= sortingHistory.length - 1) {
    currentStep = 0;
  }

  // Set flag
  isPlaying = true;
  playPauseBtn.textContent = 'Pause'; // Update UI Text

  // START ENGINE
  loop();
}

// Function: Stop the loop
function pause() {
  isPlaying = false;
  playPauseBtn.textContent = 'Play'; // Update UI Text

  // CRITICAL: Cancel the pending next frame so it stops immediately
  if (timeoutId) clearTimeout(timeoutId);
}


/**
 *  -------------------------------------------------------------------------
 *   loop()  -- THE HEARTBEAT
 *  -------------------------------------------------------------------------
 *  
 *  Goal: Move time forward one step, draw it, wait, and repeat.
 *  
 *  Cycle:
 *  [ Check State ] -> [ Logic/Audio ] -> [ Render ] -> [ Wait ] -> [ Call Loop Again ]
 */
function loop() {
  // 1. CHECK: Should we be running?
  if (!isPlaying) return;

  // 2. CHECK: Are there more frames left?
  if (currentStep < sortingHistory.length - 1) {

    // INCREMENT: Go to next frame
    currentStep++;

    // VISUALS: Draw the new frame (display.js)
    renderStep(sortingHistory[currentStep]);

    // AUDIO: Play sound effects (audio.js)
    if (typeof audioManager !== 'undefined') {
      // Look at what happened in this new frame
      const frame = sortingHistory[currentStep];

      // Trigger appropriate sound
      if (frame.type === 'comparison') audioManager.playCompare(); // Blip
      if (frame.type === 'swap') audioManager.playSwap();          // Zip
      if (frame.type === 'finalized') audioManager.playSorted();   // Chime
    }

    // TIMING: Calculate how long to wait
    // Speed Slider: 1 (Slow) to 100 (Fast)
    const speed = parseInt(speedSlider.value, 10);

    // Formula: Logarithmic-ish scaling for better control
    // Speed 100 -> ~1ms delay (Lightning fast)
    // Speed 1   -> ~500ms delay (Analyze carefully)
    const maxDelay = 500;
    const minDelay = 1;

    // Invert scale: Higher Slider value (100) means LOWER delay
    const delay = maxDelay - ((speed / 100) * (maxDelay - minDelay));

    // SCHEDULE: Call this function again after 'delay' ms
    timeoutId = setTimeout(loop, delay);

  } else {
    // 3. DONE: Logic reached the end
    pause(); // Stop everything

    // VISUALS: Trigger the victory lap!
    if (typeof triggerCompletionWave === 'function') {
      triggerCompletionWave();
    }
  }

  // Update button states (Enable/Disable Step buttons)
  updateControls();
}


/**
 *  -------------------------------------------------------------------------
 *   Manual Controls (Stepping)
 *  -------------------------------------------------------------------------
 */

function stepForward() {
  pause(); // Manual control stops auto-play

  // Only move if not at end
  if (currentStep < sortingHistory.length - 1) {
    currentStep++;
    renderStep(sortingHistory[currentStep]);
  }
  updateControls();
}

function stepBack() {
  pause(); // Manual control stops auto-play

  // Only move if not at start
  if (currentStep > 0) {
    currentStep--;
    renderStep(sortingHistory[currentStep]);
  }
  updateControls();
}

function reset() {
  pause(); // Stop whatever is happening
  currentStep = 0; // Rewind to start
  renderStep(sortingHistory[0]); // Draw start
  updateControls();
}

function updateControls() {
  // Safety check
  if (!sortingHistory.length) return;

  // UX: Disable "Back" if at start
  stepBackBtn.disabled = currentStep === 0;

  // UX: Disable "Forward" if at end
  stepFwdBtn.disabled = currentStep === sortingHistory.length - 1;

  // UX: Update step counter text
  stepCounter.textContent = `Steps: ${currentStep} / ${sortingHistory.length - 1}`;
}

/**
 *  =============================================================================
 *   EVENT LISTENERS (Waiting for execution)
 *  =============================================================================
 *  Wiring up the HTML buttons to the JavaScript functions.
 */

// "Generate New Array" -> Init()
generateBtn.addEventListener('click', init);

// "Size Input Change" -> Init()
arraySizeInput.addEventListener('change', init);

// "Reset" -> Reset()
resetBtn.addEventListener('click', reset);

// "Prev" -> StepBack()
stepBackBtn.addEventListener('click', stepBack);

// "Next" -> StepForward()
stepFwdBtn.addEventListener('click', stepForward);

// "Optimized Toggle" -> CalculateHistory()
optimizedCheckbox.addEventListener('change', calculateHistory);

// "Play" -> Toggle()
playPauseBtn.addEventListener('click', togglePlay);

// STARTUP: Run once when page loads
init();