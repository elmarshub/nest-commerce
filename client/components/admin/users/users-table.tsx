"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { UserDetailsModal } from "@/components/admin/users/user-details-modal";
import { updateUserRole, deleteUser } from "@/lib/admin/users/actions";
import { formatDate } from "@/lib/format";
import type { AdminUser } from "@/types/admin-user";

export function UsersTable({
  users,
  roleOptions,
  currentUserId,
}: {
  users: AdminUser[];
  roleOptions: string[];
  currentUserId: string;
}) {
  const router = useRouter();

  const handleRoleChange = async (id: string, role: string) => {
    const result = await updateUserRole(
      id,
      role as "USER" | "ADMIN" | "DRIVER",
    );
    if (!result.user) {
      toast.error("Couldn't update role", {
        description: result.error ?? undefined,
      });
      return;
    }
    toast.success("Role updated");
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    const result = await deleteUser(id);
    if (result.error) {
      toast.error("Couldn't delete user", { description: result.error });
      return;
    }
    toast.success("User deleted");
    router.refresh();
  };

  if (users.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">No users found.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const isSelf = user.id === currentUserId;
          return (
            <TableRow key={user.id}>
              <TableCell className="font-medium text-foreground">
                {user.firstName
                  ? `${user.firstName} ${user.lastName ?? ""}`.trim()
                  : "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {user.email}
              </TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(value) => handleRoleChange(user.id, value)}
                  disabled={isSelf}
                >
                  <SelectTrigger className="w-32 rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    {roleOptions.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(user.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <UserDetailsModal user={user} />
                  <ConfirmDeleteDialog
                    title="Delete this user?"
                    description={`"${user.email}" will be permanently deleted. This cannot be undone.`}
                    onConfirm={() => handleDelete(user.id)}
                    trigger={
                      <Button variant="ghost" size="icon-sm" disabled={isSelf}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    }
                  />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
