import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getMyOrders } from "@/lib/api/orders";
import { getMyAddresses } from "@/lib/api/addresses";
import { AccountTabs } from "@/components/account/account-tabs";

export default async function AccountPage() {
  const user = await getCurrentUser();

  // AccountLayout already redirects guests before this renders; this is
  // only to satisfy TypeScript that `user` is non-null below.
  if (!user) redirect("/");

  const [orders, addresses] = await Promise.all([
    getMyOrders(),
    getMyAddresses(),
  ]);

  const loadFailed = orders === null || addresses === null;

  return (
    <div className="pt-16 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-light text-foreground mb-2">My Account</h1>
        <p className="text-muted-foreground mb-8">
          Manage your profile and view your order history
        </p>

        {loadFailed && (
          <p className="mb-8 text-sm text-destructive">
            We couldn&apos;t load some of your account data. Please refresh to
            try again.
          </p>
        )}

        <AccountTabs
          user={user}
          orders={orders?.data ?? []}
          addresses={addresses ?? []}
        />
      </div>
    </div>
  );
}
