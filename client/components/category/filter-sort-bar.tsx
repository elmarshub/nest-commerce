"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const PRICE_RANGES = [
  { label: "Under $500", min: undefined, max: 500 },
  { label: "$500 - $800", min: 500, max: 800 },
  { label: "$800 - $1,000", min: 800, max: 1000 },
  { label: "Over $1,000", min: 1000, max: undefined },
] as const;

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name A-Z" },
];

export function FilterSortBar({ itemCount }: { itemCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sortBy = searchParams.get("sort") ?? "featured";
  const activeRange = searchParams.get("price");

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }

    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => updateParams({ price: undefined });

  return (
    <section className="w-full px-6 mb-8 border-b border-border pb-4">
      <div className="flex justify-between items-center">
        <p className="text-sm font-light text-muted-foreground">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>

        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="font-light hover:bg-transparent relative">
                Filters
                {activeRange && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-foreground rounded-full" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background border-none shadow-none">
              <SheetHeader className="mb-6 border-b border-border pb-4">
                <SheetTitle className="text-lg font-light">Filters</SheetTitle>
              </SheetHeader>

              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-light mb-4 text-foreground">Price</h3>
                  <div className="space-y-3">
                    {PRICE_RANGES.map((range) => (
                      <div key={range.label} className="flex items-center space-x-3">
                        <Checkbox
                          id={range.label}
                          checked={activeRange === range.label}
                          onCheckedChange={() =>
                            updateParams({
                              price: activeRange === range.label ? undefined : range.label,
                              minPrice: activeRange === range.label ? undefined : range.min?.toString(),
                              maxPrice: activeRange === range.label ? undefined : range.max?.toString(),
                            })
                          }
                          className="border-border data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
                        />
                        <Label htmlFor={range.label} className="text-sm font-light text-foreground cursor-pointer">
                          {range.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="border-border" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full border-none hover:bg-transparent hover:underline font-light text-left justify-start"
                >
                  Clear All
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <Select value={sortBy} onValueChange={(value) => updateParams({ sort: value })}>
            <SelectTrigger className="w-auto border-none bg-transparent text-sm font-light shadow-none rounded-none pr-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="shadow-none border-none rounded-none bg-background">
              {SORT_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="hover:bg-transparent hover:underline data-[state=checked]:bg-transparent data-[state=checked]:underline pl-2 [&>span:first-child]:hidden"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}
