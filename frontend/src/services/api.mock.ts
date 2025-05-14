import {
  SubCategory,
  CategoryAnalysis,
  AnalysisResponse,
  BatchAnalysisResponse,
  HistoryItem,
  HistoryResponse,
} from "./api";

// キャッシュ動作をシミュレーションするためのストレージ
const urlCache: Record<
  string,
  {
    result: AnalysisResponse;
    timestamp: number;
  }
> = {};

// サンプルのサブカテゴリリスト
const generateSubCategories = (): SubCategory[] => {
  const categories = [
    { name: "SaaS", confidence: 0.95 },
    { name: "クラウドサービス", confidence: 0.87 },
    { name: "Web開発", confidence: 0.82 },
    { name: "モバイル", confidence: 0.75 },
    { name: "通信サービス", confidence: 0.72 },
    { name: "アパレル", confidence: 0.68 },
    { name: "家電", confidence: 0.65 },
    { name: "食品", confidence: 0.61 },
    { name: "日用品", confidence: 0.58 },
    { name: "専門店", confidence: 0.55 },
  ];

  // ランダムに5つ以下のサブカテゴリを選択
  const count = Math.floor(Math.random() * 3) + 3;
  const shuffled = [...categories].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// サンプルのメインカテゴリリスト
const mainCategories = [
  "金融・保険",
  "不動産",
  "教育",
  "美容・化粧品",
  "健康・医薬品",
  "病院・クリニック",
  "ビジネス",
  "アプリ・システム",
  "求人・転職",
  "生活サービス",
  "家電・デジタル",
  "食品",
  "外食サービス",
  "旅行・レジャー",
  "ファッション",
  "エンターテイメント",
  "生活・日用品",
  "スポーツ・アウトドア",
  "自動車関連",
  "住宅・インテリア",
  "ペット",
  "公営ギャンブル",
  "官公庁・地方自治体・公共サービス",
];

// サンプルの説明文
const sampleDescriptions = [
  "企業向けのクラウドベースのSaaSプラットフォームを提供しています。主にビジネスプロセスの自動化と効率化を支援するソリューションが特徴です。",
  "オンラインショッピングプラットフォームで、幅広い商品カテゴリを取り扱っています。ユーザーフレンドリーなインターフェースと迅速な配送サービスが強みです。",
  "フィンテック企業として、革新的な金融サービスを提供しています。モバイル決済、投資管理、個人向け融資サービスなどが主力商品です。",
  "健康管理アプリを提供するヘルステック企業です。ユーザーの健康データを収集・分析し、パーソナライズされた健康アドバイスを提供します。",
  "オンライン学習プラットフォームで、多様な教育コンテンツを提供しています。インタラクティブな学習体験と柔軟な学習スケジュールが特徴です。",
];

// サンプルのターゲットオーディエンス
const sampleTargetAudiences = [
  "中小企業から大企業までの経営者、IT管理者、業務効率化を求めるビジネスパーソン",
  "10代後半から40代の若年層から中年層のオンラインショッピング愛好者、特に都市部に住む忙しい専門職の方々",
  "デジタル決済に関心のある20代から40代のユーザー、投資初心者、伝統的な銀行サービスに不満を持つミレニアル世代",
  "健康意識の高い25歳から50歳の男女、フィットネス愛好者、忙しいプロフェッショナル",
  "継続的な学習に関心のある学生、スキルアップを目指す社会人、知識を深めたい退職者",
];

// サンプルの価値提案
const sampleValuePropositions = [
  "複雑なビジネスプロセスを簡素化し、効率性と生産性を大幅に向上させることで、コスト削減と成長促進を実現します。",
  "豊富な商品ラインナップと便利なショッピング体験を提供し、時間と労力を節約しながら最適な商品を見つけられます。",
  "従来の金融機関よりも手数料を抑え、ユーザーフレンドリーなインターフェースで、誰でも簡単に金融サービスにアクセスできます。",
  "科学的根拠に基づいた健康アドバイスと、継続的なモニタリングによって、より健康的なライフスタイルへの転換をサポートします。",
  "場所や時間に縛られない柔軟な学習環境と、インタラクティブなコンテンツによって、効果的かつ楽しい学習体験を提供します。",
];

// ランダムなカテゴリ分析を生成する関数
const generateCategoryAnalysis = (): CategoryAnalysis => {
  const mainCategoryIndex = Math.floor(Math.random() * mainCategories.length);
  const mainCategory = mainCategories[mainCategoryIndex];
  const confidence = 0.7 + Math.random() * 0.3; // 0.7-1.0の範囲

  const descriptionIndex = Math.floor(
    Math.random() * sampleDescriptions.length
  );
  const targetAudienceIndex = Math.floor(
    Math.random() * sampleTargetAudiences.length
  );
  const valuePropositionIndex = Math.floor(
    Math.random() * sampleValuePropositions.length
  );

  return {
    main_category: mainCategory,
    sub_categories: generateSubCategories(),
    confidence: confidence,
    description: sampleDescriptions[descriptionIndex],
    target_audience: sampleTargetAudiences[targetAudienceIndex],
    value_proposition: sampleValuePropositions[valuePropositionIndex],
  };
};

// 単一URLのモック解析
export const analyzeUrl = async (
  url: string,
  forceRefresh: boolean = false
): Promise<AnalysisResponse> => {
  // キャッシュチェック (forceRefreshがfalseの場合のみ)
  if (!forceRefresh && urlCache[url]) {
    const cachedData = urlCache[url];
    // 7日以内のデータであればキャッシュを返す
    const cacheAgeMs = Date.now() - cachedData.timestamp;
    const cacheDays = cacheAgeMs / (1000 * 60 * 60 * 24);

    if (cacheDays < 7) {
      // キャッシュから返却
      console.log(`キャッシュから結果を返却: ${url}`);
      return {
        ...cachedData.result,
        from_cache: true,
      };
    }
  }

  // 遅延をシミュレート (1-3秒)
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 2000)
  );

  // 5%の確率で失敗させる
  if (Math.random() < 0.05) {
    const errorResponse = {
      url: url,
      status: "failed",
      error: "解析中にエラーが発生しました。サーバーに接続できません。",
    };
    return errorResponse;
  }

  // 成功レスポンスを生成
  const successResponse = {
    url: url,
    status: "success",
    analysis: generateCategoryAnalysis(),
  };

  // キャッシュに保存
  urlCache[url] = {
    result: successResponse,
    timestamp: Date.now(),
  };

  return successResponse;
};

// 複数URLの一括モック解析
export const analyzeBatch = async (
  urls: string[],
  forceRefresh: boolean = false
): Promise<BatchAnalysisResponse> => {
  // 遅延をシミュレート (urls.length * 300ms から urls.length * 800ms)
  await new Promise((resolve) =>
    setTimeout(resolve, urls.length * 300 + Math.random() * urls.length * 500)
  );

  const results: AnalysisResponse[] = [];
  let successCount = 0;
  let failedCount = 0;

  for (const url of urls) {
    // キャッシュチェック (forceRefreshがfalseの場合のみ)
    let result: AnalysisResponse;

    if (!forceRefresh && urlCache[url]) {
      const cachedData = urlCache[url];
      // 7日以内のデータであればキャッシュを返す
      const cacheAgeMs = Date.now() - cachedData.timestamp;
      const cacheDays = cacheAgeMs / (1000 * 60 * 60 * 24);

      if (cacheDays < 7) {
        // キャッシュから返却
        result = {
          ...cachedData.result,
          from_cache: true,
        };
        results.push(result);
        successCount++;
        continue;
      }
    }

    // キャッシュがない場合は新規解析
    // 10%の確率で失敗させる
    if (Math.random() < 0.1) {
      result = {
        url: url,
        status: "failed",
        error: "URLからコンテンツを取得できませんでした",
      };
      failedCount++;
    } else {
      result = {
        url: url,
        status: "success",
        analysis: generateCategoryAnalysis(),
      };

      // キャッシュに保存
      urlCache[url] = {
        result: result,
        timestamp: Date.now(),
      };

      successCount++;
    }

    results.push(result);
  }

  return {
    results: results,
    total: urls.length,
    success: successCount,
    failed: failedCount,
  };
};

// CSVファイルからのモック解析
export const analyzeCsv = async (
  file: File,
  columnName: string = "url",
  forceRefresh: boolean = false
): Promise<BatchAnalysisResponse> => {
  // 遅延をシミュレート (2-4秒)
  await new Promise((resolve) =>
    setTimeout(resolve, 2000 + Math.random() * 2000)
  );

  // 5つのURLを生成
  const urlCount = 5;
  const mockUrls = Array.from(
    { length: urlCount },
    (_, i) => `https://example${i + 1}.com`
  );

  // analyzeBatchを再利用
  return analyzeBatch(mockUrls, forceRefresh);
};

// カテゴリー取得のモック
export const getCategories = async (): Promise<
  Record<string, Record<string, string[]>>
> => {
  // 遅延をシミュレート
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    "IT・通信": {
      SaaS: [
        "CRM",
        "マーケティングツール",
        "コミュニケーションツール",
        "プロジェクト管理",
      ],
      クラウドサービス: ["IaaS", "PaaS", "ストレージ", "セキュリティ"],
      Web開発: ["フロントエンド", "バックエンド", "フルスタック", "デザイン"],
      モバイル: [
        "iOSアプリ",
        "Androidアプリ",
        "クロスプラットフォーム",
        "モバイルゲーム",
      ],
      通信サービス: [
        "インターネットプロバイダ",
        "携帯電話",
        "固定電話",
        "法人向け通信",
      ],
    },
    "小売・EC": {
      アパレル: ["メンズ", "レディース", "キッズ", "スポーツウェア"],
      家電: ["オーディオ", "テレビ", "生活家電", "キッチン家電"],
      食品: ["生鮮食品", "加工食品", "飲料", "健康食品"],
      日用品: ["化粧品", "トイレタリー", "ホームケア", "ペット用品"],
      専門店: ["書籍", "スポーツ用品", "ホビー", "ジュエリー"],
    },
    "金融・保険": {
      銀行: ["リテール", "法人向け", "投資銀行", "ネット銀行"],
      証券: ["株式", "債券", "投資信託", "FX"],
      保険: ["生命保険", "損害保険", "医療保険", "自動車保険"],
      フィンテック: ["決済", "融資", "資産管理", "仮想通貨"],
      不動産金融: ["住宅ローン", "不動産投資", "リース", "ファンド"],
    },
  };
};

export const getMainCategories = async (): Promise<string[]> => {
  // 遅延をシミュレート
  await new Promise((resolve) => setTimeout(resolve, 300));

  return mainCategories;
};

export const getSubCategories = async (
  mainCategory: string
): Promise<Record<string, string[]>> => {
  // 遅延をシミュレート
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (mainCategory === "IT・通信") {
    return {
      SaaS: [
        "CRM",
        "マーケティングツール",
        "コミュニケーションツール",
        "プロジェクト管理",
      ],
      クラウドサービス: ["IaaS", "PaaS", "ストレージ", "セキュリティ"],
      Web開発: ["フロントエンド", "バックエンド", "フルスタック", "デザイン"],
      モバイル: [
        "iOSアプリ",
        "Androidアプリ",
        "クロスプラットフォーム",
        "モバイルゲーム",
      ],
      通信サービス: [
        "インターネットプロバイダ",
        "携帯電話",
        "固定電話",
        "法人向け通信",
      ],
    };
  } else if (mainCategory === "小売・EC") {
    return {
      アパレル: ["メンズ", "レディース", "キッズ", "スポーツウェア"],
      家電: ["オーディオ", "テレビ", "生活家電", "キッチン家電"],
      食品: ["生鮮食品", "加工食品", "飲料", "健康食品"],
      日用品: ["化粧品", "トイレタリー", "ホームケア", "ペット用品"],
      専門店: ["書籍", "スポーツ用品", "ホビー", "ジュエリー"],
    };
  } else {
    return {
      サブカテゴリ1: ["詳細1", "詳細2", "詳細3"],
      サブカテゴリ2: ["詳細4", "詳細5", "詳細6"],
      サブカテゴリ3: ["詳細7", "詳細8", "詳細9"],
    };
  }
};

// サンプルの履歴データ
const generateHistoryItems = (count: number): HistoryItem[] => {
  const items: HistoryItem[] = [];
  const urls = [
    "https://example.com",
    "https://cloud-service.example.org",
    "https://online-shop.example.net",
    "https://finance-app.example.com",
    "https://health-tech.example.org",
    "https://education-platform.example.net",
    "https://travel-site.example.com",
    "https://realestate.example.org",
    "https://food-delivery.example.net",
    "https://beauty-store.example.com",
  ];

  // 現在の日時から過去30日間のランダムな日時を生成
  const getRandomTimestamp = (): string => {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return date.toISOString();
  };

  for (let i = 0; i < count; i++) {
    const urlIndex = Math.floor(Math.random() * urls.length);
    const url = urls[urlIndex];
    const status = Math.random() < 0.9 ? "success" : "failed";
    const id = `hist_${Date.now()}_${i}`;

    if (status === "success") {
      const analysis = generateCategoryAnalysis();
      items.push({
        id,
        url,
        timestamp: getRandomTimestamp(),
        status,
        main_category: analysis.main_category,
        confidence: analysis.confidence,
        analysis,
      });
    } else {
      items.push({
        id,
        url,
        timestamp: getRandomTimestamp(),
        status,
        error: "解析中にエラーが発生しました",
      });
    }
  }

  // 日時でソート（新しい順）
  return items.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

// サンプル履歴データのキャッシュ
const MOCK_HISTORY_ITEMS = generateHistoryItems(50);

// 履歴を取得する関数
export const getHistory = async (
  page: number = 1,
  limit: number = 10,
  sort: string = "timestamp_desc",
  status: string | null = null,
  main_category: string | null = null,
  url_contains: string | null = null
): Promise<HistoryResponse> => {
  // 遅延をシミュレート (0.5-1.5秒)
  await new Promise((resolve) =>
    setTimeout(resolve, 500 + Math.random() * 1000)
  );

  // 50アイテムのモックデータを生成
  const allItems = generateHistoryItems(50);

  // フィルタリング
  let filteredItems = [...allItems];

  if (status && status !== "all") {
    filteredItems = filteredItems.filter((item) => item.status === status);
  }

  if (main_category) {
    filteredItems = filteredItems.filter(
      (item) => item.main_category === main_category
    );
  }

  if (url_contains) {
    filteredItems = filteredItems.filter((item) =>
      item.url.toLowerCase().includes(url_contains.toLowerCase())
    );
  }

  // ソート
  if (sort === "timestamp_desc") {
    filteredItems.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } else if (sort === "timestamp_asc") {
    filteredItems.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  // ページネーション
  const startIndex = (page - 1) * limit;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + limit);

  return {
    items: paginatedItems,
    total: filteredItems.length,
  };
};

// 履歴アイテムを取得する関数
export const getHistoryItem = async (id: string): Promise<HistoryItem> => {
  // 遅延をシミュレート
  await new Promise((resolve) =>
    setTimeout(resolve, 300 + Math.random() * 300)
  );

  const item = MOCK_HISTORY_ITEMS.find((item) => item.id === id);

  if (!item) {
    throw new Error(`履歴アイテム(ID: ${id})が見つかりません`);
  }

  return item;
};

// 履歴メインカテゴリ取得
export const getHistoryCategories = async (): Promise<string[]> => {
  // 遅延をシミュレート
  await new Promise((resolve) =>
    setTimeout(resolve, 300 + Math.random() * 500)
  );

  // モック履歴データからユニークなカテゴリを抽出
  const allItems = generateHistoryItems(50);
  const uniqueCategories: Record<string, boolean> = {};

  // カテゴリを重複なしで収集
  allItems.forEach((item) => {
    if (item.main_category) {
      uniqueCategories[item.main_category] = true;
    }
  });

  // オブジェクトのキーを配列として返却してソート
  return Object.keys(uniqueCategories).sort();
};
