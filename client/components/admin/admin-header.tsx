import { SidebarTrigger } from "@/components/ui/sidebar";

export function AdminHeader({
  title,
  actions,
}: {
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-6 py-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="rounded-none" />
        <h1 className="text-xl font-light text-foreground">{title}</h1>
      </div>
      {actions}
    </header>
  );
}
