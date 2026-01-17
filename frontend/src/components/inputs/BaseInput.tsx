"use client";
import React, { ReactNode, Ref } from "react";

type Props = {
  id?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  name?: string;
  required?: boolean;
  onChange?: (value: string) => void;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  ref?: Ref<HTMLInputElement>;
};

export default function BaseInput({
  id,
  placeholder,
  type = "text",
  value,
  name,
  required,
  onChange,
  leftIcon,
  rightIcon,
  className,
  ref,
}: Props) {
  return (
    <div className="relative w-full">
      {leftIcon && (
        <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
          {leftIcon}
        </div>
      )}
      <input
        id={id}
        className={`w-full rounded-lg border border-transparent bg-gray-600 p-3 transition-colors outline-none focus:border-gray-500 ${
          leftIcon ? "pl-8" : ""
        } ${rightIcon ? "pr-8" : ""} ${className}`}
        type={type}
        value={value !== undefined ? value : undefined}
        name={name}
        required={required}
        placeholder={placeholder}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (onChange) {
            onChange(e.target.value);
          }
        }}
        ref={ref}
      />
      {rightIcon && (
        <div className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">
          {rightIcon}
        </div>
      )}
    </div>
  );
}
