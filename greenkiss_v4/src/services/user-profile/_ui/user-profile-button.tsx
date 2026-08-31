import { Button } from "@/shared/ui/kit/button";
import { Popover, PopoverTrigger } from "@/shared/ui/kit/popover";

import { UserAvatar } from "./user-avatar";
import { UserPopoverContent } from "./user-popover-content";

export const UserProfileButton = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="relative" size="icon" variant="ghost">
          <UserAvatar className="h-8 w-8" />
        </Button>
      </PopoverTrigger>

      <UserPopoverContent />
    </Popover>
  );
};
