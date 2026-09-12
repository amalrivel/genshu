import type { Route } from "./+types/home";
import { Link } from "react-router";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <><nav className="content-admin"><Link to="/practice">Start practice</Link> · <Link to="/topics">Manage topics and materials</Link> · <Link to="/practice-sets">Manage practice sets</Link></nav><Welcome /></>;
}
