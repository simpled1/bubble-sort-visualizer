/**
 *  =============================================================================
 *   AUDIO.JS
 *  =============================================================================
 *  
 *  Purpose: 
 *  This file handles the "Ears" of the operation. It uses the Web Audio API
 *  to generate sounds from scratch (Synthesizer). No mp3 files required!
 * 
 *  -----------------------------------------------------------------------------
 *   VISUAL SUMMARY: THE SYNTHESIZER
 *  -----------------------------------------------------------------------------
 *  
 *    [ Oscillator ]  ---->  [ Gain Node ]  ---->  [ Destination ]
 *   (Generates Wave)       (Volume Knob)          (Speakers/Ears)
 *          |                     |
 *      Frequency              Volume
 *      (Pitch)                (Loudness)
 *  
 *   Wave Variations:
 *   Square ( __|--|__ ) => 8-Bit / Nintendo style
 *   Sine   ( /~\_/~\ ) => Smooth / Pure tone
 * 
 */

class SoundManager {
  // Constructor: Runs once when we create the audio manager.
  constructor() {
    this.ctx = null;          // The "Audio Context" (The Virtual Studio)
    this.isMuted = false;     // Master Mute Switch
    this.oscillatorType = 'square'; // The "Voice" (Square = Nintendo/8-bit sound)
  }

  /**
   *  -------------------------------------------------------------------------
   *   init()
   *  -------------------------------------------------------------------------
   *  Goal: Turn on the studio. Browsers don't allow audio to start until
   *        the user clicks something. We call this on the first click.
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
   *  -------------------------------------------------------------------------
   *   playTone(frequency, type, duration, volume)
   *  -------------------------------------------------------------------------
   *  Goal: Play a single beep.
   * 
   *  @param {number} frequency - Pitch in Hz (e.g., 440 is A4).
   *  @param {string} type - Wave shape ('square', 'sine', 'sawtooth').
   *  @param {number} duration - How long in seconds (e.g., 0.1).
   *  @param {number} volume - How loud (0.0 to 1.0).
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
   *  -------------------------------------------------------------------------
   *   playCompare()
   *  -------------------------------------------------------------------------
   *  Sound: "BLIP"
   *  Used when: Checking two numbers.
   *  Style: High-pitched square wave (Coin sound).
   */
  playCompare() {
    this.playTone(600, 'square', 0.05, 0.05);
  }

  /**
   *  -------------------------------------------------------------------------
   *   playSwap()
   *  -------------------------------------------------------------------------
   *  Sound: "ZIP!"
   *  Used when: Moving numbers.
   *  Style: Pitch rises quickly (200Hz -> 400Hz). Action sound.
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
   *  -------------------------------------------------------------------------
   *   playSorted()
   *  -------------------------------------------------------------------------
   *  Sound: "CHIME" (Arpeggio)
   *  Used when: A bar locks into place.
   *  Style: Plays a C-Major chord (C-E-G-C) very fast.
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

  // Explicitly defining playJump if needed for future, currently unused/removed visually
  // Keeping logic is fine, naming conflict resolved previously.
  playJump() {
    // Placeholder or repurposed if we want jump sound logic for other things
  }
}

// Create one instance for the whole app to share
export const audioManager = new SoundManager();