from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse
from typing import Optional


def normalize_url(url: str) -> str:
    """
    URLを正規化する

    以下の処理を行う:
    1. プロトコル（http/https）の統一 -> httpsに統一
    2. トレイリングスラッシュの処理 -> 削除
    3. クエリパラメータの並び順統一 -> アルファベット順にソート
    4. フラグメント（#以降）の削除

    Args:
        url: 正規化するURL

    Returns:
        正規化されたURL
    """
    if not url:
        return url

    # URLをパース
    parsed = urlparse(url)

    # クエリパラメータをソート
    query_params = parse_qsl(parsed.query)
    sorted_query = urlencode(sorted(query_params))

    # URLを再構築（フラグメントは除外）
    normalized = urlunparse(
        (
            'https',  # プロトコルをhttpsに統一
            parsed.netloc,
            parsed.path.rstrip('/')
            or '/',  # パスの末尾のスラッシュを削除、ただしルートの場合は維持
            parsed.params,
            sorted_query,
            '',  # フラグメントを削除
        )
    )

    return normalized
