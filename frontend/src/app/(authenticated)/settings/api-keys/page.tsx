"use client";

import BaseButton from "@/components/BaseButton";
import toast from "react-hot-toast";
import {
  useAPIKeys,
  revokeAPIKey as revokeAPIKeyAPI,
} from "@/hooks/useAPIKeys";

interface ApiKey {
  id: string;
  name: string;
  maskedKey: string;
  fullKey: string;
  createdDate: string;
  lastUsed: string;
  permissions: string[];
}

export default function ApiKeysPage() {
  // Fetch API keys from backend
  const { apiKeys: fetchedKeys, isLoading, mutate } = useAPIKeys();

  const handleRevoke = async (id: string, name: string) => {
    try {
      await revokeAPIKeyAPI(id);
      toast.error(`${name} has been revoked!`);
      mutate(); // Revalidate data
    } catch {
      toast.error("Failed to revoke API key");
    }
  };

  // Fallback to hardcoded data if API fails
  const apiKeys: ApiKey[] = fetchedKeys.length > 0 ? fetchedKeys.map((key) => ({
    id: key.id,
    name: key.name,
    maskedKey: key.maskedKey,
    fullKey: "****", // Never available after creation
    createdDate: new Date(key.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    lastUsed: key.lastUsedAt
      ? new Date(
          key.lastUsedAt as unknown as string,
        ).toLocaleDateString()
      : "Never",
    permissions: JSON.parse(key.permissions || "[]"),
  })) : [
    {
      id: "1",
      name: "Production API Key",
      maskedKey: "sk_live_•••••••••••1234",
      fullKey: "sk_live_abc123def456ghi789",
      createdDate: "Jan 15, 2026",
      lastUsed: "2 hours ago",
      permissions: ["Read", "Write"],
    },
    {
      id: "2",
      name: "Development API Key",
      maskedKey: "sk_test_•••••••••••5678",
      fullKey: "sk_test_xyz789uvw456rst123",
      createdDate: "Jan 10, 2026",
      lastUsed: "Yesterday",
      permissions: ["Read"],
    },
    {
      id: "3",
      name: "CI/CD Pipeline Key",
      maskedKey: "sk_live_•••••••••••9012",
      fullKey: "sk_live_mno345pqr678stu901",
      createdDate: "Jan 5, 2026",
      lastUsed: "5 minutes ago",
      permissions: ["Read", "Deploy"],
    },
  ];

  const copyToClipboard = (key: string, name: string) => {
    navigator.clipboard.writeText(key);
    toast.success(`${name} copied to clipboard!`);
  };

  return (
    <div className="p-3">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl">API Keys</h1>
        <BaseButton onClick={() => toast("Feature coming soon!")}>
          + Create new API key
        </BaseButton>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <div
            key={apiKey.id}
            className="rounded-lg border border-gray-700 bg-gray-800 p-6"
          >
            <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-start">
              <div className="flex-1">
                <h3 className="mb-1 text-lg font-semibold">{apiKey.name}</h3>
                <code className="text-sm font-mono text-gray-500">
                  {apiKey.maskedKey}
                </code>
              </div>
              <div className="flex gap-2">
                <BaseButton
                  type="icon"
                  onClick={() => copyToClipboard(apiKey.maskedKey, apiKey.name)}
                  className="h-10"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </BaseButton>
                <BaseButton
                  type="icon"
                  onClick={() => handleRevoke(apiKey.id, apiKey.name)}
                  className="h-10 text-red hover:bg-red/10"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </BaseButton>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div>
                <span className="text-gray-500">Created:</span>
                <span className="ml-2">{apiKey.createdDate}</span>
              </div>
              <div>
                <span className="text-gray-500">Last used:</span>
                <span className="ml-2">{apiKey.lastUsed}</span>
              </div>
            </div>

            <div>
              <span className="text-sm text-gray-500">Permissions:</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {apiKey.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="rounded bg-gray-700 px-3 py-1 text-sm"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
