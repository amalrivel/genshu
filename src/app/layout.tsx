import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider"

import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Genshu", template: "%s | Genshu" },
  description: "Ruang belajar dan latihan bahasa Jepang Anda.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased font-sans" suppressHydrationWarning>


      <body className="min-h-full flex flex-col">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
      </body>
    </html>
  );
}
