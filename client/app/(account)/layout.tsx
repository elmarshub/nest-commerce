import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/header/site-header";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/");

  return (
    <AppShell user={user} header={<SiteHeader />}>
      {children}
    </AppShell>
  );
}
