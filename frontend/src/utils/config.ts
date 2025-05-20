/**
 * 環境変数から設定を読み込むための設定ファイル
 */

// 環境変数のデフォルト値
const DEFAULT_API_BASE_URL = "http://localhost:8001/api";
const DEFAULT_APP_ENV = "development";
const DEFAULT_API_MODE = "real";

// 設定オブジェクト
export const config = {
  // API基本URL
  apiBaseUrl: process.env.API_BASE_URL || DEFAULT_API_BASE_URL,

  // アプリケーション環境
  appEnv: process.env.NEXT_PUBLIC_APP_ENV || DEFAULT_APP_ENV,

  // API接続モード（実際のAPIかモックAPIか）
  apiMode: process.env.NEXT_PUBLIC_API_MODE || DEFAULT_API_MODE,

  // 開発モードかどうか
  isDevelopment:
    (process.env.NEXT_PUBLIC_APP_ENV || DEFAULT_APP_ENV) === "development",

  // 本番環境かどうか
  isProduction:
    (process.env.NEXT_PUBLIC_APP_ENV || DEFAULT_APP_ENV) === "production",
};

// 環境変数の検証
if (config.isDevelopment) {
  console.info("現在の環境設定:", {
    apiBaseUrl: config.apiBaseUrl,
    appEnv: config.appEnv,
    apiMode: config.apiMode,
  });
}

export default config;
