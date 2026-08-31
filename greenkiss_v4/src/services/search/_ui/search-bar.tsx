import { Search } from "lucide-react";
import { Input } from "@/shared/ui/kit/input";

export const SearchBar = () => {
  return (
    <div className="hidden w-full md:flex items-center relative">
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
      <Input
        className="w-full pl-10 bg-secondary/50"
        placeholder="Поиск товаров..."
      />
    </div>
  );
};
