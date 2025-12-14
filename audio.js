/**
 * Manages real-time audio synthesis using the Web Audio API.
 */

class SoundManager {
  // Initializes audio context and settings.
  constructor() {
    this.isMuted = false;     // Master Mute Switch
    this.oscillatorType = 'square'; // The "Voice" (8-bit sound)
  }

  /**
   * Initializes the AudioContext. Must be called after user interaction.
   */
  init() {
    if (!this.ctx) {
      // Create the Audio Context (Unified browser support)
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    // If the browser paused it (Suspended), wake it up.
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Plays a single synthesized tone.
   * @param {number} frequency - Pitch in Hz.
   * @param {string} type - Wave shape ('square', 'sine', etc.).
   * @param {number} duration - Duration in seconds.
   * @param {number} volume - Gain (0.0 to 1.0).
   */
  playTone(frequency, type, duration, volume = 0.1) {
    // 1. Safety Checks
    if (!this.ctx || this.isMuted) return;

    // 2. Create Modules
    const osc = this.ctx.createOscillator(); // The Sound Generator
    const gain = this.ctx.createGain();      // The Volume Knob

    // 3. Configure Oscillator (Pitch & Tone)
    osc.type = type;
    // Set pitch NOW
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

    // 4. Configure Envelope (Fade Out)
    // Visual: [LOUD] -> [quiet] -> [silent]
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    // Fade to near silence quickly (Exponential decay sounds natural)
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    // 5. Connect the Cables
    // OSC -> GAIN -> SPEAKERS
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    // 6. Play and Stop
    osc.start(); // Start NOW
    osc.stop(this.ctx.currentTime + duration); // Stop LATER
  }

  /**
   * Plays a short 'blip' for comparisons.
   */
  playCompare() {
    this.playTone(600, 'square', 0.05, 0.05);
  }

  /**
   * Plays a rising pitch 'zip' for swaps.
   */
  playSwap() {
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Square wave = 8-bit aesthetic
    osc.type = 'square';

    // -- PITCH RAMP --
    // Start Low (200Hz) ...
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    // ... Slide to High (400Hz) over 0.1 seconds
    osc.frequency.linearRampToValueAtTime(400, this.ctx.currentTime + 0.1);

    // -- VOLUME ENVELOPE --
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    // Connect
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    // Play
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  /**
   * Plays a fast arpeggio when a bar is sorted.
   */
  playSorted() {
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Frequencies for C Major: C4, E4, G4, C5
    const notes = [523.25, 659.25, 783.99, 1046.50];

    // Loop through each note and schedule it
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.value = freq;

      // Stagger start times: 0s, 0.1s, 0.2s...
      const start = now + (i * 0.1);

      gain.gain.setValueAtTime(0.05, start);
      gain.gain.linearRampToValueAtTime(0.001, start + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.1);
    });
  }
}

export const audioManager = new SoundManager();