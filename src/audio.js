export class SoundKit {
  constructor(enabled = true) {
    this.enabled = enabled;
    this.ctx = null;
  }

  ensure() {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  tone({ frequency = 440, duration = 0.09, type = 'sine', gain = 0.05, slide = 0, delay = 0 }) {
    const ctx = this.ensure();
    if (!ctx) return;
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, frequency + slide), start + duration);
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(gain, start + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(amp).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  click() {
    this.tone({ frequency: 660, duration: 0.055, type: 'triangle', gain: 0.028, slide: -80 });
  }

  select() {
    this.tone({ frequency: 520, duration: 0.08, type: 'sine', gain: 0.04 });
    this.tone({ frequency: 780, duration: 0.1, type: 'sine', gain: 0.03, delay: 0.045 });
  }

  swipe() {
    this.tone({ frequency: 900, duration: 0.06, type: 'sine', gain: 0.014, slide: -300 });
  }

  success(stars = 3) {
    const notes = stars >= 3 ? [523.25, 659.25, 783.99, 1046.5] : stars === 2 ? [523.25, 659.25, 783.99] : [440, 554.37];
    notes.forEach((frequency, index) => {
      this.tone({ frequency, duration: 0.28, type: 'sine', gain: 0.045, delay: index * 0.11 });
      this.tone({ frequency: frequency * 2, duration: 0.2, type: 'triangle', gain: 0.014, delay: index * 0.11 });
    });
  }

  softFail() {
    this.tone({ frequency: 330, duration: 0.18, type: 'sine', gain: 0.035, slide: -40 });
    this.tone({ frequency: 262, duration: 0.25, type: 'sine', gain: 0.03, delay: 0.12, slide: -20 });
  }

  pop() {
    this.tone({ frequency: 420, duration: 0.1, type: 'sine', gain: 0.04, slide: 260 });
  }
}
