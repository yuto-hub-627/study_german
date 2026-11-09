-- 同期コード(のハッシュ)ごとの利用者
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,          -- SHA-256(sync code)
  seq INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

-- 端末間で同期するレコード (単語・学習状況・回答履歴・文法クイズ結果・設定)
CREATE TABLE IF NOT EXISTS records (
  user_id TEXT NOT NULL,
  store TEXT NOT NULL,
  id TEXT NOT NULL,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  seq INTEGER NOT NULL,
  PRIMARY KEY (user_id, store, id)
);
CREATE INDEX IF NOT EXISTS records_user_seq ON records (user_id, seq);
