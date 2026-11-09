import { speak, ttsAvailable } from '../lib/tts';
import { Icon } from './Icon';

export function Speak({ text, small, label }: { text: string; small?: boolean; label?: string }) {
  if (!ttsAvailable()) return null;
  return (
    <button
      type="button"
      className={`icon-btn${small ? ' sm' : ''}`}
      aria-label={label || `${text} を発音`}
      title="発音を聞く"
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
    >
      <Icon name="speaker" />
    </button>
  );
}
