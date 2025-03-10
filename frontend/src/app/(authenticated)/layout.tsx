import React from "react";
import LogoIcon from "@/../public/logo.svg";
import BaseButton from "@/components/BaseButton";
import DoubleArrowIcon from "@/../public/icons/double-arrow.svg";
import BaseInput from "@/components/BaseInput";
import SearchIcon from "@/../public/icons/search.svg";
import DashboardIcon from "@/../public/icons/dashboard.svg";
import InfrastructureIcon from "@/../public/icons/infrastructure.svg";
import NavLink, { NavLinkProps } from "@/components/Sidebar/NavLink";
import BellIcon from "@/../public/icons/bell.svg";
import UserIcon from "@/../public/icons/user.svg";

type Props = {
  children: React.ReactNode;
};

export default function AuthenticatedLayout({ children }: Props) {
  const navLinks: NavLinkProps[] = [
    {
      icon: <DashboardIcon width={16} />,
      title: "Dashboard",
      subLinks: [],
    },
    {
      icon: <InfrastructureIcon width={16} />,
      title: "Infrastructure",
      subLinks: [
        { title: "Changelog", href: "#" },
        { title: "Changelog", href: "#" },
        { title: "Changelog", href: "#" },
      ],
    },
  ];

  return (
    <div className="flex">
      <header className="fixed top-0 left-0 ml-52 flex h-16 w-[calc(100%-13rem)] items-center justify-end border-b border-gray-700 bg-gray-800">
        <BaseButton
          icon={<BellIcon width={16} />}
          type="icon"
          className="mr-3"
        />
        <div className="border-l border-gray-700">
          <BaseButton
            type="icon"
            icon={<UserIcon width={16} />}
            className="rounded-none bg-transparent"
          >
            <div className="text-left">
              <p className="text-sm">Tim Witzdam</p>
              <span className="text-xs text-gray-500">Admin</span>
            </div>
          </BaseButton>
        </div>
      </header>
      <aside className="fixed top-0 left-0 h-full w-52 border-r border-gray-700 bg-gray-800">
        <div className="mb-6 flex items-center justify-between gap-3 p-3">
          <LogoIcon width={130} />
          <BaseButton icon={<DoubleArrowIcon width={12} />} type="icon" />
        </div>
        <div className="mb-3 px-3">
          <BaseInput
            placeholder="Search"
            leftIcon={<SearchIcon width={12} />}
          />
        </div>
        <div className="grid border-t border-gray-700">
          {navLinks.map((navLink, index) => (
            <NavLink key={index} {...navLink} />
          ))}
        </div>
      </aside>
      <main className="mt-16 ml-52">{children}</main>
    </div>
  );
}
