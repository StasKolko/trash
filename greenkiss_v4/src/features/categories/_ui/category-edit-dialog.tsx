"use client";

import { useMemo, useState } from "react";
import type { Category } from "@/shared/api/db/schemas/categories";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/kit/alert-dialog";
import { Button } from "@/shared/ui/kit/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { deleteCategoryById } from "../_actions/delete";
import { updateCategory } from "../_actions/update";
import {
  buildCategoryTree,
  type CategoryTreeNode,
  collectDescendantIds,
} from "../_lib/build-category-tree";

type AdminCategoryEditDialogProps = {
  categories: Category[];
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (updated: Category) => void;
  onDeleted?: (deletedId: string) => void;
};

export const AdminCategoryEditDialog = ({
  categories,
  category,
  open,
  onOpenChange,
  onUpdated,
  onDeleted,
}: AdminCategoryEditDialogProps) => {
  const [name, setName] = useState<string>(category?.name ?? "");
  const [parentId, setParentId] = useState<string | null>(
    category?.parentId ?? null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const selectedCategoryId = category?.id ?? null;

  const { options } = useMemo(() => {
    const tree = buildCategoryTree(categories);
    const nodeMap = new Map<string, CategoryTreeNode>();

    const stackForMap = [...tree];
    while (stackForMap.length > 0) {
      const node = stackForMap.pop();
      if (!node) continue;

      nodeMap.set(node.category.id, node);
      for (const child of node.children) {
        stackForMap.push(child);
      }
    }

    const forbidden = new Set<string>();
    if (selectedCategoryId) {
      forbidden.add(selectedCategoryId);
      const rootNode = nodeMap.get(selectedCategoryId);
      if (rootNode) {
        const descendants = collectDescendantIds(rootNode);
        for (const id of descendants) {
          forbidden.add(id);
        }
      }
    }

    type FlatOption = {
      id: string;
      label: string;
    };

    const flatOptions: FlatOption[] = [];
    const stack = [...tree].reverse();
    while (stack.length > 0) {
      const node = stack.pop();
      if (!node) continue;

      if (!forbidden.has(node.category.id)) {
        const indent = "— ".repeat(node.depth);
        flatOptions.push({
          id: node.category.id,
          label: `${indent}${node.category.name}`,
        });
      }
      for (let i = node.children.length - 1; i >= 0; i -= 1) {
        stack.push(node.children[i]);
      }
    }

    return {
      options: flatOptions,
    };
  }, [categories, selectedCategoryId]);

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setName(category?.name ?? "");
      setParentId(category?.parentId ?? null);
      setErrorMessage(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSave = async () => {
    if (!category) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("Название категории обязательно");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await updateCategory({
        id: category.id,
        name: trimmedName,
        parentId,
      });

      if (response.status === "error") {
        console.error(response.error.devMessage ?? response.error.userMessage);
        setErrorMessage(response.error.userMessage);
        return;
      }

      if (onUpdated) {
        onUpdated(response.data);
      }

      handleDialogOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!category) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await deleteCategoryById(category.id);

      if (response.status === "error") {
        console.error(response.error.devMessage ?? response.error.userMessage);
        setErrorMessage(response.error.userMessage);
        setDeleteDialogOpen(false);
        return;
      }

      if (onDeleted) {
        onDeleted(category.id);
      }

      setDeleteDialogOpen(false);
      handleDialogOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!category) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирование категории</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="edit-category-name">Название категории</Label>
              <Input
                id="edit-category-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="edit-category-parent">
                Родительская категория
              </Label>
              <Select
                value={parentId ?? ""}
                onValueChange={(value) => {
                  if (value === "") {
                    setParentId(null);
                  } else {
                    setParentId(value);
                  }
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger id="edit-category-parent">
                  <SelectValue placeholder="Без родительской категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Без родительской категории</SelectItem>
                  {options.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {errorMessage && (
              <div className="text-sm text-destructive">{errorMessage}</div>
            )}

            <div className="mt-2 border-t pt-3">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isSubmitting}
              >
                Удалить категорию
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleDialogOpenChange(false)}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSubmitting}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить категорию?</AlertDialogTitle>
            <AlertDialogDescription>
              Категория и все вложенные категории будут удалены без возможности
              восстановления. Вы уверены, что хотите продолжить?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
