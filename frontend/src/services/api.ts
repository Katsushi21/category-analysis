import axios from "axios";

const API_BASE_PATH = "http://localhost:8001/api";

// APIクライアントの設定
const apiClient = axios.create({
  // 相対パスを使用してプロキシを通じてアクセス
  baseURL: API_BASE_PATH,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// データモデルの定義
export interface SubCategory {
  name: string;
  confidence: number;
}

export interface CategoryAnalysis {
  main_category: string;
  sub_categories: SubCategory[];
  confidence: number;
  description?: string;
  target_audience?: string;
  value_proposition?: string;
}

export interface AnalysisResponse {
  url: string;
  status: string;
  analysis?: CategoryAnalysis;
  error?: string;
  from_cache?: boolean; // キャッシュから取得したかどうかのフラグ
}

export interface BatchAnalysisResponse {
  results: AnalysisResponse[];
  total: number;
  success: number;
  failed: number;
}

// 履歴関連の型定義
export interface HistoryItem {
  id: string;
  url: string;
  timestamp: string;
  status: string;
  main_category?: string;
  confidence?: number;
  analysis?: CategoryAnalysis;
  error?: string;
}

export interface HistoryResponse {
  items: HistoryItem[];
  total: number;
}

// API関数
export const analyzeUrl = async (
  url: string,
  forceRefresh: boolean = false
): Promise<AnalysisResponse> => {
  try {
    const response = await apiClient.post(
      "/analysis/analyze",
      { url },
      {
        params: { force_refresh: forceRefresh },
      }
    );
    return response.data;
  } catch (error) {
    console.error("URL解析中にエラーが発生しました:", error);
    throw error;
  }
};

export const analyzeBatch = async (
  urls: string[],
  forceRefresh: boolean = false
): Promise<BatchAnalysisResponse> => {
  try {
    const response = await apiClient.post(
      "/analysis/analyze-batch",
      { urls },
      {
        params: { force_refresh: forceRefresh },
      }
    );
    return response.data;
  } catch (error) {
    console.error("一括解析中にエラーが発生しました:", error);
    throw error;
  }
};

export const analyzeCsv = async (
  file: File,
  columnName: string = "url",
  forceRefresh: boolean = false
): Promise<BatchAnalysisResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("column_name", columnName);
    formData.append("force_refresh", forceRefresh.toString());

    const response = await apiClient.post("/analysis/analyze-csv", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("CSV解析中にエラーが発生しました:", error);
    throw error;
  }
};

export const getCategories = async (): Promise<
  Record<string, Record<string, string[]>>
> => {
  try {
    const response = await apiClient.get("/reference/categories");
    return response.data;
  } catch (error) {
    console.error("カテゴリ取得中にエラーが発生しました:", error);
    throw error;
  }
};

export const getMainCategories = async (): Promise<string[]> => {
  try {
    const response = await apiClient.get("/reference/categories/main");
    return response.data;
  } catch (error) {
    console.error("メインカテゴリ取得中にエラーが発生しました:", error);
    throw error;
  }
};

export const getSubCategories = async (
  mainCategory: string
): Promise<Record<string, string[]>> => {
  try {
    const response = await apiClient.get(
      `/reference/categories/${mainCategory}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `サブカテゴリ取得中にエラーが発生しました (${mainCategory}):`,
      error
    );
    throw error;
  }
};

// 履歴API
export const getHistory = async (
  page: number = 1,
  limit: number = 10,
  sort: string = "timestamp_desc",
  status: string | null = null,
  main_category: string | null = null,
  url_contains: string | null = null
): Promise<HistoryResponse> => {
  try {
    const response = await apiClient.get("/analysis/history", {
      params: {
        page,
        limit,
        sort,
        status,
        main_category,
        url_contains,
      },
    });
    return response.data;
  } catch (error) {
    console.error("履歴取得中にエラーが発生しました:", error);
    throw error;
  }
};

export const getHistoryItem = async (id: string): Promise<HistoryItem> => {
  try {
    const response = await apiClient.get(`/analysis/history/${id}`);
    return response.data;
  } catch (error) {
    console.error(`履歴アイテム取得中にエラーが発生しました (${id}):`, error);
    throw error;
  }
};

// 履歴メインカテゴリ取得
export const getHistoryCategories = async (): Promise<string[]> => {
  try {
    const response = await apiClient.get("/analysis/history/categories");
    return response.data;
  } catch (error) {
    console.error("履歴カテゴリ取得中にエラーが発生しました:", error);
    throw error;
  }
};
