import React, { useState, useEffect } from "react";
import { getHistoryCategories } from "@/services";

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

export interface SearchParams {
  urlContains: string;
  status: string;
  mainCategory: string;
}

const HistorySearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  isLoading,
}) => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    urlContains: "",
    status: "all",
    mainCategory: "",
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsCategoryLoading(true);
      try {
        const categoryData = await getHistoryCategories();
        setCategories(categoryData);
      } catch (error) {
        console.error("カテゴリの取得に失敗しました", error);
      } finally {
        setIsCategoryLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  const handleReset = () => {
    const resetParams = {
      urlContains: "",
      status: "all",
      mainCategory: "",
    };
    setSearchParams(resetParams);
    onSearch(resetParams);
  };

  return (
    <form onSubmit={handleSubmit} className='mb-lg'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-md mb-md'>
        <div>
          <label
            htmlFor='urlContains'
            className='block text-sm font-medium mb-xs'
          >
            URL検索
          </label>
          <input
            type='text'
            id='urlContains'
            name='urlContains'
            value={searchParams.urlContains}
            onChange={handleChange}
            placeholder='URLを入力'
            className='w-full rounded-md border border-border px-md py-sm'
          />
        </div>

        <div>
          <label htmlFor='status' className='block text-sm font-medium mb-xs'>
            ステータス
          </label>
          <select
            id='status'
            name='status'
            value={searchParams.status}
            onChange={handleChange}
            className='w-full rounded-md border border-border px-md py-sm'
          >
            <option value='all'>すべて</option>
            <option value='success'>成功</option>
            <option value='failed'>失敗</option>
          </select>
        </div>

        <div>
          <label
            htmlFor='mainCategory'
            className='block text-sm font-medium mb-xs'
          >
            メインカテゴリ
          </label>
          <select
            id='mainCategory'
            name='mainCategory'
            value={searchParams.mainCategory}
            onChange={handleChange}
            className='w-full rounded-md border border-border px-md py-sm'
            disabled={isCategoryLoading}
          >
            <option value=''>すべてのカテゴリ</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {isCategoryLoading && (
            <div className='text-xs text-gray-500 mt-xs'>
              カテゴリを読み込み中...
            </div>
          )}
        </div>
      </div>

      <div className='flex justify-end space-x-sm'>
        <button
          type='button'
          onClick={handleReset}
          className='px-lg py-sm rounded-md bg-light-gray text-gray-700 hover:bg-gray-300 transition-colors'
        >
          リセット
        </button>
        <button
          type='submit'
          disabled={isLoading}
          className='bg-primary text-white px-lg py-sm rounded-md hover:bg-primary-dark transition-colors disabled:opacity-70'
        >
          {isLoading ? "検索中..." : "検索"}
        </button>
      </div>
    </form>
  );
};

export default HistorySearchForm;
