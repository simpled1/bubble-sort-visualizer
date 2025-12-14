/**
 * Handles core algorithmic logic for sorting.
 * Generates sorting history steps for visualization.
 */


/**
 * Generates an array of random integers between 1 and 100.
 * @param {number} size - Size of the array.
 * @returns {number[]} - Array of random numbers.
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
 * Generates the history steps for standard Bubble Sort.
 * Records comparisons, swaps, and finalizations.
 * @param {number[]} arr - The array to sort.
 * @returns {object[]} - List of step objects describing the sort.
 */
export function generateBubbleSortHistory(arr) {
  const historyLog = [];

  // Create an initial copy of the data
  let currentArraySnapshot = [...arr];
  let currentSortedSnapshot = []; // Start with no bars sorted

  // Initial state
  historyLog.push({
    type: 'initial',
    array: currentArraySnapshot,
    indices: [],
    sortedIndices: currentSortedSnapshot
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

        // Record swap
        historyLog.push({
          type: 'swap',
          indices: [j, j + 1],
          array: currentArraySnapshot,
          sortedIndices: currentSortedSnapshot
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
 * Generates history for Optimized Bubble Sort (early exit if no swaps).
 * @param {number[]} arr - The array to sort.
 * @returns {object[]} - List of step objects.
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