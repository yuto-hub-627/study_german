export type Pos =
  | 'noun' | 'verb' | 'adj' | 'adv' | 'prep' | 'conj' | 'pron'
  | 'num' | 'det' | 'intj' | 'phrase' | 'other';

export type Gender = 'm' | 'f' | 'n';

/** 動詞の活用データ (Wiktionary 由来、なければ規則変化で補完) */
export interface VerbForms {
  /** 現在形 ich, du, er, wir, ihr, sie */
  pr?: string[];
  /** 過去形 ich, du, er, wir, ihr, sie */
  pt?: string[];
  /** 接続法II式 */
  k2?: string[];
  /** 命令形 du, ihr */
  im?: string[];
  /** 過去分詞 */
  pp?: string;
  /** 完了の助動詞 */
  ax?: string;
  rf?: number;
  wk?: number;
}

export interface Word {
  id: string;
  de: string;
  pos: Pos;
  ja: string;
  en?: string;
  ipa?: string;
  lesson?: string;
  src: 'textbook' | 'user';
  /** 名詞 */
  g?: Gender;
  pl?: string;
  gen?: string;
  plOnly?: boolean;
  weak?: boolean;
  /** 動詞 */
  v?: VerbForms;
  sep?: string;
  refl?: boolean;
  /** 形容詞 [比較級, 最上級] */
  c?: (string | null)[];
  note?: string;
  example?: string;
  tags?: string[];
  createdAt?: number;
  updatedAt?: number;
  deleted?: boolean;
}

/** 単語ごとの学習状態 (間隔反復) */
export interface Progress {
  id: string; // word id
  reps: number;
  lapses: number;
  ease: number;
  interval: number; // days
  due: number; // epoch ms
  last?: number; // epoch ms
  /** 直近の正誤 (1=正解,0=不正解) 最大20件 */
  hist: number[];
  updatedAt: number;
}

export interface ReviewLog {
  id: string; // unique
  wordId: string;
  at: number;
  grade: Grade;
  updatedAt: number;
}

export type Grade = 0 | 1 | 2 | 3; // 0:もう一度 1:難しい 2:正解 3:簡単

export interface QuizResult {
  id: string; // lessonId
  best: number; // 0..1
  last: number; // 0..1
  attempts: number;
  wrong: string[]; // question ids answered wrong last time
  updatedAt: number;
}

export interface Settings {
  rate: number;
  voiceURI?: string;
  dailyNew: number;
  direction: 'de-ja' | 'ja-de' | 'mixed';
  lessonsFilter: string[];
  syncCode?: string;
  lastSync?: number;
  serverCursor?: number;
}

export const POS_LABEL: Record<Pos, string> = {
  noun: '名詞',
  verb: '動詞',
  adj: '形容詞',
  adv: '副詞',
  prep: '前置詞',
  conj: '接続詞',
  pron: '代名詞',
  num: '数詞',
  det: '冠詞類',
  intj: '間投詞',
  phrase: '表現・フレーズ',
  other: 'その他',
};

export const POS_ORDER: Pos[] = ['noun', 'verb', 'adj', 'adv', 'prep', 'conj', 'pron', 'det', 'num', 'phrase', 'intj', 'other'];

export const LESSONS = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B', '7A', '7B', '8A', '8B'];

/** MY単語帳: フォルダーまたは単語帳 */
export interface Book {
  id: string;
  kind: 'folder' | 'book';
  name: string;
  /** 単語帳が入っているフォルダー (kind=book のみ) */
  folderId?: string;
  /** 単語帳に入っている単語ID (kind=book のみ) */
  wordIds?: string[];
  createdAt?: number;
  updatedAt: number;
  deleted?: boolean;
}
