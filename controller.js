import { triggerCompletionWave } from "./display.js";
import { renderStep } from "./display.js";
import { generateBubbleSortHistory, generateRandomArray, generateOptimizedBubbleSortHistory } from "./algorithms.js";
import { audioManager } from "./audio.js";
/**
 * Main controller for the Bubble Sort Visualizer.
 * Coordinates the algorithm logic, display rendering, and audio playback.
 */

// =============================================================================
//  1. APPLICATION STATE (MEMORY)
// =============================================================================

// Default settings
let ARRAY_SIZE = 20;

// The raw numbers (e.g., [10, 5, 8])
let array = [];

// Holds the pre-calculated sorting frames
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
 * Resets the state and prepares a new sorting simulation.
 */
function init() {


  // Get and clamp size input
  let size = parseInt(arraySizeInput.value, 10);
  if (size > 100) size = 100;
  if (size < 5) size = 5;

  // Sync state
  ARRAY_SIZE = size;
  arraySizeInput.value = size;

  pause();

  // Generate new numbers and calculate the sorting path
  array = generateRandomArray(ARRAY_SIZE);
  calculateHistory();
}


/**
 * Generates the full history of sorting steps based on the selected algorithm.
 */
function calculateHistory() {
  // 1. SAFETY: Stop running
  pause();

  // 2. CHECK: Should we use the optimized version?
  const useOptimized = optimizedCheckbox.checked;

  // Generate the steps without mutating the original array yet
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

// Starts the animation loop
function play() {
  if (typeof audioManager !== 'undefined') audioManager.init();

  // Restart if we're already at the end
  if (currentStep >= sortingHistory.length - 1) {
    currentStep = 0;
  }

  isPlaying = true;
  playPauseBtn.textContent = 'Pause';
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
 * Main animation loop.
 * Advances the step, renders the frame, plays sound, and schedules the next iteration.
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

    // Calculate delay (inverted logic: higher speed = lower delay)
    // Scale: 100 (fastest) -> 1ms, 1 (slowest) -> 500ms
    const speed = parseInt(speedSlider.value, 10);
    const maxDelay = 500;
    const minDelay = 1;

    const delay = maxDelay - ((speed / 100) * (maxDelay - minDelay));
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