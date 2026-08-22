import { AuthModal } from "@/components/auth/auth-modal";
import { AuthHydrator } from "@/components/auth/auth-hydrator";
import type { CurrentUser } from "@/lib/auth/session";

export function AppShell({
  user,
  header,
  footer,
  children,
}: {
  user: CurrentUser | null;
  header: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AuthHydrator user={user} />
      {header}
      <main className="flex-1">{children}</main>
      {footer}
      <AuthModal />
    </div>
  );
}
