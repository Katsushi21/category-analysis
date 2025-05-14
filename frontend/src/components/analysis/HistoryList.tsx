import React from "react";
import Link from "next/link";
import { HistoryItem } from "@/services";

interface HistoryListProps {
  items: HistoryItem[];
  isLoading: boolean;
}

const HistoryList: React.FC<HistoryListProps> = ({ items, isLoading }) => {
  // 日付をフォーマットする関数
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className='animate-pulse'>
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className='bg-light-gray h-16 mb-md rounded-md'
          ></div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className='bg-light-gray p-lg rounded-md text-center'>
        <p className='text-gray-500'>解析履歴がありません</p>
      </div>
    );
  }

  return (
    <div className='space-y-md'>
      {items.map((item) => (
        <div
          key={item.id}
          className='bg-white rounded-md shadow-md p-md hover:shadow-lg transition-shadow duration-300'
        >
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-sm'>
            <div className='flex items-center mb-sm sm:mb-0'>
              <Link href={`/history/${item.id}`}>
                <h3 className='font-medium text-primary hover:underline'>
                  {item.url}
                </h3>
              </Link>
              <span
                className={`ml-md text-xs px-sm py-xs rounded-sm ${
                  item.status === "success"
                    ? "bg-success text-white"
                    : "bg-danger text-white"
                }`}
              >
                {item.status === "success" ? "成功" : "失敗"}
              </span>
            </div>
            <div className='text-sm text-gray-500'>
              {formatDate(item.timestamp)}
            </div>
          </div>

          {item.status === "success" && item.main_category && (
            <div className='flex flex-wrap gap-md'>
              <div className='flex items-center'>
                <span className='text-sm text-gray-500 mr-xs'>カテゴリ:</span>
                <span className='text-text-primary font-medium'>
                  {item.main_category}
                </span>
              </div>
              {item.confidence !== undefined && (
                <div className='flex items-center'>
                  <span className='text-sm text-gray-500 mr-xs'>確信度:</span>
                  <span className='text-text-primary'>
                    {Math.round(item.confidence * 100)}%
                  </span>
                </div>
              )}
            </div>
          )}

          {item.status === "failed" && item.error && (
            <div className='text-danger text-sm'>{item.error}</div>
          )}

          <div className='mt-md pt-sm border-t border-border flex justify-end'>
            <Link href={`/history/${item.id}`}>
              <button className='text-secondary text-sm hover:underline flex items-center'>
                <span>詳細を表示</span>
                <i className='fas fa-chevron-right ml-xs text-xs'></i>
              </button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryList;
