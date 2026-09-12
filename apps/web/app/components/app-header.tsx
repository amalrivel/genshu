import { useLocation } from "react-router";
import { SidebarTrigger } from "./ui/sidebar";

function pageTitle(pathname: string) {
  if (pathname.startsWith("/practice-sets")) return "Practice sets";
  if (pathname.startsWith("/topics")) return "Topics & Materials";
  if (pathname.startsWith("/questions")) return "Questions";
  if (pathname.startsWith("/users")) return "Participants";
  if (pathname.startsWith("/practice")) return "Practice";
  return "Dashboard";
}

export function AppHeader() {
  const { pathname } = useLocation();
  return (
    <header className="app-shell-header">
      <SidebarTrigger />
      <div>
        <p className="app-shell-header__eyebrow">Genshu</p>
        <h1>{pageTitle(pathname)}</h1>
      </div>
    </header>
  );
}
