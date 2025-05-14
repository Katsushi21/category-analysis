import React, { InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  helpText?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  icon,
  error,
  helpText,
  className = "",
  ...props
}) => {
  return (
    <div className='w-full mb-md'>
      {label && (
        <label className='block text-text-primary mb-xs font-medium'>
          {label}
        </label>
      )}
      <div className='relative'>
        {icon && (
          <div className='absolute left-md top-1/2 transform -translate-y-1/2 text-primary'>
            {icon}
          </div>
        )}
        <input
          className={`
            w-full
            h-[46px]
            px-md
            ${icon ? "pl-[38px]" : ""}
            border
            border-border
            rounded-sm
            text-text-primary
            transition-all
            focus:outline-none
            focus:border-secondary
            focus:shadow-[0_0_0_2px_rgba(45,125,210,0.2)]
            disabled:bg-light-gray
            disabled:cursor-not-allowed
            ${error ? "border-danger" : ""}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className='mt-xs text-danger text-sm'>{error}</p>}
      {helpText && !error && (
        <p className='mt-xs text-gray-500 text-sm'>{helpText}</p>
      )}
    </div>
  );
};

export default InputField;
