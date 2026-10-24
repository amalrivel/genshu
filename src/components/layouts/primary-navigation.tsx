"use client";
import { useTranslations } from "next-intl";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  Home,
  ClipboardCheck,
  Video,
  Megaphone,
  Settings2,
  MoreHorizontal,
  UserRound,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "./logout-button";
import { LanguageSwitcher } from "./language-switcher";
import HomeHeader from "./home-header";

function AccountMenu({ name, email }: { name: string; email: string }) {
  const t = useTranslations("UI");

  const { theme, setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" aria-label={t("Menu_akun_dan_tampilan")} />}
      >
        <UserRound aria-hidden="true" data-icon="inline-start" />
        <span className="max-w-32 truncate">{name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 max-w-[calc(100vw-2rem)] p-2">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="block break-words text-sm text-foreground">{name}</span>
            <span className="block break-all">{email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("Tampilan")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={theme ?? "system"} onValueChange={setTheme}>
            <DropdownMenuRadioItem className="min-h-11" value="light">
              {t("Terang")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem className="min-h-11" value="dark">
              {t("Gelap")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem className="min-h-11" value="system">
              {t("Ikuti_sistem")}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="p-2">
          <LanguageSwitcher />
        </div>
        <DropdownMenuSeparator />
        <LogoutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PrimaryNavigation({
  management,
  name,
  email,
  children,
}: {
  management: boolean;
  name: string;
  email: string;
  children: ReactNode;
}) {
  const t = useTranslations("UI");

  const links = [
    { href: "/", label: t("Beranda"), icon: Home },
    { href: "/activities", label: t("Latihan"), icon: ClipboardCheck },
    { href: "/recording", label: t("Rekaman_kelas"), icon: Video },
    { href: "/announcements", label: t("Pengumuman"), icon: Megaphone },
  ];

  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = management
    ? [...links, { href: "/admin", label: t("Pengelolaan"), icon: Settings2 }]
    : links;
  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  const current = items.find((item) => active(item.href));
  const moreActive = items.slice(3).some((item) => active(item.href));
  return (
    <TooltipProvider>
      <SidebarProvider>
        <a
          href="#main-content"
          className="sr-only z-50 rounded-md bg-card p-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          {t("Lewati_ke_konten")}
        </a>
        <Sidebar>
          <SidebarHeader className="px-5 py-6">
            <HomeHeader />
            <p className="text-xs text-muted-foreground">{t("Ruang_belajar_bahasa_Jepang")}</p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>{t("Ruang_belajar")}</SidebarGroupLabel>
              <SidebarGroupContent>
                <nav aria-label={t("Navigasi_utama")}>
                  <SidebarMenu>
                    {items.map(({ href, label, icon: Icon }) => (
                      <SidebarMenuItem key={href}>
                        <SidebarMenuButton
                          className="min-h-11"
                          isActive={active(href)}
                          render={
                            <Link href={href} aria-current={active(href) ? "page" : undefined} />
                          }
                        >
                          <Icon aria-hidden="true" />
                          <span>{label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </nav>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="gap-3 p-4">
            <Separator />
            <p className="text-xs text-muted-foreground">
              {t("Sedikit_setiap_hari_selangkah_lebih_jauh")}
            </p>
            <AccountMenu name={name} email={email} />
          </SidebarFooter>
        </Sidebar>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="md:hidden">
              <HomeHeader />
            </div>
            <p className="hidden text-sm font-medium md:block">{current?.label ?? "Genshu"}</p>
            <div className="md:hidden">
              <AccountMenu name={name} email={email} />
            </div>
            <span className="hidden text-xs text-muted-foreground md:block">
              {t("Belajar_sesuai_langkah_Anda")}
            </span>
          </header>
          {children}
        </div>
        <nav
          aria-label={t("Navigasi_seluler")}
          className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t bg-card px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden"
        >
          {items.slice(0, 3).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={active(href) ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs",
                active(href) ? "bg-muted font-semibold text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon aria-hidden="true" className="size-5" />
              {label}
            </Link>
          ))}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  className="h-auto min-h-14 flex-col gap-1"
                  aria-label={t("Menu_lainnya")}
                  aria-current={moreActive ? "page" : undefined}
                />
              }
            >
              <MoreHorizontal aria-hidden="true" />
              <span className="text-xs">{t("Lainnya")}</span>
            </SheetTrigger>
            <SheetContent side="right" className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{t("Ruang_belajar_Anda")}</SheetTitle>
                <SheetDescription>{t("Kabar_kelas_dan_akun")}</SheetDescription>
              </SheetHeader>
              <nav aria-label={t("Navigasi_lainnya")} className="px-4">
                <ul className="flex flex-col gap-1">
                  {items.slice(3).map(({ href, label, icon: Icon }) => (
                    <li key={href}>
                      <Link
                        className="nav-link"
                        href={href}
                        aria-current={active(href) ? "page" : undefined}
                        onClick={() => setOpen(false)}
                      >
                        <Icon aria-hidden="true" className="size-5" />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="flex flex-col gap-4 p-4">
                <Separator />
                <AccountMenu name={name} email={email} />
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </SidebarProvider>
    </TooltipProvider>
  );
}
