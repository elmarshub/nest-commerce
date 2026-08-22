import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.id}`} className="group flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-secondary">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-opacity group-hover:opacity-80"
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
