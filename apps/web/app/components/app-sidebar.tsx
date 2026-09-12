import {
  BookOpen,
  FolderOpen,
  HelpCircle,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Users,
} from "lucide-react";
import { Form, Link, useLocation } from "react-router";
import type { AuthUser } from "../content-api";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "./ui/sidebar";

const primaryItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Practice", href: "/practice", icon: BookOpen },
];
const adminContentItems = [
  { label: "Topics & Materials", href: "/topics", icon: FolderOpen },
  { label: "Questions", href: "/questions", icon: HelpCircle },
  { label: "Practice Sets", href: "/practice-sets", icon: ListChecks },
];

function activePath(pathname: string, href: string) {
  return href === "/dashboard"
    ? pathname === "/" || pathname === "/dashboard"
    : pathname === href || pathname.startsWith(`${href}/`);
}

function NavigationItem({
  item,
  pathname,
}: {
  item: (typeof primaryItems)[number];
  pathname: string;
}) {
  const active = activePath(pathname, item.href);
  const Icon = item.icon;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link to={item.href} />}
        isActive={active}
        aria-current={active ? "page" : undefined}
        tooltip={item.label}
      >
        <Icon aria-hidden="true" />
        <span>{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar({ user }: { user: AuthUser }) {
  const { pathname } = useLocation();
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link to="/dashboard" />}
              size="lg"
              tooltip="Genshu"
            >
              <span className="app-sidebar__mark" aria-hidden="true">
                G
              </span>
              <span className="app-sidebar__brand">Genshu</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryItems.map((item) => (
                <NavigationItem
                  key={item.href}
                  item={item}
                  pathname={pathname}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {user.role === "Admin" && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Content</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminContentItems.map((item) => (
                    <NavigationItem
                      key={item.href}
                      item={item}
                      pathname={pathname}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Users</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavigationItem
                    item={{
                      label: "Participants",
                      href: "/users",
                      icon: Users,
                    }}
                    pathname={pathname}
                  />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <div
              className="app-sidebar__user"
              title={`${user.name || user.email} · ${user.role}`}
            >
              <span className="app-sidebar__user-mark" aria-hidden="true">
                U
              </span>
              <span className="app-sidebar__user-name">
                {user.name || user.email}
              </span>
              <span>{user.role}</span>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Form method="post" action="/logout">
              <SidebarMenuButton
                render={<button type="submit" />}
                tooltip="Log out"
              >
                <LogOut aria-hidden="true" />
                <span>Log out</span>
              </SidebarMenuButton>
            </Form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
