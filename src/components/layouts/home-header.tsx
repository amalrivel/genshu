import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { LogoutButton } from "./logout-button";

const links = [
  ["/learn", "Learn"],
  ["/activities", "Practice"],
  ["/recording", "Class recordings"],
  ["/announcements", "Announcements"],
  ["/calendar", "Calendar"],
] as const;

export default function HomeHeader({
  name,
  email,
  role,
}: {
  name: string;
  email: string;
  role: string;
}) {
  const navLinks = role === "teacher" || role === "admin"
    ? [...links, ["/admin", "Management"] as const]
    : links;
  return (
    <header className="border-b">
      <div className="container mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link className={buttonVariants({ variant: "link", size: "sm" })} href="/">
          <span className="text-lg font-semibold">Genshu</span>
        </Link>
        <nav aria-label="Main navigation" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navLinks.map(([href, label]) => <li key={href}>
              <Link className={buttonVariants({ variant: "link", size: "sm" })} href={href}>{label}</Link>
            </li>)}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <details className="relative lg:hidden">
            <summary className="cursor-pointer rounded-md border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2">Menu</summary>
            <nav aria-label="Mobile navigation" className="absolute right-0 z-10 mt-2 min-w-52 rounded-lg border bg-background p-2 shadow-lg">
              <ul className="flex flex-col">
                {navLinks.map(([href, label]) => <li key={href}>
                  <Link className="block rounded px-3 py-2 text-sm hover:bg-muted focus-visible:outline-2" href={href}>{label}</Link>
                </li>)}
              </ul>
            </nav>
          </details>
          <div className="max-w-20 truncate text-right text-xs sm:max-w-48 sm:text-sm">
            <p className="truncate font-medium">{name}</p>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">{email}</p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
