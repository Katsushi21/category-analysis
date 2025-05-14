import asyncio
import logging
import os
import io
from typing import Optional, Tuple, Union, Literal
from pathlib import Path

from playwright.async_api import async_playwright, Browser, Page
from PIL import Image

logger = logging.getLogger(__name__)


class WebScreenshotter:
    """
    Playwrightを使用してウェブページのスクリーンショットを取得するクラス。
    画像圧縮機能も備えています。
    """

    def __init__(
        self,
        browser_type: Literal["chromium", "firefox", "webkit"] = "chromium",
        headless: bool = True,
        viewport_size: Tuple[int, int] = (1280, 720),
    ):
        """
        WebScreenshotterクラスの初期化

        Args:
            browser_type: 使用するブラウザタイプ（chromium, firefox, webkit）
            headless: ヘッドレスモード（UI非表示）で実行するかどうか
            viewport_size: ブラウザウィンドウのサイズ (幅, 高さ)
        """
        self.browser_type = browser_type
        self.headless = headless
        self.viewport_size = viewport_size
        self.playwright = None
        self.browser = None

    async def initialize(self):
        """Playwrightとブラウザを初期化する"""
        if self.playwright is None:
            try:
                self.playwright = await async_playwright().start()
                browser_engine = getattr(self.playwright, self.browser_type)
                self.browser = await browser_engine.launch(headless=self.headless)
                logger.info(f"{self.browser_type} ブラウザを初期化しました")
            except Exception as e:
                logger.error(f"ブラウザの初期化中にエラーが発生しました: {str(e)}")
                await self.close()
                raise

    async def take_screenshot(
        self,
        url: str,
        format: Literal["png", "jpeg"] = "png",
        full_page: bool = True,
        path: Optional[Union[str, Path]] = None,
        compress: bool = True,
        quality: int = 80,
        max_size: Optional[Tuple[int, int]] = None,
    ) -> Optional[bytes]:
        """
        指定されたURLのウェブページのスクリーンショットを取得する

        Args:
            url: スクリーンショットを取得するURL
            format: 画像フォーマット（png または jpeg）
            full_page: ページ全体のスクリーンショットを取得するかどうか
            path: スクリーンショットを保存するパス（省略時は保存しない）
            compress: 画像を圧縮するかどうか
            quality: JPEG圧縮品質（0-100）
            max_size: 最大サイズ（幅, 高さ）

        Returns:
            スクリーンショットの画像データ（バイナリ）。path指定時はNone。
        """
        if self.browser is None:
            await self.initialize()

        screenshot_data = None
        page = None

        try:
            # ページを開く
            page = await self.browser.new_page(
                viewport={
                    "width": self.viewport_size[0],
                    "height": self.viewport_size[1],
                },
            )

            # ページに移動
            await page.goto(url)
            logger.info(f"ページを読み込みました: {url}")

            # スクリーンショットのオプション
            screenshot_options = {
                "type": format,
                "full_page": full_page,
            }

            # パスが指定されている場合
            if path:
                screenshot_options["path"] = str(path)
                await page.screenshot(**screenshot_options)
                logger.info(f"スクリーンショットを保存しました: {path}")
            else:
                # バイナリデータとして取得
                screenshot_data = await page.screenshot(**screenshot_options)
                logger.info(
                    f"スクリーンショットをメモリに取得しました ({len(screenshot_data)} バイト)"
                )

            # 圧縮が必要な場合
            if compress and screenshot_data:
                screenshot_data = await self.compress_image(
                    screenshot_data, format=format, quality=quality, max_size=max_size
                )
                logger.info(
                    f"スクリーンショットを圧縮しました ({len(screenshot_data)} バイト)"
                )

            return screenshot_data

        except Exception as e:
            logger.error(f"スクリーンショット取得中にエラーが発生しました: {str(e)}")
            raise
        finally:
            if page:
                await page.close()

    async def compress_image(
        self,
        image_data: bytes,
        format: Literal["png", "jpeg", "webp"] = "jpeg",
        quality: int = 80,
        max_size: Optional[Tuple[int, int]] = None,
        strip_metadata: bool = True,
    ) -> bytes:
        """
        画像データを圧縮する

        Args:
            image_data: 元の画像データ（バイナリ）
            format: 出力フォーマット（png, jpeg, webp）
            quality: 圧縮品質（0-100、JPEG/WebP用）
            max_size: 最大サイズ（幅, 高さ）
            strip_metadata: メタデータを削除するかどうか

        Returns:
            圧縮された画像データ（バイナリ）
        """
        # 画像データからPIL Imageを作成
        img = Image.open(io.BytesIO(image_data))

        # メタデータを削除
        if strip_metadata:
            img_info = img.info
            img = Image.new(img.mode, img.size)
            img.putdata(list(Image.open(io.BytesIO(image_data)).getdata()))

        # サイズ変更が必要な場合
        if max_size and (img.width > max_size[0] or img.height > max_size[1]):
            img.thumbnail(max_size, Image.LANCZOS)
            logger.info(f"画像をリサイズしました: {img.width}x{img.height}")

        # 画像を圧縮してバイナリデータに変換
        output = io.BytesIO()
        img.save(
            output,
            format=format.upper(),
            quality=quality if format in ["jpeg", "webp"] else None,
            optimize=True,
        )
        compressed_data = output.getvalue()

        logger.info(
            f"画像圧縮: {len(image_data)} バイト → {len(compressed_data)} バイト "
            f"({(len(compressed_data) / len(image_data)) * 100:.1f}%)"
        )

        return compressed_data

    async def close(self):
        """Playwrightとブラウザを閉じてリソースを解放する"""
        if self.browser:
            await self.browser.close()
            self.browser = None
            logger.info("ブラウザを閉じました")

        if self.playwright:
            await self.playwright.stop()
            self.playwright = None
            logger.info("Playwrightを停止しました")

    async def __aenter__(self):
        """非同期コンテキストマネージャーのエントリーポイント"""
        await self.initialize()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """非同期コンテキストマネージャーの終了処理"""
        await self.close()
