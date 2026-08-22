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
import { deleteCategory } from "@/lib/admin/categories/actions";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";

export function CategoriesTable({ categories }: { categories: Category[] }) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    const result = await deleteCategory(id);
    if (result.error) {
      toast.error("Couldn't delete category", { description: result.error });
      return;
    }
    toast.success("Category deleted");
    router.refresh();
  };

  if (categories.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        No categories found.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16"></TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Products</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell>
              <div className="relative h-10 w-10 bg-muted overflow-hidden">
                {category.imageUrl && (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                )}
              </div>
            </TableCell>
            <TableCell className="font-medium text-foreground">
              {category.name}
            </TableCell>
            <TableCell className="text-muted-foreground">{category.slug}</TableCell>
            <TableCell>{category.productCount}</TableCell>
            <TableCell>
              <Badge
                variant="secondary"
                className={cn(
                  "rounded-none",
                  category.isActive && "bg-green-100 text-green-800",
                )}
              >
                {category.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon-sm" asChild>
                  <Link href={`/admin/categories/${category.id}`}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <ConfirmDeleteDialog
                  title="Delete this category?"
                  description={`"${category.name}" will be permanently deleted. This cannot be undone.`}
                  onConfirm={() => handleDelete(category.id)}
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
