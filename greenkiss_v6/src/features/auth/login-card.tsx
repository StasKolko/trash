"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { signIn, signOut } from "@/shared/lib/auth";
import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/kit/card";

type AuthErrorCode =
  | "Configuration"
  | "AccessDenied"
  | "Verification"
  | "Default";

// Маппинг ошибок NextAuth -> читабельные тексты
const errorMessages: Record<
  AuthErrorCode,
  { title: string; description: string }
> = {
  Configuration: {
    title: "Ошибка конфигурации",
    description:
      "Проблема с конфигурацией сервера авторизации. Проверьте настройки провайдера и переменные окружения.",
  },
  AccessDenied: {
    title: "Доступ ограничен",
    description:
      "У вас нет прав для доступа или требуется вход. Пожалуйста, войдите в аккаунт.",
  },
  Verification: {
    title: "Ошибка подтверждения",
    description:
      "Токен недействителен или срок его действия истек. Попробуйте войти снова.",
  },
  Default: {
    title: "Неизвестная ошибка",
    description: "Произошла непредвиденная ошибка. Попробуйте ещё раз.",
  },
};

function resolveError(error?: string) {
  if (!error) return null;
  const key = (error in errorMessages ? error : "Default") as AuthErrorCode;
  return errorMessages[key];
}

export type LoginCardProps = {
  // Куда вернуться после успешного входа
  callbackUrl?: string;
  // Код ошибки из query (?error=...)
  error?: string;
  // Режим модалки: компонент не инициирует никаких лишних редиректов
  // и может безопасно показываться поверх текущей страницы.
  asModal?: boolean;
  className?: string;
};

export function LoginCard({
  callbackUrl = "/",
  error,
  className,
}: LoginCardProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const err = useMemo(() => resolveError(error), [error]);

  const onSignIn = async () => {
    // В любом режиме вызываем OAuth — браузер перейдёт на провайдера,
    // по завершении вернёт на callbackUrl
    await signIn("yandex", { redirectTo: callbackUrl });
  };

  const onSignOut = async () => {
    // По выходу возвращаемся на текущую страницу или на главную
    await signOut({ redirectTo: "/" });
  };

  const showTargetHint = callbackUrl && callbackUrl !== "/";

  return (
    <Card className={cn("w-full max-w-lg rounded-2xl", className)}>
      <CardHeader>
        <CardTitle>Вход в аккаунт</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {err && (
          <div
            className="rounded-md border border-destructive-foreground bg-destructive text-destructive-foreground p-4"
            role="alert"
          >
            <p className="font-semibold">{err.title}</p>
            <p className="text-sm opacity-90">{err.description}</p>
          </div>
        )}

        {status === "loading" ? (
          <div className="text-sm text-muted-foreground">Загрузка...</div>
        ) : !session ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Для продолжения войдите через ваш аккаунт Яндекс.
            </p>
            <Button className="w-full" onClick={onSignIn}>
              Войти через Yandex
            </Button>

            {showTargetHint && (
              <p className="text-xs text-muted-foreground">
                Эта страница откроется сразу после входа:{" "}
                <span className="font-medium break-all">{callbackUrl}</span>
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Вы вошли как:</p>
              <div className="rounded-md bg-muted p-3">
                <div className="font-medium">
                  {session.user?.name || session.user?.email || "Без имени"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Роль: {session.user?.role || "USER"}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" onClick={onSignOut} variant="outline">
                Выйти
              </Button>
              {callbackUrl && callbackUrl !== "/" && (
                <Button
                  className="flex-1"
                  onClick={() => {
                    // В режиме модалки — просто навигируем.
                    // На странице /login — тоже сработает как продолжить.
                    router.push(callbackUrl);
                  }}
                >
                  Продолжить
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
