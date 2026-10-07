"use client";

type Pattern = string;

export type Groove = "lofi" | "chill" | "house" | "synthwave";

export type Track = {
  id: string;
  title: string;
  bpm: number;
  groove: Groove;
  colors: [string, string];
  chords: number[][];
  swing: number;
  drums: {
    kick: Pattern;
    snare: Pattern;
    hat: Pattern;
    open?: Pattern;
    snareTone: [number, number];
  };
  bass: {
    pattern: Pattern;
    wave: OscillatorType;
    cutoff: number;
    gain: number;
  };
  pad: {
    wave: OscillatorType;
    cutoff: number;
    gain: number;
    rhythm?: Pattern;
  };
  arp?: {
    wave: OscillatorType;
    steps: Array<number | null>;
    gain: number;
    decay: number;
    octave: number;
    echo?: boolean;
  };
  melody: {
    wave: OscillatorType;
    gain: number;
    notes: Array<[number, number, number]>;
  };
  vinyl?: boolean;
  bars: number;
};

export const tracks: Track[] = [
  {
    id: "hydration-error",
    title: "Hydration Error",
    bpm: 150,
    groove: "house",
    colors: ["#f97316", "#ec4899"],
    chords: [
      [53, 56, 60, 63],
      [49, 53, 56, 60],
      [56, 60, 63, 67],
      [51, 55, 58, 63],
    ],
    swing: 0,
    drums: {
      kick: "x...x...x...x...",
      snare: "....x.......x...",
      hat: "x.xxx.xxx.xxx.xx",
      open: "..x...x...x...x.",
      snareTone: [1800, 0.14],
    },
    bass: {
      pattern: "..x...x...x...x.",
      wave: "sawtooth",
      cutoff: 520,
      gain: 0.3,
    },
    pad: {
      wave: "square",
      cutoff: 2000,
      gain: 0.05,
      rhythm: "..x..x....x..x..",
    },
    melody: {
      wave: "square",
      gain: 0.06,
      notes: [
        [0, 77, 1],
        [2, 77, 1],
        [4, 80, 2],
        [8, 75, 2],
        [12, 77, 4],
        [16, 72, 2],
        [20, 75, 2],
        [24, 77, 6],
        [32, 77, 1],
        [34, 80, 1],
        [36, 82, 2],
        [40, 80, 2],
        [44, 77, 2],
        [48, 75, 4],
        [56, 72, 6],
      ],
    },
    bars: 40,
  },
  {
    id: "midnight-commit",
    title: "Midnight Commit",
    bpm: 140,
    groove: "lofi",
    colors: ["#6d28d9", "#0ea5e9"],
    chords: [
      [57, 60, 64, 67, 71],
      [53, 57, 60, 64],
      [50, 53, 57, 60, 64],
      [52, 56, 59, 62],
    ],
    swing: 0.22,
    drums: {
      kick: "x......x..x.....",
      snare: "....x.......x...",
      hat: "x.x.x.x.x.x.x.xx",
      snareTone: [1400, 0.18],
    },
    bass: {
      pattern: "x......x..x.....",
      wave: "sine",
      cutoff: 600,
      gain: 0.34,
    },
    pad: {
      wave: "triangle",
      cutoff: 1600,
      gain: 0.07,
      rhythm: "x.........x.....",
    },
    melody: {
      wave: "triangle",
      gain: 0.11,
      notes: [
        [0, 76, 6],
        [8, 74, 2],
        [10, 72, 4],
        [16, 72, 6],
        [24, 71, 2],
        [26, 69, 6],
        [32, 69, 4],
        [36, 72, 4],
        [40, 76, 8],
        [48, 74, 6],
        [56, 72, 8],
      ],
    },
    vinyl: true,
    bars: 32,
  },
  {
    id: "green-build",
    title: "Green Build",
    bpm: 150,
    groove: "chill",
    colors: ["#16a34a", "#a3e635"],
    chords: [
      [48, 55, 60, 64],
      [47, 55, 59, 62],
      [45, 52, 57, 60],
      [41, 53, 57, 60],
    ],
    swing: 0.08,
    drums: {
      kick: "x.......x.......",
      snare: "....x.......x..x",
      hat: "..x...x...x...x.",
      snareTone: [2600, 0.07],
    },
    bass: {
      pattern: "x...x...x...x.x.",
      wave: "triangle",
      cutoff: 900,
      gain: 0.3,
    },
    pad: { wave: "square", cutoff: 800, gain: 0.025 },
    arp: {
      wave: "sine",
      steps: [0, 2, 1, 3, 2, 4, 3, 1, 0, 2, 1, 3, 4, 3, 2, 1],
      gain: 0.16,
      decay: 0.22,
      octave: 12,
    },
    melody: {
      wave: "sine",
      gain: 0.14,
      notes: [
        [0, 72, 2],
        [2, 74, 2],
        [4, 76, 4],
        [8, 79, 4],
        [12, 76, 2],
        [14, 74, 2],
        [16, 72, 8],
        [24, 74, 4],
        [28, 76, 4],
        [32, 79, 2],
        [34, 81, 2],
        [36, 79, 4],
        [40, 76, 4],
        [44, 74, 4],
        [48, 72, 12],
      ],
    },
    bars: 32,
  },
  {
    id: "deploy-friday",
    title: "Deploy on Friday",
    bpm: 160,
    groove: "synthwave",
    colors: ["#2563eb", "#22d3ee"],
    chords: [
      [50, 53, 57, 62],
      [46, 50, 53, 58],
      [53, 57, 60, 65],
      [48, 52, 55, 60],
    ],
    swing: 0,
    drums: {
      kick: "x.......x.......",
      snare: "....x.......x...",
      hat: "x.x.x.x.x.x.x.x.",
      snareTone: [1100, 0.32],
    },
    bass: {
      pattern: "x.x.x.x.x.x.x.x.",
      wave: "sawtooth",
      cutoff: 700,
      gain: 0.26,
    },
    pad: { wave: "sawtooth", cutoff: 1300, gain: 0.04 },
    arp: {
      wave: "sawtooth",
      steps: [0, 1, 2, 3, 2, 1, 0, 1, 0, 1, 2, 3, 4, 3, 2, 1],
      gain: 0.05,
      decay: 0.18,
      octave: 12,
      echo: true,
    },
    melody: {
      wave: "sawtooth",
      gain: 0.05,
      notes: [
        [0, 74, 4],
        [4, 77, 4],
        [8, 81, 6],
        [16, 79, 4],
        [20, 77, 4],
        [24, 76, 6],
        [32, 74, 4],
        [36, 77, 4],
        [40, 81, 4],
        [44, 84, 4],
        [48, 81, 8],
        [56, 77, 6],
      ],
    },
    bars: 32,
  },
];

const stepDuration = (t: Track) => 60 / t.bpm / 4;
export const trackDuration = (t: Track) => t.bars * 16 * stepDuration(t);

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
const hit = (pattern: Pattern | undefined, s: number) => pattern?.[s] === "x";

export type EngineState = { playing: boolean; index: number; volume: number };

class MusicEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  analyser: AnalyserNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private step = 0;
  private nextTime = 0;
  private pendingStep = 0;
  private listeners = new Set<() => void>();
  state: EngineState = { playing: false, index: 0, volume: 0.6 };

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getState = () => this.state;

  private set(next: Partial<EngineState>) {
    this.state = { ...this.state, ...next };
    this.listeners.forEach((l) => l());
  }

  private get track() {
    return tracks[this.state.index];
  }

  elapsed() {
    const dur = stepDuration(this.track);
    if (!this.ctx || !this.timer) return this.pendingStep * dur;
    const ahead = Math.max(0, this.nextTime - this.ctx.currentTime);
    return Math.max(0, this.step * dur - ahead);
  }

  configure(index: number, volume: number) {
    if (this.ctx) return;
    this.state = { ...this.state, index, volume };
  }

  private ensure() {
    if (this.ctx) return this.ctx;
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = this.state.volume;
    const glue = ctx.createDynamicsCompressor();
    glue.threshold.value = -14;
    glue.ratio.value = 3;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    master.connect(glue).connect(analyser).connect(ctx.destination);

    const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    this.ctx = ctx;
    this.master = master;
    this.analyser = analyser;
    this.noise = noise;
    return ctx;
  }

  async play() {
    const ctx = this.ensure();
    if (ctx.state === "suspended") await ctx.resume();
    if (!this.timer) {
      this.startAt(this.pendingStep);
      this.timer = setInterval(() => this.schedule(), 25);
    }
    this.set({ playing: true });
  }

  async pause() {
    if (this.ctx?.state === "running") await this.ctx.suspend();
    this.set({ playing: false });
  }

  toggle() {
    return this.state.playing ? this.pause() : this.play();
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.pendingStep = 0;
    this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.analyser = null;
    this.set({ playing: false });
  }

  select(index: number) {
    const i = (index + tracks.length) % tracks.length;
    this.set({ index: i });
    if (this.ctx && this.timer) this.startAt(0);
    else this.pendingStep = 0;
    return this.play();
  }

  next() {
    return this.select(this.state.index + 1);
  }

  prev() {
    return this.select(
      this.elapsed() > 3 ? this.state.index : this.state.index - 1,
    );
  }

  seek(seconds: number) {
    const dur = stepDuration(this.track);
    const last = this.track.bars * 16 - 1;
    const step = Math.max(0, Math.min(last, Math.round(seconds / dur)));
    if (this.ctx && this.timer) this.startAt(step);
    else this.pendingStep = step;
    this.listeners.forEach((l) => l());
  }

  skip(deltaSeconds: number) {
    this.seek(this.elapsed() + deltaSeconds);
  }

  setVolume(volume: number) {
    if (this.master && this.ctx)
      this.master.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.05);
    this.set({ volume });
  }

  private startAt(step: number) {
    this.step = step;
    this.pendingStep = step;
    this.nextTime = this.ctx!.currentTime + 0.06;
  }

  private schedule() {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== "running") return;
    const track = this.track;
    const dur = stepDuration(track);
    while (this.nextTime < ctx.currentTime + 0.12) {
      if (this.step >= track.bars * 16) {
        this.set({ index: (this.state.index + 1) % tracks.length });
        this.step = 0;
        return;
      }
      const swing = this.step % 2 === 1 ? track.swing * dur : 0;
      this.playStep(track, this.step, this.nextTime + swing, dur);
      this.nextTime += dur;
      this.step++;
      this.pendingStep = this.step;
    }
  }

  private playStep(track: Track, step: number, t: number, dur: number) {
    const bar = Math.floor(step / 16);
    const s = step % 16;
    const chord = track.chords[bar % track.chords.length];
    const intro = bar < 2;
    const outro = bar >= track.bars - 2;
    const section = Math.floor(bar / 4) % 2 === 0 ? "A" : "B";

    if (track.pad.rhythm) {
      if (hit(track.pad.rhythm, s))
        chord.forEach((n) => this.pad(track, hz(n), t, dur * 3));
    } else if (s === 0)
      chord.forEach((n) => this.pad(track, hz(n), t, dur * 16));

    if (!intro && hit(track.bass.pattern, s))
      this.bass(track, hz(chord[0] - 24), t, dur * 2.5);

    if (track.vinyl) this.vinyl(t, s);
    if (intro || outro) return;

    if (hit(track.drums.kick, s)) this.kick(t);
    if (hit(track.drums.snare, s)) this.snare(t, track.drums.snareTone);
    if (hit(track.drums.hat, s)) this.hat(t, s % 4 === 2 ? 0.07 : 0.035, 0.035);
    if (hit(track.drums.open, s)) this.hat(t, 0.05, 0.16);

    if (section === "A" && track.arp) {
      const tone = track.arp.steps[s];
      if (tone !== null && tone !== undefined) {
        const note =
          chord[tone % chord.length] +
          track.arp.octave +
          (tone >= chord.length ? 12 : 0);
        const { wave, gain, decay, echo } = track.arp;
        this.pluck(wave, hz(note), t, gain, decay);
        if (echo) this.pluck(wave, hz(note), t + dur * 3, gain * 0.35, decay);
      }
    }
    if (section === "B") {
      const phraseStep = (bar % 4) * 16 + s;
      for (const [at, midi, len] of track.melody.notes)
        if (at === phraseStep) this.lead(track, hz(midi), t, len * dur);
    }
  }

  private env(t: number, attack: number, peak: number, decay: number) {
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    g.connect(this.master!);
    return g;
  }

  private osc(
    type: OscillatorType,
    freq: number,
    t: number,
    stop: number,
    detune = 0,
  ) {
    const o = this.ctx!.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    o.detune.value = detune;
    o.start(t);
    o.stop(stop);
    return o;
  }

  private filter(type: BiquadFilterType, freq: number) {
    const f = this.ctx!.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    return f;
  }

  private pad(track: Track, freq: number, t: number, len: number) {
    const stab = Boolean(track.pad.rhythm);
    const g = this.env(t, stab ? 0.01 : 0.3, track.pad.gain, len);
    const f = this.filter("lowpass", track.pad.cutoff);
    f.connect(g);
    for (const detune of [-8, 8])
      this.osc(track.pad.wave, freq, t, t + len + 0.6, detune).connect(f);
  }

  private bass(track: Track, freq: number, t: number, len: number) {
    const g = this.env(t, 0.01, track.bass.gain, len);
    const f = this.filter("lowpass", track.bass.cutoff);
    f.connect(g);
    this.osc(track.bass.wave, freq, t, t + len + 0.1).connect(f);
  }

  private pluck(
    type: OscillatorType,
    freq: number,
    t: number,
    gain: number,
    decay: number,
  ) {
    const g = this.env(t, 0.004, gain, decay);
    const f = this.ctx!.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(4200, t);
    f.frequency.exponentialRampToValueAtTime(700, t + decay);
    f.connect(g);
    this.osc(type, freq, t, t + decay + 0.05).connect(f);
  }

  private lead(track: Track, freq: number, t: number, len: number) {
    const g = this.env(t, 0.02, track.melody.gain, len * 0.9);
    const f = this.filter("lowpass", 3200);
    f.connect(g);
    const o = this.osc(track.melody.wave, freq, t, t + len + 0.1);
    const lfo = this.osc("sine", 5.5, t, t + len + 0.1);
    const depth = this.ctx!.createGain();
    depth.gain.value = freq * 0.006;
    lfo.connect(depth).connect(o.frequency);
    o.connect(f);
  }

  private kick(t: number) {
    const o = this.ctx!.createOscillator();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.16);
    o.connect(this.env(t, 0.002, 0.6, 0.3));
    o.start(t);
    o.stop(t + 0.4);
  }

  private noiseHit(
    t: number,
    type: BiquadFilterType,
    freq: number,
    peak: number,
    decay: number,
  ) {
    const src = this.ctx!.createBufferSource();
    src.buffer = this.noise;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    src
      .connect(this.filter(type, freq))
      .connect(this.env(t, 0.002, peak, decay));
    src.start(t, Math.random() * 0.5);
    src.stop(t + decay + 0.05);
  }

  private snare(t: number, [freq, decay]: [number, number]) {
    this.noiseHit(t, "bandpass", freq, 0.16, decay);
  }

  private hat(t: number, peak: number, decay: number) {
    this.noiseHit(t, "highpass", 7800, peak, decay);
  }

  private vinyl(t: number, s: number) {
    if (s % 4 === 0) this.noiseHit(t, "lowpass", 2600, 0.008, 0.6);
    if (Math.random() < 0.18) this.noiseHit(t, "highpass", 3000, 0.03, 0.012);
  }
}

export const music = new MusicEngine();
