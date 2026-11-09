let voices: SpeechSynthesisVoice[] = [];

function refresh() {
  if (typeof speechSynthesis === 'undefined') return;
  voices = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('de'));
}
if (typeof speechSynthesis !== 'undefined') {
  refresh();
  speechSynthesis.addEventListener?.('voiceschanged', refresh);
}

export function germanVoices(): SpeechSynthesisVoice[] {
  refresh();
  return voices;
}

export function ttsAvailable(): boolean {
  return typeof speechSynthesis !== 'undefined';
}

let opts: { rate: number; voiceURI?: string } = { rate: 0.9 };
export function setTtsOptions(o: { rate: number; voiceURI?: string }) {
  opts = o;
}

export function speak(text: string, rate?: number) {
  if (!ttsAvailable()) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/\|/g, ''));
  u.lang = 'de-DE';
  u.rate = rate ?? opts.rate;
  const v = voices.find((x) => x.voiceURI === opts.voiceURI) || voices.find((x) => x.lang === 'de-DE') || voices[0];
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}
