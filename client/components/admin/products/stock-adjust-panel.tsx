"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adjustProductStock } from "@/lib/admin/products/actions";

const OPERATIONS = [
  { value: "set", label: "Set to" },
  { value: "increment", label: "Increase by" },
  { value: "decrement", label: "Decrease by" },
] as const;

export function StockAdjustPanel({
  productId,
  currentStock,
}: {
  productId: string;
  currentStock: number;
}) {
  const router = useRouter();
  const [operation, setOperation] = useState<"set" | "increment" | "decrement">("set");
  const [quantity, setQuantity] = useState("0");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const parsed = Number(quantity);
    if (!Number.isInteger(parsed) || parsed < 0) {
      toast.error("Enter a valid, non-negative quantity");
      return;
    }

    setSubmitting(true);
    const result = await adjustProductStock(productId, parsed, operation);
    setSubmitting(false);

    if (!result.product) {
      toast.error("Failed to update stock", { description: result.error ?? undefined });
      return;
    }

    toast.success(`Stock updated to ${result.product.stock}`);
    router.refresh();
  };

  return (
    <div className="bg-muted/20 p-8 space-y-4">
      <h2 className="text-lg font-light text-foreground">Adjust Stock</h2>
      <p className="text-sm text-muted-foreground">
        Current stock: <span className="text-foreground">{currentStock}</span>
      </p>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <Label className="text-sm font-light">Operation</Label>
          <Select value={operation} onValueChange={(v) => setOperation(v as typeof operation)}>
            <SelectTrigger className="mt-2 w-40 rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              {OPERATIONS.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="quantity" className="text-sm font-light">
            Quantity
          </Label>
          <Input
            id="quantity"
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="mt-2 w-32 rounded-none"
          />
        </div>

        <Button onClick={handleSubmit} disabled={submitting} className="rounded-none">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Stock"}
        </Button>
      </div>
    </div>
  );
}
