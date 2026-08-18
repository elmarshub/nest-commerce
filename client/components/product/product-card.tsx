import Link from "next/link";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.id}`} className="group flex flex-col gap-3">
      <div className="aspect-square w-full overflow-hidden rounded-md bg-secondary">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote product photography domains aren't finalized yet
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-opacity group-hover:opacity-80"
          />
        ) : null}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">
          {product.category.name}
        </span>
        <span className="text-sm">{product.name}</span>
        <span className="text-sm text-muted-foreground">
          {formatPrice(product.price)}
        </span>
      </div>
    </Link>
  );
}
