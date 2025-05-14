// モードの切り替え
// 'mock'に設定するとモックAPIを使用、'real'に設定すると実際のAPIを使用
const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "mock";

let apiService;

if (API_MODE === "mock") {
  // モックAPIをインポート
  apiService = require("./api.mock");
} else {
  // 実際のAPIをインポート
  apiService = require("./api");
}

// 型情報をエクスポート
export type {
  SubCategory,
  CategoryAnalysis,
  AnalysisResponse,
  BatchAnalysisResponse,
  HistoryItem,
  HistoryResponse,
} from "./api";

// APIサービスの各関数をエクスポート
export const {
  analyzeUrl,
  analyzeBatch,
  analyzeCsv,
  getCategories,
  getMainCategories,
  getSubCategories,
  getHistory,
  getHistoryItem,
  getHistoryCategories,
} = apiService;
