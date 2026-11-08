let sharedAudioCtx: AudioContext | null = null;
let cachedNoiseBuffer: AudioBuffer | null = null;
let lastClickPerfMs = 0;

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!sharedAudioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (AudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
  }

  if (sharedAudioCtx && sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => {});
  }

  return sharedAudioCtx;
}

function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (cachedNoiseBuffer && cachedNoiseBuffer.sampleRate === ctx.sampleRate) {
    return cachedNoiseBuffer;
  }
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * 0.008));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
  }
  cachedNoiseBuffer = buffer;
  return buffer;
}

// Mechanical detent tick. Throttled to 22ms minimum interval so multi-slot jumps at peak spin speed never overlap or clip.
export function playDetentClick(
  ctx: AudioContext | null,
  velocityRatio = 0.5
): void {
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  const nowPerf = typeof performance !== "undefined" ? performance.now() : 0;
  if (nowPerf > 0 && nowPerf - lastClickPerfMs < 22) {
    return;
  }
  lastClickPerfMs = nowPerf;

  try {
    const now = ctx.currentTime;
    const clampedVel = Math.max(0, Math.min(1, velocityRatio));

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "triangle";

    const startFreq = 1180 + clampedVel * 320;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.012);

    const peakGain = Math.min(0.28, 0.12 + clampedVel * 0.12);
    oscGain.gain.setValueAtTime(0.001, now);
    oscGain.gain.linearRampToValueAtTime(peakGain, now + 0.0012);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.013);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.014);

    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(2400, now);
    bandpass.Q.setValueAtTime(2.8, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(peakGain * 0.55, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.007);

    noise.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.008);
  } catch {
    // Web Audio API may be blocked until first user interaction
  }
}

export function playLockChime(ctx: AudioContext | null): void {
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  try {
    const now = ctx.currentTime;
    const notesHz = [587.33, 880.0];

    notesHz.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const startTime = now + idx * 0.065;

      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.19);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  } catch {
    // Web Audio API may be blocked until first user interaction
  }
}

export function playAlarmRing(ctx: AudioContext | null): void {
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  try {
    const now = ctx.currentTime;
    // 3 double-pulse alarm bursts (880Hz A5 -> 1174.66Hz D6)
    const pulses = [
      { offset: 0.0, freq: 880.0 },
      { offset: 0.12, freq: 1174.66 },
      { offset: 0.42, freq: 880.0 },
      { offset: 0.54, freq: 1174.66 },
      { offset: 0.84, freq: 880.0 },
      { offset: 0.96, freq: 1174.66 },
    ];

    pulses.forEach(({ offset, freq }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      const startTime = now + offset;

      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.22, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.11);
    });
  } catch {
    // Web Audio API may be blocked until first user interaction
  }
}
