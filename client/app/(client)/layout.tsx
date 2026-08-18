import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/footer/site-footer";
import { AuthModal } from "@/components/auth/auth-modal";
import { AuthHydrator } from "@/components/auth/auth-hydrator";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AuthHydrator user={user} />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <AuthModal />
    </div>
  );
}
