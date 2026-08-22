"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

export function AuditLogToolbar() {
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
      <Input
        placeholder="Filter by action (e.g. USER_DELETED)..."
        defaultValue={searchParams.get("action") ?? ""}
        onBlur={(e) => updateParams({ action: e.target.value || undefined })}
        className="w-72 rounded-none"
      />
      <Input
        placeholder="Filter by actor ID..."
        defaultValue={searchParams.get("actorId") ?? ""}
        onBlur={(e) => updateParams({ actorId: e.target.value || undefined })}
        className="w-64 rounded-none"
      />
    </div>
  );
}
