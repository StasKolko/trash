"use client";

import {
  Bell,
  Check,
  Home,
  Plus,
  Search,
  Settings,
  Trash2,
  User,
  X,
} from "lucide-react";
import { Button } from "@/shared/ui/kit/button";

const sizeTypes = ["button", "icon", "link"] as const;
const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
const variants = [
  "primary",
  "outline",
  "secondary",
  "inverted",
  "ok",
  "error",
  "info",
  "warning",
  "link",
] as const;

const iconMap = [Home, Settings, Search, Bell, User, Plus, Trash2, Check, X];

export default function ButtonsPreviewPage() {
  return (
    <div className="min-h-screen w-full px-6 py-10 bg-slate-50 text-slate-900">
      <h1 className="text-2xl font-semibold mb-6">Buttons preview</h1>

      <div className="flex flex-col gap-10">
        {variants.map((variant, vIndex) => (
          <section
            key={variant}
            className="border border-dashed rounded-lg p-4"
          >
            <h2 className="font-medium mb-3">
              variant: <span className="font-mono">{variant}</span>
            </h2>

            {/* TABLE-LOOKING GRID */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border px-2 py-1 bg-slate-100 text-left">
                      sizeType \ size
                    </th>
                    {sizes.map((size) => (
                      <th
                        key={size}
                        className="border px-2 py-1 bg-slate-100 font-mono"
                      >
                        {size}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sizeTypes.map((sizeType, sIndex) => (
                    <tr key={sizeType}>
                      <td className="border px-2 py-1 bg-slate-50 font-mono">
                        {sizeType}
                      </td>

                      {sizes.map((size) => {
                        const uiSize = `${sizeType}-${size}` as const;

                        const Icon =
                          iconMap[
                            (vIndex + sIndex + sizes.indexOf(size)) %
                              iconMap.length
                          ];

                        return (
                          <td
                            key={size}
                            className="border px-2 py-2 text-center align-middle"
                          >
                            <Button
                              ui={{
                                variant,
                                size: uiSize,
                              }}
                            >
                              {sizeType === "icon" ? (
                                // только иконка
                                <Icon />
                              ) : (
                                // иконка + текст для button и link
                                <>
                                  <Icon />
                                  <span>{variant}</span>
                                </>
                              )}
                            </Button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
