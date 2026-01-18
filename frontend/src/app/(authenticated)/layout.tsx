"use client";

import React from "react";
import LogoIcon from "@/../public/logo.svg";
import BaseButton from "@/components/BaseButton";
import SettingsIcon from "@/../public/icons/settings.svg";
import BaseInput from "@/components/inputs/BaseInput";
import SearchIcon from "@/../public/icons/search.svg";
import DashboardIcon from "@/../public/icons/dashboard.svg";
import InfrastructureIcon from "@/../public/icons/infrastructure.svg";
import NavLink, { NavLinkProps } from "@/components/Sidebar/NavLink";
import BellIcon from "@/../public/icons/bell.svg";
import UserIcon from "@/../public/icons/user.svg";
import NotificationIndicator from "@/components/NotificationIndicator";
import GlobalSearchModal from "@/components/modal/GlobalSearchModal/GlobalSearchModal";
import Link from "next/link";
import { apiFetch } from "@/utils/api";
import { useNotifications, useUnreadCount, markAllAsRead } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

type Props = {
  children: React.ReactNode;
};

export default function AuthenticatedLayout({ children }: Props) {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = React.useState(false);
  
  const notificationsRef = React.useRef<HTMLDivElement>(null);
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  
  // Fetch real notifications data
  const { count: unreadCountValue } = useUnreadCount();
  const { notifications, mutate } = useNotifications({ limit: 5, unread: true });

  // Click-outside handler for notifications dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  // Click-outside handler for user menu dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    }

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const navLinks: NavLinkProps[] = [
    {
      icon: <DashboardIcon width={16} />,
      title: "Dashboard",
      slug: "",
      subLinks: [],
    },
    {
      icon: <InfrastructureIcon width={16} />,
      title: "Infrastructure",
      slug: "infrastructure",
      subLinks: [
        { title: "Servers", href: "servers" },
        { title: "Virtual machines", href: "virtual-machines" },
        { title: "Services", href: "services" },
      ],
    },
    {
      icon: <SettingsIcon width={16} />,
      title: "Settings",
      slug: "settings",
      subLinks: [
        { title: "Users", href: "users" },
        { title: "API Keys", href: "api-keys" },
        { title: "System", href: "system" },
      ],
    },
  ];

  async function handleMarkAllAsRead() {
    try {
      await markAllAsRead();
      // Refresh the notifications data
      mutate();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }

  async function logout() {
    try {
      await apiFetch("/auth/logout", {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <div className="flex">
      {showGlobalSearch && (
        <GlobalSearchModal onClose={() => setShowGlobalSearch(false)} />
      )}
      <header className="fixed top-0 left-0 z-10 ml-52 flex h-16 w-[calc(100%-13rem)] items-center justify-end border-b border-gray-700 bg-gray-800">
        <div className="relative mr-3" ref={notificationsRef}>
          <BaseButton
            icon={<BellIcon width={16} />}
            type="icon"
            onClick={() => setShowNotifications(!showNotifications)}
          />
          {unreadCountValue > 0 && (
            <NotificationIndicator count={unreadCountValue} />
          )}
          {showNotifications && (
            <div className="absolute top-11 right-0 w-80 rounded-lg border border-gray-700 bg-gray-800 text-left text-sm">
              <div className="flex items-center justify-between border-b border-gray-700 px-4 py-2">
                <span className="text-xs text-gray-500">
                  {unreadCountValue} unread
                </span>
                <BaseButton
                  type="icon"
                  className="text-xs font-semibold"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </BaseButton>
              </div>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`group block border-b border-gray-700 p-4 transition-colors hover:bg-gray-700`}
                  >
                    <div className="flex justify-between">
                      <span className="text-green text-xs uppercase">
                        {notification.type}
                      </span>
                      <span
                        className={`h-2 w-2 rounded-full ${notification.isRead ? "bg-gray-700" : "bg-red"}`}
                      ></span>
                    </div>
                    <p className="font-medium">{notification.title}</p>
                    <span className="text-gray-500">
                      {notification.message}
                    </span>
                    <br />
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No unread notifications
                </div>
              )}
              <div className="p-4">
                <BaseButton
                  type="icon"
                  href="/user/notifications"
                  className="text-xs font-semibold"
                >
                  View all notifications
                </BaseButton>
              </div>
            </div>
          )}
        </div>
        <div className="realative border-l border-gray-700" ref={userMenuRef}>
          <BaseButton
            type="icon"
            icon={<UserIcon width={16} />}
            className="rounded-none bg-transparent"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="text-left">
              <p className="text-sm">Tim Witzdam</p>
              <span className="text-xs text-gray-500">Admin</span>
            </div>
          </BaseButton>
          {showUserMenu && (
            <div className="absolute top-16 right-0 w-52 rounded-bl-lg border-b border-l border-gray-700 bg-gray-800 text-left text-sm">
              <div className="grid gap-2 p-2">
                <BaseButton
                  type="icon"
                  className="text-xs font-semibold"
                  href="/user"
                  fullWidth
                >
                  Settings
                </BaseButton>
                <BaseButton
                  type="icon"
                  className="text-red text-xs font-semibold"
                  fullWidth
                  onClick={logout}
                >
                  Log out
                </BaseButton>
              </div>
            </div>
          )}
        </div>
      </header>
      <aside className="fixed top-0 left-0 h-full w-52 border-r border-gray-700 bg-gray-800">
        <div className="mb-3 p-3">
          <Link href="/">
            <LogoIcon width={130} className="cursor-pointer" />
          </Link>
        </div>
        <div className="mb-3 px-3">
          <button
            type="button"
            onClick={() => setShowGlobalSearch(!showGlobalSearch)}
          >
            <BaseInput
              placeholder="Search"
              leftIcon={<SearchIcon width={12} />}
            />
          </button>
        </div>
        <div className="grid border-t border-gray-700">
          {navLinks.map((navLink, index) => (
            <NavLink key={index} {...navLink} />
          ))}
        </div>
      </aside>
      <main className="mt-16 ml-52 w-full">{children}</main>
    </div>
  );
}
