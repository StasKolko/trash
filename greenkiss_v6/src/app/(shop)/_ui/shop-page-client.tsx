"use client";

import {
  ChevronDown,
  Filter,
  Heart,
  ShoppingCart,
  Star,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { CategoryNode } from "@/shared/api/categories-types";
import type { CatalogProductListItem } from "@/shared/api/product-types";
import { Badge } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";
import { Card, CardContent, CardFooter } from "@/shared/ui/kit/card";
import { Checkbox } from "@/shared/ui/kit/checkbox";
import { Label } from "@/shared/ui/kit/label";
import { ScrollArea } from "@/shared/ui/kit/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";
import { Separator } from "@/shared/ui/kit/separator";
import { Slider } from "@/shared/ui/kit/slider";

type Props = {
  categoryTree: CategoryNode[];
  products: CatalogProductListItem[];
  page: number;
  totalPages: number;
  totalItems: number;
  sort: "newest" | "price_asc" | "price_desc";
  categoryFullPath?: string;
};

function flattenCategories(
  nodes: CategoryNode[],
  prefix = "",
): { id: string; label: string; fullPath: string }[] {
  return nodes.flatMap((n) => {
    const label = `${prefix}${n.name}`;
    const self = { id: n.id, label, fullPath: n.fullPath };
    const children = flattenCategories(n.children, `${prefix}— `);
    return [self, ...children];
  });
}

export const ShopPageClient = ({
  categoryTree,
  products,
  page,
  totalPages,
  totalItems,
  sort,
  categoryFullPath,
}: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Локальные фильтры пока декоративны (не идут в запрос)
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const demoColors = [
    { name: "Черный", value: "black", hex: "#000000" },
    { name: "Белый", value: "white", hex: "#FFFFFF" },
    { name: "Серый", value: "gray", hex: "#9CA3AF" },
    { name: "Красный", value: "red", hex: "#EF4444" },
    { name: "Синий", value: "blue", hex: "#3B82F6" },
    { name: "Зеленый", value: "green", hex: "#10B981" },
  ];

  const categoryOptions = useMemo(
    () => flattenCategories(categoryTree),
    [categoryTree],
  );

  const handleChangePage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    params.set("sort", sort);
    if (categoryFullPath) {
      params.set("category", categoryFullPath);
    }
    router.push(`/?${params.toString()}`);
  };

  const handleChangeSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.set("page", "1");
    if (categoryFullPath) {
      params.set("category", categoryFullPath);
    }
    router.push(`/?${params.toString()}`);
  };

  const handleClickCategory = (fullPath: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    params.set("sort", sort);
    if (fullPath) {
      params.set("category", fullPath);
    } else {
      params.delete("category");
    }
    router.push(`/?${params.toString()}`);
    setMobileFiltersOpen(false);
  };

  const FilterSidebar = ({ className }: { className?: string }) => (
    <div className={`${className} space-y-6`}>
      <div>
        <h3 className="text-lg font-semibold mb-4 text-foreground">Фильтры</h3>

        {/* Категории */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium text-foreground mb-3 block">
              Категории
            </Label>
            <ScrollArea className="h-56 rounded-md border border-border/40 bg-background/40">
              <div className="py-2 px-3 space-y-1">
                {categoryOptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-1.5">
                    Категории ещё не настроены.
                  </p>
                ) : (
                  <>
                    <button
                      className="w-full text-left text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md px-2 py-1.5 transition-colors"
                      onClick={() => handleClickCategory(null)}
                      type="button"
                    >
                      Все категории
                    </button>

                    <Separator className="my-1.5 opacity-40" />

                    <ul className="space-y-0.5">
                      {categoryOptions.map((category) => (
                        <li key={category.id}>
                          <button
                            className="cursor-pointer w-full flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
                            onClick={() =>
                              handleClickCategory(category.fullPath)
                            }
                            type="button"
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedCategories.includes(
                                  category.id,
                                )}
                                id={category.id}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedCategories((prev) =>
                                      prev.includes(category.id)
                                        ? prev
                                        : [...prev, category.id],
                                    );
                                  } else {
                                    setSelectedCategories((prev) =>
                                      prev.filter((c) => c !== category.id),
                                    );
                                  }
                                }}
                              />
                              <span>{category.label}</span>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </ScrollArea>
          </div>

          <Separator />

          {/* Цена — пока локальный фильтр без связи с сервером */}
          <div>
            <Label className="text-base font-medium text-foreground mb-3 block">
              Цена
            </Label>
            <div className="px-2">
              <Slider
                className="mb-4"
                max={1000}
                min={0}
                onValueChange={setPriceRange}
                step={10}
                value={priceRange}
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">₽{priceRange[0]}</span>
                <span className="text-muted-foreground">₽{priceRange[1]}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Размеры — декоративно */}
          <div>
            <Label className="text-base font-medium text-foreground mb-3 block">
              Размер
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map((size) => (
                <Button
                  className="w-full"
                  key={size}
                  onClick={() => {
                    if (selectedSizes.includes(size)) {
                      setSelectedSizes(selectedSizes.filter((s) => s !== size));
                    } else {
                      setSelectedSizes([...selectedSizes, size]);
                    }
                  }}
                  size="sm"
                  variant={selectedSizes.includes(size) ? "default" : "outline"}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Цвета — декоративно */}
          <div>
            <Label className="text-base font-medium text-foreground mb-3 block">
              Цвет
            </Label>
            <div className="space-y-2">
              {demoColors.map((color) => (
                <div className="flex items-center space-x-2" key={color.value}>
                  <Checkbox
                    checked={selectedColors.includes(color.value)}
                    id={color.value}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedColors([...selectedColors, color.value]);
                      } else {
                        setSelectedColors(
                          selectedColors.filter((c) => c !== color.value),
                        );
                      }
                    }}
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: color.hex }}
                    />
                    <Label
                      className="text-sm font-normal cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                      htmlFor={color.value}
                    >
                      {color.name}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Кнопки действий — сейчас только сброс локальных фильтров */}
          <div className="space-y-2 pt-4">
            <Button className="w-full" variant="default">
              Применить фильтры
            </Button>
            <Button
              className="w-full"
              onClick={() => {
                setSelectedCategories([]);
                setSelectedSizes([]);
                setSelectedColors([]);
                setPriceRange([0, 500]);
              }}
              variant="outline"
            >
              Сбросить
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const formatPrice = (cents: number | null) => {
    if (cents == null) return "—";
    return (cents / 100).toLocaleString("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Боковая панель - десктоп */}
        <aside className="hidden lg:block w-64 shrink-0">
          <Card className="sticky top-24 bg-card">
            <CardContent className="p-6">
              <FilterSidebar />
            </CardContent>
          </Card>
        </aside>

        {/* Мобильная боковая панель */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/50" />
            <div className="fixed left-0 top-0 h-full w-80 bg-background shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Фильтры</h2>
                <Button
                  onClick={() => setMobileFiltersOpen(false)}
                  size="icon"
                  variant="ghost"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <ScrollArea className="h-[calc(100vh-73px)]">
                <div className="p-6">
                  <FilterSidebar />
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        {/* Основная область с товарами */}
        <main className="flex-1">
          {/* Заголовок и сортировка */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                Коллекция одежды
              </h2>
              <p className="text-muted-foreground mt-1">
                Найдено {totalItems.toLocaleString("ru-RU")} товаров
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button
                className="lg:hidden"
                onClick={() => setMobileFiltersOpen(true)}
                size="sm"
                variant="outline"
              >
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
              </Button>
              <Select
                defaultValue={sort}
                onValueChange={(value) => handleChangeSort(value)}
              >
                <SelectTrigger className="w-[210px]">
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Новинки</SelectItem>
                  <SelectItem value="price_asc">
                    Цена: по возрастанию
                  </SelectItem>
                  <SelectItem value="price_desc">Цена: по убыванию</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Сетка товаров */}
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Товары ещё не созданы или не опубликованы.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card
                  className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 bg-card"
                  key={product.id}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                    {/* biome-ignore lint/performance/noImgElement: demo */}
                    <img
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                      src={product.imageUrl ?? ""}
                    />

                    {product.discountPercent && product.discountPercent > 0 && (
                      <Badge
                        className="absolute top-3 left-3"
                        variant="destructive"
                      >
                        -{Math.round(product.discountPercent)}%
                      </Badge>
                    )}

                    <Button
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      size="icon"
                      variant="secondary"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>

                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button className="w-full" variant="secondary">
                        Быстрый просмотр
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    {product.brandName && (
                      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
                        {product.brandName}
                      </p>
                    )}

                    {/* Рейтинг — пока пустой, можно заглушить */}
                    <div className="flex items-center gap-2 mb-2 opacity-60">
                      <div className="flex items-center">
                        {[0, 1, 2, 3, 4].map((item) => (
                          <Star
                            className="h-4 w-4 text-muted-foreground"
                            key={item}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-foreground">
                          {formatPrice(product.priceCents)}
                        </span>
                        {product.originalPriceCents &&
                          product.originalPriceCents >
                            (product.priceCents ?? 0) && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.originalPriceCents)}
                            </span>
                          )}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full" variant="outline">
                      <ShoppingCart className="h-4 w-4 mr-2" />В корзину
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2 items-center">
              <Button
                disabled={page <= 1}
                onClick={() => handleChangePage(page - 1)}
                size="icon"
                variant="outline"
              >
                <ChevronDown className="h-4 w-4 rotate-90" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  onClick={() => handleChangePage(p)}
                  size="icon"
                  variant={p === page ? "default" : "outline"}
                >
                  {p}
                </Button>
              ))}
              <Button
                disabled={page >= totalPages}
                onClick={() => handleChangePage(page + 1)}
                size="icon"
                variant="outline"
              >
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
