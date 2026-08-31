"use client";

import { AlertCircle, Loader2, LogOut, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  getAuthErrorMessage,
  signIn,
  signOut,
  useSession,
} from "@/shared/lib/auth";
import { Button } from "@/shared/ui/kit/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/kit/card";
import { Separator } from "@/shared/ui/kit/separator";

export const LoginPageContent = () => {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigninLoading, setIsSigninLoading] = useState(false);
  const [isSignoutLoading, setIsSignoutLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // Читаем и приводим к человеку‑читаемому тексту параметр ?error=...
  useEffect(() => {
    const rawError = searchParams.get("error");
    const message = getAuthErrorMessage(rawError);
    setErrorMessage(message);
  }, [searchParams]);

  const handleSignIn = useCallback(async () => {
    try {
      setIsSigninLoading(true);
      await signIn("yandex", {
        redirectTo: callbackUrl,
      });
      // дальше управление возьмёт next-auth (редирект)
    } finally {
      setIsSigninLoading(false);
    }
  }, [callbackUrl]);

  const handleSignOut = useCallback(async () => {
    try {
      setIsSignoutLoading(true);
      await signOut({
        redirectTo: "/",
      });
    } finally {
      setIsSignoutLoading(false);
    }
  }, []);

  const isLoadingSession = status === "loading";
  const isAuthenticated = !!session?.user;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl font-semibold">
            {isAuthenticated ? "Ваш аккаунт" : "Вход в аккаунт"}
          </CardTitle>
          {errorMessage && (
            <div className="flex items-start gap-2 rounded-md border border-destructive-foreground bg-destructive px-3 py-2 text-sm text-destructive-foreground">
              <AlertCircle className="h-8 w-8" />
              <span>{errorMessage}</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoadingSession ? (
            <div className="flex items-center justify-center py-4 text-sm text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Загружаем данные сессии...
            </div>
          ) : isAuthenticated ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
                  {session.user.image ? (
                    <Image
                      alt={session.user.name || ""}
                      className="h-11 w-11 rounded-full object-cover"
                      src={session.user.image}
                    />
                  ) : (
                    <UserIcon className="h-6 w-6" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">
                    {session.user.name || "Пользователь"}
                  </p>
                  {session.user.email && (
                    <p className="text-xs text-muted-foreground">
                      {session.user.email}
                    </p>
                  )}
                  {session.user.role && session.user.role !== "USER" && (
                    <p className="text-xs text-primary">
                      {session.user.role === "ADMIN"
                        ? "Администратор"
                        : "Менеджер"}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Button
                  className="w-full flex items-center justify-center gap-2"
                  variant="default"
                  size="sm"
                  onClick={() => router.push(callbackUrl || "/")}
                >
                  Перейти{" "}
                  {callbackUrl && callbackUrl !== "/"
                    ? "по ссылке"
                    : "на главную"}
                </Button>

                <Button
                  className="w-full flex items-center justify-center gap-2"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/")}
                >
                  На главную магазина
                </Button>

                <Button
                  className="w-full flex items-center justify-center gap-2"
                  variant="destructive"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={isSignoutLoading}
                >
                  {isSignoutLoading && (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  )}
                  <LogOut className="h-4 w-4" />
                  Выйти из аккаунта
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Войдите через Яндекс, чтобы оформлять заказы, видеть историю
                покупок, управлять избранным и адресами доставки.
              </p>

              <div className="space-y-3">
                <Button
                  className="w-full flex items-center justify-center gap-2"
                  size="sm"
                  onClick={handleSignIn}
                  disabled={isSigninLoading}
                >
                  {isSigninLoading && (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  )}
                  {/* Если нет иконки Яндекса – оставьте только текст */}
                  {/* <YandexLogo className="h-4 w-4" /> */}
                  Войти через Яндекс
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Нажимая «Войти через Яндекс», вы соглашаетесь с условиями
                  использования сервиса.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
