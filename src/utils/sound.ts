// Lightweight procedural audio effects using Web Audio API

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Pre-warm the AudioContext on module load so the first sound has no delay.
// Browsers require a user gesture before audio can play, but Tauri's webview
// doesn't enforce that restriction, so this is safe here.
if (typeof window !== 'undefined') {
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (AudioContextClass) {
    try {
      audioCtx = new AudioContextClass();
    } catch (_) { /* ignore */ }
  }
}

export function playCheckSound(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Satisfying cheerful two-tone chime (E5 -> B5)
    const now = ctx.currentTime;
    
    // Note 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.18);

    // Note 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.08); // B5
    gain2.gain.setValueAtTime(0.07, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.32);
  } catch (e) {
    console.warn("Audio play error", e);
  }
}

export function playUncheckSound(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.1);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  } catch (e) {
    console.warn("Audio play error", e);
  }
}

export function playTypewriterSound(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Crisp mechanical key tap
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  } catch (e) {
    console.warn("Audio play error", e);
  }
}

export function playCelebrationSound(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Arpeggio: C5 -> E5 -> G5 -> C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const startTime = now + idx * 0.09;
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.09, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  } catch (e) {
    console.warn("Audio play error", e);
  }
}

export function playPrinterSound(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const duration = 1.3;

    // ---- Paper feed motor: fast sawtooth bursts ----
    // Real thermal printers make a rapid "zzzzip" — sawtooth into a bandpass
    // gives that characteristic mechanical buzz
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const nd = noiseBuffer.getChannelData(0);
    // Sawtooth-ish noise: deterministic ramp per ~2ms cycle for the buzz texture
    const cycleSamples = Math.floor(ctx.sampleRate * 0.0022);
    for (let i = 0; i < bufferSize; i++) {
      nd[i] = ((i % cycleSamples) / cycleSamples) * 2 - 1;
    }
    const motorSrc = ctx.createBufferSource();
    motorSrc.buffer = noiseBuffer;

    // Bandpass centered on the "paper zipping" frequency range
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 3200;
    bp.Q.value = 1.8;

    const motorGain = ctx.createGain();
    // Quick attack, hold, quick tail-off
    motorGain.gain.setValueAtTime(0, now);
    motorGain.gain.linearRampToValueAtTime(0.28, now + 0.04);
    motorGain.gain.setValueAtTime(0.28, now + duration - 0.18);
    motorGain.gain.linearRampToValueAtTime(0, now + duration);

    motorSrc.connect(bp);
    bp.connect(motorGain);
    motorGain.connect(ctx.destination);
    motorSrc.start(now);
    motorSrc.stop(now + duration);

    // ---- Paper friction layer: high-passed white noise ----
    // Adds the "ssshhhh" of paper surface moving under the head
    const frictionSize = Math.floor(ctx.sampleRate * duration);
    const frictionBuffer = ctx.createBuffer(1, frictionSize, ctx.sampleRate);
    const fd = frictionBuffer.getChannelData(0);
    for (let i = 0; i < frictionSize; i++) fd[i] = Math.random() * 2 - 1;

    const frictionSrc = ctx.createBufferSource();
    frictionSrc.buffer = frictionBuffer;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 5000;
    hp.Q.value = 0.5;

    const frictionGain = ctx.createGain();
    frictionGain.gain.setValueAtTime(0, now);
    frictionGain.gain.linearRampToValueAtTime(0.08, now + 0.04);
    frictionGain.gain.setValueAtTime(0.08, now + duration - 0.18);
    frictionGain.gain.linearRampToValueAtTime(0, now + duration);

    frictionSrc.connect(hp);
    hp.connect(frictionGain);
    frictionGain.connect(ctx.destination);
    frictionSrc.start(now);
    frictionSrc.stop(now + duration);

    // ---- Stepper motor sub-ticks: the chunky mechanical rhythm ----
    // 18 evenly spaced low thumps — the stepping sound of the feed roller
    const tickCount = 18;
    for (let i = 0; i < tickCount; i++) {
      const t = now + 0.03 + (i / tickCount) * (duration - 0.1);
      const tickOsc = ctx.createOscillator();
      const tickGain = ctx.createGain();
      tickOsc.type = 'sawtooth';
      tickOsc.frequency.setValueAtTime(180 + (i % 3) * 12, t);
      tickGain.gain.setValueAtTime(0.06, t);
      tickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.022);
      tickOsc.connect(tickGain);
      tickGain.connect(ctx.destination);
      tickOsc.start(t);
      tickOsc.stop(t + 0.025);
    }

    // ---- End clunk: printer head parks ----
    const clunkOsc = ctx.createOscillator();
    const clunkGain = ctx.createGain();
    clunkOsc.type = 'sine';
    clunkOsc.frequency.setValueAtTime(110, now + duration);
    clunkOsc.frequency.exponentialRampToValueAtTime(55, now + duration + 0.07);
    clunkGain.gain.setValueAtTime(0.12, now + duration);
    clunkGain.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.09);
    clunkOsc.connect(clunkGain);
    clunkGain.connect(ctx.destination);
    clunkOsc.start(now + duration);
    clunkOsc.stop(now + duration + 0.1);
  } catch (e) {
    console.warn("Audio play error", e);
  }
}

export function playBunnyPokeSound(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  } catch (e) {
    console.warn("Audio play error", e);
  }
}
