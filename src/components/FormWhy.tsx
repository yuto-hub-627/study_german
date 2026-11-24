import type { Suggestion } from '../lib/lexicon';

/** 「isst は essen の現在形（du・er/sie/es）」の表示 */
export function FormWhy({ s, input }: { s: Suggestion; input?: string }) {
  if (s.kind !== 'form' || !s.why) return null;
  const form = (input || '').trim() || s.form;
  return (
    <div className="form-why">
      <b className="de">{form}</b> は <b className="de">{s.e.w}</b> の{s.why}
    </div>
  );
}
