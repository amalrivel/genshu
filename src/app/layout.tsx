import type { Metadata } from "next";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { ThemeProvider } from "@/components/theme-provider";
import { LegacyDataProvider } from "@/components/legacy-data-provider";
import { AppHeader } from "@/components/layout/app-header";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Genshu — 日本奨学金プログラム学習管理システム",
  description: "Japanese scholarship learning management platform",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const tCommon = await getTranslations("common");

  return (
    <html
      lang={locale}
      className={cn("h-full", "antialiased", "font-sans")}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased selection:bg-primary/20">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <LegacyDataProvider>
              <a
                href="#main-content"
                className="sr-only fixed left-4 top-4 z-[100] rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground focus:not-sr-only"
              >
                {tCommon("skipToContent")}
              </a>
              <AppHeader />
              <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col outline-none">{children}</main>
              <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
                <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <span>{tCommon("footerText")}</span>
                  <span className="text-[0.7rem]">{tCommon("version")}</span>
                </div>
              </footer>
            </LegacyDataProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
