"use client";

import Image from "next/image";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { AdminUser } from "@/types/admin-user";

export function UserDetailsModal({ user }: { user: AdminUser }) {
  const name = user.firstName
    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
    : "—";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <Eye className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none">
        <DialogHeader>
          <DialogTitle className="font-light">User Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
              {user.avatarUrl && (
                <Image
                  src={user.avatarUrl}
                  alt={name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              )}
            </div>
            <div>
              <p className="font-medium text-foreground">{name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Role</p>
              <Badge variant="secondary" className="rounded-none mt-1">
                {user.role}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Joined</p>
              <p className="text-foreground">{formatDate(user.createdAt)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">User ID</p>
              <p className="text-foreground break-all text-xs">{user.id}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
