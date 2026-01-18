"use client";

import { useState, useRef, useEffect } from "react";
import ChevronIcon from "@/../public/icons/chevron.svg";

export type FilterOption = {
  value: string;
  label: string;
};

type Props = {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
};

export default function FilterDropdown({
  label,
  options,
  selected,
  onChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const displayLabel =
    selected.length === 0
      ? label
      : selected.length === 1
        ? selected[0]
        : `${label} (${selected.length})`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 text-sm transition-colors duration-100 hover:border-gray-600"
      >
        <span className="text-gray-300">{displayLabel}</span>
        <ChevronIcon
          width={12}
          className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-12 z-10 min-w-[200px] rounded-lg border border-gray-700 bg-gray-800 p-2 shadow-lg">
          <div className="max-h-60 space-y-1 overflow-y-auto">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 rounded p-2 transition-colors hover:bg-gray-700"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={() => toggleOption(option.value)}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
                />
                <span className="text-sm text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="mt-2 w-full rounded border-t border-gray-700 p-2 text-sm text-gray-400 hover:text-white"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
