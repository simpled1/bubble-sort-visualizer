# Bubble Sort Visualizer

## Features

- **Interactive Controls**: Play, Pause, Step Forward, Step Backward, and Reset controls giving you full command over the timeline.
- **🔊 Audio Synthesis**: Real-time sound effects generated using the Web Audio API. Hear the comparisons ("Blips") and swaps ("Zips") as they happen!
- **Visual Feedback**:
  - 🟡 **Yellow**: Comparison
  - 🔴 **Red**: Swapping
  - 🟢 **Green**: Sorted
- **Customizable**: Adjust data size (5 to 100 bars) and simulation speed.
- **Algorithm Variants**: Toggle **Optimized Bubble Sort** to see how the "Early Exit" optimization saves time on nearly-sorted data.
- **Zero Dependencies**: Built with pure HTML, CSS, and modern ES6+ JavaScript.

## 🧠 How it Works

The application is structured into four distinct modules:

1.  **`controller.js` (The Brain)**: Manages application state, simulation loop, and user input.
2.  **`algorithms.js` (The Worker)**: Generates the "Script" — a pre-calculated history of every comparison and swap.
3.  **`display.js` (The Artist)**: Pure rendering logic that draws the bars based on the current state frame.
4.  **`audio.js` (The Musician)**: A mini-synthesizer that plays distinct frequencies for different events.

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
