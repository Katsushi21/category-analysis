import React from "react";

interface SubCategory {
  name: string;
  confidence: number;
}

interface CategoryAnalysis {
  main_category: string;
  sub_categories: SubCategory[];
  confidence: number;
  description?: string;
  target_audience?: string;
  value_proposition?: string;
}

interface CategoryResultProps {
  analysis: CategoryAnalysis;
}

const CategoryResult: React.FC<CategoryResultProps> = ({ analysis }) => {
  // 確信度に基づいて色を決定
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.7) return "text-success";
    if (confidence >= 0.4) return "text-warning";
    return "text-danger";
  };

  // 確信度をパーセントに変換して表示
  const formatConfidence = (confidence: number): string => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <div className='category-analysis'>
      {/* メインカテゴリ */}
      <div className='bg-white rounded-md shadow-md p-md relative overflow-hidden border-l-4 border-primary mb-md'>
        <div className='text-primary font-semibold text-sm mb-xs'>
          メインカテゴリ
        </div>
        <div className='text-2xl font-semibold text-text-primary flex items-center justify-between'>
          <span>{analysis.main_category}</span>
          <span
            className={`text-base ${getConfidenceColor(analysis.confidence)}`}
          >
            確信度: {formatConfidence(analysis.confidence)}
          </span>
        </div>
      </div>

      {/* サブカテゴリ */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-md mb-lg'>
        {analysis.sub_categories.map((subCategory, index) => (
          <div
            key={index}
            className='bg-white rounded-md shadow-md p-md relative overflow-hidden border-l-4 border-secondary'
          >
            <div className='text-text-primary text-sm mb-xs'>サブカテゴリ</div>
            <div className='text-lg font-semibold text-text-primary mb-xs'>
              {subCategory.name}
            </div>
            <div
              className={`text-sm ${getConfidenceColor(
                subCategory.confidence
              )}`}
            >
              確信度: {formatConfidence(subCategory.confidence)}
            </div>
          </div>
        ))}
      </div>

      {/* 商材詳細セクション */}
      {analysis.description && (
        <div className='bg-white rounded-md shadow-md p-md mb-md'>
          <h3 className='text-base font-medium text-primary mb-xs flex items-center'>
            <i className='fas fa-info-circle text-secondary mr-sm'></i>
            商材の説明
          </h3>
          <p className='text-text-primary'>{analysis.description}</p>
        </div>
      )}

      {analysis.target_audience && (
        <div className='bg-white rounded-md shadow-md p-md mb-md'>
          <h3 className='text-base font-medium text-primary mb-xs flex items-center'>
            <i className='fas fa-users text-secondary mr-sm'></i>
            想定ターゲット
          </h3>
          <p className='text-text-primary'>{analysis.target_audience}</p>
        </div>
      )}

      {analysis.value_proposition && (
        <div className='bg-white rounded-md shadow-md p-md mb-md'>
          <h3 className='text-base font-medium text-primary mb-xs flex items-center'>
            <i className='fas fa-gem text-secondary mr-sm'></i>
            商材の価値
          </h3>
          <p className='text-text-primary'>{analysis.value_proposition}</p>
        </div>
      )}
    </div>
  );
};

export default CategoryResult;
