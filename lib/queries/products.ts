import { useQuery } from "@tanstack/react-query";
import type { Product } from "@/types/product";

async function fetchSearchResults(query: string): Promise<Product[]> {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  const json: { data: Product[] } = await response.json();
  return json.data;
}

export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: ["products", "search", query],
    queryFn: () => fetchSearchResults(query),
    enabled: query.trim().length > 0,
  });
}
