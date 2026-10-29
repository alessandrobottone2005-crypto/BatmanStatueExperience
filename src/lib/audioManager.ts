// All sound uses the same mute/pause policy; nothing loads before a user action.
let music: HTMLAudioElement | null = null;
let muted = false,
  paused = false;
let context: AudioContext | null = null;
let master: GainNode | null = null;
const sources = new Set<AudioScheduledSourceNode>();
const clips = new Set<HTMLAudioElement>();
let laughBuffer: AudioBuffer | null = null;
function graph() {
  if (!context) {
    context = new AudioContext();
    master = context.createGain();
    master.connect(context.destination);
  }
  master!.gain.value = muted || paused ? 0 : 1;
  if (!paused) void context.resume().catch(() => {});
  return { ctx: context, gain: master! };
}
function sync() {
  if (music) {
    music.muted = muted;
    if (paused) music.pause();
    else void music.play().catch(() => {});
  }
  for (const clip of clips) {
    clip.muted = muted;
    if (paused) clip.pause();
    else void clip.play().catch(() => {});
  }
  if (master && context)
    master.gain.setValueAtTime(muted || paused ? 0 : 1, context.currentTime);
  if (context)
    void (paused ? context.suspend() : context.resume()).catch(() => {});
}
export const BatcavernAudio = {
  preload() {},
  start(_fade?: number) {
    if (muted || paused) return;
    if (!music) {
      music = new Audio("/assets/audio/SiglaBatman.wav");
      music.loop = true;
      music.volume = 0.3;
    }
    void music.play().catch(() => {});
  },
  setMuted(value: boolean) {
    muted = value;
    sync();
  },
  setPaused(value: boolean) {
    paused = value;
    sync();
  },
  isPlaying() {
    return !!music && !music.paused;
  },
  getInstance() {
    return music;
  },
  beep(frequency: number, type: OscillatorType = "sine", duration = 0.25) {
    if (muted || paused) return;
    try {
      const { ctx, gain } = graph();
      const oscillator = ctx.createOscillator();
      const envelope = ctx.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      envelope.gain.setValueAtTime(0.08, ctx.currentTime);
      envelope.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration,
      );
      oscillator.connect(envelope);
      envelope.connect(gain);
      sources.add(oscillator);
      oscillator.onended = () => {
        sources.delete(oscillator);
        oscillator.disconnect();
        envelope.disconnect();
      };
      oscillator.start();
      oscillator.stop(ctx.currentTime + duration);
    } catch {
      /* Audio is optional. */
    }
  },
  clip(src: string) {
    if (muted || paused) return () => {};
    const clip = new Audio(src);
    clip.volume = 0.16;
    clips.add(clip);
    clip.onended = () => clips.delete(clip);
    void clip.play().catch(() => clips.delete(clip));
    return () => {
      clip.pause();
      clip.removeAttribute("src");
      clip.load();
      clips.delete(clip);
    };
  },
  spatialLaugh() {
    let cancelled = false;
    let source: AudioBufferSourceNode | null = null;
    const nodes: AudioNode[] = [];
    void (async () => {
      try {
        const { ctx, gain } = graph();
        if (!laughBuffer) {
          const response = await fetch("/assets/audio/RisataJoker.wav");
          if (!response.ok) return;
          laughBuffer = await ctx.decodeAudioData(await response.arrayBuffer());
        }
        if (cancelled || muted || paused || ctx.state === "closed") return;
        source = ctx.createBufferSource();
        source.buffer = laughBuffer;
        source.playbackRate.value = 0.62 + Math.random() * 0.13;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 700 + Math.random() * 1400;
        const pan = ctx.createStereoPanner();
        pan.pan.value = (Math.random() * 2 - 1) * 0.88;
        const volume = ctx.createGain();
        volume.gain.value = 0.14;
        const delay = ctx.createDelay(2);
        delay.delayTime.value = 0.45;
        const echo = ctx.createGain();
        echo.gain.value = 0.3;
        source.connect(filter);
        filter.connect(pan);
        pan.connect(volume);
        volume.connect(gain);
        volume.connect(delay);
        delay.connect(echo);
        echo.connect(gain);
        nodes.push(filter, pan, volume, delay, echo);
        sources.add(source);
        const current = source;
        source.onended = () => {
          sources.delete(current);
          current.disconnect();
          for (const node of nodes) node.disconnect();
        };
        source.start();
      } catch {
        /* Optional audio must never block a scene. */
      }
    })();
    return () => {
      cancelled = true;
      try {
        source?.stop();
      } catch {
        /* Already ended. */
      }
    };
  },
  stop() {
    music?.pause();
    music?.removeAttribute("src");
    music?.load();
    music = null;
    for (const clip of clips) {
      clip.pause();
      clip.removeAttribute("src");
      clip.load();
    }
    clips.clear();
    for (const source of sources) {
      try {
        source.stop();
      } catch {
        /* Already ended. */
      }
    }
    sources.clear();
    if (context) void context.close().catch(() => {});
    laughBuffer = null;
    context = null;
    master = null;
  },
};
