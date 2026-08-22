const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-muted text-muted-foreground",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-amber-100 text-amber-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
        STATUS_STYLES[status] ?? STATUS_STYLES.PENDING
      }`}
    >
      {status.toLowerCase()}
    </span>
  );
}
