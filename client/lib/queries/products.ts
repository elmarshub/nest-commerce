import { useQuery } from "@tanstack/react-query";
import type { Product } from "@/types/product";

async function fetchSearchResults(
  query: string,
  signal?: AbortSignal,
): Promise<Product[]> {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
    signal,
  });
  if (!response.ok) {
    throw new Error(`Search failed with status ${response.status}`);
  }
  const json: { data: Product[] } = await response.json();
  return json.data;
}

export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: ["products", "search", query],
    queryFn: ({ signal }) => fetchSearchResults(query, signal),
    enabled: query.trim().length > 0,
  });
}
