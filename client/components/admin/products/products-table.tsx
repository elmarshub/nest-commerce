"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { deleteProduct } from "@/lib/admin/products/actions";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

export function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    const result = await deleteProduct(id);
    if (result.error) {
      toast.error("Couldn't delete product", { description: result.error });
      return;
    }
    toast.success("Product deleted");
    router.refresh();
  };

  if (products.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        No products found.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16"></TableHead>
          <TableHead>Name</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <div className="relative h-10 w-10 bg-muted overflow-hidden">
                {product.imageUrl && (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                )}
              </div>
            </TableCell>
            <TableCell className="font-medium text-foreground">
              {product.name}
            </TableCell>
            <TableCell className="text-muted-foreground">{product.sku}</TableCell>
            <TableCell className="text-muted-foreground">
              {product.category.name}
            </TableCell>
            <TableCell>{formatPrice(product.price)}</TableCell>
            <TableCell>{product.stock}</TableCell>
            <TableCell>
              <Badge
                variant="secondary"
                className={cn(
                  "rounded-none",
                  product.isActive && "bg-green-100 text-green-800",
                )}
              >
                {product.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon-sm" asChild>
                  <Link href={`/admin/products/${product.id}`}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <ConfirmDeleteDialog
                  title="Delete this product?"
                  description={`"${product.name}" will be permanently deleted. This cannot be undone.`}
                  onConfirm={() => handleDelete(product.id)}
                  trigger={
                    <Button variant="ghost" size="icon-sm">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  }
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
