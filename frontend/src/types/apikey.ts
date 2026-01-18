export type Permission = {
  value: string;
  label: string;
  category: string;
  isDefault: boolean;
};

export type APIKey = {
  id: string;
  name: string;
  maskedKey: string;
  permissions: string; // JSON string of permission array
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export type CreateAPIKeyRequest = {
  name: string;
  permissions: string[];
  expiresInDays?: number | null;
};

export type CreateAPIKeyResponse = {
  key: string;
};
