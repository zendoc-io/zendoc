"use client";

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
import NotificationIndicator from "@/components/NotificationIndicator";

type Props = {
  children: React.ReactNode;
};

export default function AuthenticatedLayout({ children }: Props) {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifications, setNotifications] = React.useState([
    {
      id: 1,
      title: "New server has been detected",
      description: "IP: 192.168.69.42, assign it now",
      link: "/servers",
      type: "info",
      read: false,
      timestamp: new Date(),
    },
    {
      id: 2,
      title: "New server has been detected",
      description: "IP: 192.168.69.42, assign it now",
      type: "info",
      link: "/servers",
      read: true,
      timestamp: new Date(),
    },
    {
      id: 3,
      title: "New server has been detected",
      description: "IP: 192.168.69.42, assign it now",
      link: "/servers",
      type: "info",
      read: false,
      timestamp: new Date(),
    },
    {
      id: 4,
      title: "New server has been detected",
      description: "IP: 192.168.69.42, assign it now",
      type: "info",
      link: "/servers",
      read: true,
      timestamp: new Date(),
    },
    {
      id: 5,
      title: "New server has been detected",
      description: "IP: 192.168.69.42, assign it now",
      link: "/servers",
      type: "info",
      read: false,
      timestamp: new Date(),
    },
    {
      id: 6,
      title: "New server has been detected",
      description: "IP: 192.168.69.42, assign it now",
      type: "info",
      link: "/servers",
      read: true,
      timestamp: new Date(),
    },
  ]);
  const [showUserMenu, setShowUserMenu] = React.useState(true);

  const filteredNotifications = React.useMemo(() => {
    return notifications
      .sort((a, b) => {
        if (a.timestamp > b.timestamp) {
          return -1;
        }
        if (a.timestamp < b.timestamp) {
          return 1;
        }
        return 0;
      })
      .slice(0, 4);
  }, [notifications]);

  const unreadNotifications = React.useMemo(() => {
    return notifications.filter((notification) => !notification.read);
  }, [notifications]);

  const navLinks: NavLinkProps[] = [
    {
      icon: <DashboardIcon width={16} />,
      title: "Dashboard",
      slug: "dashboard",
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
  ];

  function markAsRead(notificationIds: number[]) {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notificationIds.includes(notification.id)
          ? { ...notification, read: true }
          : notification,
      ),
    );
  }

  return (
    <div className="flex">
      <header className="fixed top-0 left-0 z-10 ml-52 flex h-16 w-[calc(100%-13rem)] items-center justify-end border-b border-gray-700 bg-gray-800">
        <div className="relative mr-3">
          <BaseButton
            icon={<BellIcon width={16} />}
            type="icon"
            onClick={() => setShowNotifications(!showNotifications)}
          />
          {unreadNotifications.length > 0 && (
            <NotificationIndicator count={unreadNotifications.length} />
          )}
          {showNotifications && (
            <div className="absolute top-11 right-0 w-80 rounded-lg border border-gray-700 bg-gray-800 text-left text-sm">
              <div className="flex items-center justify-between border-b border-gray-700 px-4 py-2">
                <span className="text-xs text-gray-500">
                  {unreadNotifications.length} unread
                </span>
                <BaseButton
                  type="icon"
                  className="text-xs font-semibold"
                  onClick={() =>
                    markAsRead(unreadNotifications.map((n) => n.id))
                  }
                >
                  Mark all as read
                </BaseButton>
              </div>
              {filteredNotifications.map((notification, index) => (
                <a
                  key={notification.id}
                  href={notification.link}
                  className={`group block border-b border-gray-700 p-4 transition-colors hover:bg-gray-700`}
                >
                  <div className="flex justify-between">
                    <span className="text-green text-xs uppercase">
                      {notification.type}
                    </span>
                    <span
                      className={`h-2 w-2 rounded-full ${notification.read ? "bg-gray-700" : "bg-red"
                        }`}
                    ></span>
                  </div>
                  <p>{notification.title}</p>
                  <span className="text-gray-500">
                    {notification.description}
                  </span>
                  <br />
                  <span className="text-xs text-gray-500">
                    {notification.timestamp.toLocaleString()}
                  </span>
                </a>
              ))}
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
        <div className="realative border-l border-gray-700">
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
          <LogoIcon width={130} />
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
      <main className="mt-16 ml-52 w-full">{children}</main>
    </div>
  );
}
