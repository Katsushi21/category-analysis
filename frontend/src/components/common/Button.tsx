import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  className = "",
  disabled,
  ...props
}) => {
  // バリアントに基づくスタイル
  const variantClasses = {
    primary: "bg-primary text-white hover:bg-opacity-90",
    secondary: "bg-secondary text-white hover:bg-opacity-90",
    outline:
      "bg-transparent border border-primary text-primary hover:bg-primary hover:bg-opacity-10",
  };

  // サイズに基づくスタイル
  const sizeClasses = {
    sm: "py-xs px-sm text-sm h-[32px]",
    md: "px-lg h-[46px]",
    lg: "py-lg px-xl text-lg",
  };

  return (
    <button
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        rounded-sm
        font-medium
        cursor-pointer
        transition-all
        duration-300
        flex
        items-center
        justify-center
        gap-sm
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <i className='fas fa-spinner fa-spin'></i>
          <span>処理中...</span>
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
