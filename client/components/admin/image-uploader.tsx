"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function ImageUploader({
  label,
  value,
  onChange,
  upload,
}: {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  upload: (formData: FormData) => Promise<{ url: string | null; error: string | null }>;
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
      const result = await upload(formData);
      if (!result.url) {
        toast.error("Upload failed", { description: result.error ?? undefined });
        return;
      }
      onChange(result.url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error("Upload failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Label className="text-sm font-light">{label}</Label>
      <div className="mt-2 flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-none border border-muted-foreground/20 bg-muted flex items-center justify-center">
          {value ? (
            <Image src={value} alt={label} fill sizes="96px" className="object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
        </div>

        <div className="flex flex-col items-start gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-none"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {value ? "Change Image" : "Upload Image"}
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-none text-destructive hover:text-destructive"
              disabled={uploading}
              onClick={() => onChange("")}
            >
              <X className="mr-1 h-3 w-3" />
              Remove
            </Button>
          )}
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, WEBP or GIF. Max 5MB.
          </p>
        </div>

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
