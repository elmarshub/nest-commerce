import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { UsersTable } from "@/components/admin/users/users-table";
import { Pagination } from "@/components/category/pagination";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";
import { getAdminUsers } from "@/lib/api/admin/users";
import { getRoles } from "@/lib/api/meta";
import { getCurrentUser } from "@/lib/auth/session";

const PAGE_SIZE = 20;

interface UsersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const query = await searchParams;
  const page = Number(query.page) || 1;

  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/");

  const { headers } = await requireAuthHeaders();
  const [users, roles] = await Promise.all([
    headers ? getAdminUsers({ page, pageSize: PAGE_SIZE }, headers) : null,
    getRoles(),
  ]);

  return (
    <div>
      <AdminHeader title="Users" />
      <div className="px-6 py-8">
        <UsersTable
          users={users?.data ?? []}
          roleOptions={roles ?? ["USER", "ADMIN", "DRIVER"]}
          currentUserId={currentUser.id}
        />
        {users && (
          <Pagination currentPage={page} totalPages={users.meta.totalPages} />
        )}
      </div>
    </div>
  );
}
