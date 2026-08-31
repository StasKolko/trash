// src/app/login/page.tsx
import { LoginCard } from "@/features/auth/login-card";

// Тип для промиса параметров запроса
type SearchParamsPromise = Promise<{
  callbackUrl?: string;
  error?: string;
}>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParamsPromise;
}) {
  const params = await searchParams;

  const callbackUrl = normalizeCallbackUrl(params.callbackUrl ?? "/");
  const error = params.error;

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <LoginCard callbackUrl={callbackUrl} error={error} />
    </main>
  );
}

// Базовая защита от open-redirect: разрешаем только относительные пути
function normalizeCallbackUrl(url: string) {
  if (!url.startsWith("/")) return "/";
  // Можно дополнительно запретить переходы на /api/* если не нужно:
  // if (url.startsWith("/api")) return "/";
  return url;
}
