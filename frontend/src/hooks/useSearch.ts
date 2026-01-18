import { useState, useEffect } from "react";
import { apiFetch } from "@/utils/api";
import { ApiResponse } from "@/types/responses";

export interface ServerSearchResult {
  id: string;
  name: string;
  ip: string;
  status: string;
}

export interface VMSearchResult {
  id: string;
  name: string;
  hostServerName: string;
  ip: string;
  status: string;
}

export interface ServiceSearchResult {
  id: string;
  name: string;
  type: string;
  hostType: string;
  status: string;
}

export interface SearchResults {
  servers: ServerSearchResult[];
  vms: VMSearchResult[];
  services: ServiceSearchResult[];
}

export function useSearch(query: string, categories: string[], delay = 300) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [results, setResults] = useState<SearchResults>({
    servers: [],
    vms: [],
    services: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [query, delay]);

  // Fetch results when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults({ servers: [], vms: [], services: [] });
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const categoriesParam =
          categories.length > 0 ? categories.join(",") : "";
        const url = `/search?q=${encodeURIComponent(debouncedQuery)}${categoriesParam ? `&categories=${categoriesParam}` : ""}`;

        console.log('Search URL:', url);

        const response = await apiFetch<ApiResponse<SearchResults>>(url, {
          credentials: "include",
        });

        console.log('Search response:', response);

        if (response.data) {
          setResults(response.data);
        }
      } catch (err) {
        console.error('Search error:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, categories.join(",")]);

  return {
    results,
    isLoading,
    error,
  };
}
