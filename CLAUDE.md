# プロジェクトメモ（Claude向け）

- ドイツ語学習PWA。本番: https://german.yutoproduct.com（Cloudflare Workers + D1、ブランチ `claude/loving-hypatia-crdoo3` へのpushで自動デプロイ）
- ユーザーが「授業で言われた重要なこと」を伝えてきたら、`重要なこと/notes.md` に `重要なこと/README.md` のフォーマットで追記してコミット・pushする
- 「重要なこと」セクション（PCのみ・`#/important`）は `重要なこと/notes.md` をビルド時に読み込んで表示する。追記して push すればアプリに反映される
- 機能案は `docs/ROADMAP.md` に記録する。ユーザーが新しい機能案を出したら追記、実装したら状態を更新する
