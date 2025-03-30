import React from "react";
import FilledChevronIcon from "@/../public/icons/filled-chevron.svg";

type Props = {
  index: number;
  name: string;
  sort: string | null;
  handleSort: (index: number) => void;
};

export default function TableHeader({ index, name, sort, handleSort }: Props) {
  return (
    <th
      key={index}
      onClick={() => handleSort(index)}
      className="cursor-pointer"
    >
      <div className="flex items-center gap-1 p-3">
        <span>{name}</span>
        <div>
          <FilledChevronIcon
            width={8}
            className={`mb-[2px] ${sort === "asc" ? "text-white" : "text-gray-500"}`}
          />
          <FilledChevronIcon
            width={8}
            transform="rotate(180)"
            className={`mt-[2px] ${sort === "desc" ? "text-white" : "text-gray-500"}`}
          />
        </div>
      </div>
    </th>
  );
}
