import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/footer/site-footer";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <AppShell user={user} header={<SiteHeader />} footer={<SiteFooter />}>
      {children}
    </AppShell>
  );
}
