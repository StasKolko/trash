"use client";

import { Heart } from "lucide-react";
import { Badge } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";

export const FavoritesButton = () => {
  // TODO: Добавить логику подсчета избранных товаров
  const favoritesCount = 3;

  return (
    <Button className="relative" size="icon" variant="ghost">
      <Heart className="h-5 w-5" />
      {favoritesCount > 0 && (
        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
          {favoritesCount}
        </Badge>
      )}
    </Button>
  );
};
