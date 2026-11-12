import type { ChartFile } from "../types/chart";

interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export class AudioEngine {
  private context: AudioContext | null = null;
  private buffer: AudioBuffer | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private masterGain: GainNode | null = null;
  private startContextTime = 0;
  private pausedOffset = 0;
  private isPlaying = false;
  private duration = 0;

  private ensureContext(): AudioContext {
    if (!this.context) {
      const win = window as WindowWithWebkitAudio;
      const AudioCtx = window.AudioContext ?? win.webkitAudioContext;
      if (!AudioCtx) {
        throw new Error("Web Audio API is not supported in this browser.");
      }
      this.context = new AudioCtx();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 0.7;
      this.masterGain.connect(this.context.destination);
    }
    return this.context;
  }

  async load(chart: ChartFile): Promise<void> {
    this.stop();
    const ctx = this.ensureContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    this.duration = chart.duration;

    if (chart.audioFile.trim().length > 0) {
      try {
        const response = await fetch(chart.audioFile);
        if (!response.ok) {
          throw new Error(`Failed to fetch audio file: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        this.buffer = await ctx.decodeAudioData(arrayBuffer);
        this.duration = Math.max(chart.duration, this.buffer.duration);
        return;
      } catch (err: unknown) {
        console.warn("Falling back to synthesized metronome track:", err);
      }
    }

    this.buffer = this.synthesizeBeatTrack(ctx, chart.bpm, chart.duration);
  }

  // Builds a real AudioBuffer at the chart BPM so AudioContext.currentTime drives playback when no external audio file is bundled.
  private synthesizeBeatTrack(ctx: AudioContext, bpm: number, durationSec: number): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const totalSamples = Math.ceil(sampleRate * durationSec);
    const buffer = ctx.createBuffer(1, totalSamples, sampleRate);
    const data = buffer.getChannelData(0);

    const beatIntervalSec = 60 / bpm;
    const totalBeats = Math.floor(durationSec / beatIntervalSec);

    for (let beat = 0; beat < totalBeats; beat += 1) {
      const beatStartSample = Math.floor(beat * beatIntervalSec * sampleRate);
      const isDownbeat = beat % 4 === 0;
      const isBackbeat = beat % 2 === 1;

      const clickSamples = Math.min(Math.floor(sampleRate * 0.14), totalSamples - beatStartSample);
      for (let i = 0; i < clickSamples; i += 1) {
        const t = i / sampleRate;
        const env = Math.exp(-t * (isDownbeat ? 22 : 34));
        const freq = isDownbeat ? 110 : isBackbeat ? 220 : 165;
        const kickSweep = isDownbeat ? Math.exp(-t * 40) * 90 : 0;
        const tone = Math.sin(2 * Math.PI * (freq + kickSweep) * t);
        data[beatStartSample + i] += tone * env * (isDownbeat ? 0.45 : 0.28);
      }
    }

    return buffer;
  }

  play(offsetSeconds = 0): void {
    const ctx = this.ensureContext();
    if (!this.buffer || !this.masterGain) {
      throw new Error("Audio buffer is not loaded.");
    }

    this.stopSourceOnly();

    const source = ctx.createBufferSource();
    source.buffer = this.buffer;
    source.connect(this.masterGain);

    this.pausedOffset = Math.max(0, offsetSeconds);
    this.startContextTime = ctx.currentTime - this.pausedOffset;
    source.start(0, this.pausedOffset);

    this.sourceNode = source;
    this.isPlaying = true;
  }

  pause(): void {
    if (!this.isPlaying || !this.context) {
      return;
    }
    this.pausedOffset = this.getCurrentTime();
    this.stopSourceOnly();
    this.isPlaying = false;
  }

  resume(): void {
    if (this.isPlaying) {
      return;
    }
    this.play(this.pausedOffset);
  }

  stop(): void {
    this.stopSourceOnly();
    this.pausedOffset = 0;
    this.startContextTime = 0;
    this.isPlaying = false;
  }

  private stopSourceOnly(): void {
    if (this.sourceNode) {
      try {
        this.sourceNode.stop();
      } catch {
        // Ignore already-stopped nodes.
      }
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
  }

  getCurrentTime(): number {
    if (!this.context) {
      return 0;
    }
    if (!this.isPlaying) {
      return this.pausedOffset;
    }
    return Math.max(0, this.context.currentTime - this.startContextTime);
  }

  getDuration(): number {
    return this.duration;
  }

  playHitCue(lane: number): void {
    if (!this.context || !this.masterGain || this.context.state !== "running") {
      return;
    }
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const frequencies = [523.25, 587.33, 659.25, 783.99];
    const now = this.context.currentTime;

    osc.type = "triangle";
    osc.frequency.setValueAtTime(frequencies[lane] ?? 523.25, now);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  dispose(): void {
    this.stop();
    if (this.context) {
      void this.context.close();
      this.context = null;
      this.masterGain = null;
    }
    this.buffer = null;
  }
}

