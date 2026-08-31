"use client";

import { BotIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/kit/card";

const isProd = process.env.NODE_ENV === "production";

export function OnlyDevCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  if (isProd) return null;

  return (
    <Card className="border-dashed border-amber-500/60 bg-amber-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-4 text-md lg:text-lg text-amber-500">
          <BotIcon />
          <h4>{title}</h4>
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
