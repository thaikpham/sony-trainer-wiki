'use client';

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true; // Default muted until user interaction
    this.bgmOsc = null;
    this.bgmGain = null;
    this.isPlayingBGM = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted && this.isPlayingBGM) {
       this.stopBGM();
       this.isPlayingBGM = true; // Remember intent
    } else if (!muted && this.isPlayingBGM) {
       this.startBGM();
    }
  }

  play8BitTone(freq, type = 'square', duration = 0.1, vol = 0.1) {
    if (this.isMuted) return;
    this.init();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playClick() {
    // A short mid-pitch blip
    this.play8BitTone(600, 'square', 0.05, 0.05);
    setTimeout(() => this.play8BitTone(800, 'square', 0.05, 0.05), 50);
  }

  playSuccess() {
    // A classic 8-bit level up arpeggio
    this.init();
    if(this.isMuted) return;
    
    const notes = [440, 554, 659, 880]; // A major chord
    const time = this.ctx.currentTime;
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time + (idx * 0.1));
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.setValueAtTime(0.1, time + (idx * 0.1));
      gain.gain.exponentialRampToValueAtTime(0.001, time + (idx * 0.1) + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(time + (idx * 0.1));
      osc.stop(time + (idx * 0.1) + 0.3);
    });
  }

  startBGM() {
      // Just a stub for BGM so we don't annoy users too much, 
      // but if we want actual BGM we can schedule a loop of notes.
      // Usually BGM synthesized entirely in JS is tricky to loop perfectly without a library like Tone.js
      // We'll leave it out or keep it very subtle.
      this.isPlayingBGM = true;
  }

  stopBGM() {
      this.isPlayingBGM = false;
  }
}

// Singleton
const soundEngine = typeof window !== 'undefined' ? new AudioEngine() : null;

export default soundEngine;
