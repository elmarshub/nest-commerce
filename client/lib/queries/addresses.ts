import { useQuery } from "@tanstack/react-query";
import type { Address } from "@/types/address";

async function fetchMyAddresses(): Promise<Address[]> {
  const response = await fetch("/api/addresses");
  const json: { data: Address[] } = await response.json();
  return json.data;
}

export function useMyAddresses(enabled: boolean) {
  return useQuery({
    queryKey: ["addresses", "me"],
    queryFn: fetchMyAddresses,
    enabled,
  });
}
