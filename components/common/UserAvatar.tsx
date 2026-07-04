import { cn, getInitials } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  image?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-7 h-7 text-[10px]",
  md: "w-9 h-9 text-xs",
  lg: "w-12 h-12 text-sm",
};

export function UserAvatar({
  name,
  image,
  size = "md",
  className,
}: UserAvatarProps) {
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={cn("rounded-lg object-cover", sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-semibold text-primary",
        sizes[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
