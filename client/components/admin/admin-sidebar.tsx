"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  CreditCard,
  Star,
  ScrollText,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { CurrentUser } from "@/lib/auth/session";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: FolderTree },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Audit Log", href: "/admin/audit-log", icon: ScrollText },
];

export function AdminSidebar({ user }: { user: CurrentUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const signOut = useAuthStore((state) => state.signOut);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4">
        <span className="text-lg font-light text-sidebar-foreground">Haven Admin</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} className="rounded-none">
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-2 px-4 py-4">
        <div className="text-sm font-light text-sidebar-foreground">
          {user.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : user.email}
        </div>
        <div className="text-xs text-sidebar-foreground/60">{user.email}</div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="rounded-none">
              <Link href="/">
                <ArrowLeft />
                <span>Back to store</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} className="rounded-none">
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
