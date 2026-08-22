"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { uploadAvatar } from "@/lib/users/actions";
import type { CurrentUser } from "@/lib/auth/session";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function AvatarUploader({
  user,
  onUpdate,
}: {
  user: CurrentUser;
  onUpdate: (user: CurrentUser) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Unsupported file type", {
        description: "Please upload a JPEG, PNG, WEBP or GIF image",
      });
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      toast.error("Image too large", { description: "Max size is 5MB" });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const result = await uploadAvatar(formData);
      if (!result.user) {
        toast.error("Upload failed", { description: result.error ?? undefined });
        return;
      }
      onUpdate(result.user);
      toast.success("Avatar updated");
    } catch (err) {
      toast.error("Upload failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <UserAvatar email={user.email} avatarUrl={user.avatarUrl} size="lg" />
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
      </div>
      <div>
        <Button
          type="button"
          variant="outline"
          className="rounded-none"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="mr-2 h-4 w-4" />
          Change Photo
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          JPEG, PNG, WEBP or GIF. Max 5MB.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
