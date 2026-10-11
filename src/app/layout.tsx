import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Genshu", template: "%s | Genshu" },
  description: "Learning and practice for managed students.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
