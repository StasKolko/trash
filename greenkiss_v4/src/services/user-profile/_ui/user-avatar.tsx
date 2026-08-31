"use client";

import { User } from "lucide-react";
import { useSession } from "@/shared/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/kit/avatar";
import { Skeleton } from "@/shared/ui/kit/skeleton";

export const UserAvatar = ({ className }: { className?: string }) => {
  const { data: session, status } = useSession();
  const isAuthenticated = !!session;
  const userInitials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  if (status === "loading") return <Skeleton className="h-full w-full" />;
  if (!isAuthenticated) return <User className="h-full w-full" />;

  return (
    <Avatar className={className}>
      <AvatarImage
        alt={session?.user?.name || ""}
        src={session?.user?.image || ""}
      />
      <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
    </Avatar>
  );
};
