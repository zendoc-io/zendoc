import React from "react";
import XMarkIcon from "@/../public/icons/x-mark.svg";

type Props = {
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
};

export default function BaseModal({ title, children, onClose }: Props) {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div
      className="fixed top-0 right-0 bottom-0 left-0 z-40 grid h-full w-full place-content-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="rounded-lg border-gray-700 bg-gray-800">
        {title && (
          <div className="flex items-center justify-between gap-6 border-b border-gray-700 p-3">
            <h2 className="text-lg font-medium">{title}</h2>
            <button
              className="cursor-pointer rounded-md p-2 transition-colors duration-100 hover:bg-gray-700"
              onClick={onClose}
            >
              <XMarkIcon width={16} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
