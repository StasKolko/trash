"use client";

import { useState } from "react";
import type { Category } from "@/shared/api/db/schemas/categories";
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
import { createCategory } from "../_actions/create";
import { buildCategoryTree } from "../_lib/build-category-tree";

type AdminCategoryCreateDialogProps = {
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (created: Category) => void;
};

export const AdminCategoryCreateDialog = ({
  categories,
  open,
  onOpenChange,
  onCreated,
}: AdminCategoryCreateDialogProps) => {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setName("");
      setParentId(null);
      setErrorMessage(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();

    if (!trimmed) {
      setErrorMessage("Название категории обязательно");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await createCategory({
        name: trimmed,
        parentId,
      });

      if (response.status === "error") {
        console.error(response.error.devMessage ?? response.error.userMessage);
        setErrorMessage(response.error.userMessage);
        return;
      }

      if (onCreated) {
        onCreated(response.data);
      }

      handleClose(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tree = buildCategoryTree(categories);

  type FlatOption = {
    id: string;
    label: string;
  };

  const options: FlatOption[] = [];

  const stack = [...tree].reverse();
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node) continue;

    const indent = "— ".repeat(node.depth);
    options.push({
      id: node.category.id,
      label: `${indent}${node.category.name}`,
    });
    for (let i = node.children.length - 1; i >= 0; i -= 1) {
      stack.push(node.children[i]);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создание категории</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="create-category-name">Название категории</Label>
            <Input
              id="create-category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название категории"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="create-category-parent">
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
              <SelectTrigger id="create-category-parent">
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
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleClose(false)}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            Создать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
