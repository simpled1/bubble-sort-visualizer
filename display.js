/**
 * Handles DOM manipulation and rendering of the sorting visualization.
 */

/**
 * Renders a single frame of the sorting animation.
 * @param {object} frame - The snapshot containing the array and state (comparison, swap, etc.).
 */
export function renderStep(frame) {
  // 1. Find the container in the HTML where bars go
  const container = document.getElementById('visualization-container');
  // Safety check: Does the container exist?
  if (!container) return; // If not, stop.

  // Safety check: Is the frame valid?
  if (!frame || !frame.array) return;

  // 3. WIPE THE SCREEN
  // Verify strictly: innerHTML = '' deletes all children elements.
  container.innerHTML = '';

  // Max value is 100, used to calculate relative height %
  const maxVal = 100;

  // 4. GENERATE BARS Loop
  // frame.array is the list of numbers at this moment, e.g., [10, 55, 3...]
  frame.array.forEach((value, i) => {

    // Create the DIV element
    const bar = document.createElement('div');

    // Add the CSS class 'bar' (gives it width, color, etc.)
    bar.classList.add('bar');

    // Set the Height dynamically
    // Formula: (Value / 100) * 100 = Percentage
    // Example: Value 50 -> 50% height
    bar.style.height = `${(value / maxVal) * 100}%`;

    // TOOLTIP: Store the number so CSS can display it on hover
    bar.dataset.value = value;

    // D. APPLY COLORS Based on Event Type

    // CASE 1: COMPARISON (Yellow/Orange)
    // "We are strictly looking at these two"
    if (frame.type === 'comparison') {
      // frame.indices hold [a, b]. Is the current bar 'i' one of them?
      // FAILSAFE: Ensure indices is an array
      if (Array.isArray(frame.indices) && frame.indices.includes(i)) {
        bar.classList.add('comparing');
      }
    }

    // CASE 2: SWAP (Red/Green)
    // "These two are moving!"
    else if (frame.type === 'swap') {
      if (Array.isArray(frame.indices) && frame.indices.includes(i)) {
        bar.classList.add('swapping');
      }
    }

    // CASE 3: SORTED (Green/Blue)
    // "This bar is in its final position, never to move again"
    // frame.sortedIndices is a list of ALL bars that are done.
    if (frame.sortedIndices && frame.sortedIndices.includes(i)) {
      bar.classList.add('sorted');
    }

    // E. Put the bar into the container
    container.appendChild(bar);
  });
}

/**
 * Triggers a completion animation on the sorted bars.
 */
export function triggerCompletionWave() {
  const bars = document.querySelectorAll('.bar');

  // Stagger the animation: 
  // Bar 0 jumps at 0.0s, Bar 1 jumps at 0.05s, etc.
  bars.forEach((bar, i) => {
    bar.classList.add('finished');
    bar.style.animationDelay = `${i * 0.05}s`; // The "Wave" math
  });
}