import Link from "next/link";
import {
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  CreditCard,
  Star,
  ScrollText,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";
import { getProducts } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";
import { getAdminOrders } from "@/lib/api/admin/orders";
import { getAdminUsers } from "@/lib/api/admin/users";
import { getAdminPayments } from "@/lib/api/admin/payments";
import { getAuditLogs } from "@/lib/api/admin/audit-log";
import { formatPrice, formatDate } from "@/lib/format";

const RECENT_LIMIT = 5;

async function getDashboardData() {
  const { headers } = await requireAuthHeaders();
  if (!headers) {
    return {
      counts: {
        products: null,
        categories: null,
        orders: null,
        users: null,
        payments: null,
        auditLog: null,
      },
      recentOrders: [],
      recentAuditLog: [],
    };
  }

  const [products, categories, orders, users, payments, auditLog] =
    await Promise.all([
      getProducts({ limit: 1 }),
      getCategories(),
      getAdminOrders({ limit: RECENT_LIMIT }, headers),
      getAdminUsers({ page: 1, pageSize: 1 }, headers),
      getAdminPayments({ limit: 1 }, headers),
      getAuditLogs({ limit: RECENT_LIMIT }, headers),
    ]);

  return {
    counts: {
      products: products?.meta.total ?? null,
      categories: categories?.meta.total ?? null,
      orders: orders?.meta.total ?? null,
      users: users?.meta.total ?? null,
      payments: payments?.meta.total ?? null,
      auditLog: auditLog?.meta.total ?? null,
    },
    recentOrders: orders?.data ?? [],
    recentAuditLog: auditLog?.data ?? [],
  };
}

export default async function AdminDashboardPage() {
  const { counts, recentOrders, recentAuditLog } = await getDashboardData();

  const quickLinks = [
    { name: "Products", href: "/admin/products", icon: Package, description: "Manage catalog products, stock, and pricing.", count: counts.products },
    { name: "Categories", href: "/admin/categories", icon: FolderTree, description: "Manage product categories.", count: counts.categories },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart, description: "View and update customer orders.", count: counts.orders },
    { name: "Users", href: "/admin/users", icon: Users, description: "Manage user accounts and roles.", count: counts.users },
    { name: "Payments", href: "/admin/payments", icon: CreditCard, description: "View payments and issue refunds.", count: counts.payments },
    { name: "Reviews", href: "/admin/reviews", icon: Star, description: "Browse and moderate product reviews.", count: null },
    { name: "Audit Log", href: "/admin/audit-log", icon: ScrollText, description: "View a history of admin actions.", count: counts.auditLog },
  ];

  return (
    <div>
      <AdminHeader title="Dashboard" />
      <div className="px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-muted/20 p-8 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <link.icon className="h-6 w-6 text-foreground" />
                {link.count !== null && (
                  <span className="text-2xl font-light text-foreground">
                    {link.count.toLocaleString()}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-light text-foreground mb-1">{link.name}</h2>
              <p className="text-sm text-muted-foreground">{link.description}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-muted/20 p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-light text-foreground">Recent Orders</h2>
              <Link href="/admin/orders" className="text-sm text-muted-foreground hover:underline">
                View all
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between text-sm hover:underline"
                  >
                    <span className="text-foreground">#{order.orderNumber}</span>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <span className="text-muted-foreground">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-muted/20 p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-light text-foreground">Recent Admin Activity</h2>
              <Link href="/admin/audit-log" className="text-sm text-muted-foreground hover:underline">
                View all
              </Link>
            </div>
            {recentAuditLog.length === 0 ? (
              <p className="text-sm text-muted-foreground">No admin activity yet.</p>
            ) : (
              <div className="space-y-3">
                {recentAuditLog.map((entry) => (
                  <div key={entry.id} className="text-sm">
                    <p className="text-foreground">
                      {entry.actorEmail} — {entry.action.toLowerCase().replaceAll("_", " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(entry.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
