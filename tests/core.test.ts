import { describe, expect, it } from 'vitest';
import textbook from '../src/data/textbook.json';
import { declineNoun, regularVerb } from '../src/lib/german';
import { editDistance, fold, suggest, type LexEntry } from '../src/lib/lexicon';
import { newProgress, review, stage } from '../src/lib/srs';
import type { Word } from '../src/lib/types';

describe('lexicon', () => {
  it('folds umlauts and spelling variants', () => {
    expect(fold('Mädchen')).toBe('madchen');
    expect(fold('Maedchen')).toBe('madchen');
    expect(fold('Straße')).toBe('strasse');
  });
  it('suggests by prefix, then typo candidates', () => {
    const lex: LexEntry[] = [
      { w: 'Kartoffel', p: 'noun', r: 100, k: fold('Kartoffel') },
      { w: 'Karte', p: 'noun', r: 50, k: fold('Karte') },
    ];
    expect(suggest(lex, 'Kar')[0].e.w).toBe('Karte');
    const typo = suggest(lex, 'Kartofel');
    expect(typo[0].e.w).toBe('Kartoffel');
    expect(typo[0].kind).toBe('fuzzy');
    expect(editDistance('abc', 'acb')).toBe(1);
  });
});

describe('german', () => {
  it('conjugates regular verbs with e-insertion', () => {
    const v = regularVerb('arbeiten');
    expect(v.pr).toEqual(['arbeite', 'arbeitest', 'arbeitet', 'arbeiten', 'arbeitet', 'arbeiten']);
    expect(v.pp).toBe('gearbeitet');
    expect(regularVerb('studieren').pp).toBe('studiert');
    expect(regularVerb('abholen', 'ab').pp).toBe('abgeholt');
  });
  it('declines weak masculine nouns', () => {
    const w = (textbook as Word[]).find((x) => x.de === 'Student')!;
    expect(declineNoun(w).sg).toEqual(['der Student', 'des Studenten', 'dem Studenten', 'den Studenten']);
    const k = (textbook as Word[]).find((x) => x.de === 'Kind')!;
    expect(declineNoun(k).pl![2]).toBe('den Kindern');
  });
  it('textbook verbs all have conjugation data', () => {
    for (const w of textbook as Word[]) if (w.pos === 'verb') expect(w.v?.pr?.length, w.de).toBe(6);
  });
});

describe('srs', () => {
  it('grows intervals and resets on lapse', () => {
    let p = newProgress('x', 0);
    expect(stage(p)).toBe('new');
    p = review(p, 2, 0);
    expect(p.interval).toBe(1);
    p = review(p, 2, 0);
    expect(p.interval).toBe(3);
    p = review(p, 2, 0);
    expect(p.interval).toBeGreaterThan(6);
    p = review(p, 0, 0);
    expect(p.interval).toBe(0);
    expect(p.lapses).toBe(1);
  });
});
