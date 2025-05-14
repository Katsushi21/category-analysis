import React, { useState } from "react";
import { NextPage } from "next";
import Layout from "@/components/common/Layout";
import InputField from "@/components/common/InputField";
import Button from "@/components/common/Button";
import LoadingIndicator from "@/components/common/LoadingIndicator";
import CategoryResult from "@/components/analysis/CategoryResult";
import { analyzeUrl, AnalysisResponse } from "@/services";

const SingleAnalysis: NextPage = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [forceRefresh, setForceRefresh] = useState(false);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError("URLを入力してください");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await analyzeUrl(url, forceRefresh);
      setResult(response);

      if (response.from_cache) {
        console.log("キャッシュから結果を取得しました");
      }

      if (response.status !== "success") {
        setError(response.error || "解析に失敗しました");
      }
    } catch (e) {
      setError("解析中にエラーが発生しました。もう一度お試しください。");
      console.error("Error during analysis:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title='単一URL解析 - WebInsight Analytics'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-2xl font-semibold text-primary mb-lg'>
          単一URLの解析
        </h1>

        <form onSubmit={handleSubmit} className='mb-xl'>
          <div className='mb-md'>
            <InputField
              id='url'
              label='解析するURL'
              placeholder='https://example.com'
              value={url}
              onChange={handleUrlChange}
            />
          </div>

          <div className='flex items-center mb-md'>
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

          <Button type='submit' disabled={loading} className='w-full sm:w-auto'>
            分析開始
          </Button>
        </form>

        {loading && (
          <div className='text-center p-xl'>
            <LoadingIndicator />
            <p className='mt-md text-text-secondary'>
              URLを解析中です。しばらくお待ちください...
            </p>
          </div>
        )}

        {error && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-lg py-md rounded mb-xl'>
            {error}
          </div>
        )}

        {result && result.status === "success" && result.analysis && (
          <div className='border border-border rounded-lg overflow-hidden'>
            <div className='bg-background-secondary p-lg'>
              <h2 className='text-lg font-medium'>解析結果</h2>
              {result.from_cache && (
                <div className='text-sm text-text-secondary mt-xs'>
                  ※ この結果はキャッシュから取得されました
                </div>
              )}
            </div>
            <div className='p-lg'>
              <CategoryResult analysis={result.analysis} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SingleAnalysis;
