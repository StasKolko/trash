"use client";

import { ShoppingCart } from "lucide-react";
import { Badge } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";

export const CartButton = () => {
  // TODO: Добавить логику подсчета товаров в корзине
  const cartItemsCount = 2;

  return (
    <Button className="relative" size="icon" variant="ghost">
      <ShoppingCart className="h-5 w-5" />
      {cartItemsCount > 0 && (
        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
          {cartItemsCount}
        </Badge>
      )}
    </Button>
  );
};
