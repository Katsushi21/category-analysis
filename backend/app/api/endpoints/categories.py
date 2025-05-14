from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any

router = APIRouter()

# サンプルのカテゴリ階層構造
# 実際のプロダクションでは、これはデータベースから取得するか、より複雑な構造になる可能性があります
SAMPLE_CATEGORIES = {
    "IT・通信": {
        "SaaS": [
            "CRM",
            "マーケティングツール",
            "コミュニケーションツール",
            "プロジェクト管理",
        ],
        "クラウドサービス": ["IaaS", "PaaS", "ストレージ", "セキュリティ"],
        "Web開発": ["フロントエンド", "バックエンド", "フルスタック", "デザイン"],
        "モバイル": [
            "iOSアプリ",
            "Androidアプリ",
            "クロスプラットフォーム",
            "モバイルゲーム",
        ],
        "通信サービス": [
            "インターネットプロバイダ",
            "携帯電話",
            "固定電話",
            "法人向け通信",
        ],
    },
    "小売・EC": {
        "アパレル": ["メンズ", "レディース", "キッズ", "スポーツウェア"],
        "家電": ["オーディオ", "テレビ", "生活家電", "キッチン家電"],
        "食品": ["生鮮食品", "加工食品", "飲料", "健康食品"],
        "日用品": ["化粧品", "トイレタリー", "ホームケア", "ペット用品"],
        "専門店": ["書籍", "スポーツ用品", "ホビー", "ジュエリー"],
    },
    "金融・保険": {
        "銀行": ["リテール", "法人向け", "投資銀行", "ネット銀行"],
        "証券": ["株式", "債券", "投資信託", "FX"],
        "保険": ["生命保険", "損害保険", "医療保険", "自動車保険"],
        "フィンテック": ["決済", "融資", "資産管理", "仮想通貨"],
        "不動産金融": ["住宅ローン", "不動産投資", "リース", "ファンド"],
    },
    "医療・ヘルスケア": {
        "医療機関": ["病院", "クリニック", "歯科", "眼科"],
        "医薬品": ["処方薬", "OTC", "健康食品", "サプリメント"],
        "医療機器": ["診断機器", "治療機器", "ウェアラブル", "在宅医療"],
        "ヘルスケアサービス": [
            "フィットネス",
            "栄養指導",
            "メンタルヘルス",
            "遠隔医療",
        ],
        "介護": ["施設", "在宅介護", "福祉用具", "介護食"],
    },
    "教育・学習": {
        "学校教育": ["幼児教育", "小中高", "大学", "専門学校"],
        "オンライン学習": ["語学", "プログラミング", "資格取得", "趣味・教養"],
        "塾・予備校": ["進学塾", "個別指導", "受験対策", "補習"],
        "企業研修": ["ビジネススキル", "リーダーシップ", "技術研修", "語学研修"],
        "教育コンテンツ": ["教材", "参考書", "教育アプリ", "eラーニング"],
    },
}


@router.get("/categories", response_model=Dict[str, Dict[str, List[str]]])
async def get_all_categories():
    """
    すべてのカテゴリ階層を取得する
    """
    return SAMPLE_CATEGORIES


@router.get("/categories/main", response_model=List[str])
async def get_main_categories():
    """
    メインカテゴリのリストを取得する
    """
    return list(SAMPLE_CATEGORIES.keys())


@router.get("/categories/{main_category}", response_model=Dict[str, List[str]])
async def get_subcategories(main_category: str):
    """
    指定されたメインカテゴリのサブカテゴリを取得する
    """
    if main_category not in SAMPLE_CATEGORIES:
        raise HTTPException(
            status_code=404, detail=f"カテゴリ '{main_category}' が見つかりません"
        )
    return SAMPLE_CATEGORIES[main_category]
