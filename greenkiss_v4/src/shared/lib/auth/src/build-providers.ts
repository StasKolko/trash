import type { NextAuthConfig } from "next-auth";
import Yandex from "next-auth/providers/yandex";
import { env } from "@/shared/config/env";

type Providers = NextAuthConfig["providers"];

export const buildProviders = (): Providers => [
  Yandex({
    clientId: env.AUTH_YANDEX_ID,
    clientSecret: env.AUTH_YANDEX_SECRET,
  }),
];
