"use client";

import BaseInput from "@/components/inputs/BaseInput";
import BaseButton from "@/components/BaseButton";
import ToggleSwitch from "@/components/inputs/ToggleSwitch";
import toast from "react-hot-toast";
import { useState } from "react";
import { useUser } from "@/hooks/useUser";

export default function UserProfilePage() {
  const { user, isLoading } = useUser();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully!");
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0]?.toUpperCase() || "";
    const last = lastName?.[0]?.toUpperCase() || "";
    return first + last || "U";
  };

  const formatMemberSince = (dateString?: string) => {
    if (!dateString) return "...";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl p-3">
        <div className="p-8 text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-3">
      <h1 className="mb-6 text-2xl">Profile & Settings</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 text-center">
            {/* Avatar */}
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold">
              {getInitials(user?.firstName, user?.lastName)}
            </div>
            <h2 className="mb-1 text-xl font-semibold">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="mb-2 text-gray-500">{user?.email}</p>
            <span className="inline-block rounded bg-primary/20 px-3 py-1 text-sm text-primary">
              {user?.userType || "User"}
            </span>
            <div className="mt-6 border-t border-gray-700 pt-6">
              <p className="text-sm text-gray-500">
                Member since
                <br />
                <span className="text-white">{formatMemberSince(user?.createdAt)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Edit Profile and Preferences */}
        <div className="space-y-6 lg:col-span-2">
          {/* Edit Profile Form */}
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
            <h2 className="mb-4 text-xl">Edit Profile</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    First Name
                  </label>
                  <BaseInput value={user?.firstName || ""} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Last Name
                  </label>
                  <BaseInput value={user?.lastName || ""} />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Email
                </label>
                <BaseInput type="email" value={user?.email || ""} />
              </div>

              <hr className="my-6 border-gray-700" />

              <h3 className="mb-4 text-lg">Change Password</h3>
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Current Password
                </label>
                <BaseInput type="password" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  New Password
                </label>
                <BaseInput type="password" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Confirm Password
                </label>
                <BaseInput type="password" />
              </div>

              <div className="flex justify-end">
                <BaseButton buttonType="submit">Update Profile</BaseButton>
              </div>
            </form>
          </div>

          {/* Preferences Section */}
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
            <h2 className="mb-4 text-xl">Preferences</h2>
            <div className="space-y-4">
              {/* Theme toggle (disabled) */}
              <div className="flex cursor-not-allowed items-center justify-between opacity-50">
                <div>
                  <p className="font-semibold">Theme</p>
                  <p className="text-sm text-gray-500">
                    Dark (Light theme coming soon)
                  </p>
                </div>
                <ToggleSwitch checked disabled />
              </div>



              {/* Email notifications toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive email alerts</p>
                </div>
                <ToggleSwitch
                  checked={emailNotifications}
                  onChange={setEmailNotifications}
                />
              </div>

              {/* Desktop notifications toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Desktop Notifications</p>
                  <p className="text-sm text-gray-500">
                    Show browser notifications
                  </p>
                </div>
                <ToggleSwitch
                  checked={desktopNotifications}
                  onChange={setDesktopNotifications}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
