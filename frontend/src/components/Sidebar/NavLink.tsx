"use client";
import React from "react";
import ChevronIcon from "@/../public/icons/chevron.svg";

export type NavLinkProps = {
  icon: React.ReactNode;
  title: string;
  subLinks?: { title: string; href: string }[];
};

export default function NavLink({ icon, title, subLinks }: NavLinkProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      {subLinks?.length ? (
        <div className="border-b border-gray-700">
          <button
            className="flex w-full cursor-pointer items-center justify-between px-3 py-4 font-medium transition-colors duration-100 hover:bg-gray-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-2">
              {icon}
              <span>{title}</span>
            </div>
            <ChevronIcon
              width={12}
              transform={isOpen ? "rotate(180)" : ""}
              className="transition-transform duration-100"
            />
          </button>
          <div
            className={`relative ml-4 grid max-h-0 text-sm opacity-0 transition-all duration-100 before:absolute before:-z-10 before:h-full before:w-[3px] before:bg-gray-700 ${isOpen ? "pointer-events-auto mb-4 max-h-64 opacity-100" : "pointer-events-none"}`}
          >
            {subLinks.map((subLink, index) => (
              <a
                key={index}
                href={subLink.href}
                className="border-l-3 border-transparent py-2 pl-4 text-gray-500 transition-colors duration-100 hover:border-white hover:text-white"
              >
                {subLink.title}
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="border-b border-gray-700">
          <a
            href="#"
            className="flex items-center gap-2 p-3 py-4 font-medium transition-colors duration-100 hover:bg-gray-700"
          >
            {icon}
            <span>{title}</span>
          </a>
        </div>
      )}
    </div>
  );
}
