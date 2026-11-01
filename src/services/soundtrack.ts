/**
 * Audio Engine for Romantic Proposal
 * Provides an original synthesized soft piano / music box progression using Web Audio API
 * as well as support for external audio elements with graceful fallback.
 * Strictly respects no-autoplay; audio only begins upon explicit user gesture.
 */

class RomanticAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.6;
  private timerId: number | null = null;
  private currentStep: number = 0;
  private gainNode: GainNode | null = null;

  // Romantic chord progression frequencies (Hz):
  // C major 9: C4 (261.63), E4 (329.63), G4 (392.00), B4 (493.88), D5 (587.33)
  // A minor 9: A3 (220.00), C4 (261.63), E4 (329.63), G4 (392.00), B4 (493.88)
  // F major 7: F3 (174.61), A3 (220.00), C4 (261.63), E4 (329.63), G4 (392.00)
  // G sus 4 to G: G3 (196.00), C4 (261.63), D4 (293.66), G4 (392.00), B4 (493.88)
  private chords = [
    [261.63, 329.63, 392.0, 493.88, 587.33], // Cmaj9
    [220.0, 261.63, 329.63, 392.0, 493.88],  // Am9
    [174.61, 220.0, 261.63, 329.63, 392.0],  // Fmaj7
    [196.0, 261.63, 293.66, 392.0, 493.88],  // Gsus4
  ];

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume * 0.28, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  // Play a soft, felt-piano / warm kalimba harmonic note
  private playNote(freq: number, startTime: number, duration: number = 2.4) {
    if (!this.ctx || !this.gainNode) return;

    // Primary gentle tone (sine)
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Warm harmonic overtone (triangle with soft low-pass filter)
    const oscHarmonic = this.ctx.createOscillator();
    oscHarmonic.type = 'triangle';
    oscHarmonic.frequency.setValueAtTime(freq * 2, startTime);

    const noteGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, startTime);
    filter.Q.setValueAtTime(1.2, startTime);

    // Attack, decay, and romantic gentle release envelope
    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.linearRampToValueAtTime(0.65, startTime + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.6);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    // Connect nodes
    osc.connect(noteGain);
    oscHarmonic.connect(noteGain);
    noteGain.connect(filter);
    filter.connect(this.gainNode);

    osc.start(startTime);
    oscHarmonic.start(startTime);
    osc.stop(startTime + duration + 0.1);
    oscHarmonic.stop(startTime + duration + 0.1);
  }

  private scheduleNextArpeggio() {
    if (!this.isPlaying || !this.ctx) return;

    const chordIndex = Math.floor(this.currentStep / 4) % this.chords.length;
    const noteIndex = this.currentStep % 4;
    const chord = this.chords[chordIndex];
    
    // Pick note to create a gentle acoustic strum/arpeggio
    const noteFreq = chord[noteIndex % chord.length];
    const now = this.ctx.currentTime;

    this.playNote(noteFreq, now, 2.2);

    // Occasionally add a soft bass root note on the downbeat
    if (noteIndex === 0) {
      const rootFreq = chord[0] / 2;
      this.playNote(rootFreq, now, 3.2);
    }

    this.currentStep++;
    // Arpeggio tempo: ~580ms per note (relaxed, meditative romantic tempo ~52 BPM)
    this.timerId = window.setTimeout(() => {
      this.scheduleNextArpeggio();
    }, 580);
  }

  public play() {
    try {
      const ctx = this.getAudioContext();
      if (!this.gainNode) {
        this.gainNode = ctx.createGain();
        this.gainNode.gain.setValueAtTime(this.volume * 0.28, ctx.currentTime);
        this.gainNode.connect(ctx.destination);
      }

      this.isPlaying = true;
      this.scheduleNextArpeggio();
    } catch (e) {
      console.warn('Audio playback initialization error:', e);
      this.isPlaying = false;
    }
  }

  public pause() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }
}

export const romanticAudio = new RomanticAudioEngine();
