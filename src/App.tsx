import { useEffect } from 'react';
import { Icon } from './components/Icon';
import { EditWord } from './pages/EditWord';
import { GrammarLesson, GrammarList } from './pages/Grammar';
import { Home } from './pages/Home';
import { BookDetail, MyBooks } from './pages/MyBooks';
import { Settings } from './pages/Settings';
import { Study } from './pages/Study';
import { WordDetail } from './pages/WordDetail';
import { Words } from './pages/Words';
import { match, useRoute } from './lib/router';
import { useStore } from './lib/store';
import { setTtsOptions } from './lib/tts';

const NAV = [
  { path: '/', label: 'ホーム', icon: 'home' },
  { path: '/words', label: '教科書', icon: 'words' },
  { path: '/my', label: 'MY単語帳', icon: 'folder' },
  { path: '/study', label: '学習', icon: 'study' },
  { path: '/grammar', label: '文法', icon: 'grammar' },
  { path: '/settings', label: '設定', icon: 'settings' },
];

export function App() {
  const { path, query } = useRoute();
  const ready = useStore((s) => s.ready);
  const settings = useStore((s) => s.settings);
  useEffect(() => setTtsOptions({ rate: settings.rate, voiceURI: settings.voiceURI }), [settings.rate, settings.voiceURI]);

  let page: React.ReactNode;
  let m: Record<string, string> | null;
  if (path === '/') page = <Home />;
  else if (path === '/words') page = <Words query={query} />;
  else if ((m = match('/word/:id', path))) page = <WordDetail id={m.id} />;
  else if (path === '/add') page = <EditWord bookId={query.get('book') || undefined} />;
  else if (path === '/my') page = <MyBooks />;
  else if ((m = match('/my/:id', path))) page = <BookDetail id={m.id} />;
  else if ((m = match('/edit/:id', path))) page = <EditWord id={m.id} />;
  else if (path === '/study') page = <Study query={query} />;
  else if (path === '/grammar') page = <GrammarList />;
  else if ((m = match('/grammar/:id', path))) page = <GrammarLesson key={m.id} id={m.id} />;
  else if (path === '/settings') page = <Settings query={query} />;
  else page = <div className="empty">ページが見つかりません</div>;

  const active = (p: string) => (p === '/' ? path === '/' : path.startsWith(p) || (p === '/my' && (path === '/add' || path.startsWith('/edit'))));

  return (
    <div className="app">
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="sketchy">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" />
        </filter>
      </svg>
      <nav className="sidebar" aria-label="メインメニュー">
        <div className="brand">
          <img src="/icons/icon.svg" alt="" width={40} height={40} style={{ flexShrink: 0 }} />
          <span className="lbl de" style={{ fontSize: 24 }}>Deutsch lernen</span>
        </div>
        <div className="flagbar" style={{ margin: '-10px 12px 18px' }}>
          <i />
          <i />
          <i />
        </div>
        {NAV.map((n) => (
          <a key={n.path} href={`#${n.path}`} className={active(n.path) ? 'active' : ''} title={n.label} onClick={(e) => e.currentTarget.blur()}>
            <Icon name={n.icon} />
            <span className="lbl">{n.label}</span>
          </a>
        ))}
        <div className="foot lbl">基礎ドイツ語 学習アプリ</div>
      </nav>
      <main className="main">{ready ? page : <div className="empty">読み込み中…</div>}</main>
      <nav className="tabbar" aria-label="メインメニュー">
        {NAV.map((n) => (
          <a key={n.path} href={`#${n.path}`} className={active(n.path) ? 'active' : ''}>
            <Icon name={n.icon} />
            {n.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
