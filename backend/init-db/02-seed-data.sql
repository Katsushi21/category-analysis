-- カテゴリマスターの初期データ
INSERT INTO categories (main_category, sub_category, detail_category) VALUES
-- IT・テクノロジー
('IT・テクノロジー', 'ソフトウェア開発', 'プログラミング言語'),
('IT・テクノロジー', 'ソフトウェア開発', 'フレームワーク'),
('IT・テクノロジー', 'ソフトウェア開発', '開発ツール'),
('IT・テクノロジー', 'クラウドサービス', 'IaaS'),
('IT・テクノロジー', 'クラウドサービス', 'PaaS'),
('IT・テクノロジー', 'クラウドサービス', 'SaaS'),
('IT・テクノロジー', 'AI・機械学習', '自然言語処理'),
('IT・テクノロジー', 'AI・機械学習', 'コンピュータビジョン'),
('IT・テクノロジー', 'AI・機械学習', '機械学習フレームワーク'),
-- ビジネス
('ビジネス', 'マーケティング', 'デジタルマーケティング'),
('ビジネス', 'マーケティング', 'コンテンツマーケティング'),
('ビジネス', 'マーケティング', 'SEO'),
('ビジネス', '金融・投資', '株式投資'),
('ビジネス', '金融・投資', '不動産投資'),
('ビジネス', '金融・投資', '暗号資産'),
('ビジネス', '起業・経営', '事業計画'),
('ビジネス', '起業・経営', '資金調達'),
('ビジネス', '起業・経営', 'スタートアップ'),
-- EC・通販
('EC・通販', 'ファッション', 'メンズ'),
('EC・通販', 'ファッション', 'レディース'),
('EC・通販', '家電', 'スマートフォン'),
('EC・通販', '家電', 'パソコン'),
('EC・通販', '家電', '生活家電'),
('EC・通販', '食品・飲料', '健康食品'),
('EC・通販', '食品・飲料', '酒類'),
-- エンタメ
('エンタメ', '動画・映像', '映画'),
('エンタメ', '動画・映像', 'アニメ'),
('エンタメ', '音楽', 'ポップス'),
('エンタメ', '音楽', 'ロック'),
('エンタメ', 'ゲーム', 'PCゲーム'),
('エンタメ', 'ゲーム', 'コンソールゲーム'),
('エンタメ', 'ゲーム', 'モバイルゲーム');

-- 一括解析履歴のサンプルデータ
INSERT INTO batch_analysis_history (batch_id, timestamp, total_urls, success_count, failed_count) VALUES
('batch_123456789abcdef', NOW() - interval '2 days', 4, 3, 1),
('batch_9876543210abcd', NOW() - interval '5 days', 5, 5, 0),
('batch_aabbccddeeff00', NOW() - interval '10 days', 10, 8, 2);

-- 解析履歴のサンプルデータ (基本的な5件)
INSERT INTO analysis_history (id, url, status, main_category, confidence, analysis, is_batch, batch_id) VALUES
-- 既存の5件
('hist_123456789a', 'https://www.example.com/tech-blog', 'success', 'IT・テクノロジー', 0.92,
 '{"main_category": "IT・テクノロジー", "sub_categories": [{"name": "ソフトウェア開発", "confidence": 0.85}, {"name": "クラウドサービス", "confidence": 0.72}], "confidence": 0.92, "description": "テクノロジーに関する最新情報を提供するブログサイト", "target_audience": "エンジニア、IT業界の専門家", "value_proposition": "複雑な技術情報をわかりやすく解説"}'::jsonb,
 TRUE, 'batch_123456789abcdef'),

('hist_123456789b', 'https://www.example.com/business-news', 'success', 'ビジネス', 0.88,
 '{"main_category": "ビジネス", "sub_categories": [{"name": "マーケティング", "confidence": 0.78}, {"name": "起業・経営", "confidence": 0.65}], "confidence": 0.88, "description": "ビジネスニュースと分析記事を提供するサイト", "target_audience": "経営者、ビジネスパーソン", "value_proposition": "意思決定に役立つ経済・市場情報を提供"}'::jsonb,
 TRUE, 'batch_123456789abcdef'),

('hist_123456789c', 'https://www.example.com/online-shop', 'success', 'EC・通販', 0.95,
 '{"main_category": "EC・通販", "sub_categories": [{"name": "家電", "confidence": 0.92}, {"name": "ファッション", "confidence": 0.65}], "confidence": 0.95, "description": "家電製品とファッションアイテムを販売するオンラインショップ", "target_audience": "一般消費者、ガジェット愛好家", "value_proposition": "高品質な製品を市場より安価に提供"}'::jsonb,
 TRUE, 'batch_123456789abcdef'),

('hist_123456789d', 'https://www.example.com/game-review', 'success', 'エンタメ', 0.91,
 '{"main_category": "エンタメ", "sub_categories": [{"name": "ゲーム", "confidence": 0.95}, {"name": "動画・映像", "confidence": 0.45}], "confidence": 0.91, "description": "ゲームのレビューと攻略情報を提供するサイト", "target_audience": "ゲーム愛好家、カジュアルゲーマー", "value_proposition": "詳細なゲーム分析と初心者向けの攻略ガイド"}'::jsonb,
 FALSE, NULL),

('hist_123456789e', 'https://www.example.com/invalid-url', 'failed', NULL, NULL, NULL, TRUE, 'batch_123456789abcdef');

-- IT・テクノロジー関連の追加データ
INSERT INTO analysis_history (id, url, status, main_category, confidence, analysis, is_batch, batch_id) VALUES
('hist_abcdef001', 'https://www.example.com/cloud-computing', 'success', 'IT・テクノロジー', 0.94,
 '{"main_category": "IT・テクノロジー", "sub_categories": [{"name": "クラウドサービス", "confidence": 0.92}, {"name": "ソフトウェア開発", "confidence": 0.65}], "confidence": 0.94, "description": "クラウドコンピューティングに関する情報サイト", "target_audience": "IT技術者、企業のIT部門", "value_proposition": "クラウド導入のベストプラクティスを提供"}'::jsonb,
 FALSE, NULL),

('hist_abcdef002', 'https://www.example.com/programming-tutorial', 'success', 'IT・テクノロジー', 0.89,
 '{"main_category": "IT・テクノロジー", "sub_categories": [{"name": "ソフトウェア開発", "confidence": 0.95}, {"name": "AI・機械学習", "confidence": 0.42}], "confidence": 0.89, "description": "プログラミング初心者向けチュートリアルサイト", "target_audience": "プログラミング初学者、転職希望者", "value_proposition": "実践的な例を通じてプログラミングを学べる"}'::jsonb,
 FALSE, NULL),

('hist_abcdef003', 'https://www.example.com/ai-news', 'success', 'IT・テクノロジー', 0.96,
 '{"main_category": "IT・テクノロジー", "sub_categories": [{"name": "AI・機械学習", "confidence": 0.97}, {"name": "ソフトウェア開発", "confidence": 0.53}], "confidence": 0.96, "description": "AI技術の最新動向を紹介するニュースサイト", "target_audience": "AI研究者、エンジニア、ビジネス関係者", "value_proposition": "AIの実用例と技術トレンドを分かりやすく解説"}'::jsonb,
 FALSE, NULL),

('hist_abcdef004', 'https://www.example.com/cybersecurity', 'success', 'IT・テクノロジー', 0.93,
 '{"main_category": "IT・テクノロジー", "sub_categories": [{"name": "クラウドサービス", "confidence": 0.68}, {"name": "ソフトウェア開発", "confidence": 0.62}], "confidence": 0.93, "description": "サイバーセキュリティ情報ポータル", "target_audience": "セキュリティ専門家、IT管理者", "value_proposition": "最新の脅威情報と対策方法の提供"}'::jsonb,
 FALSE, NULL),

('hist_abcdef005', 'https://www.example.com/data-science', 'success', 'IT・テクノロジー', 0.91,
 '{"main_category": "IT・テクノロジー", "sub_categories": [{"name": "AI・機械学習", "confidence": 0.88}, {"name": "ソフトウェア開発", "confidence": 0.75}], "confidence": 0.91, "description": "データサイエンスの学習リソースを提供するサイト", "target_audience": "データサイエンティスト、分析者", "value_proposition": "実践的なデータ分析スキルの習得"}'::jsonb,
 TRUE, 'batch_9876543210abcd');

-- ビジネス関連の追加データ
INSERT INTO analysis_history (id, url, status, main_category, confidence, analysis, is_batch, batch_id) VALUES
('hist_abcdef006', 'https://www.example.com/startup-guide', 'success', 'ビジネス', 0.91,
 '{"main_category": "ビジネス", "sub_categories": [{"name": "起業・経営", "confidence": 0.93}, {"name": "マーケティング", "confidence": 0.61}], "confidence": 0.91, "description": "スタートアップ立ち上げガイド", "target_audience": "起業家、スタートアップ経営者", "value_proposition": "少ない資金からビジネスを成長させるノウハウ"}'::jsonb,
 FALSE, NULL),

('hist_abcdef007', 'https://www.example.com/digital-marketing', 'success', 'ビジネス', 0.94,
 '{"main_category": "ビジネス", "sub_categories": [{"name": "マーケティング", "confidence": 0.96}, {"name": "起業・経営", "confidence": 0.55}], "confidence": 0.94, "description": "デジタルマーケティングの情報ポータル", "target_audience": "マーケター、ビジネスオーナー", "value_proposition": "最新のマーケティング戦略とツールの紹介"}'::jsonb,
 FALSE, NULL),

('hist_abcdef008', 'https://www.example.com/investment-tips', 'success', 'ビジネス', 0.88,
 '{"main_category": "ビジネス", "sub_categories": [{"name": "金融・投資", "confidence": 0.91}, {"name": "起業・経営", "confidence": 0.42}], "confidence": 0.88, "description": "投資アドバイスと金融情報のブログ", "target_audience": "個人投資家、資産運用者", "value_proposition": "リスクを抑えた投資戦略の提案"}'::jsonb,
 FALSE, NULL),

('hist_abcdef009', 'https://www.example.com/business-strategy', 'success', 'ビジネス', 0.92,
 '{"main_category": "ビジネス", "sub_categories": [{"name": "起業・経営", "confidence": 0.89}, {"name": "マーケティング", "confidence": 0.72}], "confidence": 0.92, "description": "ビジネス戦略コンサルティング会社のサイト", "target_audience": "経営者、マネージャー", "value_proposition": "実証済みのビジネス成長戦略の提供"}'::jsonb,
 TRUE, 'batch_9876543210abcd'),

('hist_abcdef010', 'https://www.example.com/crypto-news', 'success', 'ビジネス', 0.85,
 '{"main_category": "ビジネス", "sub_categories": [{"name": "金融・投資", "confidence": 0.87}, {"name": "マーケティング", "confidence": 0.34}], "confidence": 0.85, "description": "暗号資産ニュースと分析", "target_audience": "暗号資産投資家、ブロックチェーン愛好家", "value_proposition": "暗号資産市場の最新動向と分析"}'::jsonb,
 TRUE, 'batch_9876543210abcd');

-- EC・通販関連の追加データ
INSERT INTO analysis_history (id, url, status, main_category, confidence, analysis, is_batch, batch_id) VALUES
('hist_abcdef011', 'https://www.example.com/fashion-store', 'success', 'EC・通販', 0.97,
 '{"main_category": "EC・通販", "sub_categories": [{"name": "ファッション", "confidence": 0.98}, {"name": "日用品", "confidence": 0.45}], "confidence": 0.97, "description": "トレンドファッションのオンラインストア", "target_audience": "若年層、ファッション愛好家", "value_proposition": "手頃な価格でトレンドアイテムを提供"}'::jsonb,
 FALSE, NULL),

('hist_abcdef012', 'https://www.example.com/electronics-shop', 'success', 'EC・通販', 0.96,
 '{"main_category": "EC・通販", "sub_categories": [{"name": "家電", "confidence": 0.97}, {"name": "ファッション", "confidence": 0.21}], "confidence": 0.96, "description": "家電製品専門のECサイト", "target_audience": "ガジェット好き、一般消費者", "value_proposition": "最新テクノロジー製品の豊富な品揃え"}'::jsonb,
 FALSE, NULL),

('hist_abcdef013', 'https://www.example.com/organic-food', 'success', 'EC・通販', 0.93,
 '{"main_category": "EC・通販", "sub_categories": [{"name": "食品・飲料", "confidence": 0.95}, {"name": "ファッション", "confidence": 0.12}], "confidence": 0.93, "description": "オーガニック食品の通販サイト", "target_audience": "健康志向の消費者、料理好き", "value_proposition": "厳選された高品質なオーガニック食材"}'::jsonb,
 FALSE, NULL),

('hist_abcdef014', 'https://www.example.com/beauty-products', 'success', 'EC・通販', 0.90,
 '{"main_category": "EC・通販", "sub_categories": [{"name": "日用品", "confidence": 0.91}, {"name": "ファッション", "confidence": 0.68}], "confidence": 0.90, "description": "美容製品とスキンケアのオンラインショップ", "target_audience": "美容に関心のある男女", "value_proposition": "天然成分を使用したスキンケア製品"}'::jsonb,
 TRUE, 'batch_9876543210abcd'),

('hist_abcdef015', 'https://www.example.com/home-decor', 'success', 'EC・通販', 0.89,
 '{"main_category": "EC・通販", "sub_categories": [{"name": "日用品", "confidence": 0.86}, {"name": "家電", "confidence": 0.52}], "confidence": 0.89, "description": "インテリアとホームデコレーション製品の通販", "target_audience": "インテリア愛好家、新居の準備をしている人", "value_proposition": "独創的でスタイリッシュな住空間の提案"}'::jsonb,
 TRUE, 'batch_9876543210abcd');

-- エンタメ関連の追加データ
INSERT INTO analysis_history (id, url, status, main_category, confidence, analysis, is_batch, batch_id) VALUES
('hist_abcdef016', 'https://www.example.com/movie-reviews', 'success', 'エンタメ', 0.95,
 '{"main_category": "エンタメ", "sub_categories": [{"name": "動画・映像", "confidence": 0.96}, {"name": "音楽", "confidence": 0.34}], "confidence": 0.95, "description": "映画レビューと批評のサイト", "target_audience": "映画ファン、エンターテイメント愛好家", "value_proposition": "公平で詳細な映画批評の提供"}'::jsonb,
 FALSE, NULL),

('hist_abcdef017', 'https://www.example.com/music-streaming', 'success', 'エンタメ', 0.94,
 '{"main_category": "エンタメ", "sub_categories": [{"name": "音楽", "confidence": 0.97}, {"name": "動画・映像", "confidence": 0.42}], "confidence": 0.94, "description": "音楽ストリーミングサービス", "target_audience": "音楽ファン、アーティスト", "value_proposition": "豊富な楽曲ライブラリとパーソナライズされたプレイリスト"}'::jsonb,
 FALSE, NULL),

('hist_abcdef018', 'https://www.example.com/anime-portal', 'success', 'エンタメ', 0.92,
 '{"main_category": "エンタメ", "sub_categories": [{"name": "動画・映像", "confidence": 0.94}, {"name": "ゲーム", "confidence": 0.38}], "confidence": 0.92, "description": "アニメ情報とレビューのポータルサイト", "target_audience": "アニメファン、オタク文化愛好者", "value_proposition": "最新のアニメ情報と深い作品分析"}'::jsonb,
 FALSE, NULL),

('hist_abcdef019', 'https://www.example.com/mobile-games', 'success', 'エンタメ', 0.91,
 '{"main_category": "エンタメ", "sub_categories": [{"name": "ゲーム", "confidence": 0.93}, {"name": "動画・映像", "confidence": 0.25}], "confidence": 0.91, "description": "モバイルゲーム開発会社のサイト", "target_audience": "カジュアルゲーマー、モバイルユーザー", "value_proposition": "革新的でアディクティブなモバイルゲーム体験"}'::jsonb,
 FALSE, NULL),

('hist_abcdef020', 'https://www.example.com/entertainment-news', 'success', 'エンタメ', 0.88,
 '{"main_category": "エンタメ", "sub_categories": [{"name": "動画・映像", "confidence": 0.87}, {"name": "音楽", "confidence": 0.78}], "confidence": 0.88, "description": "エンターテイメント業界のニュースサイト", "target_audience": "エンタメファン、業界関係者", "value_proposition": "エンタメ業界のトレンドと最新情報"}'::jsonb,
 FALSE, NULL);

-- 様々なカテゴリの失敗例
INSERT INTO analysis_history (id, url, status, main_category, confidence, analysis, is_batch, batch_id) VALUES
('hist_abcdef021', 'https://www.example.com/broken-link-1', 'failed', NULL, NULL, NULL, FALSE, NULL),
('hist_abcdef022', 'https://www.example.com/timeout-error', 'failed', NULL, NULL, NULL, FALSE, NULL),
('hist_abcdef023', 'https://www.example.com/invalid-content', 'failed', NULL, NULL, NULL, TRUE, 'batch_aabbccddeeff00'),
('hist_abcdef024', 'https://www.example.com/server-error', 'failed', NULL, NULL, NULL, TRUE, 'batch_aabbccddeeff00'),
('hist_abcdef025', 'https://www.example.com/parse-error', 'failed', NULL, NULL, '{"error": "コンテンツの解析中にエラーが発生しました"}'::jsonb, FALSE, NULL);

-- 追加の一括解析データ
INSERT INTO analysis_history (id, url, status, main_category, confidence, analysis, is_batch, batch_id) VALUES
('hist_batchabc1', 'https://www.example.com/batch-site1', 'success', 'ビジネス', 0.86,
 '{"main_category": "ビジネス", "sub_categories": [{"name": "マーケティング", "confidence": 0.84}], "confidence": 0.86}'::jsonb,
 TRUE, 'batch_aabbccddeeff00'),

('hist_batchabc2', 'https://www.example.com/batch-site2', 'success', 'IT・テクノロジー', 0.82,
 '{"main_category": "IT・テクノロジー", "sub_categories": [{"name": "ソフトウェア開発", "confidence": 0.81}], "confidence": 0.82}'::jsonb,
 TRUE, 'batch_aabbccddeeff00'),

('hist_batchabc3', 'https://www.example.com/batch-site3', 'success', 'エンタメ', 0.78,
 '{"main_category": "エンタメ", "sub_categories": [{"name": "ゲーム", "confidence": 0.77}], "confidence": 0.78}'::jsonb,
 TRUE, 'batch_aabbccddeeff00'),

('hist_batchabc4', 'https://www.example.com/batch-site4', 'success', 'EC・通販', 0.91,
 '{"main_category": "EC・通販", "sub_categories": [{"name": "ファッション", "confidence": 0.90}], "confidence": 0.91}'::jsonb,
 TRUE, 'batch_aabbccddeeff00'),

('hist_batchabc5', 'https://www.example.com/batch-site5', 'success', 'ビジネス', 0.84,
 '{"main_category": "ビジネス", "sub_categories": [{"name": "起業・経営", "confidence": 0.83}], "confidence": 0.84}'::jsonb,
 TRUE, 'batch_aabbccddeeff00');

-- 一括解析と個別解析の関連付け
INSERT INTO batch_analysis_items (batch_id, analysis_id) VALUES
-- 既存の一括解析関連付け
('batch_123456789abcdef', 'hist_123456789a'),
('batch_123456789abcdef', 'hist_123456789b'),
('batch_123456789abcdef', 'hist_123456789c'),
('batch_123456789abcdef', 'hist_123456789e'),

-- 2つ目の一括解析関連付け
('batch_9876543210abcd', 'hist_abcdef005'),
('batch_9876543210abcd', 'hist_abcdef009'),
('batch_9876543210abcd', 'hist_abcdef010'),
('batch_9876543210abcd', 'hist_abcdef014'),
('batch_9876543210abcd', 'hist_abcdef015'),

-- 3つ目の一括解析関連付け
('batch_aabbccddeeff00', 'hist_batchabc1'),
('batch_aabbccddeeff00', 'hist_batchabc2'),
('batch_aabbccddeeff00', 'hist_batchabc3'),
('batch_aabbccddeeff00', 'hist_batchabc4'),
('batch_aabbccddeeff00', 'hist_batchabc5'),
('batch_aabbccddeeff00', 'hist_abcdef023'),
('batch_aabbccddeeff00', 'hist_abcdef024');