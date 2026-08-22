import { CheckoutHeader } from "@/components/header/checkout-header";
import { SiteFooter } from "@/components/footer/site-footer";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth/session";

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <AppShell user={user} header={<CheckoutHeader />} footer={<SiteFooter />}>
      {children}
    </AppShell>
  );
}
