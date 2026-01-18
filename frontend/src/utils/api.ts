import { ApiResponse } from "@/types/responses";

const backendURL = process.env.NEXT_PUBLIC_API_URL;

type FetchOptions = RequestInit;

export async function apiFetch<T = ApiResponse>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const url = `${backendURL}${endpoint}`;

  const response = await fetch(url, {
    credentials: "include",
    ...options,
  });
  if (!response.ok) {
    console.error(`API Error: ${url} - ${response.status} ${response.statusText}`);
    throw new Error(`Error fetching ${url}: ${response.statusText}`);
  }
  const data: T = await response.json();
  console.log(`API Success: ${endpoint}`, data);
  return data;
}
