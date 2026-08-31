import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "@/shared/lib/auth";
import { ThemeProvider } from "@/shared/ui/theme";

import "./_styles/globals.css";

export const metadata: Metadata = {
  title: "Green Kiss",
  description: "Интернет-магазин одежды Green Kiss",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          enableSystem={false}
        >
          <SessionProvider>
            {children}
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
