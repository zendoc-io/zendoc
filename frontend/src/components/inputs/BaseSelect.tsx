import { ReactNode } from "react";

type Option = {
  value: string;
  label: string;
};

type Props = {
  id?: string;
  name?: string;
  value?: string;
  options: Option[];
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  leftIcon?: ReactNode;
};

export default function BaseSelect({
  id,
  name,
  value,
  options,
  onChange,
  placeholder = "Select...",
  required = false,
  disabled = false,
  className = "",
  leftIcon,
}: Props) {
  return (
    <div className={`relative ${className}`}>
      {leftIcon && (
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {leftIcon}
        </div>
      )}
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        disabled={disabled}
        className={`w-full appearance-none rounded-lg border border-transparent bg-gray-600 p-3 text-white transition-colors outline-none focus:border-gray-500 disabled:opacity-50 ${
          leftIcon ? "pl-10" : ""
        }`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
