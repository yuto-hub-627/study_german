# Deutsch lernen — ドイツ語学習 PWA

基礎ドイツ語Iの教科書（Lektion 1A〜8B）に準拠した、PC・スマホ両対応の学習アプリです。

## 機能
- **単語学習**: 教科書の約740語を収録（課・品詞ごとに自動分類）。間隔反復(SRS)で出題し、推定定着率・正答率・品詞別の習得状況を表示
- **発音**: ブラウザの音声合成（de-DE）で単語・例文を読み上げ
- **単語追加**: 約2.1万語の辞書（Wiktionary由来）から予測入力。綴り違いは「もしかして」で候補提示、品詞・性・複数形・活用・日本語訳を自動入力
- **活用表**: 動詞は3基本形・現在/過去/現在完了/接続法II式（不規則な形は赤字）、名詞は格変化、形容詞は比較級と語尾変化
- **文法**: 16課ぶんの解説と練習問題（選択・穴埋め・並べ替え）。期末テストで間違えやすい点（語順・前置詞・弱変化名詞など）を重点化
- **同期**: 同期コード（またはQR）でPCとスマホのデータを同期（Cloudflare Workers + D1）。オフラインでも利用可

## 開発
```bash
npm install
npm run db:migrate:local   # ローカルD1を初期化
npm run worker:dev         # ビルドして http://localhost:8787 で起動（同期APIつき）
npm test
```
`npm run dev`（Vite, :5173）でも画面開発できます（同期APIは :8787 にプロキシ）。

## データ
- `data/textbook_words.tsv` … 教科書単語（課・品詞・性・複数形・日本語訳）。編集後 `python3 scripts/build_textbook.py public/dict/lexicon.json data/textbook_words.tsv src/data/textbook.json`
- `public/dict/lexicon.json` … 予測入力用辞書。再生成手順は [docs/DATA.md](docs/DATA.md)
- `src/data/grammar/` … 文法解説と問題

デプロイ手順は [docs/DEPLOY.md](docs/DEPLOY.md) を参照。
