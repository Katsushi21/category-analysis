import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "@/components/common/Layout";
import { getHistoryItem, HistoryItem } from "@/services";
import LoadingIndicator from "@/components/common/LoadingIndicator";
import CategoryResult from "@/components/analysis/CategoryResult";

const HistoryDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [historyItem, setHistoryItem] = useState<HistoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoryItem = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);
      try {
        const data = await getHistoryItem(id as string);
        setHistoryItem(data);
      } catch (err) {
        console.error("履歴詳細の取得に失敗しました", err);
        setError(
          "履歴詳細の取得中にエラーが発生しました。もう一度お試しください。"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoryItem();
  }, [id]);

  // 日付をフォーマットする関数
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  if (isLoading) {
    return (
      <Layout title='解析履歴詳細' activeLink='history'>
        <div className='container mx-auto px-md'>
          <div className='flex justify-center items-center h-[50vh]'>
            <LoadingIndicator />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !historyItem) {
    return (
      <Layout title='解析履歴詳細' activeLink='history'>
        <div className='container mx-auto px-md'>
          <div className='bg-white rounded-md shadow-sm p-lg'>
            <Link href='/history'>
              <button className='text-secondary mb-lg flex items-center'>
                <i className='fas fa-arrow-left mr-xs'></i>
                <span>履歴一覧に戻る</span>
              </button>
            </Link>

            <div className='bg-danger-light text-danger p-md rounded-md'>
              {error || "履歴データが見つかりませんでした。"}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`解析履歴詳細 - ${historyItem.url}`} activeLink='history'>
      <div className='container mx-auto px-md'>
        <div className='bg-white rounded-md shadow-sm p-lg mb-lg'>
          <Link href='/history'>
            <button className='text-secondary mb-lg flex items-center'>
              <i className='fas fa-arrow-left mr-xs'></i>
              <span>履歴一覧に戻る</span>
            </button>
          </Link>

          <div className='mb-lg'>
            <h1 className='text-2xl font-bold mb-md border-b pb-md'>
              解析履歴詳細
            </h1>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-lg mt-lg'>
              <div>
                <h2 className='text-lg font-semibold mb-md'>基本情報</h2>

                <div className='space-y-sm'>
                  <div className='flex flex-col md:flex-row md:items-center'>
                    <span className='text-gray-500 w-32'>URL:</span>
                    <a
                      href={historyItem.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-primary break-all hover:underline'
                    >
                      {historyItem.url}
                    </a>
                  </div>

                  <div className='flex flex-col md:flex-row md:items-center'>
                    <span className='text-gray-500 w-32'>解析日時:</span>
                    <span>{formatDate(historyItem.timestamp)}</span>
                  </div>

                  <div className='flex flex-col md:flex-row md:items-center'>
                    <span className='text-gray-500 w-32'>ステータス:</span>
                    <span
                      className={`px-sm py-xs rounded-sm text-white ${
                        historyItem.status === "success"
                          ? "bg-success"
                          : "bg-danger"
                      }`}
                    >
                      {historyItem.status === "success" ? "成功" : "失敗"}
                    </span>
                  </div>

                  {historyItem.status === "success" &&
                    historyItem.main_category && (
                      <div className='flex flex-col md:flex-row md:items-center'>
                        <span className='text-gray-500 w-32'>
                          メインカテゴリ:
                        </span>
                        <span className='font-medium'>
                          {historyItem.main_category}
                        </span>
                      </div>
                    )}

                  {historyItem.status === "success" &&
                    historyItem.confidence !== undefined && (
                      <div className='flex flex-col md:flex-row md:items-center'>
                        <span className='text-gray-500 w-32'>確信度:</span>
                        <span>{Math.round(historyItem.confidence * 100)}%</span>
                      </div>
                    )}
                </div>
              </div>

              {historyItem.status === "success" && historyItem.analysis && (
                <div>
                  <h2 className='text-lg font-semibold mb-md'>詳細分析</h2>
                  <CategoryResult analysis={historyItem.analysis} />
                </div>
              )}

              {historyItem.status === "failed" && historyItem.error && (
                <div>
                  <h2 className='text-lg font-semibold mb-md text-danger'>
                    エラー詳細
                  </h2>
                  <div className='bg-danger-light p-md rounded-md'>
                    <p className='text-danger'>{historyItem.error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HistoryDetailPage;
