// NOTE: Current behavior: static navigation, sample avatar, and inactive account actions.
// TODO: Add mobile navigation, real identity/logout, and the Class recordings label;
// remove inactive account items. See docs/developer-guide.md, Shared layout.
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function HomeHeader() {
  return (
    <header className="flex justify-between container  mx-auto px-4 my-2">
      <Link
        className={buttonVariants({ variant: "link", size: "sm" })}
        href="/"
      >
        <h1>Genshu</h1>
      </Link>

      <nav className="flex justify-end flex-row gap-4">
        <ul className="flex justify-end flex-row gap-3">
          <li>
            <Link
              className={buttonVariants({ variant: "link", size: "sm" })}
              href="/learn"
            >
              Learns
            </Link>
          </li>
          <li>
            <Link
              className={buttonVariants({ variant: "link", size: "sm" })}
              href="/activities"
            >
              Activities
            </Link>
          </li>
          <li>
            <Link
              className={buttonVariants({ variant: "link", size: "sm" })}
              href="/recording"
            >
              Recording
            </Link>
          </li>
          <li>
            <Link
              className={buttonVariants({ variant: "link", size: "sm" })}
              href="/announcements"
            >
              Announcements
            </Link>
          </li>
          <li>
            <Link
              className={buttonVariants({ variant: "link", size: "sm" })}
              href="/calendar"
            >
              Calendar
            </Link>
          </li>
        </ul>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent className="w-32">
            <DropdownMenuGroup>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive">Log out</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  );
}
