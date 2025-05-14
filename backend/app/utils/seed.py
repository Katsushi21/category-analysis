import os
import logging
import psycopg2
from pathlib import Path
from app.core.config import settings

logger = logging.getLogger(__name__)


def is_local_environment() -> bool:
    """ローカル環境かどうかを判定する"""
    # 環境変数でローカル環境かどうかを判定
    env = os.getenv("ENVIRONMENT", "local").lower()
    return env in ["local", "development", "dev"]


def run_seed_file(file_path: Path) -> None:
    """SQLファイルを実行する"""
    if not file_path.exists():
        logger.warning(f"シードファイル {file_path} が見つかりません")
        return

    logger.info(f"シードファイル {file_path} を実行します")

    try:
        # データベースに接続
        conn = psycopg2.connect(settings.DATABASE_URL)
        conn.autocommit = True
        cursor = conn.cursor()

        # SQLファイルを読み込んで実行
        with open(file_path, 'r', encoding='utf-8') as file:
            sql = file.read()
            cursor.execute(sql)

        logger.info(f"シードファイル {file_path} の実行が完了しました")

    except Exception as e:
        logger.error(f"シードファイル {file_path} の実行中にエラーが発生しました: {e}")

    finally:
        if 'conn' in locals():
            cursor.close()
            conn.close()


def is_seed_already_applied() -> bool:
    """シードが既に適用されているかどうかを確認する"""
    try:
        conn = psycopg2.connect(settings.DATABASE_URL)
        cursor = conn.cursor()

        # categoriesテーブルにデータがあるかチェック
        cursor.execute("SELECT COUNT(*) FROM categories")
        count = cursor.fetchone()[0]

        cursor.close()
        conn.close()

        return count > 0

    except Exception as e:
        logger.error(f"シード適用確認中にエラーが発生しました: {e}")
        return False


def apply_seeds() -> None:
    """シードデータを適用する"""
    if not is_local_environment():
        logger.info("本番環境のため、シードデータは適用しません")
        return

    if is_seed_already_applied():
        logger.info("シードデータは既に適用されています")
        return

    logger.info("シードデータを適用します")

    # プロジェクトのルートディレクトリ
    root_dir = Path(__file__).parents[2]

    # シードファイルのパス
    seed_file = root_dir / "init-db" / "02-seed-data.sql"

    run_seed_file(seed_file)


if __name__ == "__main__":
    # 直接実行された場合に実行
    logging.basicConfig(level=logging.INFO)
    apply_seeds()
