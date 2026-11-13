import { useMemo, useState } from 'react';
import { Icon } from '../components/Icon';
import { fold } from '../lib/lexicon';
import { headword } from '../lib/german';
import { go } from '../lib/router';
import { DEFAULT_FOLDER, deleteBook, folderOf, saveBook, setBookWords, useStore } from '../lib/store';
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
  const folders = books.filter((b) => b.kind === 'folder').sort((a, b) => (a.id === DEFAULT_FOLDER ? -1 : b.id === DEFAULT_FOLDER ? 1 : 0));
  const wordbooks = books.filter((b) => b.kind === 'book');
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const newFolder = async () => {
    const name = prompt('フォルダー名', '新しいフォルダー');
    if (name?.trim()) await saveBook({ kind: 'folder', name: name.trim() });
  };
  const newBook = async (folderId: string) => {
    const name = prompt('単語帳の名前', '新しい単語帳');
    if (!name?.trim()) return;
    const b = await saveBook({ kind: 'book', name: name.trim(), folderId });
    go(`/my/${encodeURIComponent(b.id)}`);
  };

  return (
    <div className="stack">
      <div className="topbar">
        <h1>MY単語帳</h1>
        <div className="row">
          <button className="btn primary small" onClick={newFolder}>
            <Icon name="plus" size={16} /> フォルダー
          </button>
        </div>
      </div>

      {wordbooks.length === 0 && (
        <div className="alert info small">単語帳はフォルダーの中に作ります。フォルダーの「＋」ボタンで単語帳を作成しましょう。</div>
      )}

      {folders.map((f) => {
        const inside = wordbooks.filter((b) => folderOf(b, books) === f.id);
        const isOpen = open[f.id] ?? true;
        return (
          <div key={f.id} className="card" style={{ padding: '10px 16px' }}>
            <div className="row" style={{ flexWrap: 'nowrap' }}>
              <button className="btn ghost" style={{ padding: '4px 0', justifyContent: 'flex-start', flex: 1 }} onClick={() => setOpen({ ...open, [f.id]: !isOpen })} aria-expanded={isOpen}>
                <span style={{ fontSize: 22 }}>{isOpen ? '📂' : '📁'}</span>
                <h3 style={{ margin: 0 }}>{f.name}</h3>
                <span className="tag">{inside.length}</span>
              </button>
              <button className="btn small primary" onClick={() => newBook(f.id)} title="このフォルダーに単語帳を作成">
                <Icon name="plus" size={16} /> 単語帳
              </button>
              <FolderMenu f={f} />
            </div>
            {isOpen && (
              <div className="stack" style={{ gap: 8, marginTop: 8, paddingLeft: 8 }}>
                {inside.length === 0 && <div className="tiny muted">単語帳がありません</div>}
                {inside.map((b) => (
                  <BookRow key={b.id} b={b} />
                ))}
              </div>
            )}
          </div>
        );
      })}

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

function FolderMenu({ f }: { f: Book }) {
  return (
    <>
      <button
        className="btn small ghost"
        title="名前を変更"
        onClick={async () => {
          const name = prompt('フォルダー名', f.name);
          if (name?.trim()) await saveBook({ ...f, name: name.trim() });
        }}
      >
        <Icon name="edit" size={16} />
      </button>
      {f.id !== DEFAULT_FOLDER && <button
        className="btn small ghost danger"
        title="フォルダーを削除"
        onClick={async () => {
          if (confirm(`フォルダー「${f.name}」を削除しますか？\n中の単語帳は「MY単語」フォルダーに移動します。`)) await deleteBook(f);
        }}
      >
        <Icon name="trash" size={16} />
      </button>}
    </>
  );
}

function BookRow({ b }: { b: Book }) {
  return (
    <div className="card lesson-card" style={{ marginTop: 0 }} onClick={() => go(`/my/${encodeURIComponent(b.id)}`)}>
      <span style={{ fontSize: 22 }}>📘</span>
      <div style={{ flex: 1, minWidth: 0, fontWeight: 700 }}>{b.name}</div>
      <span className="tag">{b.wordIds?.length ?? 0}語</span>
      <Icon name="chevron" size={18} />
    </div>
  );
}

export function BookDetail({ id }: { id: string }) {
  const book = useStore((s) => s.books.find((b) => b.id === id));
  const books = useStore((s) => s.books);
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
  const folders = books.filter((b) => b.kind === 'folder');

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
        {!isUnfiled && book && folders.length > 1 && (
          <select className="input" style={{ width: 'auto', minHeight: 40 }} value={folderOf(book, books)} onChange={(e) => void saveBook({ ...book, folderId: e.target.value })} aria-label="フォルダー">
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                📁 {f.name}
              </option>
            ))}
          </select>
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
