const backendURL = process.env.NEXT_PUBLIC_API_URL;

type FetchOptions = RequestInit;

// You can also define a generic type for response data if desired
export async function apiFetch<T = ApiResponse>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const url = `${backendURL}${endpoint}`;

  const response = await fetch(url, options);
  if (!response.ok) {
    // Handle error responses as needed
    throw new Error(`Error fetching ${url}: ${response.statusText}`);
  }
  const data: T = await response.json();
  return data;
}
