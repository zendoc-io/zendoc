"use client";

import BaseInput from "@/components/inputs/BaseInput";
import BaseButton from "@/components/BaseButton";
import ToggleSwitch from "@/components/inputs/ToggleSwitch";
import toast from "react-hot-toast";
import { useState } from "react";

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState({
    appName: "Zendoc",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    sessionTimeout: "30",
    enable2FA: false,
    passwordMinLength: true,
    passwordUppercase: true,
    passwordNumbers: true,
    passwordSpecialChars: false,
    smtpServer: "smtp.example.com",
    smtpPort: "587",
    emailNotifications: true,
    autoBackup: true,
    backupFrequency: "daily",
    retentionPeriod: "30",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="mx-auto max-w-4xl p-3">
      <h1 className="mb-6 text-2xl">System Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
          <h2 className="mb-4 text-xl">General Settings</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Application Name
                </label>
                <BaseInput
                  value={settings.appName}
                  onChange={(value) =>
                    setSettings({ ...settings, appName: value })
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Time Zone
                </label>
                <select
                  className="w-full rounded-lg border-transparent bg-gray-600 p-3 transition-colors duration-100 focus:border-gray-500"
                  value={settings.timezone}
                  onChange={(e) =>
                    setSettings({ ...settings, timezone: e.target.value })
                  }
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern (EST)</option>
                  <option value="PST">Pacific (PST)</option>
                  <option value="CET">Central European (CET)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Date Format
              </label>
              <select
                className="w-full rounded-lg border-transparent bg-gray-600 p-3 transition-colors duration-100 focus:border-gray-500"
                value={settings.dateFormat}
                onChange={(e) =>
                  setSettings({ ...settings, dateFormat: e.target.value })
                }
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
          <h2 className="mb-4 text-xl">Security Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Session Timeout (minutes)
              </label>
                <BaseInput
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(value) =>
                    setSettings({ ...settings, sessionTimeout: value })
                  }
                />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Enable Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">
                  Require 2FA for all users
                </p>
              </div>
              <ToggleSwitch
                checked={settings.enable2FA}
                onChange={(checked) =>
                  setSettings({ ...settings, enable2FA: checked })
                }
              />
            </div>
            <div>
              <p className="mb-3 font-semibold">Password Requirements</p>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer rounded border-gray-700 bg-gray-600 text-primary focus:ring-primary"
                    checked={settings.passwordMinLength}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        passwordMinLength: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm">Minimum 8 characters</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer rounded border-gray-700 bg-gray-600 text-primary focus:ring-primary"
                    checked={settings.passwordUppercase}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        passwordUppercase: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm">Require uppercase letters</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer rounded border-gray-700 bg-gray-600 text-primary focus:ring-primary"
                    checked={settings.passwordNumbers}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        passwordNumbers: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm">Require numbers</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer rounded border-gray-700 bg-gray-600 text-primary focus:ring-primary"
                    checked={settings.passwordSpecialChars}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        passwordSpecialChars: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm">Require special characters</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
          <h2 className="mb-4 text-xl">Email Settings</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  SMTP Server
                </label>
                <BaseInput
                  value={settings.smtpServer}
                  onChange={(value) =>
                    setSettings({ ...settings, smtpServer: value })
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  SMTP Port
                </label>
                <BaseInput
                  type="number"
                  value={settings.smtpPort}
                  onChange={(value) =>
                    setSettings({ ...settings, smtpPort: value })
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Email Notifications</p>
                <p className="text-sm text-gray-500">
                  Send email alerts to administrators
                </p>
              </div>
              <ToggleSwitch
                checked={settings.emailNotifications}
                onChange={(checked) =>
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Backup Settings */}
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
          <h2 className="mb-4 text-xl">Backup Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Automatic Backups</p>
                <p className="text-sm text-gray-500">
                  Enable scheduled backups
                </p>
              </div>
              <ToggleSwitch
                checked={settings.autoBackup}
                onChange={(checked) =>
                  setSettings({ ...settings, autoBackup: checked })
                }
              />
            </div>
            {settings.autoBackup && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Backup Frequency
                  </label>
                  <select
                    className="w-full rounded-lg border-transparent bg-gray-600 p-3 transition-colors duration-100 focus:border-gray-500"
                    value={settings.backupFrequency}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        backupFrequency: e.target.value,
                      })
                    }
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Retention Period (days)
                  </label>
                  <BaseInput
                    type="number"
                    value={settings.retentionPeriod}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        retentionPeriod: value,
                      })
                    }
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <BaseButton buttonType="submit">Save Changes</BaseButton>
        </div>
      </form>
    </div>
  );
}
