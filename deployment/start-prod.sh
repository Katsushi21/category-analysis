#!/bin/bash
set -e

# データベースの待機
echo "データベースの準備を待機中..."
until python -c "import psycopg2; conn=psycopg2.connect('host=db port=5432 user=postgres password=790491bf413ae78784ae87fe4ffa884d dbname=categorydb'); conn.close()" 2>/dev/null; do
  echo "データベースに接続できません - 再試行します"
  sleep 2
done
echo "データベース接続確認"

# アプリケーションの起動
echo "本番環境アプリケーションを起動中..."
exec /usr/bin/supervisord