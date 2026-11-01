/**
 * Realistic Procedural Paper Flip Audio Engine
 * Uses the Web Audio API to synthesize an authentic, warm, multi-stage parchment
 * page-turning sound synchronized with physical 3D page curl deformation.
 *
 * Acoustic Profile (1100ms timeline):
 * 1. Stage 1 (0ms - 150ms): Subtle Initial Paper Lift & Corner Separation
 *    - Delicate high-mid friction rustle as the page edge lifts from the book stack.
 * 2. Stage 2 (150ms - 820ms): Paper Flexion & Air Displacement
 *    - Continuous, rippling parchment rustle and gentle air sweep as the sheet bends and arcs.
 *    - Direction-aware frequency filtering for natural organic variety.
 * 3. Stage 3 (820ms - 1050ms): Delicate Tactile Settling "Flop"
 *    - Damped low-mid body resonance simulating soft handmade paper landing flat against paper.
 *
 * Designed to be intimate, romantic, and warm—never harsh, loud, or cartoony.
 * Zero external audio assets required; perfectly reliable offline with zero latency.
 */

const SESSION_STORAGE_KEY = 'for_ekta_paper_sound';

type Listener = (isMuted: boolean) => void;

class PaperFlipAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.38; // Gentle, romantic ambient level
  private lastPlayTimestamp: number = 0;
  private minIntervalMs: number = 650; // Prevent overlapping cacophony on rapid clicks
  private listeners: Set<Listener> = new Set();
  private activeNodes: { stop?: () => void; disconnect?: () => void }[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (stored === 'muted') {
          this.isMuted = true;
        } else if (stored === 'enabled') {
          this.isMuted = false;
        }
      } catch {
        // Handle private browsing or restricted storage
      }
    }
  }

  /**
   * Subscribe to sound mute state changes so all UI toggles stay perfectly in sync
   */
  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.isMuted));
  }

  /**
   * Lazy-initialize AudioContext strictly on user interaction
   */
  private getAudioContext(): AudioContext | null {
    try {
      if (typeof window === 'undefined') return null;
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return null;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch (e) {
      console.warn('AudioContext unavailable for paper turn sound:', e);
      return null;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(SESSION_STORAGE_KEY, muted ? 'muted' : 'enabled');
      }
    } catch {
      // Storage quota or restriction fallback
    }
    this.stopActiveSounds();
    this.notify();
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  private stopActiveSounds() {
    this.activeNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch {
        // Already stopped
      }
    });
    this.activeNodes = [];
  }

  /**
   * Plays the multi-stage realistic paper flip sound synchronized with page curl
   * @param direction 'next' (forward turn) or 'prev' (backward turn)
   */
  public play(direction: 'next' | 'prev' = 'next') {
    if (this.isMuted) return;

    const nowMs = performance.now();
    if (nowMs - this.lastPlayTimestamp < this.minIntervalMs) {
      // Rapid click debounce: avoid stacking overlapping audio bursts
      return;
    }
    this.lastPlayTimestamp = nowMs;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      // Clean up previous nodes
      this.stopActiveSounds();

      const startTime = ctx.currentTime;
      const isForward = direction === 'next';

      // Master output gain with soft master ceiling
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume, startTime);
      masterGain.connect(ctx.destination);
      this.activeNodes.push({ disconnect: () => masterGain.disconnect() });

      // =========================================================================
      // STAGE 1: INITIAL PAPER LIFT & SEPARATION RUSTLE (0.00s - 0.16s)
      // Delicate high-mid whisper as the top corner parts from the stack
      // =========================================================================
      const liftDuration = 0.22;
      const liftBufferSize = Math.floor(ctx.sampleRate * liftDuration);
      const liftBuffer = ctx.createBuffer(1, liftBufferSize, ctx.sampleRate);
      const liftData = liftBuffer.getChannelData(0);

      // Fine-grained paper surface texture
      let l0 = 0, l1 = 0;
      for (let i = 0; i < liftBufferSize; i++) {
        const white = Math.random() * 2 - 1;
        l0 = 0.85 * l0 + white * 0.15;
        l1 = 0.82 * l1 + l0 * 0.18;
        liftData[i] = l1 * (Math.random() > 0.4 ? 1 : 0.7);
      }

      const liftSource = ctx.createBufferSource();
      liftSource.buffer = liftBuffer;

      const liftFilter = ctx.createBiquadFilter();
      liftFilter.type = 'bandpass';
      liftFilter.frequency.setValueAtTime(isForward ? 2200 : 1900, startTime);
      liftFilter.frequency.exponentialRampToValueAtTime(isForward ? 1100 : 1300, startTime + 0.15);
      liftFilter.Q.setValueAtTime(2.2, startTime);

      const liftGain = ctx.createGain();
      liftGain.gain.setValueAtTime(0.0001, startTime);
      liftGain.gain.linearRampToValueAtTime(0.18, startTime + 0.035); // Soft quick peel attack
      liftGain.gain.exponentialRampToValueAtTime(0.04, startTime + 0.12);
      liftGain.gain.exponentialRampToValueAtTime(0.0001, startTime + liftDuration);

      liftSource.connect(liftFilter);
      liftFilter.connect(liftGain);
      liftGain.connect(masterGain);

      liftSource.start(startTime);
      liftSource.stop(startTime + liftDuration);
      this.activeNodes.push({ stop: () => liftSource.stop() });

      // =========================================================================
      // STAGE 2: PHYSICAL PAPER FLEXION & AIR SWEEP (0.12s - 0.82s)
      // Continuous, organic parchment rustle as the sheet bows and arcs through the air
      // =========================================================================
      const sweepDuration = 0.72;
      const sweepBufferSize = Math.floor(ctx.sampleRate * sweepDuration);
      const sweepBuffer = ctx.createBuffer(1, sweepBufferSize, ctx.sampleRate);
      const sweepData = sweepBuffer.getChannelData(0);

      // Soft pink noise filter to simulate thick vintage rag parchment
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < sweepBufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555;
        b1 = 0.99332 * b1 + white * 0.0750;
        b2 = 0.96900 * b2 + white * 0.1538;
        // Mild undulating ripple simulating natural paper curvature
        const wave = 0.85 + 0.15 * Math.sin((i / ctx.sampleRate) * 18 * Math.PI);
        sweepData[i] = (b0 + b1 + b2) * 0.22 * wave;
      }

      const sweepSource = ctx.createBufferSource();
      sweepSource.buffer = sweepBuffer;

      // Sweeping bandpass filter following the curl trajectory
      const sweepBandpass = ctx.createBiquadFilter();
      sweepBandpass.type = 'bandpass';
      const sweepStartTime = startTime + 0.10;

      if (isForward) {
        // Forward turn: sweeps from mid-high down to mid warmth as it turns
        sweepBandpass.frequency.setValueAtTime(1400, sweepStartTime);
        sweepBandpass.frequency.exponentialRampToValueAtTime(620, sweepStartTime + 0.35);
        sweepBandpass.frequency.exponentialRampToValueAtTime(480, sweepStartTime + sweepDuration);
      } else {
        // Backward turn: inverted resonance variation
        sweepBandpass.frequency.setValueAtTime(520, sweepStartTime);
        sweepBandpass.frequency.exponentialRampToValueAtTime(1150, sweepStartTime + 0.32);
        sweepBandpass.frequency.exponentialRampToValueAtTime(680, sweepStartTime + sweepDuration);
      }
      sweepBandpass.Q.setValueAtTime(1.6, sweepStartTime);

      // Gentle air-friction amplitude envelope
      const sweepGain = ctx.createGain();
      sweepGain.gain.setValueAtTime(0.0001, sweepStartTime);
      sweepGain.gain.linearRampToValueAtTime(0.24, sweepStartTime + 0.18); // Arcing crest
      sweepGain.gain.exponentialRampToValueAtTime(0.12, sweepStartTime + 0.48);
      sweepGain.gain.exponentialRampToValueAtTime(0.0001, sweepStartTime + sweepDuration);

      sweepSource.connect(sweepBandpass);
      sweepBandpass.connect(sweepGain);
      sweepGain.connect(masterGain);

      sweepSource.start(sweepStartTime);
      sweepSource.stop(sweepStartTime + sweepDuration);
      this.activeNodes.push({ stop: () => sweepSource.stop() });

      // =========================================================================
      // STAGE 3: TACTILE SETTLING "FLOP" ONTO OPPOSITE PAGE (0.82s - 1.05s)
      // Muffled, soft body resonance as the curled sheet flattens onto the stack
      // =========================================================================
      const settleStartTime = startTime + 0.82;

      // Component 3A: Soft low-frequency paper body impulse
      const settleOsc = ctx.createOscillator();
      settleOsc.type = 'triangle';
      settleOsc.frequency.setValueAtTime(isForward ? 150 : 165, settleStartTime);
      settleOsc.frequency.exponentialRampToValueAtTime(58, settleStartTime + 0.14);

      const settleFilter = ctx.createBiquadFilter();
      settleFilter.type = 'lowpass';
      settleFilter.frequency.setValueAtTime(240, settleStartTime);

      const settleGain = ctx.createGain();
      settleGain.gain.setValueAtTime(0.0001, settleStartTime);
      settleGain.gain.linearRampToValueAtTime(0.11, settleStartTime + 0.016); // Gentle muffled pat
      settleGain.gain.exponentialRampToValueAtTime(0.0001, settleStartTime + 0.16);

      settleOsc.connect(settleFilter);
      settleFilter.connect(settleGain);
      settleGain.connect(masterGain);

      settleOsc.start(settleStartTime);
      settleOsc.stop(settleStartTime + 0.18);
      this.activeNodes.push({ stop: () => settleOsc.stop() });

      // Component 3B: Whispering trailing landing friction (sheet smoothing out)
      const landDuration = 0.20;
      const landBufferSize = Math.floor(ctx.sampleRate * landDuration);
      const landBuffer = ctx.createBuffer(1, landBufferSize, ctx.sampleRate);
      const landData = landBuffer.getChannelData(0);

      let prev = 0;
      for (let i = 0; i < landBufferSize; i++) {
        const white = Math.random() * 2 - 1;
        prev = 0.94 * prev + white * 0.06;
        landData[i] = prev * 0.2;
      }

      const landSource = ctx.createBufferSource();
      landSource.buffer = landBuffer;

      const landFilter = ctx.createBiquadFilter();
      landFilter.type = 'bandpass';
      landFilter.frequency.setValueAtTime(800, settleStartTime);
      landFilter.Q.setValueAtTime(1.4, settleStartTime);

      const landGain = ctx.createGain();
      landGain.gain.setValueAtTime(0.0001, settleStartTime);
      landGain.gain.linearRampToValueAtTime(0.09, settleStartTime + 0.02);
      landGain.gain.exponentialRampToValueAtTime(0.0001, settleStartTime + landDuration);

      landSource.connect(landFilter);
      landFilter.connect(landGain);
      landGain.connect(masterGain);

      landSource.start(settleStartTime);
      landSource.stop(settleStartTime + landDuration);
      this.activeNodes.push({ stop: () => landSource.stop() });
    } catch (e) {
      console.warn('Could not play paper turn sound:', e);
    }
  }
}

export const paperFlipAudio = new PaperFlipAudioEngine();
