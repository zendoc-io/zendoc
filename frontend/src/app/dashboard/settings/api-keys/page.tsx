"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/utils/api";
import type { APIKey, Permission, CreateAPIKeyRequest } from "@/types/apikey";

type ApiResponse<T> = {
  status: string;
  data?: T;
};

export default function APIKeysPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string>("");
  const [createKeyName, setCreateKeyName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expiresInDays, setExpiresInDays] = useState<number | null>(30);

  useEffect(() => {
    loadApiKeys();
    loadPermissions();
  }, []);

  const loadApiKeys = async () => {
    try {
      const response = await apiFetch<ApiResponse<APIKey[]>>(
        "/user/api-keys",
        {
          credentials: "include",
        }
      );
      if (response.data) {
        setApiKeys(response.data);
      }
    } catch (error) {
      console.error("Failed to load API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const response = await apiFetch<ApiResponse<Permission[]>>(
        "/user/api-keys/permissions",
        {
          credentials: "include",
        }
      );
      if (response.data) {
        setPermissions(response.data);
        // Set default permissions
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
      alert("Please enter a name for the API key");
      return;
    }

    try {
      const requestBody: CreateAPIKeyRequest = {
        name: createKeyName,
        permissions: selectedPermissions,
        expiresInDays: expiresInDays,
      };

      const response = await apiFetch<ApiResponse<{ key: string }>>(
        "/user/api-keys",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(requestBody),
        }
      );

      if (response.data?.key) {
        setNewApiKey(response.data.key);
        setShowCreateModal(false);
        setShowSuccessModal(true);
        setCreateKeyName("");
        loadApiKeys();
      }
    } catch (error) {
      console.error("Failed to create API key:", error);
      alert("Failed to create API key. Please try again.");
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      return;
    }

    try {
      await apiFetch(`/user/api-keys/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      loadApiKeys();
    } catch (error) {
      console.error("Failed to revoke API key:", error);
      alert("Failed to revoke API key. Please try again.");
    }
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("API key copied to clipboard!");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  const formatRelativeTime = (dateString: string | null) => {
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

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your API keys for programmatic access
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Create New API Key
        </button>
      </div>

      <div className="space-y-4">
        {apiKeys.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500">No API keys yet. Create one to get started!</p>
          </div>
        ) : (
          apiKeys.map((key) => (
            <div
              key={key.id}
              className="rounded-lg border border-gray-200 bg-white p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{key.name}</h3>
                  <div className="mt-2 font-mono text-sm text-gray-600">
                    {key.maskedKey}
                  </div>
                  <div className="mt-3 flex gap-4 text-sm text-gray-500">
                    <span>
                      Last used: {formatRelativeTime(key.lastUsedAt)}
                    </span>
                    <span>
                      Expires: {key.expiresAt ? formatDate(key.expiresAt) : "Never"}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Created {formatDate(key.createdAt)}
                  </div>
                </div>
                <button
                  onClick={() => handleRevokeKey(key.id)}
                  className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-600 hover:bg-red-100"
                >
                  Revoke
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">Create New API Key</h2>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">Name</label>
              <input
                type="text"
                value={createKeyName}
                onChange={(e) => setCreateKeyName(e.target.value)}
                placeholder="e.g., Production API"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">Expiration</label>
              <select
                value={expiresInDays || ""}
                onChange={(e) =>
                  setExpiresInDays(e.target.value ? parseInt(e.target.value) : null)
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2"
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
              <div className="max-h-96 space-y-4 overflow-y-auto rounded-md border border-gray-300 p-4">
                {Object.entries(permissionsByCategory).map(([category, perms]) => (
                  <div key={category}>
                    <h3 className="mb-2 font-medium text-gray-700">{category}</h3>
                    <div className="space-y-2">
                      {perms.map((perm) => (
                        <label key={perm.value} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(perm.value)}
                            onChange={() => togglePermission(perm.value)}
                            className="h-4 w-4 rounded border-gray-300"
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
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateKeyName("");
                }}
                className="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateKey}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Create API Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold text-green-600">
              API Key Created Successfully!
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Save this key now - it won&apos;t be shown again!
            </p>

            <div className="mb-4 rounded-md bg-gray-100 p-3">
              <div className="flex items-center justify-between gap-2">
                <code className="flex-1 overflow-x-auto text-sm">{newApiKey}</code>
                <button
                  onClick={() => copyToClipboard(newApiKey)}
                  className="shrink-0 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-sm font-medium">This key has the following permissions:</p>
              <ul className="list-inside list-disc text-sm text-gray-600">
                {selectedPermissions.map((perm) => {
                  const permission = permissions.find((p) => p.value === perm);
                  return permission ? (
                    <li key={perm}>{permission.label}</li>
                  ) : null;
                })}
              </ul>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setNewApiKey("");
                  setSelectedPermissions(
                    permissions.filter((p) => p.isDefault).map((p) => p.value)
                  );
                }}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
