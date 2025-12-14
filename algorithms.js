/**
 *  =============================================================================
 *   ALGORITHMS.JS
 *  =============================================================================
 *  
 *  Purpose: 
 *  This file contains the "Brain" of the operation. It handles the raw logic 
 *  for generating data and determining the sorting steps. It does NOT touch 
 *  the DOM (HTML) directly.
 *
 *  -----------------------------------------------------------------------------
 *   VISUAL SUMMARY
 *  -----------------------------------------------------------------------------
 *  
 *   [ Random Generator ]  --->  [ Array ]  --->  [ Bubble Sort Logic ]
 *                                                      |
 *                                                      v
 *                                                [ History Log ]
 *                                           (Step-by-step instructions)
 *
 *  -----------------------------------------------------------------------------
 *   STRUCTURAL SHARING (Memory Optimization)
 *  -----------------------------------------------------------------------------
 *  
 *   Standard History:
 *     [Step 1: ARRAY A] -> [Step 2: ARRAY B] -> [Step 3: ARRAY C]
 *     (Every step creates a full copy. Heavy Memory usage!)
 *  
 *   Optimized History:
 *     [Step 1] --+
 *                | (Ref)
 *     [Step 2] --+--> [ ARRAY A ]   (Only create [ARRAY B] when data changes)
 *                |
 *     [Step 3] --+
 * 
 */


/**
 *  -------------------------------------------------------------------------
 *   generateRandomArray(size)
 *  -------------------------------------------------------------------------
 *  
 *  Goal: Create a list of random numbers.
 *  
 *  Process:
 *  1. Create an empty container (Array).
 *  2. Repeat 'size' times.
 *  3. Pick a random number between 1 and 100.
 *  4. Put it in the container.
 * 
 *  Visualization:
 *  
 *   Input: size = 5
 *   
 *   Loop 1: Random() -> 42  -> [ 42 ]
 *   Loop 2: Random() -> 15  -> [ 42, 15 ]
 *   Loop 3: Random() -> 99  -> [ 42, 15, 99 ]
 *   ...
 * 
 *  @param {number} size - How many bars we want.
 *  @returns {number[]} - The list of random numbers.
 */
export function generateRandomArray(size) {
  // Create an empty array to hold our numbers
  const newArray = [];

  // Start a loop from 0 up to 'size'
  for (let i = 0; i < size; i++) {
    // Math.random() gives 0.0 to 1.0 (e.g., 0.543...)
    // * 99 gives 0.0 to 99.0
    // Math.floor cuts off decimals (e.g., 54)
    // + 1 ensures we don't get 0 (range becomes 1 to 100)
    const randomNum = Math.floor(Math.random() * 99) + 1;

    // Add the new number to the end of our array
    newArray.push(randomNum);
  }

  // Send the finished array back to whoever asked for it
  return newArray;
}




/**
 *  -------------------------------------------------------------------------
 *   generateBubbleSortHistory(arr)
 *  -------------------------------------------------------------------------
 *  
 *  Goal: Run the Bubble Sort algorithm, but instead of just sorting,
 *        RECORD every single thing that happens (Compare, Swap, Finalize).
 * 
 *  Why? We need this "Recording" (History) so we can replay it later
 *       as an animation.
 * 
 *  The Bubble Sort Algorithm:
 *  Think of it like bubbles rising in water. The heavy (large) numbers
 *  "bubble up" to the top (right side) in each pass.
 * 
 *  Visualization of One Pass:
 *  Array: [ 5, 2, 8 ]
 * 
 *  1. Compare (5, 2)
 *     [ 5, 2, 8 ]
 *       ^  ^
 *       Is 5 > 2? YES! -> SWAP!
 * 
 *  2. Swap
 *     [ 2, 5, 8 ]
 * 
 *  3. Compare (5, 8)
 *     [ 2, 5, 8 ]
 *          ^  ^
 *          Is 5 > 8? NO. -> Keep going.
 * 
 *  4. End of Pass -> 8 is the biggest, it is "Finalized" (Locked).
 * 
 *  @param {number[]} arr - The initial jumbled array.
 *  @returns {object[]} historyLog - A list of "Step Objects" describing the sort.
 */
export function generateBubbleSortHistory(arr) {
  const historyLog = [];

  // Create an initial copy of the data
  let currentArraySnapshot = [...arr];
  let currentSortedSnapshot = []; // Start with no bars sorted

  // RECORD INITIAL STATE
  historyLog.push({
    type: 'initial',
    array: currentArraySnapshot, // Snapshot A
    indices: [],
    sortedIndices: currentSortedSnapshot // Snapshot X
  });

  const n = currentArraySnapshot.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {

      // -- EVENT: COMPARISON --
      // No data changes relative to the last step!
      // REUSE: currentArraySnapshot & currentSortedSnapshot
      historyLog.push({
        type: 'comparison',
        indices: [j, j + 1],
        array: currentArraySnapshot, // Shared Ref
        sortedIndices: currentSortedSnapshot // Shared Ref
      });

      // The Check: Left > Right
      // Access the SNAPSHOT directly since it represents current state
      if (currentArraySnapshot[j] > currentArraySnapshot[j + 1]) {

        // -- DATA CHANGE OCCURRING! --
        // 1. Create NEW snapshot based on old one
        const newArraySnapshot = [...currentArraySnapshot];

        // 2. Perform Swap on NEW snapshot
        const temp = newArraySnapshot[j];
        newArraySnapshot[j] = newArraySnapshot[j + 1];
        newArraySnapshot[j + 1] = temp;

        // 3. Update our "Current" pointer
        currentArraySnapshot = newArraySnapshot;

        // -- EVENT: SWAP --
        historyLog.push({
          type: 'swap',
          indices: [j, j + 1],
          array: currentArraySnapshot, // Snapshot B (New Address)
          sortedIndices: currentSortedSnapshot // Shared Ref (No change yet)
        });
      }
    }

    // -- DATA CHANGE: Sorted List grows --
    const finalizedIndex = n - i - 1;

    // 1. Create NEW sorted list snapshot
    const newSortedSnapshot = [...currentSortedSnapshot];
    newSortedSnapshot.push(finalizedIndex);

    // 2. Update Pointer
    currentSortedSnapshot = newSortedSnapshot;

    // -- EVENT: FINALIZED --
    historyLog.push({
      type: 'finalized',
      index: finalizedIndex,
      indices: [finalizedIndex],
      array: currentArraySnapshot, // Shared Ref
      sortedIndices: currentSortedSnapshot // Snapshot Y (New Address)
    });
  }

  // Final Step: 0 is sorted
  const finalSortedSnapshot = [...currentSortedSnapshot];
  finalSortedSnapshot.push(0);
  currentSortedSnapshot = finalSortedSnapshot;

  historyLog.push({
    type: 'finalized',
    index: 0,
    indices: [0],
    array: currentArraySnapshot, // Shared Ref
    sortedIndices: currentSortedSnapshot // Snapshot Z
  });

  return historyLog;
}


/**
 *  -------------------------------------------------------------------------
 *   generateOptimizedBubbleSortHistory(arr)
 *  -------------------------------------------------------------------------
 *  
 *  Goal: Same as generateBubbleSortHistory, but with OPTIMIZATION!
 *  
 *  Optimization: "Early Exit with Swap Flag"
 *  
 *  How it works:
 *  - Track whether ANY swaps occurred in a pass.
 *  - If NO swaps happened → Array is already sorted → STOP!
 *  
 *  Visualization:
 *  
 *  Pass 1: [ 3, 1, 2 ]  →  Swaps: YES  →  Continue
 *  Pass 2: [ 1, 2, 3 ]  →  Swaps: NO   →  DONE! ✓
 *  
 *  Benefit:
 *  - Best case: O(n) instead of O(n²) for nearly-sorted arrays
 *  - You'll SEE the difference in the visualizer!
 * 
 *  @param {number[]} arr - The initial jumbled array.
 *  @returns {object[]} historyLog - A list of "Step Objects" describing the sort.
 */
export function generateOptimizedBubbleSortHistory(arr) {
  const historyLog = [];

  // Snapshots
  let currentArraySnapshot = [...arr];
  let currentSortedSnapshot = [];

  // Initial state
  historyLog.push({
    type: 'initial',
    array: currentArraySnapshot,
    indices: [],
    sortedIndices: currentSortedSnapshot
  });

  const n = currentArraySnapshot.length;

  for (let i = 0; i < n - 1; i++) {

    let swappedInThisPass = false;

    for (let j = 0; j < n - i - 1; j++) {

      // Comparison (Shared)
      historyLog.push({
        type: 'comparison',
        indices: [j, j + 1],
        array: currentArraySnapshot, // Shared
        sortedIndices: currentSortedSnapshot // Shared
      });

      if (currentArraySnapshot[j] > currentArraySnapshot[j + 1]) {

        // Swap (New Snapshot)
        const newArraySnapshot = [...currentArraySnapshot];
        const temp = newArraySnapshot[j];
        newArraySnapshot[j] = newArraySnapshot[j + 1];
        newArraySnapshot[j + 1] = temp;

        currentArraySnapshot = newArraySnapshot;
        swappedInThisPass = true;

        historyLog.push({
          type: 'swap',
          indices: [j, j + 1],
          array: currentArraySnapshot, // New Ref
          sortedIndices: currentSortedSnapshot // Shared
        });
      }
    }

    // Finalize one element
    const finalizedIndex = n - i - 1;

    // New Sorted Snapshot
    const newSortedSnapshot = [...currentSortedSnapshot];
    newSortedSnapshot.push(finalizedIndex);
    currentSortedSnapshot = newSortedSnapshot;

    historyLog.push({
      type: 'finalized',
      index: finalizedIndex,
      indices: [finalizedIndex],
      array: currentArraySnapshot, // Shared
      sortedIndices: currentSortedSnapshot // New Ref
    });

    // EARLY EXIT
    if (!swappedInThisPass) {

      // Update sorted list with everything remaining
      const finalExitSortedSnapshot = [...currentSortedSnapshot];
      for (let k = 0; k < finalizedIndex; k++) {
        if (!finalExitSortedSnapshot.includes(k)) {
          finalExitSortedSnapshot.push(k);
        }
      }
      currentSortedSnapshot = finalExitSortedSnapshot;

      historyLog.push({
        type: 'finalized',
        index: 0,
        indices: Array.from({ length: n }, (_, idx) => idx),
        array: currentArraySnapshot, // Shared
        sortedIndices: currentSortedSnapshot // New Ref
      });

      break;
    }
  }

  // Finalize first element if not early exit
  if (!currentSortedSnapshot.includes(0)) {
    const finalSortedSnapshot = [...currentSortedSnapshot];
    finalSortedSnapshot.push(0);
    currentSortedSnapshot = finalSortedSnapshot;

    historyLog.push({
      type: 'finalized',
      index: 0,
      indices: [0],
      array: currentArraySnapshot,
      sortedIndices: currentSortedSnapshot
    });
  }

  return historyLog;
}