"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/types/product";

export function ReviewsProductPicker({ products }: { products: Product[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <Select
      value={searchParams.get("productId") ?? undefined}
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("productId", value);
        router.push(`${pathname}?${params.toString()}`);
      }}
    >
      <SelectTrigger className="w-80 rounded-none">
        <SelectValue placeholder="Select a product to view its reviews" />
      </SelectTrigger>
      <SelectContent className="rounded-none">
        {products.map((product) => (
          <SelectItem key={product.id} value={product.id}>
            {product.name} ({product.reviewCount})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
