import { useMemo, useState } from 'react';
import { Icon } from '../components/Icon';
import { fold } from '../lib/lexicon';
import { headword } from '../lib/german';
import { go } from '../lib/router';
import { deleteBook, saveBook, setBookWords, useStore } from '../lib/store';
import type { Book, Word } from '../lib/types';
import { WordList } from './Words';

export const UNFILED = 'unfiled';

/** どの単語帳にも入っていない自分で追加した単語 */
function useUnfiled() {
  const words = useStore((s) => s.words);
  const books = useStore((s) => s.books);
  return useMemo(() => {
    const inBook = new Set(books.flatMap((b) => b.wordIds || []));
    return words.filter((w) => w.src === 'user' && !inBook.has(w.id));
  }, [words, books]);
}

export function MyBooks() {
  const books = useStore((s) => s.books);
  const unfiled = useUnfiled();
  const wordbooks = books.filter((b) => b.kind === 'book');

  const newBook = async () => {
    const name = prompt('単語帳の名前', '新しい単語帳');
    if (!name?.trim()) return;
    const b = await saveBook({ kind: 'book', name: name.trim() });
    go(`/my/${encodeURIComponent(b.id)}`);
  };

  return (
    <div className="stack">
      <div className="topbar">
        <h1>MY単語帳</h1>
        <button className="btn primary small" onClick={newBook}>
          <Icon name="plus" size={16} /> 単語帳
        </button>
      </div>

      <div className="card" style={{ padding: '4px 16px' }}>
        {wordbooks.length === 0 ? (
          <div className="empty small">まだ単語帳がありません。「＋ 単語帳」で作成しましょう。</div>
        ) : (
          <div className="wlist">
            {wordbooks.map((b) => (
              <BookRow key={b.id} b={b} />
            ))}
          </div>
        )}
      </div>

      {unfiled.length > 0 && (
        <div className="card lesson-card" onClick={() => go(`/my/${UNFILED}`)}>
          <span style={{ fontSize: 22 }}>🗂️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>未分類の追加単語</div>
            <div className="small muted">どの単語帳にも入っていない、自分で追加した単語</div>
          </div>
          <span className="tag">{unfiled.length}語</span>
          <Icon name="chevron" size={18} />
        </div>
      )}
    </div>
  );
}

function BookRow({ b }: { b: Book }) {
  return (
    <div className="witem book-row" onClick={() => go(`/my/${encodeURIComponent(b.id)}`)}>
      <span style={{ fontSize: 20 }}>📘</span>
      <div className="body" style={{ fontWeight: 600 }}>{b.name}</div>
      <span className="tiny muted">{b.wordIds?.length ?? 0}語</span>
      <Icon name="chevron" size={18} />
    </div>
  );
}

export function BookDetail({ id }: { id: string }) {
  const book = useStore((s) => s.books.find((b) => b.id === id));
  const wordMap = useStore((s) => s.wordMap);
  const all = useStore((s) => s.words);
  const progress = useStore((s) => s.progress);
  const unfiled = useUnfiled();
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState('');
  const isUnfiled = id === UNFILED;

  const words: Word[] = isUnfiled ? unfiled : (book?.wordIds || []).map((x) => wordMap.get(x)).filter((w): w is Word => !!w);
  const candidates = useMemo(() => {
    if (!q.trim() || !book) return [];
    const fq = fold(q);
    const jp = /[぀-ヿ一-鿿]/.test(q);
    const ids = new Set(book.wordIds);
    return all.filter((w) => !ids.has(w.id) && (jp ? w.ja.includes(q) : fold(w.de).includes(fq))).slice(0, 30);
  }, [q, all, book]);

  if (!book && !isUnfiled) return <div className="empty">単語帳が見つかりません</div>;

  return (
    <div className="stack">
      <div className="topbar">
        <button className="back" onClick={() => go('/my')}>
          <Icon name="back" size={18} /> MY単語帳
        </button>
        {!isUnfiled && book && (
          <div className="row">
            <button
              className="btn small ghost"
              title="名前を変更"
              onClick={async () => {
                const name = prompt('単語帳の名前', book.name);
                if (name?.trim()) await saveBook({ ...book, name: name.trim() });
              }}
            >
              <Icon name="edit" size={16} />
            </button>
            <button
              className="btn small ghost danger"
              title="単語帳を削除"
              onClick={async () => {
                if (confirm(`単語帳「${book.name}」を削除しますか？\n（単語そのものは消えません）`)) {
                  await deleteBook(book);
                  go('/my');
                }
              }}
            >
              <Icon name="trash" size={16} />
            </button>
          </div>
        )}
      </div>
      <div>
        <h1 className="scribble">{isUnfiled ? '未分類の追加単語' : book!.name}</h1>
        <div className="small muted">{words.length} 語</div>
      </div>

      <div className="row">
        {words.length > 0 && (
          <button className="btn primary" onClick={() => go(`/study?book=${encodeURIComponent(id)}`)}>
            この単語帳で学習
          </button>
        )}
        {!isUnfiled && (
          <>
            <button className="btn" onClick={() => go(`/add?book=${encodeURIComponent(id)}`)}>
              <Icon name="plus" size={16} /> 新しい単語を追加
            </button>
            <button className="btn" onClick={() => setAdding(!adding)}>
              <Icon name="search" size={16} /> 既存の単語から追加
            </button>
          </>
        )}
      </div>

      {adding && book && (
        <div className="card stack">
          <input className="input" autoFocus placeholder="教科書単語・追加した単語から検索（ドイツ語 / 日本語）" value={q} onChange={(e) => setQ(e.target.value)} />
          {q && candidates.length === 0 && <div className="tiny muted">見つかりません。「新しい単語を追加」から辞書で追加できます。</div>}
          {candidates.length > 0 && (
            <WordList
              words={candidates}
              progress={progress}
              showLesson
              action={(w) => (
                <button
                  className="btn small primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    void setBookWords(book.id, (ids) => [...ids, w.id]);
                  }}
                >
                  ＋
                </button>
              )}
            />
          )}
        </div>
      )}

      <div className="card" style={{ padding: '4px 16px' }}>
        {words.length === 0 ? (
          <div className="empty">まだ単語がありません</div>
        ) : (
          <WordList
            words={words}
            progress={progress}
            showLesson
            action={
              isUnfiled || !book
                ? undefined
                : (w) => (
                    <button
                      className="btn small ghost"
                      title={`「${headword(w)}」を単語帳から外す`}
                      onClick={(e) => {
                        e.stopPropagation();
                        void setBookWords(book.id, (ids) => ids.filter((x) => x !== w.id));
                      }}
                    >
                      <Icon name="x" size={16} />
                    </button>
                  )
            }
          />
        )}
      </div>
    </div>
  );
}
