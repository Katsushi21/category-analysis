# Appパッケージ初期化ファイル

from fastapi import FastAPI
import logging
import os
from pathlib import Path
import psycopg2
from sqlalchemy import inspect

# ロガーの設定
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)


# アプリケーション初期化時に実行される関数
def init_app():
    logger.info("アプリケーションを初期化しています...")
    try:
        # テーブルが存在するか確認
        if not check_tables_exist():
            # テーブルが存在しない場合、初期化スクリプトを実行
            create_tables()

        # ローカル環境の場合、シードデータを適用
        from app.utils.seed import apply_seeds

        apply_seeds()
    except Exception as e:
        logger.error(f"初期化中にエラーが発生しました: {e}")


def check_tables_exist():
    """主要テーブルが存在するかチェック"""
    try:
        from .models.database import engine

        inspector = inspect(engine)
        return "analysis_history" in inspector.get_table_names()
    except Exception as e:
        logger.error(f"テーブル存在チェック中にエラー: {e}")
        return False


def create_tables():
    """テーブル作成SQLの実行"""
    try:
        from .core.config import settings

        # SQLファイルのパス
        root_dir = Path(__file__).parents[1]
        sql_file = root_dir / "init-db" / "01-create-tables.sql"

        if not sql_file.exists():
            logger.error(f"SQLファイルが見つかりません: {sql_file}")
            return

        logger.info(f"テーブル作成スクリプトを実行します: {sql_file}")

        # データベースに接続
        conn = psycopg2.connect(settings.DATABASE_URL)
        conn.autocommit = True
        cursor = conn.cursor()

        # SQLファイルを読み込んで実行
        with open(sql_file, 'r') as file:
            sql = file.read()
            cursor.execute(sql)

        cursor.close()
        conn.close()

        logger.info("テーブルの作成が完了しました")

    except Exception as e:
        logger.error(f"テーブル作成中にエラー: {e}")
        raise


# アプリケーション初期化
init_app()
