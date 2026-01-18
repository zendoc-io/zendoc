import React from "react";
import Link from "next/link";

export type BaseButtonProps = {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  type?: "primary" | "icon";
  href?: string;
  newTab?: boolean;
  onClick?: () => void;
  buttonType?: "button" | "submit" | "reset";
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
};

export default function BaseButton({
  children,
  icon,
  iconPosition = "left",
  type = "primary",
  href,
  newTab = false,
  onClick,
  buttonType = "button",
  fullWidth = false,
  className,
  disabled = false,
}: BaseButtonProps) {
  let classes = {
    primary:
      "flex items-center justify-center gap-3 text-center rounded-lg bg-primary p-4 px-6 font-semibold text-white tracking-[0.016rem] hover:bg-primary-dark transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
    icon: "rounded-lg bg-gray-600 p-3 flex items-center justify-center gap-3 cursor-pointer hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  }[type];
  if (!fullWidth) {
    classes += " w-fit";
  }
  classes += ` ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        target={newTab ? "_blank" : "_self"}
      >
        {iconPosition === "left" && icon}
        {children}
        {iconPosition === "right" && icon}
      </Link>
    );
  }

  return (
    <button className={classes} onClick={onClick} type={buttonType} disabled={disabled}>
      {iconPosition === "left" && icon}
      {children}
      {iconPosition === "right" && icon}
    </button>
  );
}
