import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const isWeb = Platform.OS === 'web';

let audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  if (!isWeb) return null;
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch { return null; }
  }
  return audioCtx;
}

function webBeep(freq: number, durationMs: number, volume = 0.15) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = 'sine';
  gain.gain.value = volume;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + durationMs / 1000);
}

export async function playClick() {
  if (isWeb) return;
  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
}

export async function playSuccess() {
  if (isWeb) return;
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
}

export async function playError() {
  if (isWeb) return;
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
}

export async function playBeep() {
  if (isWeb) return;
  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
}

export async function playComplete() {
  if (isWeb) return;
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
}

export function playTick() {
  if (isWeb) {
    webBeep(1200, 60, 0.12);
  } else {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
}

// --- Sesli komut (Web Speech API) ---
let trVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

function loadVoice() {
  if (!isWeb || voicesLoaded) return;
  const pick = () => {
    const voices = speechSynthesis.getVoices();
    // Türkçe kadın sesi tercih et
    const trFemale = voices.find(v => v.lang.startsWith('tr') && v.name.toLowerCase().includes('female'));
    const trAny = voices.find(v => v.lang.startsWith('tr'));
    trVoice = trFemale || trAny || null;
    voicesLoaded = true;
  };
  pick();
  if (!trVoice) {
    speechSynthesis.onvoiceschanged = pick;
  }
}

if (isWeb) {
  loadVoice();
}

export function speak(text: string) {
  if (!isWeb) return;
  try {
    if (!voicesLoaded) loadVoice();
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'tr-TR';
    u.rate = 0.95;
    u.pitch = 1.15;
    u.volume = 1;
    if (trVoice) u.voice = trVoice;
    speechSynthesis.speak(u);
  } catch {}
}
