"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { User, Package, LogOut, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/lib/stores/auth-store";
import { updateProfile } from "@/lib/users/actions";
import { formatPrice } from "@/lib/format";
import { profileSchema, type ProfileFormValues } from "@/lib/validation/account";
import { AddressesTab } from "@/components/account/addresses-tab";
import type { CurrentUser } from "@/lib/auth/session";
import type { Order } from "@/types/order";
import type { Address } from "@/types/address";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-muted text-muted-foreground",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-amber-100 text-amber-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function AccountTabs({
  user,
  orders,
  addresses,
}: {
  user: CurrentUser;
  orders: Order[];
  addresses: Address[];
}) {
  const router = useRouter();
  const signOut = useAuthStore((state) => state.signOut);
  const setUser = useAuthStore((state) => state.setUser);
  const [savingProfile, setSavingProfile] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
    },
  });

  const onSubmitProfile = async (data: ProfileFormValues) => {
    setSavingProfile(true);
    const result = await updateProfile(data);
    setSavingProfile(false);

    if (!result.user) {
      toast.error("Update failed", { description: result.error ?? undefined });
      return;
    }

    setUser(result.user);
    toast.success("Profile updated");
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <Tabs defaultValue="profile" className="space-y-8">
      <TabsList className="bg-muted/20 p-1 rounded-none">
        <TabsTrigger value="profile" className="rounded-none data-[state=active]:bg-background">
          <User className="h-4 w-4 mr-2" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="orders" className="rounded-none data-[state=active]:bg-background">
          <Package className="h-4 w-4 mr-2" />
          Orders
        </TabsTrigger>
        <TabsTrigger value="addresses" className="rounded-none data-[state=active]:bg-background">
          <MapPin className="h-4 w-4 mr-2" />
          Addresses
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-8">
        <form onSubmit={handleSubmit(onSubmitProfile)}>
          <div className="bg-muted/20 p-8 rounded-none space-y-6">
            <h2 className="text-lg font-light text-foreground">Personal Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName" className="text-sm font-light">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  className="mt-2 rounded-none"
                  placeholder="Enter your first name"
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName" className="text-sm font-light">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  className="mt-2 rounded-none"
                  placeholder="Enter your last name"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-light">
                  Email Address
                </Label>
                <Input
                  id="email"
                  value={user.email}
                  className="mt-2 rounded-none bg-muted/50"
                  disabled
                />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here</p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={!isDirty || savingProfile} className="rounded-none">
                {savingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </form>

        <div className="bg-muted/20 p-8 rounded-none">
          <h2 className="text-lg font-light text-foreground mb-4">Account Actions</h2>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="rounded-none border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="orders">
        <div className="bg-muted/20 p-8 rounded-none">
          <h2 className="text-lg font-light text-foreground mb-6">Order History</h2>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No orders yet</p>
              <Button onClick={() => router.push("/")} className="rounded-none">
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border border-muted-foreground/20 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order #{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
                          STATUS_STYLES[order.status] ?? STATUS_STYLES.PENDING
                        }`}
                      >
                        {order.status.toLowerCase()}
                      </span>
                      <span className="font-medium text-foreground">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-light text-foreground truncate">
                            {item.productName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <p className="font-medium text-foreground">{formatPrice(item.subtotal)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-muted-foreground/10">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p className="whitespace-pre-line">{order.shippingAddress}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="addresses">
        <AddressesTab initialAddresses={addresses} />
      </TabsContent>
    </Tabs>
  );
}
