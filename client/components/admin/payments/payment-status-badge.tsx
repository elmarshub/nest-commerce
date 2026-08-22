import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-muted text-muted-foreground",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-amber-100 text-amber-800",
};

export function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn("rounded-none capitalize", STATUS_STYLES[status] ?? STATUS_STYLES.PENDING)}
    >
      {status.toLowerCase()}
    </Badge>
  );
}
