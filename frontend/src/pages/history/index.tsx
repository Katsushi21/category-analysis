import React, { useEffect, useState } from "react";
import Layout from "@/components/common/Layout";
import { getHistory, HistoryItem, HistoryResponse } from "@/services";
import HistoryList from "@/components/analysis/HistoryList";
import HistorySearchForm, {
  SearchParams,
} from "@/components/analysis/HistorySearchForm";
import LoadingIndicator from "@/components/common/LoadingIndicator";

const HistoryPage: React.FC = () => {
  const [historyData, setHistoryData] = useState<HistoryResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    urlContains: "",
    status: "all",
    mainCategory: "",
  });
  const ITEMS_PER_PAGE = 10;

  const fetchHistory = async (page: number, params: SearchParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getHistory(
        page,
        ITEMS_PER_PAGE,
        "timestamp_desc",
        params.status === "all" ? null : params.status,
        params.mainCategory || null,
        params.urlContains || null
      );
      setHistoryData(data);
    } catch (err) {
      console.error("履歴の取得に失敗しました", err);
      setError(
        "履歴データの取得中にエラーが発生しました。もう一度お試しください。"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(currentPage, searchParams);
  }, [currentPage]);

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    setCurrentPage(1); // 検索時は1ページ目に戻る
    fetchHistory(1, params);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const renderPagination = () => {
    if (!historyData || historyData.total <= ITEMS_PER_PAGE) return null;

    const totalPages = Math.ceil(historyData.total / ITEMS_PER_PAGE);

    return (
      <div className='flex justify-center mt-lg'>
        <div className='flex space-x-sm'>
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-md py-sm rounded-md ${
              currentPage === 1
                ? "bg-light-gray text-gray-400 cursor-not-allowed"
                : "bg-secondary text-white hover:bg-secondary-dark"
            }`}
          >
            前へ
          </button>

          <div className='flex items-center px-md'>
            <span>
              {currentPage} / {totalPages}
            </span>
          </div>

          <button
            onClick={() =>
              handlePageChange(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className={`px-md py-sm rounded-md ${
              currentPage === totalPages
                ? "bg-light-gray text-gray-400 cursor-not-allowed"
                : "bg-secondary text-white hover:bg-secondary-dark"
            }`}
          >
            次へ
          </button>
        </div>
      </div>
    );
  };

  return (
    <Layout title='解析履歴' activeLink='history'>
      <div className='container mx-auto px-md'>
        <div className='bg-white rounded-md shadow-sm p-lg mb-lg'>
          <h1 className='text-2xl font-bold mb-lg border-b pb-md'>解析履歴</h1>

          <HistorySearchForm onSearch={handleSearch} isLoading={isLoading} />

          {error && (
            <div className='bg-danger-light text-danger p-md rounded-md mb-lg'>
              {error}
            </div>
          )}

          {isLoading && !historyData ? (
            <div className='flex justify-center p-xl'>
              <LoadingIndicator />
            </div>
          ) : (
            <>
              <HistoryList
                items={historyData?.items || []}
                isLoading={isLoading}
              />
              {renderPagination()}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HistoryPage;
