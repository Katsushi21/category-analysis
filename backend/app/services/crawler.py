import logging
import requests
from bs4 import BeautifulSoup
from typing import Tuple, Optional

logger = logging.getLogger(__name__)


class WebCrawler:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }

    async def fetch_url_content(self, url: str) -> Tuple[str, Optional[str]]:
        """
        URLからHTMLコンテンツを取得する

        Args:
            url: 取得対象のURL

        Returns:
            (テキストコンテンツ, エラーメッセージ)のタプル。
            成功時はエラーメッセージはNone。
        """
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()

            # HTMLコンテンツを解析してテキストを抽出
            html_content = response.text
            text_content = self._extract_text_from_html(html_content)

            return text_content, None

        except requests.exceptions.RequestException as e:
            error_message = f"URLからコンテンツを取得できませんでした: {str(e)}"
            return "", error_message

    def _extract_text_from_html(self, html_content: str) -> str:
        """
        HTMLからテキストを抽出する

        Args:
            html_content: HTMLコンテンツ

        Returns:
            抽出されたテキスト
        """
        try:
            soup = BeautifulSoup(html_content, 'html.parser')

            # スクリプトとスタイルシートを削除
            for script in soup(["script", "style", "noscript", "iframe"]):
                script.decompose()

            # テキストを抽出
            text = soup.get_text(separator=" ", strip=True)

            # メタデータを抽出
            title = soup.title.string if soup.title else ""
            meta_description = ""
            meta_keywords = ""

            if soup.find("meta", attrs={"name": "description"}):
                meta_description = soup.find("meta", attrs={"name": "description"}).get(
                    "content", ""
                )

            if soup.find("meta", attrs={"name": "keywords"}):
                meta_keywords = soup.find("meta", attrs={"name": "keywords"}).get(
                    "content", ""
                )

            # メタデータとテキストを組み合わせて返す
            combined_text = f"Title: {title}\nDescription: {meta_description}\nKeywords: {meta_keywords}\n\nContent:\n{text}"

            return combined_text

        except Exception as e:
            # HTMLのパースに失敗した場合は元のHTMLを返す
            return html_content
