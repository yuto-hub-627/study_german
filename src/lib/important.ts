import raw from '../../重要なこと/notes.md?raw';

export interface ImportantNote {
  id: string;
  title: string;
  date?: string;
  lesson?: string;
  category: string;
  content: string;
  example?: string;
  memo?: string;
}

/** 重要なこと/notes.md (README のフォーマット) をカード用データに変換 */
export function parseNotes(md: string): ImportantNote[] {
  const out: ImportantNote[] = [];
  const blocks = md.split(/^##\s+/m).slice(1);
  for (const b of blocks) {
    const lines = b.split('\n');
    const m = lines[0].trim().match(/^(I-\d+)\s+(.*)$/);
    if (!m) continue;
    const f: Record<string, string> = {};
    for (const l of lines.slice(1)) {
      const mm = l.match(/^-\s*([^:：]+)[:：]\s*(.*)$/);
      if (mm) f[mm[1].trim()] = mm[2].trim();
    }
    out.push({
      id: m[1],
      title: m[2].trim(),
      date: f['日付'],
      lesson: f['課'] && f['課'] !== '-' ? f['課'] : undefined,
      category: f['分類'] || 'その他',
      content: f['内容'] || '',
      example: f['例'] || undefined,
      memo: f['メモ'] || undefined,
    });
  }
  return out;
}

export const IMPORTANT_NOTES = parseNotes(raw);
