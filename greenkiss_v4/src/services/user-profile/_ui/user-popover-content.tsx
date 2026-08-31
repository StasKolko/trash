"use client";

import { signIn, signOut, useSession } from "@/shared/lib/auth";
import { PopoverContent } from "@/shared/ui/kit/popover";
import { UserProfilePopoverAuthenticated } from "./user-profile-popover-authenticated";
import { UserProfilePopoverGuest } from "./user-profile-popover-guest";

export const UserPopoverContent = () => {
  const { data: session } = useSession();

  const handleSignIn = async () => {
    await signIn("yandex", { redirectTo: "/" });
  };

  const handleSignOut = async () => {
    await signOut({ redirectTo: "/" });
  };

  const isAuthenticated = !!session;

  return (
    <PopoverContent align="end" className="w-80">
      {isAuthenticated ? (
        <UserProfilePopoverAuthenticated
          onSignOut={handleSignOut}
          user={session?.user}
        />
      ) : (
        <UserProfilePopoverGuest onSignIn={handleSignIn} />
      )}
    </PopoverContent>
  );
};
