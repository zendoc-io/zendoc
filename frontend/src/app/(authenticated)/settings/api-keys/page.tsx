"use client";

import { useState, useEffect } from "react";
import BaseButton from "@/components/BaseButton";
import toast from "react-hot-toast";
import {
  useAPIKeys,
  createAPIKey as createAPIKeyAPI,
  revokeAPIKey as revokeAPIKeyAPI,
} from "@/hooks/useAPIKeys";
import { apiFetch } from "@/utils/api";
import DeleteConfirmModal from "@/components/modal/DeleteConfirmModal";

type Permission = {
  value: string;
  label: string;
  category: string;
  isDefault: boolean;
};

export default function ApiKeysPage() {
  const { apiKeys: fetchedKeys, isLoading, mutate } = useAPIKeys();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string>("");
  const [createKeyName, setCreateKeyName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expiresInDays, setExpiresInDays] = useState<number | null>(30);
  const [keyToRevoke, setKeyToRevoke] = useState<{ id: string; name: string } | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const response = await apiFetch<{ status: string; data: Permission[] }>(
        "/user/api-keys/permissions",
        { credentials: "include" }
      );
      if (response.data) {
        setPermissions(response.data);
        const defaults = response.data
          .filter((p) => p.isDefault)
          .map((p) => p.value);
        setSelectedPermissions(defaults);
      }
    } catch (error) {
      console.error("Failed to load permissions:", error);
    }
  };

  const handleCreateKey = async () => {
    if (!createKeyName.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }

    try {
      const response = await createAPIKeyAPI({
        name: createKeyName,
        permissions: selectedPermissions,
        expiresInDays: expiresInDays ?? undefined,
      });

      if (response.data?.key) {
        setNewApiKey(response.data.key);
        setShowCreateModal(false);
        setShowSuccessModal(true);
        setCreateKeyName("");
        mutate();
        toast.success("API key created successfully!");
      }
    } catch (error) {
      console.error("Failed to create API key:", error);
      toast.error("Failed to create API key. Please try again.");
    }
  };

  const handleRevokeClick = (id: string, name: string) => {
    setKeyToRevoke({ id, name });
  };

  const handleConfirmRevoke = async () => {
    if (!keyToRevoke) return;

    setIsRevoking(true);
    try {
      await revokeAPIKeyAPI(keyToRevoke.id);
      toast.success(`${keyToRevoke.name} has been revoked!`);
      mutate();
      setKeyToRevoke(null);
    } catch {
      toast.error("Failed to revoke API key");
    } finally {
      setIsRevoking(false);
    }
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${name} copied to clipboard!`);
  };

  const formatRelativeTime = (dateString: string | null | undefined) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  const permissionsByCategory = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="p-3">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl">API Keys</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your API keys for programmatic access
          </p>
        </div>
        <BaseButton onClick={() => setShowCreateModal(true)}>
          + Create new API key
        </BaseButton>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      ) : fetchedKeys.length === 0 ? (
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-12 text-center">
          <p className="text-gray-500">No API keys yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fetchedKeys.map((apiKey) => (
            <div
              key={apiKey.id}
              className="rounded-lg border border-gray-700 bg-gray-800 p-6"
            >
              <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-start">
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-semibold">{apiKey.name}</h3>
                  <code className="font-mono text-sm text-gray-500">
                    {apiKey.maskedKey}
                  </code>
                </div>
                <div className="flex gap-2">
                  <BaseButton
                    type="icon"
                    onClick={() => copyToClipboard(apiKey.maskedKey, apiKey.name)}
                    className="h-10"
                    title="Copy masked key"
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
                    onClick={() => handleRevokeClick(apiKey.id, apiKey.name)}
                    className="h-10 text-red hover:bg-red/10"
                    title="Revoke API key"
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

              <div className="mb-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
                <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2">
                    {new Date(apiKey.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Last used:</span>
                  <span className="ml-2">{formatRelativeTime(apiKey.lastUsedAt)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Expires:</span>
                  <span className="ml-2">
                    {apiKey.expiresAt ? formatDate(apiKey.expiresAt) : "Never"}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-500">Permissions:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {JSON.parse(apiKey.permissions || "[]").map((permission: string) => (
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-gray-800 p-6">
            <h2 className="mb-4 text-xl font-bold">Create New API Key</h2>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">Name</label>
              <input
                type="text"
                value={createKeyName}
                onChange={(e) => setCreateKeyName(e.target.value)}
                placeholder="e.g., Production API"
                className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">Expiration</label>
              <select
                value={expiresInDays || ""}
                onChange={(e) =>
                  setExpiresInDays(e.target.value ? parseInt(e.target.value) : null)
                }
                className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2"
              >
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="120">120 days</option>
                <option value="">Never</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">Permissions</label>
              <div className="max-h-96 space-y-4 overflow-y-auto rounded-md border border-gray-600 bg-gray-700 p-4">
                {Object.entries(permissionsByCategory).map(([category, perms]) => (
                  <div key={category}>
                    <h3 className="mb-2 font-medium text-gray-300">{category}</h3>
                    <div className="space-y-2">
                      {perms.map((perm) => (
                        <label key={perm.value} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(perm.value)}
                            onChange={() => togglePermission(perm.value)}
                            className="h-4 w-4 rounded border-gray-600"
                          />
                          <span className="text-sm">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <BaseButton
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateKeyName("");
                }}
                type="ghost"
              >
                Cancel
              </BaseButton>
              <BaseButton onClick={handleCreateKey}>
                Create API Key
              </BaseButton>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded-lg bg-gray-800 p-6">
            <h2 className="mb-4 text-xl font-bold text-green-500">
              API Key Created Successfully!
            </h2>
            <p className="mb-4 text-sm text-gray-400">
              Save this key now - it won&apos;t be shown again!
            </p>

            <div className="mb-4 rounded-md bg-gray-700 p-3">
              <div className="flex items-center justify-between gap-2">
                <code className="flex-1 overflow-x-auto text-sm">{newApiKey}</code>
                <BaseButton
                  onClick={() => copyToClipboard(newApiKey, "API Key")}
                  type="icon"
                >
                  Copy
                </BaseButton>
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-sm font-medium">This key has the following permissions:</p>
              <ul className="list-inside list-disc text-sm text-gray-400">
                {selectedPermissions.map((perm) => {
                  const permission = permissions.find((p) => p.value === perm);
                  return permission ? (
                    <li key={perm}>{permission.label}</li>
                  ) : null;
                })}
              </ul>
            </div>

            <div className="flex justify-end">
              <BaseButton
                onClick={() => {
                  setShowSuccessModal(false);
                  setNewApiKey("");
                  setSelectedPermissions(
                    permissions.filter((p) => p.isDefault).map((p) => p.value)
                  );
                }}
              >
                Done
              </BaseButton>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {keyToRevoke && (
        <DeleteConfirmModal
          title="Revoke API Key"
          message={`Are you sure you want to revoke "${keyToRevoke.name}"? This action cannot be undone.`}
          onConfirm={handleConfirmRevoke}
          onClose={() => setKeyToRevoke(null)}
          isLoading={isRevoking}
          confirmLabel="Revoke"
        />
      )}
    </div>
  );
}
