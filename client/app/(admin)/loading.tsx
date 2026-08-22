import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="px-6 py-8">
      <Skeleton className="mb-8 h-8 w-48" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
