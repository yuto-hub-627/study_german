import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { exportAll, importAll } from '../lib/db';
import { reload, saveSettings, useStore } from '../lib/store';
import { generateCode, getCode, isValidCode, normalizeCode, setCode, syncNow } from '../lib/sync';
import { germanVoices, setTtsOptions, speak } from '../lib/tts';

export function Settings({ query }: { query: URLSearchParams }) {
  const settings = useStore((s) => s.settings);
  const sync = useStore((s) => s.syncStatus);
  const [code, setCodeState] = useState<string | null>(null);
  const [joinInput, setJoinInput] = useState(() => normalizeCode(query.get('code') || ''));
  const [qr, setQr] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void getCode().then((c) => setCodeState(c ?? null));
    setVoices(germanVoices());
    const t = setTimeout(() => setVoices(germanVoices()), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!code || !showCode) return setQr(null);
    const url = `${location.origin}${location.pathname}#/settings?code=${code}`;
    QRCode.toDataURL(url, { margin: 1, width: 220 }).then(setQr, () => setQr(null));
  }, [code, showCode]);

  const connect = async (c: string) => {
    await setCode(c);
    setCodeState(c);
    await syncNow();
    setMsg('同期を開始しました');
  };

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="stack">
      <div className="topbar">
        <h1>設定</h1>
      </div>

      <div className="card stack">
        <h3 style={{ margin: 0 }}>PC・スマホ間の同期</h3>
        {code ? (
          <>
            <div className="row small">
              <span className={`tag ${sync.state === 'error' ? 'warn' : 'ok'}`}>{sync.state === 'syncing' ? '同期中…' : sync.state === 'error' ? 'エラー' : '同期オン'}</span>
              {sync.at && <span className="muted">最終同期 {new Date(sync.at).toLocaleString('ja-JP')}</span>}
              {sync.message && <span className="muted">{sync.message}</span>}
            </div>
            <div className="alert info small">
              もう一方の端末でこのアプリを開き、「設定 → 同期コードを入力」に下のコードを入れるか、QRコードを読み取ってください。
              <b>このコードを知っている人は学習データを読み書きできます。他人に教えないでください。</b>
            </div>
            {showCode ? (
              <>
                <div className="code-box">{code}</div>
                {qr && <img src={qr} alt="同期用QRコード" style={{ width: 200, height: 200, alignSelf: 'center', borderRadius: 8 }} />}
                <button className="btn small" onClick={() => void navigator.clipboard?.writeText(code).then(() => flash('コピーしました'))}>
                  コードをコピー
                </button>
              </>
            ) : (
              <button className="btn" onClick={() => setShowCode(true)}>
                同期コード・QRコードを表示
              </button>
            )}
            <div className="row">
              <button className="btn primary" onClick={() => void syncNow()} disabled={sync.state === 'syncing'}>
                今すぐ同期
              </button>
              <div className="spacer" />
              <button
                className="btn danger small"
                onClick={async () => {
                  if (confirm('この端末の同期を解除しますか？（端末内のデータは残ります）')) {
                    await setCode(null);
                    setCodeState(null);
                    setShowCode(false);
                  }
                }}
              >
                同期を解除
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="small muted" style={{ margin: 0 }}>
              ログイン不要。同期コードを1つ発行し、他の端末で同じコードを入力すると、単語・学習記録・文法の成績が自動で同期されます。
            </p>
            <button className="btn primary" onClick={() => void connect(generateCode()).then(() => setShowCode(true))}>
              新しい同期コードを発行（最初の端末）
            </button>
            <div className="field">
              <label htmlFor="join">同期コードを入力（2台目以降の端末）</label>
              <div className="row" style={{ flexWrap: 'nowrap' }}>
                <input id="join" className="input" value={joinInput} onChange={(e) => setJoinInput(normalizeCode(e.target.value))} placeholder="XXXXX-XXXXX-XXXXX-XXXXX" autoCapitalize="characters" />
                <button className="btn primary" disabled={!isValidCode(joinInput)} onClick={() => void connect(joinInput)}>
                  接続
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="card stack">
        <h3 style={{ margin: 0 }}>発音</h3>
        {voices.length === 0 && <div className="alert warn small">この端末にドイツ語の音声が見つかりません。OSの設定で「ドイツ語」の読み上げ音声を追加すると発音が良くなります。</div>}
        {voices.length > 0 && (
          <div className="field">
            <label>音声</label>
            <select
              className="input"
              value={settings.voiceURI || ''}
              onChange={(e) => {
                void saveSettings({ voiceURI: e.target.value || undefined });
                setTtsOptions({ rate: settings.rate, voiceURI: e.target.value || undefined });
              }}
            >
              <option value="">自動</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="field">
          <label>速さ: {settings.rate.toFixed(2)}</label>
          <input
            type="range"
            min={0.5}
            max={1.2}
            step={0.05}
            value={settings.rate}
            onChange={(e) => {
              const rate = Number(e.target.value);
              void saveSettings({ rate });
              setTtsOptions({ rate, voiceURI: settings.voiceURI });
            }}
          />
        </div>
        <button className="btn small" onClick={() => speak('Guten Tag! Ich lerne Deutsch.')}>
          試しに再生
        </button>
      </div>

      <div className="card stack">
        <h3 style={{ margin: 0 }}>学習</h3>
        <div className="field">
          <label>1日の新規単語数: {settings.dailyNew}</label>
          <input type="range" min={5} max={50} step={5} value={settings.dailyNew} onChange={(e) => void saveSettings({ dailyNew: Number(e.target.value) })} />
        </div>
      </div>

      <div className="card stack">
        <h3 style={{ margin: 0 }}>バックアップ</h3>
        <div className="row">
          <button
            className="btn"
            onClick={async () => {
              const data = await exportAll();
              const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = `study-german-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(a.href);
            }}
          >
            エクスポート
          </button>
          <label className="btn">
            インポート
            <input
              type="file"
              accept="application/json"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const json = JSON.parse(await f.text());
                  const n = await importAll(json);
                  await reload();
                  flash(`${n} 件を読み込みました`);
                } catch {
                  flash('ファイルを読み込めませんでした');
                }
              }}
            />
          </label>
        </div>
      </div>

      <div className="card small muted stack" style={{ gap: 4 }}>
        <b style={{ color: 'var(--text)' }}>データについて</b>
        <div>辞書データ: Wiktionary（kaikki.org 経由, CC BY-SA 4.0）、頻度リスト: FrequencyWords (CC BY-SA 4.0)。</div>
        <div>教科書の単語・文法は授業用教科書の内容をもとに独自にまとめたものです。</div>
      </div>
      {msg && <div className="toast">{msg}</div>}
    </div>
  );
}
