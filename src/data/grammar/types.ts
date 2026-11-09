export type Block =
  | { t: 'p'; text: string }
  | { t: 'note'; text: string }
  | { t: 'list'; items: string[] }
  | { t: 'ex'; de: string; ja: string }
  | { t: 'table'; head: string[]; rows: string[][]; caption?: string; firstColHead?: boolean };

export interface Section {
  title: string;
  blocks: Block[];
}

export type Question =
  | { id: string; type: 'choice'; q: string; de?: string; options: string[]; answer: number; explain?: string }
  | { id: string; type: 'input'; q: string; de: string; answers: string[]; hint?: string; explain?: string }
  | { id: string; type: 'order'; q: string; words: string[]; answers?: string[][]; explain?: string };

export interface GrammarLesson {
  id: string;
  title: string;
  subtitle: string;
  goals: string[];
  sections: Section[];
  quiz: Question[];
}
