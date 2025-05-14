import React, { useState, useCallback } from "react";
import { NextPage } from "next";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import Layout from "@/components/common/Layout";
import Button from "@/components/common/Button";
import InputField from "@/components/common/InputField";
import LoadingIndicator from "@/components/common/LoadingIndicator";
import { analyzeBatch, analyzeCsv, BatchAnalysisResponse } from "@/services";

const BatchAnalysis: NextPage = () => {
  const [urls, setUrls] = useState<string[]>([]);
  const [manualUrls, setManualUrls] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [columnName, setColumnName] = useState("url");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BatchAnalysisResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"manual" | "csv">("manual");

  // CSVファイルのプレビュー
  const [csvPreview, setCsvPreview] = useState<{
    headers: string[];
    rows: Record<string, string>[];
  } | null>(null);

  // 新しい状態変数: キャッシュ無効化フラグ
  const [forceRefresh, setForceRefresh] = useState(false);

  // ドラッグ&ドロップの処理
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];

      // CSVファイルのバリデーション
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        setError("CSVファイルのみアップロードできます");
        return;
      }

      setCsvFile(file);
      setError(null);

      // CSVファイルのプレビュー表示
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        preview: 5, // 最初の5行だけ表示
        complete: (results) => {
          if (results.data.length > 0) {
            setCsvPreview({
              headers: results.meta.fields || [],
              rows: results.data as Record<string, string>[],
            });

            // 自動的にURL列を検出
            const headers = results.meta.fields || [];
            const urlColumn = headers.find((h) =>
              h.toLowerCase().includes("url")
            );
            if (urlColumn) {
              setColumnName(urlColumn);
            }
          }
        },
        error: () => {
          setError("CSVファイルの読み込みに失敗しました");
        },
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  });

  // 手動入力URLの処理
  const handleManualUrlsChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setManualUrls(e.target.value);
  };

  // 一括解析の実行
  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      let response: BatchAnalysisResponse;

      if (activeTab === "manual") {
        // 手動入力されたURLを解析
        const urlList = manualUrls
          .split("\n")
          .map((url) => url.trim())
          .filter((url) => url.length > 0);

        if (urlList.length === 0) {
          setError("解析するURLを入力してください");
          setLoading(false);
          return;
        }

        response = await analyzeBatch(urlList, forceRefresh);
      } else {
        // CSVファイルを解析
        if (!csvFile) {
          setError("CSVファイルをアップロードしてください");
          setLoading(false);
          return;
        }

        response = await analyzeCsv(csvFile, columnName, forceRefresh);
      }

      setResults(response);

      if (response.failed > 0) {
        setError(`${response.failed}件のURLの解析に失敗しました`);
      }
    } catch (e) {
      setError("解析中にエラーが発生しました。もう一度お試しください。");
      console.error("Error during batch analysis:", e);
    } finally {
      setLoading(false);
    }
  };

  // 結果のCSVエクスポート
  const exportResults = () => {
    if (!results) return;

    const csvData = results.results.map((result) => {
      if (result.status === "success" && result.analysis) {
        return {
          url: result.url,
          status: result.status,
          main_category: result.analysis.main_category,
          confidence: result.analysis.confidence,
          sub_categories: result.analysis.sub_categories
            .map((sub) => `${sub.name} (${Math.round(sub.confidence * 100)}%)`)
            .join(", "),
          description: result.analysis.description || "",
          target_audience: result.analysis.target_audience || "",
          value_proposition: result.analysis.value_proposition || "",
        };
      } else {
        return {
          url: result.url,
          status: "failed",
          error: result.error || "Unknown error",
          main_category: "",
          confidence: "",
          sub_categories: "",
          description: "",
          target_audience: "",
          value_proposition: "",
        };
      }
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `category-analysis-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout title='一括解析 - WebInsight Analytics'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-2xl font-semibold text-primary mb-lg'>
          複数URLの一括解析
        </h1>

        {/* タブナビゲーション */}
        <div className='flex border-b border-border mb-lg overflow-x-auto'>
          <div
            className={`px-lg py-md cursor-pointer whitespace-nowrap font-medium ${
              activeTab === "manual"
                ? "text-primary border-b-3 border-primary"
                : "text-text-primary"
            }`}
            onClick={() => setActiveTab("manual")}
          >
            手動入力
          </div>
          <div
            className={`px-lg py-md cursor-pointer whitespace-nowrap font-medium ${
              activeTab === "csv"
                ? "text-primary border-b-3 border-primary"
                : "text-text-primary"
            }`}
            onClick={() => setActiveTab("csv")}
          >
            CSVアップロード
          </div>
        </div>

        <div className='bg-background-secondary rounded-lg p-lg mb-xl'>
          {activeTab === "manual" ? (
            <div>
              <p className='text-text-primary mb-md'>
                解析したいURLを1行に1つずつ入力してください。
              </p>
              <textarea
                className='w-full p-md border border-border rounded-sm text-text-primary transition-all focus:outline-none focus:border-secondary focus:shadow-[0_0_0_2px_rgba(45,125,210,0.2)] min-h-[200px]'
                placeholder='https://example.com'
                value={manualUrls}
                onChange={handleManualUrlsChange}
              ></textarea>
            </div>
          ) : (
            <div>
              <p className='text-text-primary mb-md'>
                URLが含まれたCSVファイルをアップロードしてください。
              </p>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed p-lg rounded-md text-center cursor-pointer transition-all mb-md ${
                  isDragActive
                    ? "border-primary bg-primary bg-opacity-5"
                    : "border-border hover:border-secondary"
                }`}
              >
                <input {...getInputProps()} />
                <i className='fas fa-file-csv text-4xl text-secondary mb-md'></i>
                {csvFile ? (
                  <p className='text-text-primary'>{csvFile.name}</p>
                ) : (
                  <div>
                    <p className='text-text-primary mb-xs'>
                      ファイルをドラッグ&ドロップするか、クリックして選択
                    </p>
                    <p className='text-sm text-gray-500'>
                      CSVファイルのみ (.csv)
                    </p>
                  </div>
                )}
              </div>

              {csvPreview && (
                <div className='mb-md'>
                  <h3 className='text-lg font-medium text-primary mb-sm'>
                    CSVプレビュー
                  </h3>
                  <div className='overflow-x-auto mb-md'>
                    <table className='min-w-full border border-border text-sm'>
                      <thead>
                        <tr className='bg-light-gray'>
                          {csvPreview.headers.map((header, index) => (
                            <th
                              key={index}
                              className='border border-border p-sm text-left'
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {csvPreview.headers.map((header, cellIndex) => (
                              <td
                                key={cellIndex}
                                className='border border-border p-sm'
                              >
                                {row[header]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <InputField
                    label='URL列の名前'
                    value={columnName}
                    onChange={(e) => setColumnName(e.target.value)}
                    helpText='CSVファイル内のURLが含まれる列の名前を指定してください'
                  />
                </div>
              )}
            </div>
          )}

          {/* キャッシュ無効化のトグルスイッチ */}
          <div className='flex items-center mt-md mb-md'>
            <label className='inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                className='sr-only peer'
                checked={forceRefresh}
                onChange={() => setForceRefresh(!forceRefresh)}
              />
              <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className='ml-3 text-sm font-medium text-gray-900'>
                キャッシュを使用せず再解析する
              </span>
            </label>
          </div>

          <div className='mt-md'>
            <Button
              onClick={handleAnalyze}
              disabled={loading}
              className='w-full sm:w-auto'
            >
              一括解析を開始
            </Button>
          </div>
        </div>

        {loading && (
          <LoadingIndicator text='解析中です。しばらくお待ちください...' />
        )}

        {error && (
          <div className='bg-danger bg-opacity-10 text-danger p-md rounded-md mb-lg'>
            <i className='fas fa-exclamation-circle mr-sm'></i>
            {error}
          </div>
        )}

        {results && (
          <div className='bg-white rounded-md shadow-md overflow-hidden'>
            <div className='p-lg border-b border-border flex justify-between items-center'>
              <div>
                <h2 className='text-lg font-medium'>解析結果</h2>
                <div className='text-sm text-text-secondary mt-xs'>
                  合計: {results.total}件 / 成功: {results.success}件 / 失敗:{" "}
                  {results.failed}件
                </div>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={exportResults}
                icon={<i className='fas fa-download'></i>}
                disabled={results.results.length === 0}
              >
                CSVエクスポート
              </Button>
            </div>

            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-border'>
                <thead className='bg-background-secondary'>
                  <tr>
                    <th
                      scope='col'
                      className='px-md py-sm text-left text-xs font-medium text-text-secondary uppercase tracking-wider'
                    >
                      URL
                    </th>
                    <th
                      scope='col'
                      className='px-md py-sm text-left text-xs font-medium text-text-secondary uppercase tracking-wider'
                    >
                      ステータス
                    </th>
                    <th
                      scope='col'
                      className='px-md py-sm text-left text-xs font-medium text-text-secondary uppercase tracking-wider'
                    >
                      メインカテゴリ
                    </th>
                    <th
                      scope='col'
                      className='px-md py-sm text-left text-xs font-medium text-text-secondary uppercase tracking-wider'
                    >
                      確信度
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-border'>
                  {results.results.map((result, index) => (
                    <tr key={index}>
                      <td className='px-md py-md whitespace-nowrap'>
                        <div className='text-sm text-text-primary'>
                          {result.url}
                          {result.from_cache && (
                            <span className='ml-sm text-xs bg-gray-100 text-gray-500 px-xs py-xs rounded'>
                              キャッシュ
                            </span>
                          )}
                        </div>
                      </td>
                      <td className='px-md py-md whitespace-nowrap'>
                        {result.status === "success" ? (
                          <span className='px-sm py-xs text-xs rounded-full bg-green-100 text-green-800'>
                            成功
                          </span>
                        ) : (
                          <span className='px-sm py-xs text-xs rounded-full bg-red-100 text-red-800'>
                            失敗
                          </span>
                        )}
                      </td>
                      <td className='px-md py-md whitespace-nowrap'>
                        <div className='text-sm text-text-primary'>
                          {result.analysis?.main_category || "-"}
                        </div>
                      </td>
                      <td className='px-md py-md whitespace-nowrap'>
                        {result.analysis?.confidence !== undefined ? (
                          <div className='text-sm text-text-primary'>
                            {Math.round(result.analysis.confidence * 100)}%
                          </div>
                        ) : (
                          <div className='text-sm text-text-secondary'>-</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BatchAnalysis;
