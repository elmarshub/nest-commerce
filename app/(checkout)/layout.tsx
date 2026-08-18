import { CheckoutHeader } from "@/components/header/checkout-header";
import { SiteFooter } from "@/components/footer/site-footer";
import { AuthModal } from "@/components/auth/auth-modal";
import { AuthHydrator } from "@/components/auth/auth-hydrator";
import { getCurrentUser } from "@/lib/auth/session";

// TODO: duplicates (client)/layout.tsx's shell (auth hydration/modal)
// with a different header — worth extracting a shared <AppShell> once
// there's a third consumer, not before.
export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AuthHydrator user={user} />
      <CheckoutHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <AuthModal />
    </div>
  );
}
