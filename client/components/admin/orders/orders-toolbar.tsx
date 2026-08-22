"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function OrdersToolbar({ statusOptions }: { statusOptions: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <Select
        value={searchParams.get("status") ?? "all"}
        onValueChange={(value) =>
          updateParams({ status: value === "all" ? undefined : value })
        }
      >
        <SelectTrigger className="w-48 rounded-none">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent className="rounded-none">
          <SelectItem value="all">All statuses</SelectItem>
          {statusOptions.map((option) => (
            <SelectItem key={option} value={option} className="capitalize">
              {option.toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        placeholder="Filter by user ID..."
        defaultValue={searchParams.get("userId") ?? ""}
        onBlur={(e) => updateParams({ userId: e.target.value || undefined })}
        className="w-64 rounded-none"
      />
    </div>
  );
}
