import { useEffect, useRef, useState } from 'react';
import { loadLexicon, suggest, type LexEntry, type Suggestion } from '../lib/lexicon';
import { ARTICLE } from '../lib/german';
import { POS_LABEL } from '../lib/types';

const UML = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'];

export function useLexicon() {
  const [lex, setLex] = useState<LexEntry[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    loadLexicon().then(setLex, (e) => setErr(String(e.message || e)));
  }, []);
  return { lex, err };
}

export function GermanInput({
  value,
  onChange,
  onPick,
  lex,
  autoFocus,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onPick: (e: LexEntry) => void;
  lex: LexEntry[] | null;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(0);
  const [list, setList] = useState<Suggestion[]>([]);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!lex) return;
    const t = setTimeout(() => {
      setList(suggest(lex, value, 8));
      setSel(0);
    }, 60);
    return () => clearTimeout(t);
  }, [value, lex]);

  const insert = (ch: string) => {
    const el = ref.current;
    if (!el) return onChange(value + ch);
    const s = el.selectionStart ?? value.length;
    const e = el.selectionEnd ?? value.length;
    const nv = value.slice(0, s) + ch + value.slice(e);
    onChange(nv);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + ch.length, s + ch.length);
    });
    setOpen(true);
  };

  const pick = (s: Suggestion) => {
    onPick(s.e);
    setOpen(false);
  };

  return (
    <div className="suggest">
      <input
        ref={ref}
        className="input de"
        value={value}
        autoFocus={autoFocus}
        placeholder={placeholder}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        autoComplete="off"
        lang="de"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (!open || !list.length) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSel((sel + 1) % list.length);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSel((sel - 1 + list.length) % list.length);
          } else if (e.key === 'Enter') {
            e.preventDefault();
            pick(list[sel]);
          } else if (e.key === 'Escape') setOpen(false);
        }}
        role="combobox"
        aria-expanded={open && list.length > 0}
        aria-autocomplete="list"
      />
      <div className="umlauts" aria-label="ウムラウト入力">
        {UML.map((u) => (
          <button type="button" key={u} onMouseDown={(e) => e.preventDefault()} onClick={() => insert(u)}>
            {u}
          </button>
        ))}
      </div>
      {open && value.trim() && list.length > 0 && (
        <div className="suggest-list" role="listbox" style={{ top: 52 }}>
          {list[0]?.kind === 'fuzzy' && <div className="tiny muted" style={{ padding: '8px 14px 0' }}>もしかして：</div>}
          {list.map((s, i) => (
            <div
              key={s.e.w + s.e.p + i}
              className={`suggest-item${i === sel ? ' sel' : ''}`}
              role="option"
              aria-selected={i === sel}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(s)}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="row" style={{ gap: 6 }}>
                  <span className={`w de${s.e.p === 'noun' && s.e.g ? ' g-' + s.e.g : ''}`}>
                    {s.e.p === 'noun' && s.e.g ? ARTICLE[s.e.g] + ' ' : ''}
                    {s.e.w}
                  </span>
                  <span className="tag">{POS_LABEL[s.e.p] ?? s.e.p}</span>
                  {s.kind === 'fuzzy' && <span className="tag warn">綴り違い?</span>}
                </div>
                <div className="ja">{s.e.ja || s.e.en?.[0] || ''}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
