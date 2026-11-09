# Cloudflare へのデプロイ（german.yutoproduct.com）

前提: yutoproduct.com が Cloudflare のゾーンとして登録済みであること。

## 1. D1 データベースを作成（初回のみ）
```bash
npx wrangler login
npx wrangler d1 create study-german
```
表示された `database_id` を `wrangler.jsonc` の `REPLACE_WITH_YOUR_D1_DATABASE_ID` に貼り付けてコミットします。

```bash
npm run db:migrate       # 本番D1にテーブル作成
```

## 2. デプロイ
### 手動
```bash
npm run deploy
```
`wrangler.jsonc` の `routes`（custom_domain）により `german.yutoproduct.com` が自動で設定されます。

### GitHub連携で自動デプロイ（推奨）
Cloudflare ダッシュボード → Workers & Pages → Create → **Import a repository** で `study_german` を選択。
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

以降は main に push するたびに自動デプロイされます。マイグレーションを追加したときだけ `npm run db:migrate` を実行してください。

## 3. 使い始める
1. PCで https://german.yutoproduct.com を開き「設定 → 新しい同期コードを発行」
2. スマホで同じURLを開き、QRコードを読み取る（またはコードを入力）
3. スマホはブラウザの「ホーム画面に追加」でアプリとして使えます
