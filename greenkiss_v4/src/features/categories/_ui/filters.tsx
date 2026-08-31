import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";

type AdminCategoriesFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
};

export const AdminCategoriesFilters = ({
  search,
  onSearchChange,
  onCreateClick,
}: AdminCategoriesFiltersProps) => {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="categories-search"
          className="text-sm font-medium text-muted-foreground"
        >
          Поиск категорий
        </label>
        <Input
          id="categories-search"
          type="search"
          placeholder="Введите название категории..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full md:w-80"
        />
      </div>

      <div className="flex items-center justify-end">
        <Button type="button" onClick={onCreateClick}>
          Добавить категорию
        </Button>
      </div>
    </div>
  );
};
