"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Edit3,
  Filter,
  Search as SearchIcon,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import type {
  BrandListItem,
  CreateBrandInput,
  UpdateBrandInput,
} from "@/shared/api/brands-types";
import {
  createBrandInputSchema,
  updateBrandInputSchema,
} from "@/shared/api/brands-types";
import { Badge } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/kit/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/kit/dialog";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";
import { Separator } from "@/shared/ui/kit/separator";
import { OnlyDevCard } from "@/shared/ui/only-dev-card";
import {
  createBrandAction,
  deleteAllTestBrandsAction,
  deleteBrandAction,
  generateTestBrandsAction,
  listBrandProductsAction,
  listBrandsAction,
  restoreBrandAction,
  updateBrandAction,
} from "../_actions";

type StatusFilter = "all" | "active" | "hidden";

type EditDialogState = { open: false } | { open: true; brand: BrandListItem };

type DeleteDialogState = {
  open: boolean;
  brand: BrandListItem | null;
  loadingProducts: boolean;
  products: { id: string; name: string; slug: string }[];
};

export const BrandAdminPage = () => {
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState<BrandListItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [editDialog, setEditDialog] = useState<EditDialogState>({
    open: false,
  });
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    brand: null,
    loadingProducts: false,
    products: [],
  });

  const createForm = useForm<CreateBrandInput>({
    resolver: zodResolver(createBrandInputSchema) as never,
    defaultValues: {
      name: "",
      imageAssetId: undefined,
      status: "active",
      isTest: false,
    },
  });

  const editForm = useForm<UpdateBrandInput>({
    resolver: zodResolver(updateBrandInputSchema) as never,
    defaultValues: {
      id: "",
      name: "",
      imageAssetId: undefined,
      status: "active",
      isTest: false,
    },
  });

  const loadBrands = (opts?: {
    search?: string;
    statusFilter?: StatusFilter;
  }) => {
    startTransition(async () => {
      const res = await listBrandsAction({
        search: opts?.search,
        includeDeleted: true,
        statusFilter: opts?.statusFilter ?? statusFilter,
      });
      if (res.success) {
        setItems(res.data.items);
      } else {
        toast.error(res.error ?? "Не удалось загрузить бренды");
      }
    });
  };

  useEffect(() => {
    startTransition(async () => {
      const res = await listBrandsAction({
        search: undefined,
        includeDeleted: true,
        statusFilter,
      });
      if (res.success) {
        setItems(res.data.items);
      } else {
        toast.error(res.error ?? "Не удалось загрузить бренды");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const onCreateSubmit = (values: CreateBrandInput) => {
    startTransition(async () => {
      const res = await createBrandAction(values);
      if (res.success) {
        toast.success("Бренд создан");
        createForm.reset({
          name: "",
          imageAssetId: undefined,
          status: "active",
          isTest: false,
        });
        loadBrands({ search, statusFilter });
      } else {
        toast.error(res.error ?? "Ошибка при создании бренда");
      }
    });
  };

  const onEditSubmit = (values: UpdateBrandInput) => {
    startTransition(async () => {
      const res = await updateBrandAction(values);
      if (res.success) {
        toast.success("Бренд обновлён");
        setEditDialog({ open: false });
        loadBrands({ search, statusFilter });
      } else {
        toast.error(res.error ?? "Ошибка при обновлении бренда");
      }
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadBrands({ search, statusFilter });
  };

  const openEditDialog = (brand: BrandListItem) => {
    editForm.reset({
      id: brand.id,
      name: brand.name,
      imageAssetId: brand.imageAssetId ?? undefined,
      status: brand.status,
      isTest: brand.isTest,
    });
    setEditDialog({ open: true, brand });
  };

  const openDeleteDialog = (brand: BrandListItem) => {
    setDeleteDialog({
      open: true,
      brand,
      loadingProducts: true,
      products: [],
    });

    startTransition(async () => {
      const res = await listBrandProductsAction(brand.id);
      if (res.success) {
        setDeleteDialog((prev) => ({
          ...prev,
          loadingProducts: false,
          products: res.data.items,
        }));
      } else {
        toast.error(res.error ?? "Не удалось загрузить товары бренда");
        setDeleteDialog((prev) => ({
          ...prev,
          loadingProducts: false,
        }));
      }
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog((prev) => ({ ...prev, open: false }));
  };

  const confirmDeleteBrand = () => {
    if (!deleteDialog.open || !deleteDialog.brand) return;
    const { brand } = deleteDialog;

    startTransition(async () => {
      const res = await deleteBrandAction(brand.id);
      if (res.success) {
        toast.success("Бренд помечен как удалённый");
        closeDeleteDialog();
        loadBrands({ search, statusFilter });
      } else {
        toast.error(res.error ?? "Ошибка при удалении бренда");
      }
    });
  };

  const handleRestore = (id: string) => {
    startTransition(async () => {
      const res = await restoreBrandAction(id);
      if (res.success) {
        toast.success("Бренд восстановлен");
        loadBrands({ search, statusFilter });
      } else {
        toast.error(res.error ?? "Ошибка при восстановлении бренда");
      }
    });
  };

  const handleGenerateTestBrands = (count: number) => {
    startTransition(async () => {
      const res = await generateTestBrandsAction(count);
      if (res.success) {
        toast.success(`Добавлено ${count} тестовых брендов`);
        loadBrands({ search, statusFilter });
      } else {
        toast.error(res.error ?? "Ошибка при генерации тестовых брендов");
      }
    });
  };

  const handleDeleteAllTestBrands = () => {
    startTransition(async () => {
      const res = await deleteAllTestBrandsAction();
      if (res.success) {
        toast.success("Все тестовые бренды удалены");
        loadBrands({ search, statusFilter });
      } else {
        toast.error(res.error ?? "Ошибка при удалении тестовых брендов");
      }
    });
  };

  const filteredItems = useMemo(() => items, [items]);

  const getStatusBadge = (status: BrandListItem["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="outline">Активный</Badge>;
      case "hidden":
        return <Badge variant="secondary">Скрытый</Badge>;
      case "archived":
        return <Badge variant="destructive">Архив</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Бренды</h1>
          <p className="text-sm text-muted-foreground">
            Поиск, фильтрация, редактирование и удаление брендов.
          </p>
        </div>
      </div>

      {/* Панель фильтров + поиск + создание + dev tools */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтры и создание</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Поиск + селект статуса */}
          <form
            className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
            onSubmit={handleSearchSubmit}
          >
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по названию бренда..."
                  value={search}
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  onValueChange={(v) => setStatusFilter(v as StatusFilter)}
                  value={statusFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все бренды</SelectItem>
                    <SelectItem value="active">Активные</SelectItem>
                    <SelectItem value="hidden">Скрытые</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button disabled={isPending} type="submit" variant="outline">
              Найти
            </Button>
          </form>

          <Separator />

          {/* Форма создания бренда */}
          <form
            className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_auto]"
            onSubmit={createForm.handleSubmit(onCreateSubmit as never)}
          >
            <div className="space-y-1.5">
              <Label htmlFor="brand-name">Название</Label>
              <Input
                id="brand-name"
                {...createForm.register("name")}
                placeholder="Например, Nike"
              />
              {createForm.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {createForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Статус</Label>
              <Select
                onValueChange={(v) =>
                  createForm.setValue("status", v as CreateBrandInput["status"])
                }
                value={createForm.watch("status")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активный</SelectItem>
                  <SelectItem value="hidden">Скрытый</SelectItem>
                  <SelectItem value="archived">Архив</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brand-image-asset-id">
                ID медиа-ресурса (опционально)
              </Label>
              <Input
                id="brand-image-asset-id"
                {...createForm.register("imageAssetId")}
                placeholder="Например, 01H..."
              />
              {createForm.formState.errors.imageAssetId && (
                <p className="text-xs text-destructive">
                  {createForm.formState.errors.imageAssetId.message as string}
                </p>
              )}
            </div>

            <div className="flex items-end">
              <Button className="w-full" disabled={isPending} type="submit">
                {isPending ? "Создание..." : "Создать бренд"}
              </Button>
            </div>
          </form>

          {/* Dev card для тестовых брендов (видна только в dev) */}
          <OnlyDevCard
            description="Эта панель видна только в режиме разработки."
            title="Dev: Тестовые бренды"
          >
            <DevTestBrandsControls
              disabled={isPending}
              onDeleteAll={handleDeleteAllTestBrands}
              onGenerate={handleGenerateTestBrands}
            />
          </OnlyDevCard>
        </CardContent>
      </Card>

      {/* Таблица брендов */}
      <Card>
        <CardHeader>
          <CardTitle>Список брендов</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Бренды ещё не созданы.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 text-left">Название</th>
                    <th className="px-3 py-2 text-left">Статус</th>
                    <th className="px-3 py-2 text-left">Медиа</th>
                    <th className="px-3 py-2 text-left">Тип</th>
                    <th className="px-3 py-2 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((brand) => (
                    <tr
                      className="border-t hover:bg-muted/40 transition-colors"
                      key={brand.id}
                    >
                      <td className="px-3 py-2 align-middle">
                        <div className="flex flex-col">
                          <span className="font-medium">{brand.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ID: {brand.id}
                          </span>
                          {brand.deletedAt && (
                            <span className="mt-1 inline-flex items-center gap-1 text-xs text-destructive">
                              <AlertTriangle className="h-3 w-3" />
                              Помечен как удалённый
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 align-middle">
                        {getStatusBadge(brand.status)}
                      </td>
                      <td className="px-3 py-2 align-middle">
                        {brand.imageAssetId ? (
                          <span className="text-xs text-muted-foreground">
                            {brand.imageAssetId}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            — нет
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 align-middle">
                        {brand.isTest ? (
                          <Badge variant="outline">Тестовый</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Боевой
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <div className="flex items-center justify-end gap-2">
                          {!brand.deletedAt ? (
                            <>
                              <Button
                                onClick={() => openEditDialog(brand)}
                                size="icon"
                                variant="ghost"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => openDeleteDialog(brand)}
                                size="icon"
                                variant="ghost"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              onClick={() => handleRestore(brand.id)}
                              size="sm"
                              variant="outline"
                            >
                              Восстановить
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог редактирования */}
      <Dialog
        onOpenChange={(open) => {
          if (!open) setEditDialog({ open: false });
        }}
        open={editDialog.open}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирование бренда</DialogTitle>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={editForm.handleSubmit(onEditSubmit as never)}
          >
            <div className="space-y-2">
              <Label htmlFor="brand-name-edit">Название</Label>
              <Input
                id="brand-name-edit"
                {...editForm.register("name")}
                placeholder="Например, Nike"
              />
              {editForm.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {editForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Статус</Label>
              <Select
                onValueChange={(v) =>
                  editForm.setValue("status", v as UpdateBrandInput["status"])
                }
                value={editForm.watch("status")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активный</SelectItem>
                  <SelectItem value="hidden">Скрытый</SelectItem>
                  <SelectItem value="archived">Архив</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand-image-asset-id-edit">
                ID медиа-ресурса (опционально)
              </Label>
              <Input
                id="brand-image-asset-id-edit"
                {...editForm.register("imageAssetId")}
                placeholder="Например, 01H..."
              />
              {editForm.formState.errors.imageAssetId && (
                <p className="text-xs text-destructive">
                  {editForm.formState.errors.imageAssetId.message as string}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                onClick={() => setEditDialog({ open: false })}
                type="button"
                variant="outline"
              >
                Отмена
              </Button>
              <Button disabled={isPending} type="submit">
                {isPending ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog
        onOpenChange={(open) => {
          if (!open) closeDeleteDialog();
        }}
        open={deleteDialog.open}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить бренд?</DialogTitle>
          </DialogHeader>

          {deleteDialog.brand && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Вы уверены, что хотите удалить бренд{" "}
                <span className="font-semibold">{deleteDialog.brand.name}</span>
                ? <br />
                {deleteDialog.loadingProducts
                  ? "Загружаем список связанных товаров..."
                  : deleteDialog.products.length > 0
                    ? `${deleteDialog.products.length} товаров потеряют свой бренд.`
                    : "С брендом пока не связано ни одного товара."}
              </p>

              {!deleteDialog.loadingProducts &&
                deleteDialog.products.length > 0 && (
                  <div className="rounded-md border bg-muted/40 max-h-48 overflow-auto">
                    <ul className="divide-y text-sm">
                      {deleteDialog.products.map((p) => (
                        <li className="px-3 py-2" key={p.id}>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground">
                            /{p.slug} · {p.id}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  onClick={closeDeleteDialog}
                  type="button"
                  variant="outline"
                >
                  Отмена
                </Button>
                <Button
                  disabled={isPending}
                  onClick={confirmDeleteBrand}
                  type="button"
                  variant="destructive"
                >
                  {isPending ? "Удаляем..." : "Удалить бренд"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

function DevTestBrandsControls({
  onGenerate,
  onDeleteAll,
  disabled,
}: {
  onGenerate: (count: number) => void;
  onDeleteAll: () => void;
  disabled?: boolean;
}) {
  const [count, setCount] = useState(10);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1.5 max-w-[220px]">
        <Label htmlFor="dev-test-brands-count">
          Количество тестовых брендов
        </Label>
        <Input
          id="dev-test-brands-count"
          max={200}
          min={1}
          onChange={(e) =>
            setCount(
              Number.isNaN(Number(e.target.value))
                ? 10
                : Number(e.target.value),
            )
          }
          type="number"
          value={count}
        />
        <p className="text-xs text-muted-foreground">
          Будут созданы бренды с пометкой <code>isTest = true</code>.
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          disabled={disabled}
          onClick={() => onGenerate(count)}
          type="button"
          variant="outline"
        >
          Добавить
        </Button>
        <Button
          disabled={disabled}
          onClick={onDeleteAll}
          type="button"
          variant="destructive"
        >
          Удалить все тестовые
        </Button>
      </div>
    </div>
  );
}
