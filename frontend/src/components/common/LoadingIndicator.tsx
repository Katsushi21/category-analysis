import React from "react";

interface LoadingIndicatorProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  text?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = "md",
  fullScreen = false,
  text = "読み込み中...",
}) => {
  // サイズに基づくスタイル
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  if (fullScreen) {
    return (
      <div className='fixed inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-50'>
        <i
          className={`fas fa-spinner fa-spin ${sizeClasses[size]} text-primary mb-md`}
        ></i>
        {text && <p className='text-text-primary'>{text}</p>}
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center justify-center py-lg'>
      <i
        className={`fas fa-spinner fa-spin ${sizeClasses[size]} text-primary mb-md`}
      ></i>
      {text && <p className='text-text-primary'>{text}</p>}
    </div>
  );
};

export default LoadingIndicator;
