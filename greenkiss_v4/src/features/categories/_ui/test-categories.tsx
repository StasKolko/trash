"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { createTestCategories } from "../_actions/create";
import { deleteAllTestCategories } from "../_actions/delete";

export const AdminTestCategories = () => {
  const [count, setCount] = useState<number>(10);
  const [loadingAction, setLoadingAction] = useState<"add" | "delete" | null>(
    null,
  );
  const router = useRouter();

  const isLoading = loadingAction !== null;

  async function handleAdd() {
    setLoadingAction("add");
    try {
      const res = await createTestCategories(count);

      if (res.status === "error") {
        console.error(res.error.devMessage ?? res.error.userMessage);
        return;
      }

      router.refresh();
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleDeleteAllTest() {
    setLoadingAction("delete");
    try {
      const res = await deleteAllTestCategories();

      if (res.status === "error") {
        console.error(res.error.devMessage ?? res.error.userMessage);
        return;
      }

      router.refresh();
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="test-count">
          Количество тестовых категорий
        </label>
        <Input
          id="test-count"
          type="number"
          min={1}
          value={count}
          onChange={(e) => {
            const value = Number(e.target.value);
            setCount(value);
          }}
          className="w-32"
          disabled={isLoading}
        />
      </div>

      <Button
        type="button"
        onClick={handleAdd}
        disabled={isLoading || count <= 0}
      >
        {isLoading && loadingAction === "add" ? "Добавление..." : "Добавить"}
      </Button>

      <Button
        type="button"
        variant="destructive"
        onClick={handleDeleteAllTest}
        disabled={isLoading}
      >
        {isLoading && loadingAction === "delete"
          ? "Удаление..."
          : "Удалить все тестовые"}
      </Button>
    </div>
  );
};
