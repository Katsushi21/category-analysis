-- 解析履歴用のテーブルを作成
CREATE TABLE
  IF NOT EXISTS analysis_history (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    timestamp TIMESTAMP
    WITH
      TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
      main_category TEXT,
      confidence FLOAT,
      error TEXT,
      analysis JSONB,
      is_batch BOOLEAN DEFAULT FALSE,
      batch_id TEXT
  );

-- インデックスを作成
CREATE INDEX IF NOT EXISTS analysis_history_url_idx ON analysis_history (url);

CREATE INDEX IF NOT EXISTS analysis_history_timestamp_idx ON analysis_history (timestamp);

CREATE INDEX IF NOT EXISTS analysis_history_status_idx ON analysis_history (status);

CREATE INDEX IF NOT EXISTS analysis_history_main_category_idx ON analysis_history (main_category);

CREATE INDEX IF NOT EXISTS analysis_history_batch_id_idx ON analysis_history (batch_id);

CREATE INDEX IF NOT EXISTS analysis_history_is_batch_idx ON analysis_history (is_batch);

-- 一括解析履歴用のテーブルを作成
CREATE TABLE
  IF NOT EXISTS batch_analysis_history (
    batch_id TEXT PRIMARY KEY,
    timestamp TIMESTAMP
    WITH
      TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      total_urls INTEGER NOT NULL,
      success_count INTEGER NOT NULL,
      failed_count INTEGER NOT NULL
  );

-- 一括解析とURLの関連付けテーブル
CREATE TABLE
  IF NOT EXISTS batch_analysis_items (
    batch_id TEXT REFERENCES batch_analysis_history (batch_id) ON DELETE CASCADE,
    analysis_id TEXT REFERENCES analysis_history (id) ON DELETE CASCADE,
    PRIMARY KEY (batch_id, analysis_id)
  );

-- カテゴリマスターテーブル
CREATE TABLE
  IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    main_category TEXT NOT NULL,
    sub_category TEXT NOT NULL,
    detail_category TEXT,
    UNIQUE (main_category, sub_category, detail_category)
  );

-- コメント
COMMENT ON TABLE analysis_history IS '単一URL解析の履歴';

COMMENT ON TABLE batch_analysis_history IS '一括解析の履歴';

COMMENT ON TABLE batch_analysis_items IS '一括解析と個別解析の関連付け';

COMMENT ON TABLE categories IS 'カテゴリマスター';