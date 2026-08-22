"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useAuthStore } from "@/lib/stores/auth-store";
import { AvatarUploader } from "@/components/account/avatar-uploader";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";

export function AdminProfileMenu() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const signOut = useAuthStore((state) => state.signOut);

  const [profileOpen, setProfileOpen] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-2 rounded-none px-2 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors duration-200 max-w-[70vw] sm:max-w-none"
            aria-label="Account"
          >
            <UserAvatar email={user.email} avatarUrl={user.avatarUrl} size="sm" />
            <span className="hidden sm:block text-sm font-medium text-foreground max-w-35 truncate">
              {fullName || user.email}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-none w-56">
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-medium text-foreground truncate">
              {fullName || user.email}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setProfileOpen(true)}>
            <UserIcon />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <ConfirmDeleteDialog
            title="Sign out?"
            description="You'll need to sign in again to access the admin dashboard."
            confirmLabel="Sign out"
            onConfirm={handleSignOut}
            trigger={
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => e.preventDefault()}
              >
                <LogOut />
                Sign out
              </DropdownMenuItem>
            }
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="rounded-none w-[calc(100vw-2rem)] sm:w-full sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-light">Your Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="bg-muted/20 p-4 sm:p-6">
              <h3 className="text-sm font-medium text-foreground mb-4">
                Profile Photo
              </h3>
              <AvatarUploader user={user} onUpdate={setUser} />
            </div>

            <div className="bg-muted/20 p-4 sm:p-6 space-y-3">
              <h3 className="text-sm font-medium text-foreground mb-2">
                Account Details
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="min-w-0">
                  <dt className="text-muted-foreground">Full Name</dt>
                  <dd className="text-foreground truncate">{fullName || "—"}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="text-foreground truncate">{user.email}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-muted-foreground">Role</dt>
                  <dd className="text-foreground">{user.role}</dd>
                </div>
              </dl>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
