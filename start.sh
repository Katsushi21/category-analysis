#!/bin/bash
set -e

# 仮想環境の有効化
source /app/venv/bin/activate

# ログディレクトリの作成
mkdir -p /var/log/supervisor

# データベースの待機
echo "データベースの準備を待機中..."
until python -c "import psycopg2; psycopg2.connect('host=db port=5432 user=postgres password=postgres dbname=categorydb')" 2>/dev/null; do
  echo "データベースに接続できません - 再試行します"
  sleep 1
done
echo "データベース接続確認"

# Supervisordの起動
echo "アプリケーションを起動中..."
exec /usr/bin/supervisord