import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginPageContent } from "./_ui/login-page-content";

export const metadata: Metadata = {
  title: "Вход | Green Kiss",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
