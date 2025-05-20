# WebInsight Analytics

AI を活用したウェブサイトカテゴリ分析ツール

## プロジェクト概要

WebInsight Analytics は、URL を入力するだけでウェブサイトのカテゴリを自動分析するツールです。単一 URL 解析と一括解析に対応しており、解析結果はデータベースに保存されます。Gemini API を活用して、ウェブサイトのコンテンツを解析し、適切なカテゴリを判定します。

## システム要件

- Docker
- Docker Compose

## 技術スタック

- **フロントエンド**:

  - Next.js
  - React
  - TypeScript
  - Tailwind CSS

- **バックエンド**:
  - FastAPI (Python)
  - PostgreSQL
  - Gemini API (AI 分析エンジン)

## セットアップ方法

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/category-analysis.git
cd category-analysis
```

### 2. 環境変数の設定

バックエンド用とフロントエンド用の環境変数ファイルを作成します。

```bash
# バックエンド
cp backend/.env.example backend/.env
# フロントエンド
cp frontend/.env.example frontend/.env
```

`.env`ファイルを編集して、必要な設定を行います。

#### バックエンド環境変数（backend/.env）

```
# データベース設定
DATABASE_URL=postgresql://postgres:postgres@db:5432/categorydb

# API設定
API_HOST=0.0.0.0
API_PORT=8001

# アプリケーション設定
DEBUG=False
ENVIRONMENT=local

# Gemini API設定
GEMINI_API_KEY=your-gemini-api-key-here

# ロギングレベル
LOG_LEVEL=INFO

# CORS設定
ALLOWED_ORIGINS=http://localhost:3001
```

#### フロントエンド環境変数（frontend/.env）

```
# API設定
API_BASE_URL=http://localhost:8001/api

# アプリケーション設定
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_MODE=real
```

### 3. Docker コンテナの起動

Docker Compose を使用して、すべてのサービスを起動します。

```bash
docker-compose up -d
```

初回起動時には、イメージのビルドが行われるため、時間がかかる場合があります。

### 4. テストデータ

ローカル環境（`ENVIRONMENT=local`）では、自動的に以下のテストデータが登録されます：

- カテゴリマスター: IT・テクノロジー、ビジネス、EC・通販、エンタメの 4 つのメインカテゴリとそれぞれのサブカテゴリ
- 解析履歴: 5 件のサンプル解析結果（成功 4 件、失敗 1 件）
- 一括解析履歴: 1 件のサンプル一括解析履歴

テストデータは以下の条件を満たす場合のみ登録されます：

- 環境変数`ENVIRONMENT`が`local`に設定されている
- データベースの`categories`テーブルが空である

本番環境や開発環境（`ENVIRONMENT=production`または`development`）では、テストデータは登録されません。

### 5. アクセス方法

- フロントエンド: http://localhost:3001
- バックエンド API: http://localhost:8001/api
- PostgreSQL データベース: localhost:5432 (ユーザー名: postgres, パスワード: postgres)

## 主な機能

- **単一 URL 解析**：

  - URL を入力するだけでウェブサイトのカテゴリを分析
  - メインカテゴリとサブカテゴリを階層的に表示
  - 解析結果はデータベースに保存

- **一括解析**：

  - 複数の URL を一度に分析
  - CSV ファイルからの一括インポート
  - 解析結果を CSV としてエクスポート

- **解析履歴**：

  - 過去の解析結果の閲覧と検索
  - URL、ステータス、カテゴリによるフィルタリング
  - 解析結果の詳細表示

- **データ活用**：
  - 解析結果の統計
  - クライアントごとの解析傾向の把握

## アーキテクチャの特徴

当プロジェクトでは、バックエンドとフロントエンドを単一のコンテナで実行する統合アーキテクチャを採用しています。

- **単一コンテナ構成**：

  - バックエンド(FastAPI)とフロントエンド(Next.js)を 1 つのコンテナで動作
  - Supervisord による複数プロセスの管理
  - 同一コンテナ内での効率的な通信

- **構成ファイル**：
  - Dockerfile: 統合環境のビルド設定
  - supervisord.conf: プロセス管理設定
  - start.sh: コンテナ起動スクリプト

## 環境変数の詳細

### バックエンド環境変数

| 変数名              | 説明                                     | デフォルト値                                        |
| ------------------- | ---------------------------------------- | --------------------------------------------------- |
| `DATABASE_URL`      | PostgreSQL データベースの接続 URL        | `postgresql://postgres:postgres@db:5432/categorydb` |
| `API_HOST`          | API サーバーのホスト                     | `0.0.0.0`                                           |
| `API_PORT`          | API サーバーのポート                     | `8001`                                              |
| `DEBUG`             | デバッグモードの有効/無効                | `False`                                             |
| `ENVIRONMENT`       | 実行環境（local/development/production） | `local`                                             |
| `GEMINI_API_KEY`    | Google Gemini API キー                   | -                                                   |
| `GEMINI_MODEL_NAME` | Google Gemini モデル名                   | `gemini-2.0-flash`                                  |
| `LOG_LEVEL`         | ロギングレベル                           | `INFO`                                              |
| `ALLOWED_ORIGINS`   | CORS 許可オリジン                        | `http://localhost:3001`                             |

### フロントエンド環境変数

| 変数名                  | 説明                          | デフォルト値                |
| ----------------------- | ----------------------------- | --------------------------- |
| `API_BASE_URL`          | バックエンド API のベース URL | `http://localhost:8001/api` |
| `NEXT_PUBLIC_APP_ENV`   | アプリケーション環境          | `development`               |
| `NEXT_PUBLIC_API_MODE`  | API 接続モード（real/mock）   | `real`                      |
| `NEXT_PUBLIC_BASE_PATH` | アプリケーションのベースパス  | 空文字列（開発環境）        |
| `NODE_ENV`              | Node.js 環境                  | `development`               |

## 開発用コマンド

### コンテナのログを表示

```bash
docker-compose logs -f
```

### 特定のサービスのログを表示

```bash
docker-compose logs -f app
docker-compose logs -f db
```

### スーパーバイザー管理下のプロセスログを確認

```bash
docker exec -it category-analysis-app cat /var/log/supervisor/backend.out.log
docker exec -it category-analysis-app cat /var/log/supervisor/frontend.out.log
```

### コンテナの再起動

```bash
docker-compose restart
```

### サービスの再ビルド

コードを変更した場合は、再ビルドが必要です。

```bash
docker-compose up -d --build
```

### データベースへの接続

```bash
docker-compose exec db psql -U postgres -d categorydb
```

### コンテナへの接続

```bash
docker exec -it category-analysis-app bash
```

## データの永続化

アプリケーションのデータは、Docker ボリューム`postgres_data`に保存されます。このボリュームは、コンテナを削除しても保持されます。

## トラブルシューティング

### コンテナが起動しない場合

ログを確認して、エラーの原因を特定してください。

```bash
docker-compose logs -f
```

### データベース接続エラーが発生する場合

バックエンドの環境変数`DATABASE_URL`が正しく設定されているか確認してください。また、データベースコンテナが正常に起動しているか確認してください。

```bash
docker-compose ps
```

### プロセス個別のログを確認

```bash
# バックエンドのログを確認
docker exec -it category-analysis-app cat /var/log/supervisor/backend.err.log

# フロントエンドのログを確認
docker exec -it category-analysis-app cat /var/log/supervisor/frontend.err.log
```

### Gemini API 関連のエラー

1. `GEMINI_API_KEY`が正しく設定されているか確認
2. API 使用量の制限に達していないか確認
3. バックエンドログで API リクエスト詳細を確認

### 環境変数が反映されない場合

1. `.env`ファイルが正しい場所に存在するか確認
2. コンテナを再起動して最新の環境変数を反映させる
3. `.env`ファイルの構文が正しいか確認（スペースやクオーテーションなど）
