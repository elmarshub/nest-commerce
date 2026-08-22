import Image from "next/image";
import { cn } from "@/lib/utils";

const FALLBACK_COLORS = [
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-violet-500",
];

function colorForEmail(email: string) {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}

const SIZE_CLASSES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-20 w-20 text-2xl",
} as const;

export function UserAvatar({
  email,
  avatarUrl,
  size = "md",
  className,
}: {
  email: string;
  avatarUrl?: string | null;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  const sizeClass = SIZE_CLASSES[size];

  if (avatarUrl) {
    return (
      <span
        className={cn(
          "relative inline-block shrink-0 overflow-hidden rounded-full bg-muted",
          sizeClass,
          className,
        )}
      >
        <Image
          src={avatarUrl}
          alt={email}
          fill
          sizes="80px"
          className="object-cover"
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white uppercase",
        colorForEmail(email),
        sizeClass,
        className,
      )}
    >
      {email.charAt(0)}
    </span>
  );
}
